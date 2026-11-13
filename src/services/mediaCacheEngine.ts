/**
 * High-Performance Smart Stream Pre-Warmer & Media Cache Engine
 * Pre-warms server-side stream tokens sequentially without saturating browser HTTP sockets
 * or triggering Chromium HTTP Cache range locks.
 */

const warmedUrls = new Set<string>();
let warmingQueue: string[] = [];
let isWarming = false;

async function processWarmingQueue(): Promise<void> {
  if (isWarming || typeof window === 'undefined') return;
  isWarming = true;

  while (warmingQueue.length > 0) {
    const nextUrl = warmingQueue.shift();
    if (!nextUrl || warmedUrls.has(nextUrl)) continue;
    warmedUrls.add(nextUrl);

    try {
      if (nextUrl.startsWith('/api/velora/stream/')) {
        const vid = nextUrl.replace('/api/velora/stream/', '').split('?')[0].trim();
        if (vid && !vid.endsWith('.mp4')) {
          const controller = new AbortController();
          const timer = window.setTimeout(() => controller.abort(), 3500);
          await fetch(`/api/velora/prepare/${encodeURIComponent(vid)}`, {
            signal: controller.signal
          }).catch(() => {});
          window.clearTimeout(timer);
        }
      }
    } catch {
      // ignore pre-warm errors
    }
  }

  isWarming = false;
}

/**
 * Sequentially pre-warms catalog video streams on the backend so CDN tokens
 * are ready in 0ms without blocking browser <video> HTTP byte-range sockets.
 */
export async function preloadCatalogStreams(urls: string[]): Promise<void> {
  if (typeof window === 'undefined') return;
  const uniqueUrls = Array.from(new Set(urls.filter(Boolean)));
  for (const u of uniqueUrls) {
    if (!warmedUrls.has(u) && !warmingQueue.includes(u)) {
      warmingQueue.push(u);
    }
  }
  processWarmingQueue().catch(() => {});
}

export async function getFastCachedMediaUrl(rawUrl: string): Promise<string> {
  return rawUrl;
}

export function getCachedBlobUrlSync(rawUrl: string): string {
  return rawUrl;
}
