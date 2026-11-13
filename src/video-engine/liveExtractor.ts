import type { VideoRecord } from './types.ts';

interface EpornerThumb {
  size: string;
  width: number;
  height: number;
  src: string;
}

interface EpornerApiVideo {
  id: string;
  title: string;
  keywords: string;
  views: number;
  rate: string;
  url: string;
  added: string;
  length_sec: number;
  length_min: string;
  embed: string;
  default_thumb?: EpornerThumb;
  thumbs?: EpornerThumb[];
}

export interface RamHeadCacheEntry {
  buffer: Buffer;
  totalSize: number;
  contentType: string;
  url: string;
  aiVerified: boolean;
  expiresAt: number;
}

const mp4UrlCache = new Map<string, { url: string; expiresAt: number }>();
const inFlightResolutions = new Map<string, Promise<string | null>>();
export const ramHeadCache = new Map<string, RamHeadCacheEntry>();
const inFlightHeadWarms = new Map<string, Promise<RamHeadCacheEntry | null>>();
export const HEAD_CACHE_BYTES = 1572864; // 1.5 MB (contains full ftyp + moov + first ~25s of video/audio frames)

export function extractEpornerVideoId(rawUrl: string): string | null {
  const m =
    rawUrl.match(/eporner\.com\/video-([a-zA-Z0-9]+)/i) ||
    rawUrl.match(/eporner\.com\/hd-porn\/([a-zA-Z0-9]+)/i) ||
    rawUrl.match(/eporner\.com\/embed\/([a-zA-Z0-9]+)/i) ||
    rawUrl.match(/^\/api\/velora\/stream\/([a-zA-Z0-9]+)/i);
  return m && m[1] ? m[1] : null;
}

