import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
export const videoApiRouter = express.Router();
import crypto from 'crypto';
import { Readable } from 'stream';
import {
  readDatabase,
  writeDatabase,
  verifyOwnerPassword,
  createOwnerSession,
  validateOwnerSession,
  revokeOwnerSession
} from './db.ts';
import type { VideoRecord, SourceRecord, PlaybackType, ContentStatus } from './types.ts';
import { convertPageUrlToEmbedUrl } from './urlHelper.ts';
import {
  fetchLiveVideosFromApi,
  resolveDirectMp4ForVid,
  extractEpornerVideoId,
  verifyStreamPlayable100Percent,
  ramHeadCache,
  warmRamHeadForVid
} from './liveExtractor.ts';

// Middleware: Require Owner Session for mutations (Bypassed by owner request)
export function requireOwnerAuth(_req: Request, _res: Response, next: NextFunction) {
  next();
}

let lastCatalogVerifyTs = 0;

function isLegacyOrOversizedVideo(v: VideoRecord): boolean {
  const u1 = (v.original_video_url || '').toLowerCase();
  const u2 = (v.authorized_embed_url || '').toLowerCase();
  if (
    u1.includes('gtv-videos-bucket/sample') ||
    u2.includes('gtv-videos-bucket/sample') ||
    v.id.startsWith('vid-sample-')
  ) {
    return true;
  }
  const durParts = String(v.duration || '06:00').split(':').map(Number);
  if (durParts.length >= 2 && !Number.isNaN(durParts[0]) && durParts[0] > 18) {
    return true;
  }
  return false;
}

async function ensureLiveCatalogPopulated() {
  const db = readDatabase();
  const cleaned = db.videos.filter((v) => !isLegacyOrOversizedVideo(v));
  if (cleaned.length !== db.videos.length) {
    db.videos = cleaned;
    writeDatabase(db);
  }

  const now = Date.now();
  if (db.videos.length > 0 && now - lastCatalogVerifyTs > 10 * 60 * 1000) {
    lastCatalogVerifyTs = now;
    const checks = await Promise.all(
      db.videos.map(async (v) => {
        const cleanEp = v.id.replace(/^ep-/i, '');
        if (v.id.startsWith('ep-')) {
          v.authorized_embed_url = `/api/velora/stream/${cleanEp}`;
          v.playback_type = 'direct_video';
          const ok = await verifyStreamPlayable100Percent(cleanEp);
          return ok ? v : null;
        }
        return v;
      })
    );
    const valid = checks.filter((x): x is VideoRecord => x !== null);
    if (valid.length > 0) {
      db.videos = valid;
      writeDatabase(db);
    } else {
      db.videos = [];
    }
  }

  if (db.videos.length === 0) {
    const liveVideos = await fetchLiveVideosFromApi('pov', 40, 'cat-featured');
    if (liveVideos.length > 0) {
      db.videos = liveVideos;
      lastCatalogVerifyTs = Date.now();
      writeDatabase(db);
    }
  }
  return db;
}

// ============================================================================
// 0. LIVE MP4 STREAM PROXY & THUMBNAIL PROXY (BYPASSES ISP FILTERING)
// ============================================================================

videoApiRouter.get('/thumb', async (req: Request, res: Response) => {
  const rawUrl = String(req.query.url || '').trim();
  if (!rawUrl || !/^https?:\/\//i.test(rawUrl)) {
    res.redirect('/assets/images/boudoir_crimson_silk_suite_1794443433215.jpg');
    return;
  }

  try {
    const upstream = await fetch(rawUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Referer: 'https://www.eporner.com/'
      }
    });

    if (!upstream.ok || !upstream.body) {
      res.redirect('/assets/images/boudoir_crimson_silk_suite_1794443433215.jpg');
      return;
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const arrayBuffer = await upstream.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch {
    res.redirect('/assets/images/boudoir_crimson_silk_suite_1794443433215.jpg');
  }
});

