import type {
  FeedbackRecord,
  LanguageCode,
  OfflineDownloadRecord,
  PrototypeMediaItem,
  SearchFilterState,
  TasteVector6D,
  UserAccountState,
  UserCollection,
  WatchProgressEntry
} from './types';

export const VAULT_STORAGE_KEY = 'aether_universe_inapp_memory_v1';
const IDB_NAME = 'AetherUniverseVaultDB';
const IDB_STORE = 'memorySnapshots';
const IDB_RECORD_KEY = 'primary_snapshot';

export interface InAppVaultSnapshot {
  version: number;
  updatedAt: string;
  lang: LanguageCode;
  onboardingDone: boolean;
  user: UserAccountState;
  userVector: TasteVector6D;
  progressMap: Record<string, WatchProgressEntry>;
  favoriteIds: string[];
  hiddenIds: string[];
  recentIds: string[];
  feedbackMap: Record<string, FeedbackRecord>;
  collections: UserCollection[];
  downloads?: Record<string, OfflineDownloadRecord>;
  searchFilters: SearchFilterState;
  catalog: PrototypeMediaItem[];
}

export function loadVaultSnapshot(): InAppVaultSnapshot | null {
  try {
    const raw = window.localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<InAppVaultSnapshot>;
    if (!parsed || parsed.version !== 1 || !parsed.user || !parsed.userVector) {
      return null;
    }
    return parsed as InAppVaultSnapshot;
  } catch {
    return null;
  }
}

function openVaultIdb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      resolve(null);
      return;
    }
    try {
      const req = window.indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveVaultSnapshot(snapshot: InAppVaultSnapshot): Promise<void> {
  const serialized = JSON.stringify(snapshot);
  try {
    window.localStorage.setItem(VAULT_STORAGE_KEY, serialized);
  } catch {
    // Quota or private mode fallback still proceeds to IndexedDB below
  }

  const db = await openVaultIdb();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(snapshot, IDB_RECORD_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } finally {
    db.close();
  }
}

export async function loadVaultFromIndexedDb(): Promise<InAppVaultSnapshot | null> {
  const db = await openVaultIdb();
  if (!db) return null;
  try {
    return await new Promise<InAppVaultSnapshot | null>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(IDB_RECORD_KEY);
      req.onsuccess = () => {
        const val = req.result as Partial<InAppVaultSnapshot> | undefined;
        if (val && val.version === 1 && val.user && val.userVector) {
          resolve(val as InAppVaultSnapshot);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } finally {
    db.close();
  }
}

export async function clearVaultSnapshot(): Promise<void> {
  try {
    window.localStorage.removeItem(VAULT_STORAGE_KEY);
  } catch {
    // ignore
  }
  const db = await openVaultIdb();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete(IDB_RECORD_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } finally {
    db.close();
  }
}

export function getVaultByteSize(): number {
  try {
    const raw = window.localStorage.getItem(VAULT_STORAGE_KEY) || '';
    return new Blob([raw]).size;
  } catch {
    return 0;
  }
}
