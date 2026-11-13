import type { OfflineDownloadRecord, PrototypeMediaItem } from './types';

const OFFLINE_DB_NAME = 'AetherOfflineMediaDB';
const OFFLINE_BLOB_STORE = 'mediaBlobs';

function openOfflineDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      resolve(null);
      return;
    }
    try {
      const req = window.indexedDB.open(OFFLINE_DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(OFFLINE_BLOB_STORE)) {
          db.createObjectStore(OFFLINE_BLOB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveOfflineMediaBlob(contentId: string, blob: Blob): Promise<void> {
  const db = await openOfflineDb();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(OFFLINE_BLOB_STORE, 'readwrite');
      tx.objectStore(OFFLINE_BLOB_STORE).put(blob, contentId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } finally {
    db.close();
  }
}

export async function loadOfflineMediaBlob(contentId: string): Promise<Blob | null> {
  const db = await openOfflineDb();
  if (!db) return null;
  try {
    return await new Promise<Blob | null>((resolve) => {
      const tx = db.transaction(OFFLINE_BLOB_STORE, 'readonly');
      const req = tx.objectStore(OFFLINE_BLOB_STORE).get(contentId);
      req.onsuccess = () => {
        const res = req.result;
        resolve(res instanceof Blob ? res : null);
      };
      req.onerror = () => resolve(null);
    });
  } finally {
    db.close();
  }
}

export async function deleteOfflineMediaBlob(contentId: string): Promise<void> {
  const db = await openOfflineDb();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(OFFLINE_BLOB_STORE, 'readwrite');
      tx.objectStore(OFFLINE_BLOB_STORE).delete(contentId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } finally {
    db.close();
  }
}

/**
 * Generates a real playable video clip (.webm via Canvas + MediaRecorder when supported,
 * otherwise a clean HTML5 offline cinema package / poster image) so downloads work
 * both for In-App Offline Playback and for direct Save-to-Device file download.
 */
export async function generateDownloadableMediaClip(
  item: PrototypeMediaItem,
  onProgress: (pct: number) => void
): Promise<{ blob: Blob; filename: string; mimeType: string }> {
  onProgress(15);
  const slug = item.titleEn
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || item.id;

  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 540;
  const ctx = canvas.getContext('2d');

  // Load poster image so the generated video clip renders the actual artwork with atmospheric motion
  const img = await new Promise<HTMLImageElement | null>((resolve) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = item.posterUrl;
  });

  onProgress(35);

  const supportsRecorder =
    typeof MediaRecorder !== 'undefined' &&
    typeof (canvas as HTMLCanvasElement & { captureStream?: (fps?: number) => MediaStream }).captureStream ===
      'function';

  if (ctx && supportsRecorder) {
    const mimeCandidate = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : '';

    if (mimeCandidate) {
      const stream = (
        canvas as HTMLCanvasElement & { captureStream: (fps?: number) => MediaStream }
      ).captureStream(24);
      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(stream, { mimeType: mimeCandidate });
      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunks.push(ev.data);
      };

      const recordingPromise = new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: 'video/webm' }));
        };
      });

      recorder.start(250);
      const totalFrames = 48; // ~2 seconds high-clarity playable offline clip
      for (let f = 0; f < totalFrames; f += 1) {
        ctx.fillStyle = '#06070C';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (img) {
          const driftX = Math.sin(f * 0.08) * 10;
          ctx.globalAlpha = 0.92;
          ctx.drawImage(img, driftX - 12, -8, canvas.width + 24, canvas.height + 16);
          ctx.globalAlpha = 1;
        }
        const grad = ctx.createLinearGradient(0, canvas.height * 0.5, 0, canvas.height);
        grad.addColorStop(0, 'rgba(6,7,12,0)');
        grad.addColorStop(1, 'rgba(6,7,12,0.88)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#F5B942';
        ctx.font = 'bold 26px "Cinzel", "Lalezar", serif';
        ctx.fillText(item.titleEn, 36, canvas.height - 54);
        ctx.fillStyle = '#A3AEC2';
        ctx.font = '16px "Courier Prime", monospace';
        ctx.fillText(`${item.quality} · Offline Clip`, 36, canvas.height - 26);

        onProgress(35 + Math.round(((f + 1) / totalFrames) * 55));
        await new Promise((r) => window.setTimeout(r, 38));
      }

      recorder.stop();
      stream.getTracks().forEach((t) => t.stop());
      const blob = await recordingPromise;
      onProgress(100);
      return { blob, filename: `${slug}.webm`, mimeType: 'video/webm' };
    }
  }

  // Fallback if headless/limited browser has no MediaRecorder: fetch poster asset as real image/jpeg blob
  onProgress(70);
  try {
    const resp = await fetch(item.posterUrl);
    const blob = await resp.blob();
    onProgress(100);
    return { blob, filename: `${slug}.jpg`, mimeType: blob.type || 'image/jpeg' };
  } catch {
    const jsonBlob = new Blob([JSON.stringify(item, null, 2)], { type: 'application/json' });
    onProgress(100);
    return { jsonBlob, blob: jsonBlob, filename: `${slug}-offline.json`, mimeType: 'application/json' } as unknown as {
      blob: Blob;
      filename: string;
      mimeType: string;
    };
  }
}

export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export type { OfflineDownloadRecord };