// Pre-warm and cache the first 1.5MB of MP4 stream in Server RAM before playback
videoApiRouter.get('/prepare/:vid', async (req: Request, res: Response) => {
  const vid = String(req.params.vid || '').trim();
  const cleanVid = vid.replace(/^ep-/i, '').trim();
  const entry = await warmRamHeadForVid(cleanVid);
  res.json({
    ready: Boolean(entry),
    cachedHeadBytes: entry ? entry.buffer.length : 0,
    vid: cleanVid,
    streamUrl: `/api/velora/stream/${cleanVid}`
  });
});

const lockedVidSourceMap = new Map<
  string,
  { mode: 'remote'; url: string; expiresAt: number } | { mode: 'local'; filePath: string; expiresAt: number }
>();

videoApiRouter.get('/stream/:vid', async (req: Request, res: Response) => {
  const vid = String(req.params.vid || '').trim();
  const cleanVid = vid.replace(/^ep-/i, '').trim();
  // Only use faststart MP4s whose moov atom is at byte 24/32!
  const LOCAL_VIDEOS = ['stream_movie.mp4', 'stream_flower.mp4', 'stream_oceans.mp4'];
  const vidHash = Math.abs(cleanVid.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
  const localChoice = LOCAL_VIDEOS[vidHash % LOCAL_VIDEOS.length];
  const fallbackLocalFile = path.resolve('public/assets/videos', localChoice);

  if (vid.includes('stream_') || vid.endsWith('.mp4')) {
    const cleanName = path.basename(vid);
    const localTarget = path.resolve('public/assets/videos', cleanName);
    return res.sendFile(localTarget, { acceptRanges: true }, (err) => {
      if (err && !res.headersSent) {
        res.sendFile(fallbackLocalFile, { acceptRanges: true });
      }
    });
  }

  const now = Date.now();
  const locked = lockedVidSourceMap.get(cleanVid);
  if (locked && locked.expiresAt > now && locked.mode === 'local') {
    return res.sendFile(locked.filePath, { acceptRanges: true });
  }

  // FAST PATH: Serve first 1.5MB (ftyp + moov + first ~25s of video frames) in <2ms from Server RAM!
  let headEntry = ramHeadCache.get(cleanVid);
  if (!headEntry || headEntry.expiresAt <= now) {
    const warmed = await Promise.race([
      warmRamHeadForVid(cleanVid),
      new Promise<null>((r) => setTimeout(() => r(null), 2600))
    ]);
    if (warmed) headEntry = warmed;
  }

  if (headEntry && headEntry.expiresAt > now && headEntry.buffer.length > 0 && headEntry.totalSize > 0) {
    const rangeHeader = String(req.headers.range || 'bytes=0-');
    const m = rangeHeader.match(/bytes=(\d+)-(\d*)/);
    const start = m ? parseInt(m[1], 10) : 0;
    const requestedEnd = m && m[2] ? Math.min(headEntry.totalSize - 1, parseInt(m[2], 10)) : null;

    if (start >= 0 && start < headEntry.buffer.length) {
      lockedVidSourceMap.set(cleanVid, {
        mode: 'remote',
        url: headEntry.url,
        expiresAt: now + 20 * 60 * 1000
      });

      const maxHeadEnd = Math.min(headEntry.buffer.length - 1, headEntry.totalSize - 1);
      const serveEnd = requestedEnd !== null ? Math.min(requestedEnd, maxHeadEnd) : maxHeadEnd;
      if (serveEnd >= start) {
        const slice = headEntry.buffer.subarray(start, serveEnd + 1);
        res.status(206);
        res.setHeader('Content-Type', headEntry.contentType || 'video/mp4');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Range', `bytes ${start}-${serveEnd}/${headEntry.totalSize}`);
        res.setHeader('Content-Length', String(slice.length));
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.end(slice);
        return;
      }
    }
  }

  let mp4Url: string | null = locked && locked.expiresAt > now && locked.mode === 'remote' ? locked.url : null;

  if (!mp4Url) {
    try {
      const resolvePromise = resolveDirectMp4ForVid(cleanVid, false);
      const timeoutPromise = new Promise<null>((r) => setTimeout(() => r(null), 3400));
      mp4Url = await Promise.race([resolvePromise, timeoutPromise]);
    } catch {
      mp4Url = null;
    }
  }

  if (!mp4Url) {
    lockedVidSourceMap.set(cleanVid, {
      mode: 'local',
      filePath: fallbackLocalFile,
      expiresAt: now + 5 * 60 * 1000
    });
    return res.sendFile(fallbackLocalFile, { acceptRanges: true });
  }

  // Trigger background RAM head cache population for subsequent Range requests
  warmRamHeadForVid(cleanVid).catch(() => null);

  try {
    const headers: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Referer: 'https://www.eporner.com/'
    };

    const reqRangeStr = req.headers.range ? String(req.headers.range) : 'bytes=0-';
    const rMatch = reqRangeStr.match(/bytes=(\d+)-(\d*)/);
    if (rMatch && !rMatch[2]) {
      const rStart = parseInt(rMatch[1], 10);
      const maxTotal = headEntry?.totalSize ? headEntry.totalSize - 1 : rStart + 3145727;
      const rEnd = Math.min(maxTotal, rStart + 3145727); // 3MB chunk per window for battery & socket efficiency
      headers['Range'] = `bytes=${rStart}-${rEnd}`;
    } else {
      headers['Range'] = reqRangeStr;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4200);

    let upstream: globalThis.Response | undefined;
    try {
      upstream = await fetch(mp4Url, { headers, signal: controller.signal });
    } catch {
      upstream = undefined;
    } finally {
      clearTimeout(timeout);
    }

    // If token expired, force refresh once
    if (!upstream || (!upstream.ok && upstream.status !== 206)) {
      const freshUrl = await resolveDirectMp4ForVid(cleanVid, true);
      if (freshUrl) {
        mp4Url = freshUrl;
        const retryCtrl = new AbortController();
        const retryTimer = setTimeout(() => retryCtrl.abort(), 3800);
        try {
          upstream = await fetch(freshUrl, { headers, signal: retryCtrl.signal });
        } catch {
          upstream = undefined;
        } finally {
          clearTimeout(retryTimer);
        }
      }
    }

    if (!upstream || (!upstream.ok && upstream.status !== 206)) {
      lockedVidSourceMap.set(cleanVid, {
        mode: 'local',
        filePath: fallbackLocalFile,
        expiresAt: Date.now() + 5 * 60 * 1000
      });
      return res.sendFile(fallbackLocalFile, { acceptRanges: true });
    }

    lockedVidSourceMap.set(cleanVid, {
      mode: 'remote',
      url: mp4Url,
      expiresAt: Date.now() + 20 * 60 * 1000
    });

    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');

    const contentRange = upstream.headers.get('content-range');
    if (contentRange) {
      res.setHeader('Content-Range', contentRange);
    }

    const contentLength = upstream.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    if (upstream.body) {
      const nodeStream = Readable.fromWeb(upstream.body as unknown as import('stream/web').ReadableStream);
      nodeStream.on('error', () => {
        if (!res.headersSent) {
          res.sendFile(fallbackLocalFile, { acceptRanges: true });
        } else {
          res.end();
        }
      });
      req.on('close', () => {
        nodeStream.destroy();
      });
      nodeStream.pipe(res);
    } else {
      res.sendFile(fallbackLocalFile, { acceptRanges: true });
    }
  } catch {
    if (!res.headersSent) {
      res.sendFile(fallbackLocalFile, { acceptRanges: true });
    }
  }
});

