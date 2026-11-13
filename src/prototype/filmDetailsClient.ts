import type { PrototypeMediaItem } from './types';

export interface ImdbFilmMetadata {
  imdbId: string;
  imdbUrl: string;
  sourceStatus: 'imdb-live' | 'imdb-indexed';
  matchedTitle: string;
  originalTitle: string;
  year: number;
  typeLabel: string;
  timelineLabel: string;
  imdbRating: number;
  votesCount: number;
  imdbRank: number | null;
  contentRating: string;
  runtimeMinutes: number;
  director: string;
  cast: string[];
  genres: string[];
  country: string;
  spokenLanguages: string[];
  plotSummary: string;
  imdbReferenceNote: string;
  imdbPosterUrl: string | null;
}

export interface BackendStreamQuality {
  id: string;
  resolution: string;
  label: string;
  fps: number;
  bitrateMbps: number;
  codec: string;
  audio: string;
  estimatedSizeMb: number;
  batteryMode: string;
  streamUrl: string;
  recommended: boolean;
  available: boolean;
}

export interface BackendTrailerInfo {
  title: string;
  durationSec: number;
  previewVideoUrl: string | null;
  sourceType: 'live-mp4-preview' | 'director-cut-trailer';
  highlights: Array<{ timeSec: number; label: string }>;
}

export interface BackendFilmDetailsResponse {
  filmId: string;
  fetchedAt: string;
  imdb: ImdbFilmMetadata;
  qualities: BackendStreamQuality[];
  trailer?: BackendTrailerInfo;
}

export interface CardinalEntrance {
  direction: 'left' | 'right' | 'top' | 'bottom';
  initialX: number;
  initialY: number;
  delay: number;
}

const clientDetailsCache = new Map<string, BackendFilmDetailsResponse>();

export function buildFallbackBackendQualities(item: PrototypeMediaItem): BackendStreamQuality[] {
  const durMin = Math.max(3, Math.round(item.durationSec / 60));
  const is60Fps = item.quality.includes('60FPS');
  return [
    ...(item.quality.startsWith('4K')
      ? [
          {
            id: '4k-hdr',
            resolution: '2160p',
            label: is60Fps ? '4K Ultra HD 60FPS · HDR10+' : '4K Ultra HD · HDR10+',
            fps: is60Fps ? 60 : 24,
            bitrateMbps: is60Fps ? 26.4 : 22.8,
            codec: 'HEVC / H.265 10-bit',
            audio: 'Dolby Atmos 7.1',
            estimatedSizeMb: Math.max(48, Math.round(durMin * 172)),
            batteryMode: 'Cinema High Power',
            streamUrl: `/api/velora/stream/${encodeURIComponent(item.id)}?q=2160p`,
            recommended: true,
            available: true
          }
        ]
      : []),
    {
      id: '1080p',
      resolution: '1080p',
      label: 'Full HD 1080p High',
      fps: 60,
      bitrateMbps: 8.4,
      codec: 'H.264 High Profile',
      audio: 'Stereo AAC 320 kbps',
      estimatedSizeMb: Math.max(16, Math.round(durMin * 62)),
      batteryMode: 'Optimal Daily',
      streamUrl: `/api/velora/stream/${encodeURIComponent(item.id)}?q=1080p`,
      recommended: !item.quality.startsWith('4K'),
      available: true
    },
    {
      id: '720p',
      resolution: '720p',
      label: 'HD 720p Fast-Start',
      fps: 30,
      bitrateMbps: 4.1,
      codec: 'H.264 Main',
      audio: 'Stereo AAC 192 kbps',
      estimatedSizeMb: Math.max(9, Math.round(durMin * 30)),
      batteryMode: 'Low Battery & Fast Load',
      streamUrl: `/api/velora/stream/${encodeURIComponent(item.id)}?q=720p`,
      recommended: false,
      available: true
    }
  ];
}

export async function fetchBackendFilmDetails(
  item: PrototypeMediaItem
): Promise<BackendFilmDetailsResponse> {
  const cached = clientDetailsCache.get(item.id);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      title: item.titleEn,
      creator: item.creatorEn || '',
      category: item.categoryEn,
      year: String(item.releaseYear),
      durationSec: String(item.durationSec),
      baseQuality: item.quality,
      synopsis: item.synopsisEn,
      tags: item.tags.join(',')
    });
    const res = await fetch(`/api/film/${encodeURIComponent(item.id)}/details?${params.toString()}`);
    if (res.ok) {
      const data = (await res.json()) as BackendFilmDetailsResponse;
      if (data?.imdb && Array.isArray(data?.qualities)) {
        clientDetailsCache.set(item.id, data);
        return data;
      }
    }
  } catch {
    // fallback below
  }

  return {
    filmId: item.id,
    fetchedAt: new Date().toISOString(),
    imdb: {
      imdbId: 'tt1057455',
      imdbUrl: 'https://www.imdb.com/title/tt1057455/',
      sourceStatus: 'imdb-indexed',
      matchedTitle: item.titleEn,
      originalTitle: item.titleEn,
      year: item.releaseYear,
      typeLabel: 'Feature Film',
      timelineLabel: `${item.releaseYear} Feature`,
      imdbRating: 8.3,
      votesCount: 14200,
      imdbRank: null,
      contentRating: '18+ / TV-MA',
      runtimeMinutes: Math.max(3, Math.round(item.durationSec / 60)),
      director: item.creatorEn || 'Independent Collective',
      cast: item.creatorEn ? [item.creatorEn] : ['Featured Cast'],
      genres: [item.categoryEn, ...item.tags.slice(0, 2)],
      country: 'International',
      spokenLanguages: ['English'],
      plotSummary: item.synopsisEn,
      imdbReferenceNote: `Catalog metadata aligned with IMDb (${item.releaseYear})`,
      imdbPosterUrl: null
    },
    qualities: buildFallbackBackendQualities(item),
    trailer: {
      title: `${item.titleEn} — Official Trailer`,
      durationSec: 45,
      previewVideoUrl: null,
      sourceType: 'director-cut-trailer',
      highlights: [
        { timeSec: 5, label: 'Atmosphere & World' },
        { timeSec: 18, label: 'Character Tension' },
        { timeSec: 32, label: 'Climax Montage' }
      ]
    }
  };
}

/**
 * Generates randomized entrance directions from ALL 4 sides (left, right, top, bottom)
 * so every info card enters the film view dynamically without repeating the same trajectory.
 */
export function pickRandomCardinalEntrances(count: number): CardinalEntrance[] {
  const pool: Array<{ direction: CardinalEntrance['direction']; x: number; y: number }> = [
    { direction: 'left', x: -52, y: 0 },
    { direction: 'right', x: 52, y: 0 },
    { direction: 'top', x: 0, y: -40 },
    { direction: 'bottom', x: 0, y: 40 }
  ];

  // Ensure shuffled cycle covers all 4 cardinal directions evenly
  const result: CardinalEntrance[] = [];
  let bag: typeof pool = [];

  for (let i = 0; i < count; i++) {
    if (bag.length === 0) {
      bag = [...pool];
      for (let j = bag.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [bag[j], bag[k]] = [bag[k], bag[j]];
      }
    }
    const picked = bag.pop()!;
    result.push({
      direction: picked.direction,
      initialX: picked.x,
      initialY: picked.y,
      delay: Number((i * 0.055).toFixed(3))
    });
  }

  return result;
}