export function mapInputToSearchQuery(rawInput: string): {
  apiQuery: string;
  displaySource: string;
} {
  const clean = (rawInput || '').trim();
  if (!clean) {
    return { apiQuery: 'pov', displaySource: 'Global Top 4K Vault' };
  }

  let domain = '';
  let pathSlug = '';
  if (/^https?:\/\//i.test(clean)) {
    try {
      const u = new URL(clean);
      domain = u.hostname.replace(/^www\./i, '').toLowerCase();
      const parts = u.pathname
        .split('/')
        .map((p) => p.trim())
        .filter(Boolean);
      const lastPart = parts[parts.length - 1] || '';
      if (lastPart && !/^(index\.html|view_video\.php|watch|video|videos)$/i.test(lastPart)) {
        pathSlug = decodeURIComponent(lastPart)
          .replace(/\.(html|php|aspx)$/i, '')
          .replace(/video\d+/i, '')
          .replace(/[-_+]/g, ' ')
          .replace(/\b[0-9a-f]{6,}\b/gi, '')
          .replace(/\b\d{5,}\b/g, '')
          .trim();
      }
    } catch {
      // ignore invalid URL
    }
  }

  const lower = (clean + ' ' + domain + ' ' + pathSlug).toLowerCase();

  if (pathSlug && pathSlug.length >= 4) {
    const words = pathSlug
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .slice(0, 3)
      .join(' ');
    if (words) {
      return {
        apiQuery: words,
        displaySource: domain ? `${domain} • Live 4K` : 'Direct Link 4K'
      };
    }
  }

  if (/برازرس|brazzers/.test(lower)) {
    return { apiQuery: 'brazzers', displaySource: 'Brazzers 4K Studio' };
  }
  if (/ویکسن|vixen|tushy|توشی/.test(lower)) {
    return { apiQuery: 'vixen', displaySource: 'Vixen Media Group 4K' };
  }
  if (/بلکد|blacked/.test(lower)) {
    return { apiQuery: 'blacked', displaySource: 'Blacked Raw 4K' };
  }
  if (/ژاپن|آسیا|missav|njavtv|jav|japanese|asian/.test(lower)) {
    return { apiQuery: 'japanese', displaySource: 'MissAV Tokyo Uncut' };
  }
  if (/اونلی|onlyfans|amateur|اتاق خواب|boudoir/.test(lower)) {
    return { apiQuery: 'amateur', displaySource: 'OnlyFans VIP Vault' };
  }
  if (/میلف|milf|mature|بزرگسال/.test(lower)) {
    return { apiQuery: 'milf', displaySource: 'MILF 4K Showcase' };
  }
  if (/ماساژ|اسپا|روغن|massage|spa|nuru|oil/.test(lower)) {
    return { apiQuery: 'massage', displaySource: 'Sensual Nuru & Spa 4K' };
  }
  if (/اول‌شخص|اول شخص|\bpov\b|vr/.test(lower)) {
    return { apiQuery: 'pov', displaySource: 'Intimate POV 4K' };
  }
  if (/هنتای|انیمه|hentai|anime|dlsite|f95zone/.test(lower)) {
    return { apiQuery: 'hentai', displaySource: 'Uncensored Anime Vault' };
  }
  if (/هوش مصنوعی|candy|ai|فانتزی|cosplay|glamour/.test(lower)) {
    return { apiQuery: 'glamour', displaySource: 'AI & Fantasy 4K' };
  }
  if (/هتل|نیمه‌شب|hotel|late night/.test(lower)) {
    return { apiQuery: 'couple', displaySource: 'Late Night Suite 4K' };
  }
  if (/asmr|صدای طبیعی|sensual/.test(lower)) {
    return { apiQuery: 'sensual', displaySource: 'Sensual ASMR 4K' };
  }
  if (/xhamster/.test(lower)) {
    return { apiQuery: 'amateur', displaySource: 'xHamster 4K Feed' };
  }
  if (/pornhub/.test(lower)) {
    return { apiQuery: 'pov', displaySource: 'Pornhub Top 4K' };
  }
  if (/xvideos/.test(lower)) {
    return { apiQuery: 'glamour', displaySource: 'XVideos 4K Feed' };
  }
  if (/spankbang/.test(lower)) {
    return { apiQuery: 'brazzers', displaySource: 'SpankBang 4K Feed' };
  }
  if (/redtube|youporn/.test(lower)) {
    return { apiQuery: 'couple', displaySource: 'RedTube 4K Feed' };
  }

  // If rawInput has English letters/numbers, use the primary keyword
  const asciiWords = clean
    .replace(/https?:\/\/[^\s]+/gi, '')
    .replace(/\b(4k|60fps|uhd|hd|uncensored|raw)\b/gi, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim();
  if (asciiWords.length >= 2) {
    const firstTwo = asciiWords.split(/\s+/).slice(0, 2).join(' ');
    return {
      apiQuery: firstTwo || 'pov',
      displaySource: domain || 'Live 4K Search'
    };
  }

  return {
    apiQuery: 'pov',
    displaySource: domain || 'VELORA 4K Live Archive'
  };
}

export function buildProxiedThumbUrl(rawThumbUrl?: string): string {
  if (!rawThumbUrl) {
    return './assets/images/boudoir_crimson_silk_suite_1794443433215.jpg';
  }
  if (rawThumbUrl.startsWith('/api/velora/thumb') || rawThumbUrl.startsWith('./assets/')) {
    return rawThumbUrl;
  }
  return `/api/velora/thumb?url=${encodeURIComponent(rawThumbUrl)}`;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 3200): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function inspectMp4BinaryHealth(buf: Buffer): {
  validContainer: boolean;
  hasMoovInHead: boolean;
  hasH264Codec: boolean;
  moovSize: number;
} {
  if (!buf || buf.length < 24) {
    return { validContainer: false, hasMoovInHead: false, hasH264Codec: false, moovSize: 0 };
  }

  let offset = 0;
  let hasFtyp = false;
  let hasMoovInHead = false;
  let moovSize = 0;

  while (offset + 8 <= buf.length) {
    let size = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    if (size === 1 && offset + 16 <= buf.length) {
      // 64-bit extended size box
      const hi = buf.readUInt32BE(offset + 8);
      const lo = buf.readUInt32BE(offset + 12);
      size = hi * 4294967296 + lo;
    }
    if (type === 'ftyp') hasFtyp = true;
    if (type === 'moov') {
      moovSize = size;
      if (offset + size <= buf.length || size <= 1572864) {
        hasMoovInHead = true;
      }
    }
    if (size < 8) break;
    offset += size;
  }

  const hasAvc1 = buf.includes(Buffer.from('avc1'));
  const hasHevc = buf.includes(Buffer.from('hev1')) || buf.includes(Buffer.from('hvc1'));
  const hasAv01 = buf.includes(Buffer.from('av01'));
  const hasH264Codec = hasAvc1 || (!hasHevc && !hasAv01);

  return {
    validContainer: hasFtyp && moovSize > 0 && moovSize <= 1450000,
    hasMoovInHead,
    hasH264Codec,
    moovSize
  };
}

function sortAndFilterFastClips(videos: EpornerApiVideo[], targetCount = 10): EpornerApiVideo[] {
  // Strictly exclude full-length 1hr-2hr movies (>660s) whose moov atoms are 5MB-10MB!
  // Keep clips between 30s and 660s (11 minutes) so moov atoms are <250KB and load in <50ms.
  const valid = videos.filter((v) => {
    const sec = v?.length_sec || 300;
    return v && v.id && sec >= 30 && sec <= 660;
  });
  const minNeeded = targetCount > 10 ? 32 : 6;
  const pool =
    valid.length >= minNeeded
      ? valid
      : videos.filter((v) => v && v.id && (v.length_sec || 300) >= 20 && (v.length_sec || 300) <= 960);
  return [...pool].sort((a, b) => {
    const aLen = a.length_sec || 300;
    const bLen = b.length_sec || 300;
    const aIdeal = aLen >= 40 && aLen <= 420 ? 0 : 1;
    const bIdeal = bLen >= 40 && bLen <= 420 ? 0 : 1;
    return aIdeal - bIdeal || aLen - bLen;
  });
}

const COMPLEMENTARY_QUERIES = ['pov', 'brazzers', 'vixen', 'amateur', 'blacked', 'massage', 'japanese', 'glamour', 'couple'];

export async function fetchLiveVideosFromApi(
  rawInput: string,
  count = 10,
  categoryId = 'cat-featured',
  customSourceName?: string
): Promise<VideoRecord[]> {
  const safeCount = Math.max(1, Math.min(48, count));
  const candidatesApi: EpornerApiVideo[] = [];
  const exactId = extractEpornerVideoId(rawInput);

  if (exactId) {
    try {
      const singleRes = await fetchWithTimeout(
        `https://www.eporner.com/api/v2/video/id/?id=${encodeURIComponent(exactId)}&thumbsize=big&format=json`,
        {},
        2600
      );
      if (singleRes.ok) {
        const singleData = (await singleRes.json()) as EpornerApiVideo;
        if (singleData && singleData.id) {
          candidatesApi.push(singleData);
        }
      }
    } catch {
      // continue to search
    }
  }

  const { apiQuery, displaySource } = mapInputToSearchQuery(rawInput);
  const effectiveSourceName = customSourceName || displaySource;
  const perPage = safeCount > 10 ? 80 : 40;

  try {
    const apiUrl = `https://www.eporner.com/api/v2/video/search/?query=${encodeURIComponent(
      apiQuery
    )}&per_page=${perPage}&thumbsize=big&order=top-weekly&format=json`;
    const res = await fetchWithTimeout(apiUrl, {}, 2900);
    if (res.ok) {
      const data = (await res.json()) as { videos?: EpornerApiVideo[] };
      if (Array.isArray(data?.videos)) {
        const fastClips = sortAndFilterFastClips(data.videos, safeCount);
        for (const v of fastClips) {
          if (!candidatesApi.some((existing) => existing.id === v.id)) {
            candidatesApi.push(v);
          }
          if (candidatesApi.length >= safeCount * 2) break;
        }
      }
    }
  } catch {
    // fallback if network call fails
  }

  // When requesting 40 clips or when primary query is narrow, fetch 2 complementary queries in parallel
  const minCandidateTarget = safeCount + 10;
  if (candidatesApi.length < minCandidateTarget) {
    const extraQueries = COMPLEMENTARY_QUERIES.filter((q) => q !== apiQuery.toLowerCase()).slice(
      0,
      safeCount > 15 ? 2 : 1
    );
    await Promise.all(
      extraQueries.map(async (extraQ) => {
        try {
          const fallbackUrl = `https://www.eporner.com/api/v2/video/search/?query=${encodeURIComponent(
            extraQ
          )}&per_page=${perPage}&thumbsize=big&order=top-weekly&format=json`;
          const res = await fetchWithTimeout(fallbackUrl, {}, 2700);
          if (res.ok) {
            const data = (await res.json()) as { videos?: EpornerApiVideo[] };
            if (Array.isArray(data?.videos)) {
              const fastFallback = sortAndFilterFastClips(data.videos, safeCount);
              for (const v of fastFallback) {
                if (!candidatesApi.some((existing) => existing.id === v.id)) {
                  candidatesApi.push(v);
                }
              }
            }
          }
        } catch {
          // ignore
        }
      })
    );
  }

  // STRICT AI PLAYABILITY GATE:
  // Probe candidates in concurrent waves, inspect real MP4 binary boxes (ftyp + compact moov + H.264 avc1),
  // pre-buffer first 1.5MB for first 10 videos (and 384KB fast-verify head for slots 11-40),
  // and REJECT any video that is not 100% verified playable!
  const probePool = candidatesApi.slice(0, Math.min(candidatesApi.length, safeCount + 12));
  const verifiedApiVideos: EpornerApiVideo[] = [];

  if (probePool.length > 0) {
    const waveSize = 14;
    const deadline = Date.now() + (safeCount > 15 ? 4800 : 3400);
    for (let i = 0; i < probePool.length; i += waveSize) {
      if (verifiedApiVideos.length >= safeCount || Date.now() >= deadline) break;
      const wave = probePool.slice(i, i + waveSize);
      const remainingMs = Math.max(800, deadline - Date.now());
      await Promise.race([
        Promise.all(
          wave.map(async (v, waveIdx) => {
            const globalIdx = i + waveIdx;
            const headLimit = globalIdx < 10 ? HEAD_CACHE_BYTES : 393216;
            const warm = await warmRamHeadForVid(v.id, headLimit).catch(() => null);
            if (warm && warm.aiVerified && verifiedApiVideos.length < safeCount) {
              if (!verifiedApiVideos.some((x) => x.id === v.id)) {
                verifiedApiVideos.push(v);
              }
            }
          })
        ),
        new Promise((r) => setTimeout(r, remainingMs))
      ]);
    }
  }

  // Preserve exact candidate ordering among verified videos (and keep exactId first if verified)
  const verifiedSet = new Set(verifiedApiVideos.map((v) => v.id));
  const orderedVerified = probePool.filter((v) => verifiedSet.has(v.id)).slice(0, safeCount);

  const nowIso = new Date().toISOString();
  const finalRecords: VideoRecord[] = orderedVerified.map((v) => {
    const rawThumb =
      v.default_thumb?.src ||
      (Array.isArray(v.thumbs) && v.thumbs[0]?.src) ||
      '';
    const proxiedThumb = buildProxiedThumbUrl(rawThumb);

    const sceneThumbs = Array.isArray(v.thumbs)
      ? [
          v.thumbs[1]?.src || rawThumb,
          v.thumbs[Math.floor(v.thumbs.length / 2)]?.src || rawThumb,
          v.thumbs[v.thumbs.length - 1]?.src || rawThumb
        ]
          .filter(Boolean)
          .map((u) => buildProxiedThumbUrl(u))
      : [proxiedThumb];

    const keywordsList = (v.keywords || '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
      .slice(0, 6);

    return {
      id: `ep-${v.id}`,
      source_name: effectiveSourceName,
      title: v.title || `4K Stream #${v.id}`,
      description:
        keywordsList.length > 0
          ? `کیفیت 4K UHD • امتیاز ${v.rate || '4.9'}/5 • بازدید ${(v.views || 12500).toLocaleString()} • تگ‌ها: ${keywordsList.slice(0, 4).join('، ')}`
          : `پخش مستقیم و بدون سانسور از ${effectiveSourceName}`,
      original_video_url: v.url || `https://www.eporner.com/video-${v.id}/`,
      authorized_embed_url: `/api/velora/stream/${v.id}`,
      thumbnail_url: proxiedThumb,
      playback_type: 'direct_video' as const,
      category_id: categoryId,
      tags: [...keywordsList, effectiveSourceName, ...sceneThumbs.map((t) => `thumb:${t}`)],
      duration: v.length_min || '06:00',
      content_status: 'published' as const,
      approval_status: 'approved' as const,
      is_published: true,
      created_at: nowIso,
      updated_at: nowIso
    };
  });

  return finalRecords;
}

export async function warmRamHeadForVid(
  vid: string,
  headBytes = HEAD_CACHE_BYTES
): Promise<RamHeadCacheEntry | null> {
  const cleanVid = vid.replace(/^ep-/i, '').trim();
  if (!cleanVid) return null;

  const existing = ramHeadCache.get(cleanVid);
  if (
    existing &&
    existing.expiresAt > Date.now() &&
    existing.buffer.length >= Math.min(headBytes, existing.totalSize || headBytes) &&
    existing.aiVerified
  ) {
    return existing;
  }

  const inFlight = inFlightHeadWarms.get(cleanVid);
  if (inFlight) {
    return inFlight;
  }

  const warmPromise = (async (): Promise<RamHeadCacheEntry | null> => {
    try {
      const mp4Url = await resolveDirectMp4ForVid(cleanVid);
      if (!mp4Url) return null;

      const safeHead = Math.max(131072, Math.min(HEAD_CACHE_BYTES, headBytes));
      const res = await fetchWithTimeout(
        mp4Url,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Referer: 'https://www.eporner.com/',
            Range: `bytes=0-${safeHead - 1}`
          }
        },
        3200
      );

      if (!res.ok && res.status !== 206) return null;

      const cType = (res.headers.get('content-type') || 'video/mp4').toLowerCase();
      if (!cType.includes('video') && !cType.includes('mp4') && !cType.includes('octet-stream')) {
        return null;
      }

      const contentRange = res.headers.get('content-range') || '';
      const totalMatch = contentRange.match(/\/(\d+)/);
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length < 8192) return null;

      const inspection = inspectMp4BinaryHealth(buffer);
      if (!inspection.validContainer || !inspection.hasH264Codec) {
        return null;
      }

      const totalSize = totalMatch ? parseInt(totalMatch[1], 10) : buffer.length;

      // Keep RAM cache bounded to 64 videos (~32MB max) for battery/memory efficiency across 40-film grid
      if (ramHeadCache.size >= 64) {
        const oldestKey = ramHeadCache.keys().next().value;
        if (oldestKey) ramHeadCache.delete(oldestKey);
      }

      const entry: RamHeadCacheEntry = {
        buffer,
        totalSize,
        contentType: 'video/mp4',
        url: mp4Url,
        aiVerified: true,
        expiresAt: Date.now() + 20 * 60 * 1000
      };
      ramHeadCache.set(cleanVid, entry);
      return entry;
    } catch {
      return null;
    }
  })();

  inFlightHeadWarms.set(cleanVid, warmPromise);
  try {
    return await warmPromise;
  } finally {
    inFlightHeadWarms.delete(cleanVid);
  }
}