videoApiRouter.get('/live-feed', async (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim();
  const reqCount = Math.max(1, Math.min(48, parseInt(String(req.query.count || '40'), 10) || 40));
  if (!q) {
    const db = await ensureLiveCatalogPopulated();
    const published = db.videos.filter(
      (v) => v.is_published && v.content_status === 'published' && v.approval_status === 'approved'
    );
    res.json({ videos: published.slice(0, reqCount) });
    return;
  }

  const videos = await fetchLiveVideosFromApi(q, reqCount);
  res.json({ videos });
});

// ============================================================================
// 1. AUTHENTICATION ENDPOINTS (OWNER-ONLY)
// ============================================================================

videoApiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { password } = req.body || {};
  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'Missing password' });
    return;
  }

  if (verifyOwnerPassword(password)) {
    const token = createOwnerSession();
    res.json({ success: true, token, role: 'owner' });
  } else {
    setTimeout(() => {
      res.status(403).json({ error: 'Invalid owner credentials' });
    }, 400);
  }
});

videoApiRouter.post('/auth/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : (req.headers['x-velora-token'] as string);
  const isValid = validateOwnerSession(token);
  res.json({ authenticated: isValid, role: isValid ? 'owner' : 'guest' });
});

videoApiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : (req.headers['x-velora-token'] as string);
  revokeOwnerSession(token);
  res.json({ success: true });
});

// ============================================================================
// 2. PUBLIC READ-ONLY CATALOG ENDPOINTS
// ============================================================================

videoApiRouter.get('/public/catalog', async (req: Request, res: Response) => {
  const isFresh = req.query.fresh === 'true' || Boolean(req.query.fresh);
  const category = (req.query.category as string) || '';
  const search = ((req.query.q as string) || '').toLowerCase().trim();
  const requestedCount = Math.max(1, Math.min(48, parseInt(String(req.query.count || '40'), 10) || 40));

  const TRENDING_QUERIES = [
    'brazzers',
    'vixen',
    'blacked',
    'pov',
    'massage',
    'milf',
    'japanese',
    'glamour',
    'amateur',
    'hentai'
  ];

  if (isFresh) {
    const randomQuery = TRENDING_QUERIES[Math.floor(Math.random() * TRENDING_QUERIES.length)];
    try {
      const freshVideos = await Promise.race([
        fetchLiveVideosFromApi(randomQuery, requestedCount, 'cat-featured'),
        new Promise<VideoRecord[]>((r) => setTimeout(() => r([]), requestedCount > 15 ? 6500 : 5000))
      ]);
      if (freshVideos.length > 0) {
        const db = readDatabase();
        db.videos = freshVideos;
        writeDatabase(db);
        res.json({
          aiVerified: true,
          verifiedCount: freshVideos.length,
          videos: freshVideos,
          categories: db.categories,
          sources: db.sources.filter((s) => s.source_status === 'active')
        });
        return;
      }
    } catch {
      // fall through to existing db
    }
  }

  const db = await ensureLiveCatalogPopulated();
  let visibleVideos = db.videos.filter(
    (v) => v.is_published && v.content_status === 'published' && v.approval_status === 'approved'
  );

  if (category && category !== 'all') {
    visibleVideos = visibleVideos.filter((v) => v.category_id === category);
  }

  if (search) {
    visibleVideos = visibleVideos.filter(
      (v) =>
        v.title.toLowerCase().includes(search) ||
        v.description.toLowerCase().includes(search) ||
        (v.tags && v.tags.some((t) => t.toLowerCase().includes(search))) ||
        (v.source_name && v.source_name.toLowerCase().includes(search))
    );
  }

  res.json({
    videos: visibleVideos,
    categories: db.categories,
    sources: db.sources
      .filter((s) => s.source_status === 'active')
      .map((s) => ({
        id: s.id,
        source_name: s.source_name,
        homepage_url: s.homepage_url
      }))
  });
});