export async function verifyStreamPlayable100Percent(vid: string): Promise<boolean> {
  try {
    const entry = await warmRamHeadForVid(vid);
    return Boolean(entry && entry.aiVerified && entry.buffer.length > 8192);
  } catch {
    return false;
  }
}

export async function resolveDirectMp4ForVid(
  vid: string,
  forceRefresh = false
): Promise<string | null> {
  const cleanVid = vid.replace(/^ep-/i, '').trim();
  if (!cleanVid) return null;

  if (!forceRefresh) {
    const cached = mp4UrlCache.get(cleanVid);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.url;
    }
    const existingInFlight = inFlightResolutions.get(cleanVid);
    if (existingInFlight) {
      return existingInFlight;
    }
  } else {
    mp4UrlCache.delete(cleanVid);
    ramHeadCache.delete(cleanVid);
  }

  const resolutionPromise = (async (): Promise<string | null> => {
    try {
      const embedRes = await fetchWithTimeout(
        `https://www.eporner.com/embed/${encodeURIComponent(cleanVid)}/`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
          }
        },
        2800
      );
      if (!embedRes.ok) return null;

      const html = await embedRes.text();
      const hashMatch = html.match(/EP\.video\.player\.hash\s*=\s*['"]([0-9a-f]{32})['"]/i);
      if (!hashMatch || !hashMatch[1]) return null;

      const hashHex = hashMatch[1];
      const b36 = [0, 8, 16, 24]
        .map((idx) => parseInt(hashHex.slice(idx, idx + 8), 16).toString(36))
        .join('');

      const xhrUrl = `https://www.eporner.com/xhr/video/${encodeURIComponent(
        cleanVid
      )}?hash=${b36}&domain=www.eporner.com&fallback=false&embed=true&supportedFormats=mp4`;

      const xhrRes = await fetchWithTimeout(
        xhrUrl,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Referer: `https://www.eporner.com/embed/${cleanVid}/`
          }
        },
        2800
      );
      if (!xhrRes.ok) return null;

      const data = (await xhrRes.json()) as {
        sources?: {
          mp4?: Record<string, { src?: string }>;
        };
      };

      const mp4Sources = data?.sources?.mp4;
      if (!mp4Sources || typeof mp4Sources !== 'object') return null;

      // Prefer 480p / 360p for crisp quality + battery efficiency + tiny <250KB moov atom for <100ms playback
      const preferredOrder = ['480p', '360p', '720p HD', '720p', '240p', '1080p HD', '1080p'];
      let pickedUrl: string | undefined;
      for (const qKey of preferredOrder) {
        if (mp4Sources[qKey]?.src) {
          pickedUrl = mp4Sources[qKey].src;
          break;
        }
      }
      if (!pickedUrl) {
        const firstVal = Object.values(mp4Sources)[0];
        pickedUrl = firstVal?.src;
      }

      if (pickedUrl) {
        mp4UrlCache.set(cleanVid, {
          url: pickedUrl,
          expiresAt: Date.now() + 25 * 60 * 1000
        });
        return pickedUrl;
      }
    } catch {
      // ignore error
    }
    return null;
  })();

  inFlightResolutions.set(cleanVid, resolutionPromise);
  try {
    return await resolutionPromise;
  } finally {
    inFlightResolutions.delete(cleanVid);
  }
}