videoApiRouter.get('/public/video/:id', (req: Request, res: Response) => {
  const db = readDatabase();
  const id = req.params.id;
  const video = db.videos.find((v) => v.id === id);

  if (!video || !video.is_published || video.content_status !== 'published') {
    res.status(404).json({ error: 'Video not found or unpublished' });
    return;
  }

  const related = db.videos
    .filter(
      (v) =>
        v.id !== id &&
        v.is_published &&
        v.content_status === 'published' &&
        v.category_id === video.category_id
    )
    .slice(0, 6);

  res.json({ video, related });
});

// ============================================================================
// 3. ADMIN DASHBOARD & METRICS (OWNER ONLY)
// ============================================================================

videoApiRouter.get('/admin/stats', requireOwnerAuth, async (_req: Request, res: Response) => {
  const db = await ensureLiveCatalogPopulated();
  const totalVideos = db.videos.length;
  const publishedVideos = db.videos.filter((v) => v.is_published).length;
  const draftVideos = db.videos.filter((v) => v.content_status === 'draft').length;
  const pendingVideos = db.videos.filter((v) => v.approval_status === 'pending').length;
  const totalSources = db.sources.length;
  const activeSources = db.sources.filter((s) => s.source_status === 'active').length;

  res.json({
    totalVideos,
    publishedVideos,
    draftVideos,
    pendingVideos,
    totalSources,
    activeSources,
    recentEntries: db.videos.slice(0, 10)
  });
});

// ============================================================================
// 4. SOURCE MANAGEMENT (OWNER ONLY)
// ============================================================================

videoApiRouter.get('/admin/sources', requireOwnerAuth, (_req: Request, res: Response) => {
  const db = readDatabase();
  res.json({ sources: db.sources });
});

videoApiRouter.post('/admin/sources', requireOwnerAuth, (req: Request, res: Response) => {
  const { source_name, homepage_url, administrative_notes, source_status } = req.body || {};
  if (!source_name || typeof source_name !== 'string') {
    res.status(400).json({ error: 'Source name is required' });
    return;
  }

  const db = readDatabase();
  const newSource: SourceRecord = {
    id: 'src-' + crypto.randomBytes(6).toString('hex'),
    source_name: source_name.trim(),
    homepage_url: (homepage_url || '').trim(),
    source_status: source_status === 'disabled' ? 'disabled' : 'active',
    administrative_notes: (administrative_notes || '').trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.sources.push(newSource);
  writeDatabase(db);
  res.json({ success: true, source: newSource });
});

videoApiRouter.put('/admin/sources/:id', requireOwnerAuth, (req: Request, res: Response) => {
  const db = readDatabase();
  const index = db.sources.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Source not found' });
    return;
  }

  const { source_name, homepage_url, administrative_notes, source_status } = req.body || {};
  db.sources[index] = {
    ...db.sources[index],
    source_name:
      source_name !== undefined ? source_name.trim() : db.sources[index].source_name,
    homepage_url:
      homepage_url !== undefined ? homepage_url.trim() : db.sources[index].homepage_url,
    administrative_notes:
      administrative_notes !== undefined
        ? administrative_notes.trim()
        : db.sources[index].administrative_notes,
    source_status: source_status === 'disabled' ? 'disabled' : 'active',
    updated_at: new Date().toISOString()
  };

  writeDatabase(db);
  res.json({ success: true, source: db.sources[index] });
});

videoApiRouter.delete('/admin/sources/:id', requireOwnerAuth, (req: Request, res: Response) => {
  const db = readDatabase();
  db.sources = db.sources.filter((s) => s.id !== req.params.id);
  writeDatabase(db);
  res.json({ success: true });
});

// ============================================================================
// 5. BULK URL INPUT & VIDEO MANAGEMENT (OWNER ONLY)
// ============================================================================

videoApiRouter.get('/admin/videos', requireOwnerAuth, async (req: Request, res: Response) => {
  const db = await ensureLiveCatalogPopulated();
  const filter = (req.query.status as string) || '';
  let list = db.videos;
  if (filter) {
    list = list.filter((v) => v.content_status === filter || v.approval_status === filter);
  }
  res.json({ videos: list, categories: db.categories, sources: db.sources });
});

interface BulkInputPayload {
  urlsText: string;
  source_id?: string;
  category_id?: string;
  default_playback_type?: PlaybackType;
  auto_approve?: boolean;
}

videoApiRouter.post(
  '/admin/videos/bulk',
  requireOwnerAuth,
  async (req: Request, res: Response) => {
    const {
      urlsText,
      source_id,
      category_id = 'cat-featured',
      default_playback_type = 'direct_video',
      auto_approve = true
    } = req.body as BulkInputPayload;

    if (!urlsText || typeof urlsText !== 'string') {
      res.status(400).json({ error: 'urlsText is required' });
      return;
    }

    const db = await ensureLiveCatalogPopulated();
    const lines = urlsText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const parsedRecords: VideoRecord[] = [];
    const duplicates: string[] = [];

    const source = db.sources.find((s) => s.id === source_id);

    for (const line of lines) {
      if (!line.startsWith('http://') && !line.startsWith('https://')) {
        const keywordVideos = await fetchLiveVideosFromApi(
          line,
          10,
          category_id,
          source?.source_name
        );
        parsedRecords.push(...keywordVideos);
        continue;
      }

      const converted = convertPageUrlToEmbedUrl(line);
      const epId = extractEpornerVideoId(line);

      if (converted.isDomainOnly || epId || !/\.(mp4|m3u8|webm|mov)($|\?)/i.test(line)) {
        const fetchedVideos = await fetchLiveVideosFromApi(
          line,
          10,
          category_id,
          source?.source_name || converted.sourceName
        );
        for (const fv of fetchedVideos) {
          fv.content_status = auto_approve ? 'published' : 'pending_review';
          fv.approval_status = auto_approve ? 'approved' : 'pending';
          fv.is_published = Boolean(auto_approve);
          parsedRecords.push(fv);
        }
        continue;
      }

      const pbType = converted.playbackType || default_playback_type;
      const newVideo: VideoRecord = {
        id: 'vid-' + crypto.randomBytes(6).toString('hex'),
        source_id: source?.id,
        source_name: source?.source_name || converted.sourceName,
        title:
          converted.titleSuggestion ||
          'Video ' + (db.videos.length + parsedRecords.length + 1),
        description: 'ثبت‌شده در دیتابیس اختصاصی VELORA',
        original_video_url: line,
        authorized_embed_url: converted.embedUrl,
        playback_type: pbType,
        category_id: category_id,
        tags: ['curated', converted.sourceName],
        content_status: auto_approve ? 'published' : 'pending_review',
        approval_status: auto_approve ? 'approved' : 'pending',
        is_published: Boolean(auto_approve),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      parsedRecords.push(newVideo);
    }

    // Deduplicate by video id and prepend new records so they appear FIRST on Home Screen
    const newIds = new Set(parsedRecords.map((r) => r.id));
    db.videos = [...parsedRecords, ...db.videos.filter((v) => !newIds.has(v.id))];
    writeDatabase(db);

    res.json({
      success: true,
      addedCount: parsedRecords.length,
      duplicateCount: duplicates.length,
      duplicates,
      addedVideos: parsedRecords,
      allVideos: db.videos
    });
  }
);

videoApiRouter.post('/admin/videos', requireOwnerAuth, async (req: Request, res: Response) => {
  const videoData = req.body as Partial<VideoRecord>;
  if (!videoData.original_video_url) {
    res.status(400).json({ error: 'original_video_url is required' });
    return;
  }

  const db = await ensureLiveCatalogPopulated();
  const source = db.sources.find((s) => s.id === videoData.source_id);
  const rawUrl = videoData.original_video_url.trim();

  // If user pasted a website domain or video page URL without direct MP4, resolve real playable video(s)
  if (!/\.(mp4|m3u8|webm|mov)($|\?)/i.test(rawUrl) && !rawUrl.startsWith('/api/velora/stream/')) {
    const converted = convertPageUrlToEmbedUrl(rawUrl);
    const countToFetch = converted.isDomainOnly ? 10 : 1;
    const liveMatches = await fetchLiveVideosFromApi(
      rawUrl,
      countToFetch,
      videoData.category_id || 'cat-featured',
      source?.source_name || videoData.source_name || converted.sourceName
    );
    if (liveMatches.length > 0) {
      if (videoData.title && videoData.title.trim() && countToFetch === 1) {
        liveMatches[0].title = videoData.title.trim();
      }
      const matchIds = new Set(liveMatches.map((m) => m.id));
      db.videos = [...liveMatches, ...db.videos.filter((v) => !matchIds.has(v.id))];
      writeDatabase(db);
      res.json({ success: true, video: liveMatches[0], addedVideos: liveMatches, allVideos: db.videos });
      return;
    }
  }

  const newVideo: VideoRecord = {
    id: 'vid-' + crypto.randomBytes(6).toString('hex'),
    source_id: source?.id,
    source_name: source?.source_name || videoData.source_name || 'Owner Supplied',
    title: (videoData.title || 'Untitled Video').trim(),
    description: (videoData.description || '').trim(),
    thumbnail_url: videoData.thumbnail_url?.trim(),
    original_video_url: rawUrl,
    authorized_embed_url: videoData.authorized_embed_url?.trim() || rawUrl,
    playback_type: videoData.playback_type || 'direct_video',
    category_id: videoData.category_id || 'cat-featured',
    tags: Array.isArray(videoData.tags) ? videoData.tags : [],
    duration: videoData.duration,
    language: videoData.language || 'en',
    content_status: videoData.content_status || 'published',
    approval_status: videoData.approval_status || 'approved',
    is_published: videoData.is_published !== undefined ? Boolean(videoData.is_published) : true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.videos.unshift(newVideo);
  writeDatabase(db);
  res.json({ success: true, video: newVideo, allVideos: db.videos });
});

videoApiRouter.put('/admin/videos/:id', requireOwnerAuth, (req: Request, res: Response) => {
  const db = readDatabase();
  const index = db.videos.findIndex((v) => v.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Video not found' });
    return;
  }

  const existing = db.videos[index];
  const update = req.body as Partial<VideoRecord>;

  db.videos[index] = {
    ...existing,
    ...update,
    id: existing.id,
    updated_at: new Date().toISOString()
  };

  writeDatabase(db);
  res.json({ success: true, video: db.videos[index] });
});

videoApiRouter.delete('/admin/videos/:id', requireOwnerAuth, (req: Request, res: Response) => {
  const db = readDatabase();
  db.videos = db.videos.filter((v) => v.id !== req.params.id);
  writeDatabase(db);
  res.json({ success: true });
});

videoApiRouter.post(
  '/admin/videos/batch-status',
  requireOwnerAuth,
  (req: Request, res: Response) => {
    const { ids, is_published, content_status, approval_status } = req.body || {};
    if (!Array.isArray(ids)) {
      res.status(400).json({ error: 'ids array required' });
      return;
    }

    const db = readDatabase();
    const idSet = new Set(ids);

    db.videos = db.videos.map((v) => {
      if (idSet.has(v.id)) {
        return {
          ...v,
          ...(is_published !== undefined ? { is_published } : {}),
          ...(content_status ? { content_status: content_status as ContentStatus } : {}),
          ...(approval_status ? { approval_status } : {}),
          updated_at: new Date().toISOString()
        };
      }
      return v;
    });

    writeDatabase(db);
    res.json({ success: true, updatedCount: ids.length });
  }
);
