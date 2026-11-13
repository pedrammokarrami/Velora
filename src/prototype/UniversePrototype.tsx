import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Compass,
  Film,
  Globe2,
  Home,
  Search,
  Settings
} from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import type {
  FeedbackRecord,
  LanguageCode,
  LibraryTab,
  OfflineDownloadRecord,
  PrototypeMediaItem,
  PrototypeRoute,
  SearchFilterState,
  TasteVector6D,
  UiSimulationState,
  UserAccountState,
  UserCollection,
  WatchProgressEntry
} from './types';
import { INITIAL_USER_STATE, PROTOTYPE_MEDIA_CATALOG } from './prototypeData';
import {
  blendVector,
  calibrateColdStartVector,
  DEFAULT_TASTE_VECTOR
} from './tasteEngine';
import {
  clearVaultSnapshot,
  getVaultByteSize,
  loadVaultFromIndexedDb,
  loadVaultSnapshot,
  saveVaultSnapshot
} from './localVault';
import {
  deleteOfflineMediaBlob,
  formatBytes,
  generateDownloadableMediaClip,
  loadOfflineMediaBlob,
  saveOfflineMediaBlob,
  triggerBrowserDownload
} from './downloadEngine';
import {
  getLanguageDirection,
  I18nProvider,
  LanguagePickerModal,
  useT
} from './i18n';
import type { BackendStreamQuality } from './filmDetailsClient';
import { StateBoundary, ToastBanner, ToastMessage } from './components/UiPrimitives';
import { EntryFlow } from './screens/EntryFlow';
import { LivingHomeScreen } from './screens/LivingHomeScreen';
import { DiscoveryUniverseScreen } from './screens/DiscoveryUniverseScreen';
import { IntelligentSearchScreen } from './screens/IntelligentSearchScreen';
import { ContentDetailModal } from './screens/ContentDetailModal';
import { CinematicPlayerScreen } from './screens/CinematicPlayerScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { SettingsScreen } from './screens/SettingsScreen';

const INITIAL_PROGRESS_SEED: Record<string, WatchProgressEntry> = {
  'proto-01': {
    contentId: 'proto-01',
    positionSec: 185,
    durationSec: 540,
    completed: false,
    lastWatchedAt: new Date(Date.now() - 3600_000).toISOString()
  },
  'proto-03': {
    contentId: 'proto-03',
    positionSec: 210,
    durationSec: 615,
    completed: false,
    lastWatchedAt: new Date(Date.now() - 7200_000).toISOString()
  }
};

const INITIAL_COLLECTIONS_SEED: UserCollection[] = [
  {
    id: 'col-late-night',
    name: 'شب‌های بارانی و آرام',
    itemIds: ['proto-01', 'proto-03'],
    createdAt: new Date().toISOString()
  }
];

const INITIAL_SEARCH_FILTERS: SearchFilterState = {
  query: '',
  mode: 'all',
  excludeTags: [],
  maxDurationMin: null,
  minQuality: 'all',
  unwatchedOnly: false,
  sortBy: 'relevance'
};

function sanitizeLoadedDownloads(
  raw?: Record<string, OfflineDownloadRecord>
): Record<string, OfflineDownloadRecord> {
  if (!raw) return {};
  const cleaned: Record<string, OfflineDownloadRecord> = {};
  for (const [id, rec] of Object.entries(raw)) {
    if (rec && rec.status === 'completed') {
      cleaned[id] = rec;
    }
  }
  return cleaned;
}

function buildDownloadFilename(item: PrototypeMediaItem, mimeType: string): string {
  const slug =
    item.titleEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || item.id;
  if (mimeType.includes('webm')) return `${slug}.webm`;
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return `${slug}.jpg`;
  if (mimeType.includes('png')) return `${slug}.png`;
  return `${slug}-offline.json`;
}

export function UniversePrototype() {
  const initialVault = useMemo(() => loadVaultSnapshot(), []);
  const [lang, setLang] = useState<LanguageCode>(() => initialVault?.lang ?? 'fa');

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = getLanguageDirection(lang);
  }, [lang]);

  return (
    <I18nProvider lang={lang} onChangeLang={setLang}>
      <UniversePrototypeShell initialVault={initialVault} lang={lang} setLang={setLang} />
    </I18nProvider>
  );
}

function UniversePrototypeShell({
  initialVault,
  lang,
  setLang
}: {
  initialVault: ReturnType<typeof loadVaultSnapshot>;
  lang: LanguageCode;
  setLang: React.Dispatch<React.SetStateAction<LanguageCode>>;
}) {
  const { t, languageInfo } = useT();

  const [onboardingDone, setOnboardingDone] = useState<boolean>(
    () => Boolean(initialVault?.onboardingDone || initialVault?.user?.ageVerified)
  );
  const [route, setRoute] = useState<PrototypeRoute>(() =>
    initialVault?.onboardingDone || initialVault?.user?.ageVerified ? 'universe' : 'welcome'
  );
  const [uiState, setUiState] = useState<UiSimulationState>('normal');
  const [libraryTabRequest, setLibraryTabRequest] = useState<LibraryTab | undefined>(undefined);
  const [langPickerOpen, setLangPickerOpen] = useState(false);

  const [catalog, setCatalog] = useState<PrototypeMediaItem[]>(
    () => initialVault?.catalog ?? PROTOTYPE_MEDIA_CATALOG
  );
  const [user, setUser] = useState<UserAccountState>(() => initialVault?.user ?? INITIAL_USER_STATE);
  const [userVector, setUserVector] = useState<TasteVector6D>(
    () => initialVault?.userVector ?? DEFAULT_TASTE_VECTOR
  );

  const [progressMap, setProgressMap] = useState<Record<string, WatchProgressEntry>>(
    () => initialVault?.progressMap ?? INITIAL_PROGRESS_SEED
  );
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(
    () => new Set(initialVault?.favoriteIds ?? ['proto-01', 'proto-05'])
  );
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(
    () => new Set(initialVault?.hiddenIds ?? [])
  );
  const [recentIds, setRecentIds] = useState<string[]>(
    () => initialVault?.recentIds ?? ['proto-01', 'proto-03']
  );
  const [feedbackMap, setFeedbackMap] = useState<Record<string, FeedbackRecord>>(
    () => initialVault?.feedbackMap ?? {}
  );
  const [collections, setCollections] = useState<UserCollection[]>(
    () => initialVault?.collections ?? INITIAL_COLLECTIONS_SEED
  );
  const [downloadsMap, setDownloadsMap] = useState<Record<string, OfflineDownloadRecord>>(() =>
    sanitizeLoadedDownloads(initialVault?.downloads)
  );
  const downloadsMapRef = useRef(downloadsMap);
  downloadsMapRef.current = downloadsMap;

  const [searchFilters, setSearchFilters] = useState<SearchFilterState>(
    () => initialVault?.searchFilters ?? INITIAL_SEARCH_FILTERS
  );
  const [selectedDetailItem, setSelectedDetailItem] = useState<PrototypeMediaItem | null>(null);
  const [playingItem, setPlayingItem] = useState<PrototypeMediaItem | null>(null);
  const [playingQualityId, setPlayingQualityId] = useState<string | undefined>(undefined);
  const [playingPlaybackMode, setPlayingPlaybackMode] = useState<'movie' | 'trailer'>('movie');
  const [previousRouteBeforeWatch, setPreviousRouteBeforeWatch] =
    useState<PrototypeRoute>('universe');

  const [vaultSizeBytes, setVaultSizeBytes] = useState<number>(() => getVaultByteSize());
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // If localStorage was empty on boot, recover from IndexedDB backup if available
  useEffect(() => {
    if (initialVault) return;
    let active = true;
    void loadVaultFromIndexedDb().then((idbSnap) => {
      if (!active || !idbSnap) return;
      setLang(idbSnap.lang);
      setOnboardingDone(Boolean(idbSnap.onboardingDone || idbSnap.user?.ageVerified));
      if (idbSnap.onboardingDone || idbSnap.user?.ageVerified) {
        setRoute('universe');
      }
      setCatalog(idbSnap.catalog);
      setUser(idbSnap.user);
      setUserVector(idbSnap.userVector);
      setProgressMap(idbSnap.progressMap);
      setFavoriteIds(new Set(idbSnap.favoriteIds));
      setHiddenIds(new Set(idbSnap.hiddenIds));
      setRecentIds(idbSnap.recentIds);
      setFeedbackMap(idbSnap.feedbackMap);
      setCollections(idbSnap.collections);
      setDownloadsMap(sanitizeLoadedDownloads(idbSnap.downloads));
      setSearchFilters(idbSnap.searchFilters);
    });
    return () => {
      active = false;
    };
  }, [initialVault, setLang]);

  // Persist everything inside the application automatically on any change
  useEffect(() => {
    const snapshot = {
      version: 1,
      updatedAt: new Date().toISOString(),
      lang,
      onboardingDone,
      user,
      userVector,
      progressMap,
      favoriteIds: Array.from(favoriteIds),
      hiddenIds: Array.from(hiddenIds),
      recentIds,
      feedbackMap,
      collections,
      downloads: sanitizeLoadedDownloads(downloadsMap),
      searchFilters,
      catalog
    };
    void saveVaultSnapshot(snapshot).then(() => {
      setVaultSizeBytes(getVaultByteSize());
    });
  }, [
    lang,
    onboardingDone,
    user,
    userVector,
    progressMap,
    favoriteIds,
    hiddenIds,
    recentIds,
    feedbackMap,
    collections,
    downloadsMap,
    searchFilters,
    catalog
  ]);

  // Global keyboard shortcut: Cmd/Ctrl + K jumps directly to Intelligent Search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setRoute('search');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((text: string, undoLabel?: string, onUndo?: () => void) => {
    setToast({ id: `${Date.now()}`, text, undoLabel, onUndo });
  }, []);

  const navigateTo = useCallback((nextRoute: PrototypeRoute) => {
    if (nextRoute !== 'library') {
      setLibraryTabRequest(undefined);
    }
    setRoute(nextRoute);
  }, []);

  const handleUpdateUser = useCallback((patch: Partial<UserAccountState>) => {
    setUser((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleApplyOnboardingPresets = useCallback(
    (presets: string[], blockedTopics: string[]) => {
      setUserVector(calibrateColdStartVector(presets));
      setUser((prev) => ({ ...prev, blockedTopics }));
      setOnboardingDone(true);
    },
    []
  );

  const handleQuickEnterUniverse = useCallback(() => {
    setUser((prev) => ({
      ...prev,
      ageVerified: true
    }));
    setOnboardingDone(true);
    setRoute('universe');
  }, []);

  const handleOpenDetail = useCallback((item: PrototypeMediaItem) => {
    setSelectedDetailItem(item);
    setRecentIds((prev) => [item.id, ...prev.filter((x) => x !== item.id)].slice(0, 12));
  }, []);

  const handlePlayItem = useCallback(
    (item: PrototypeMediaItem, selectedQuality?: BackendStreamQuality) => {
      setSelectedDetailItem(null);
      if (route !== 'watch') {
        setPreviousRouteBeforeWatch(route);
      }
      setPlayingItem(item);
      setPlayingQualityId(selectedQuality?.id);
      setPlayingPlaybackMode('movie');
      setRecentIds((prev) => [item.id, ...prev.filter((x) => x !== item.id)].slice(0, 12));
      setRoute('watch');
      if (user.personalizationEnabled) {
        setUserVector((prev) => blendVector(prev, item.vector, 0.12));
      }
    },
    [route, user.personalizationEnabled]
  );

  const handleWatchTrailer = useCallback(
    (item: PrototypeMediaItem, selectedQuality?: BackendStreamQuality) => {
      setSelectedDetailItem(null);
      if (route !== 'watch') {
        setPreviousRouteBeforeWatch(route);
      }
      setPlayingItem(item);
      setPlayingQualityId(selectedQuality?.id);
      setPlayingPlaybackMode('trailer');
      setRoute('watch');
    },
    [route]
  );

  // Offline Download Engine (In-App IndexedDB Vault + Direct Save to Device)
  const handleDownloadItem = useCallback(
    async (
      item: PrototypeMediaItem,
      saveFileToDevice = false,
      selectedQuality?: BackendStreamQuality
    ) => {
      const existing = downloadsMapRef.current[item.id];
      if (existing?.status === 'downloading') return;
      const itemTitle = t(item.titleEn, item.titleFa);
      const effectiveQuality = selectedQuality?.resolution || item.quality;

      if (existing?.status === 'completed') {
        const cachedBlob = await loadOfflineMediaBlob(item.id);
        if (cachedBlob) {
          if (saveFileToDevice) {
            triggerBrowserDownload(cachedBlob, buildDownloadFilename(item, existing.mimeType));
            showToast(`${itemTitle} — ${t('Saved to your device.', 'در دستگاه شما ذخیره شد.')}`);
          } else {
            showToast(
              `${itemTitle} — ${t('Already saved in Offline Library.', 'قبلاً در کتابخانه آفلاین ذخیره شده است.')}`,
              t('Open Downloads', 'مشاهده دانلودها'),
              () => {
                setLibraryTabRequest('downloads');
                setRoute('library');
              }
            );
          }
          return;
        }
      }

      setDownloadsMap((prev) => ({
        ...prev,
        [item.id]: {
          contentId: item.id,
          titleFa: item.titleFa,
          titleEn: item.titleEn,
          quality: effectiveQuality,
          fileSizeBytes: 0,
          mimeType: 'video/webm',
          downloadedAt: new Date().toISOString(),
          status: 'downloading',
          progressPct: 8
        }
      }));

      let lastPct = 8;
      const result = await generateDownloadableMediaClip(item, (pct) => {
        if (pct - lastPct < 10 && pct < 100) return;
        lastPct = pct;
        setDownloadsMap((prev) => {
          const cur = prev[item.id];
          if (!cur || cur.status !== 'downloading') return prev;
          return {
            ...prev,
            [item.id]: { ...cur, progressPct: pct }
          };
        });
      });

      await saveOfflineMediaBlob(item.id, result.blob);

      setDownloadsMap((prev) => ({
        ...prev,
        [item.id]: {
          contentId: item.id,
          titleFa: item.titleFa,
          titleEn: item.titleEn,
          quality: effectiveQuality,
          fileSizeBytes: result.blob.size,
          mimeType: result.mimeType,
          downloadedAt: new Date().toISOString(),
          status: 'completed',
          progressPct: 100
        }
      }));

      if (saveFileToDevice) {
        triggerBrowserDownload(result.blob, result.filename);
      }

      showToast(
        `${t('Downloaded', 'دانلود کامل شد')}: ${itemTitle} (${formatBytes(result.blob.size)})`,
        t('Downloads', 'دانلودهای من'),
        () => {
          setLibraryTabRequest('downloads');
          setRoute('library');
        }
      );
    },
    [showToast, t]
  );

  const handleSaveDownloadToDevice = useCallback(
    async (item: PrototypeMediaItem) => {
      const existing = downloadsMapRef.current[item.id];
      const blob = await loadOfflineMediaBlob(item.id);
      if (blob) {
        triggerBrowserDownload(blob, buildDownloadFilename(item, existing?.mimeType || blob.type));
        showToast(
          `${t(item.titleEn, item.titleFa)} — ${t('Saved file to device.', 'فایل روی دستگاه دانلود شد.')}`
        );
        return;
      }
      await handleDownloadItem(item, true);
    },
    [handleDownloadItem, showToast, t]
  );

  const handleDeleteDownload = useCallback(
    (contentId: string) => {
      void deleteOfflineMediaBlob(contentId);
      setDownloadsMap((prev) => {
        const next = { ...prev };
        delete next[contentId];
        return next;
      });
      showToast(t('Offline download deleted.', 'فایل آفلاین حذف شد.'));
    },
    [showToast, t]
  );

  const handleToggleFavorite = useCallback(
    (item: PrototypeMediaItem) => {
      const wasFavorite = favoriteIds.has(item.id);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorite) {
          next.delete(item.id);
        } else {
          next.add(item.id);
        }
        return next;
      });
      if (wasFavorite) {
        showToast(t('Removed from Favorites', 'از علاقه‌مندی‌ها حذف شد'));
      } else {
        showToast(t('Added to Favorites', 'به علاقه‌مندی‌ها اضافه شد'));
        if (user.personalizationEnabled) {
          setUserVector((v) => blendVector(v, item.vector, 0.16));
        }
      }
    },
    [favoriteIds, showToast, t, user.personalizationEnabled]
  );

  const handleFeedback = useCallback(
    (item: PrototypeMediaItem, sentiment: 'like' | 'dislike' | 'less_like_this') => {
      const prevRecord = feedbackMap[item.id];
      const prevVec = userVector;
      setFeedbackMap((prev) => ({
        ...prev,
        [item.id]: { contentId: item.id, sentiment, updatedAt: new Date().toISOString() }
      }));

      if (user.personalizationEnabled) {
        if (sentiment === 'like') {
          setUserVector((v) => blendVector(v, item.vector, 0.24));
        } else {
          const invertedTarget: TasteVector6D = {
            tension: 1 - item.vector.tension,
            pace: 1 - item.vector.pace,
            surrealism: 1 - item.vector.surrealism,
            nocturnal: 1 - item.vector.nocturnal,
            intimacy: 1 - item.vector.intimacy,
            depth: 1 - item.vector.depth
          };
          setUserVector((v) => blendVector(v, invertedTarget, 0.18));
        }
      }

      showToast(
        sentiment === 'like'
          ? t('Taste calibrated (More like this)', 'سلیقه شما به‌روزرسانی شد (مشابه این بیشتر)')
          : t('Feed tuned down for this style', 'رتبه‌بندی تطبیق داده شد (کمتر از این سبک)'),
        t('Undo', 'بازگردانی'),
        () => {
          setFeedbackMap((curr) => {
            const copy = { ...curr };
            if (prevRecord) copy[item.id] = prevRecord;
            else delete copy[item.id];
            return copy;
          });
          setUserVector(prevVec);
        }
      );
    },
    [feedbackMap, userVector, user.personalizationEnabled, showToast, t]
  );

  const handleHideItem = useCallback(
    (item: PrototypeMediaItem) => {
      setHiddenIds((prev) => {
        const next = new Set(prev);
        next.add(item.id);
        return next;
      });
      showToast(
        t('Item hidden from your feeds', 'این مورد از فید شما مخفی شد'),
        t('Undo', 'لغو مخفی‌سازی'),
        () => {
          setHiddenIds((prev) => {
            const next = new Set(prev);
            next.delete(item.id);
            return next;
          });
        }
      );
    },
    [showToast, t]
  );

  const handleSaveProgress = useCallback(
    (contentId: string, positionSec: number, durationSec: number, completed: boolean) => {
      setProgressMap((prev) => ({
        ...prev,
        [contentId]: {
          contentId,
          positionSec,
          durationSec,
          completed,
          lastWatchedAt: new Date().toISOString()
        }
      }));
    },
    []
  );

  const handlePersonalizeTasteFromSearch = useCallback(
    (targetVector: TasteVector6D, alpha = 0.32) => {
      if (!user.personalizationEnabled) return;
      setUserVector((prev) => blendVector(prev, targetVector, alpha));
    },
    [user.personalizationEnabled]
  );

  const handleExportPersonalData = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      storageEngine: 'In-App Local Vault (localStorage + IndexedDB)',
      userAccount: user,
      tasteVector6D: userVector,
      watchProgress: progressMap,
      favoriteIds: Array.from(favoriteIds),
      collections,
      downloads: downloadsMap,
      feedbackMap
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal-universe-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(
      t('Personal JSON archive downloaded.', 'خروجی داده‌های شما در قالب فایل JSON دانلود شد.')
    );
  }, [user, userVector, progressMap, favoriteIds, collections, downloadsMap, feedbackMap, showToast, t]);

  const handleResetPrototype = useCallback(() => {
    Object.keys(downloadsMapRef.current).forEach((id) => {
      void deleteOfflineMediaBlob(id);
    });
    void clearVaultSnapshot();
    setCatalog(PROTOTYPE_MEDIA_CATALOG);
    setUser(INITIAL_USER_STATE);
    setUserVector(DEFAULT_TASTE_VECTOR);
    setProgressMap(INITIAL_PROGRESS_SEED);
    setFavoriteIds(new Set(['proto-01', 'proto-05']));
    setHiddenIds(new Set());
    setRecentIds(['proto-01', 'proto-03']);
    setFeedbackMap({});
    setCollections(INITIAL_COLLECTIONS_SEED);
    setDownloadsMap({});
    setSearchFilters(INITIAL_SEARCH_FILTERS);
    setUiState('normal');
    setOnboardingDone(false);
    showToast(t('In-app memory wiped and reset cleanly.', 'حافظه داخل اپلیکیشن پاک‌سازی و بازنشانی شد.'));
  }, [showToast, t]);

  const effectiveNavItems: Array<{
    id: PrototypeRoute;
    fa: string;
    en: string;
    icon: React.ReactNode;
  }> = useMemo(
    () => [
      { id: 'universe', fa: 'جهان من', en: 'My Universe', icon: <Home className="h-4 w-4" /> },
      { id: 'discover', fa: 'کاوش سه‌بعدی', en: 'Discover Map', icon: <Compass className="h-4 w-4" /> },
      { id: 'search', fa: 'جست‌وجو', en: 'Search', icon: <Search className="h-4 w-4" /> },
      { id: 'library', fa: 'کتابخانه', en: 'Library', icon: <Film className="h-4 w-4" /> },
      { id: 'settings', fa: 'تنظیمات', en: 'Settings', icon: <Settings className="h-4 w-4" /> }
    ],
    []
  );

  // Entry Gate Routes render full-screen without main app chrome
  if (
    route === 'splash' ||
    route === 'welcome' ||
    route === 'age-gate' ||
    route === 'onboarding'
  ) {
    return (
      <MotionConfig reducedMotion={user.reducedMotion ? 'always' : 'user'}>
        <div className={user.highContrast ? 'contrast-125' : ''}>
          <EntryFlow
            route={route}
            lang={lang}
            user={user}
            onOpenLanguagePicker={() => setLangPickerOpen(true)}
            onNavigate={(nextRoute) => {
              if (nextRoute === 'universe') {
                setOnboardingDone(true);
              }
              navigateTo(nextRoute);
            }}
            onUpdateUser={handleUpdateUser}
            onApplyOnboardingPresets={handleApplyOnboardingPresets}
            onQuickEnterUniverse={handleQuickEnterUniverse}
          />
          <LanguagePickerModal
            isOpen={langPickerOpen}
            currentLang={lang}
            onSelect={setLang}
            onClose={() => setLangPickerOpen(false)}
          />
          <ToastBanner toast={toast} onDismiss={() => setToast(null)} />
        </div>
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion={user.reducedMotion ? 'always' : 'user'}>
      <div
        className={`min-h-[100dvh] bg-[#06070C] text-[#F5F7FA] flex flex-col ${
          user.highContrast ? 'contrast-125' : ''
        } ${user.reducedMotion ? 'reduced-motion-mode' : ''}`}
      >
        {/* Top Clean 3-Zone Header */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#06070C]/90 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
            {/* Zone 1: Brand */}
            <button
              type="button"
              onClick={() => navigateTo('universe')}
              className="min-h-[44px] flex items-center gap-2.5 text-start cursor-pointer shrink-0"
            >
              <span className="font-editorial text-lg sm:text-xl tracking-[0.16em] text-[#F5B942]">
                AETHER
              </span>
              <span className="hidden xl:inline text-[11px] font-medium text-[#A3AEC2]">
                {t('Personal Entertainment Universe', 'جهان سرگرمی شخصی')}
              </span>
            </button>

            {/* Zone 2: Desktop Single-Line Primary Links with Sliding Indicator */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
              {effectiveNavItems.map((nav) => {
                const active = route === nav.id;
                return (
                  <button
                    key={nav.id}
                    type="button"
                    onClick={() => navigateTo(nav.id)}
                    className={`relative min-h-[40px] inline-flex items-center gap-1.5 rounded-full px-3.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      active
                        ? 'text-[#06070C] font-semibold'
                        : 'text-[#A3AEC2] hover:text-[#F5F7FA] hover:bg-white/[0.06]'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="desktopNavPill"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-[#F5B942]"
                      />
                    )}
                    <span className="relative z-10 inline-flex items-center gap-1.5">
                      {nav.icon}
                      <span>{t(nav.en, nav.fa)}</span>
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Global World Language Picker */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setLangPickerOpen(true)}
                aria-label={t('Select World Language', 'انتخاب زبان اپلیکیشن')}
                className="min-h-[40px] inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0D101A] px-3 text-xs font-medium text-[#F5F7FA] hover:border-[#F5B942]/55 cursor-pointer whitespace-nowrap"
              >
                <Globe2 className="h-3.5 w-3.5 text-[#F5B942]" />
                <span className="hidden sm:inline">{languageInfo.nativeName}</span>
                <span className="sm:hidden uppercase">{lang}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-[calc(5.25rem+env(safe-area-inset-bottom))] md:pb-12">
          <StateBoundary
            uiState={uiState}
            lang={lang}
            onRetry={() => setUiState('normal')}
            onResetFilters={() => {
              setSearchFilters(INITIAL_SEARCH_FILTERS);
              setUiState('normal');
            }}
            onOpenDownloads={() => {
              setUiState('normal');
              setLibraryTabRequest('downloads');
              setRoute('library');
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={route}
                initial={route === 'watch' ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={route === 'watch' ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={route === 'watch' ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                {route === 'universe' && (
                  <LivingHomeScreen
                    catalog={catalog}
                    lang={lang}
                    userVector={userVector}
                    personalizationEnabled={user.personalizationEnabled}
                    progressMap={progressMap}
                    favoriteIds={favoriteIds}
                    downloadsMap={downloadsMap}
                    hiddenIds={hiddenIds}
                    blockedTopics={user.blockedTopics}
                    feedbackMap={feedbackMap}
                    collections={collections}
                    onNavigate={navigateTo}
                    onOpenDetail={handleOpenDetail}
                    onPlay={handlePlayItem}
                    onWatchTrailer={(item) => handleWatchTrailer(item)}
                    onDownload={(item) => void handleDownloadItem(item, false)}
                    onToggleFavorite={handleToggleFavorite}
                    onFeedback={handleFeedback}
                    onHide={handleHideItem}
                    onEnablePersonalization={() =>
                      handleUpdateUser({ personalizationEnabled: true, consentPersonalization: true })
                    }
                  />
                )}

                {route === 'discover' && (
                  <DiscoveryUniverseScreen
                    catalog={catalog}
                    lang={lang}
                    userVector={userVector}
                    personalizationEnabled={user.personalizationEnabled}
                    liteMode={user.liteUniverseMode}
                    reducedMotion={user.reducedMotion}
                    favoriteIds={favoriteIds}
                    downloadsMap={downloadsMap}
                    hiddenIds={hiddenIds}
                    blockedTopics={user.blockedTopics}
                    progressMap={progressMap}
                    feedbackMap={feedbackMap}
                    onToggleLiteMode={(lite) => handleUpdateUser({ liteUniverseMode: lite })}
                    onOpenDetail={handleOpenDetail}
                    onPlay={handlePlayItem}
                    onDownload={(item) => void handleDownloadItem(item, false)}
                    onToggleFavorite={handleToggleFavorite}
                    onFeedback={handleFeedback}
                    onHide={handleHideItem}
                  />
                )}

                {route === 'search' && (
                  <IntelligentSearchScreen
                    catalog={catalog}
                    lang={lang}
                    userVector={userVector}
                    personalizationEnabled={user.personalizationEnabled}
                    progressMap={progressMap}
                    favoriteIds={favoriteIds}
                    downloadsMap={downloadsMap}
                    hiddenIds={hiddenIds}
                    blockedTopics={user.blockedTopics}
                    feedbackMap={feedbackMap}
                    filters={searchFilters}
                    onChangeFilters={setSearchFilters}
                    onPersonalizeTaste={handlePersonalizeTasteFromSearch}
                    onOpenDetail={handleOpenDetail}
                    onPlay={handlePlayItem}
                    onDownload={(item) => void handleDownloadItem(item, false)}
                    onToggleFavorite={handleToggleFavorite}
                    onFeedback={handleFeedback}
                    onHide={handleHideItem}
                  />
                )}

                {route === 'watch' && (
                  <CinematicPlayerScreen
                    item={playingItem || catalog[0]}
                    lang={lang}
                    initialProgress={progressMap[(playingItem || catalog[0]).id]}
                    downloadRecord={downloadsMap[(playingItem || catalog[0]).id]}
                    defaultQuality={user.preferredQuality}
                    defaultSubtitleLang={user.defaultSubtitleLang}
                    defaultSpeed={user.defaultSpeed}
                    initialSelectedQualityId={playingQualityId}
                    initialPlaybackMode={playingPlaybackMode}
                    onSaveProgress={handleSaveProgress}
                    onDownload={(item, saveFile, quality) =>
                      void handleDownloadItem(item, saveFile, quality)
                    }
                    onOpenLanguagePicker={() => setLangPickerOpen(true)}
                    onBack={() => navigateTo(previousRouteBeforeWatch)}
                  />
                )}

                {route === 'library' && (
                  <LibraryScreen
                    catalog={catalog}
                    lang={lang}
                    userVector={userVector}
                    personalizationEnabled={user.personalizationEnabled}
                    progressMap={progressMap}
                    favoriteIds={favoriteIds}
                    downloadsMap={downloadsMap}
                    hiddenIds={hiddenIds}
                    recentIds={recentIds}
                    feedbackMap={feedbackMap}
                    collections={collections}
                    initialTab={libraryTabRequest}
                    onOpenDetail={handleOpenDetail}
                    onPlay={handlePlayItem}
                    onDownload={(item, saveFile) => void handleDownloadItem(item, saveFile)}
                    onSaveDownloadToDevice={(item) => void handleSaveDownloadToDevice(item)}
                    onDeleteDownload={handleDeleteDownload}
                    onToggleFavorite={handleToggleFavorite}
                    onFeedback={handleFeedback}
                    onHide={handleHideItem}
                    onUnhide={(id) =>
                      setHiddenIds((prev) => {
                        const next = new Set(prev);
                        next.delete(id);
                        return next;
                      })
                    }
                    onCreateCollection={(name) => {
                      setCollections((prev) => [
                        { id: `col-${Date.now()}`, name, itemIds: [], createdAt: new Date().toISOString() },
                        ...prev
                      ]);
                      showToast(t('Collection created.', 'کلکسیون جدید ایجاد شد.'));
                    }}
                    onDeleteCollection={(id) => {
                      setCollections((prev) => prev.filter((c) => c.id !== id));
                      showToast(t('Collection deleted.', 'کلکسیون حذف شد.'));
                    }}
                    onRemoveFromCollection={(colId, contentId) => {
                      setCollections((prev) =>
                        prev.map((c) =>
                          c.id === colId ? { ...c, itemIds: c.itemIds.filter((x) => x !== contentId) } : c
                        )
                      );
                    }}
                    onClearHistory={() => {
                      setProgressMap({});
                      setRecentIds([]);
                      showToast(t('Watch history cleared.', 'تاریخچه تماشا پاک شد.'));
                    }}
                  />
                )}

                {route === 'settings' && (
                  <SettingsScreen
                    lang={lang}
                    user={user}
                    userVector={userVector}
                    vaultSizeBytes={vaultSizeBytes}
                    onChangeLang={setLang}
                    onOpenLanguagePicker={() => setLangPickerOpen(true)}
                    onUpdateUser={handleUpdateUser}
                    onRevokeSession={(sessionId) => {
                      setUser((prev) => ({
                        ...prev,
                        sessions: prev.sessions.filter((s) => s.id !== sessionId)
                      }));
                      showToast(t('Session revoked.', 'دسترسی نشست لغو شد.'));
                    }}
                    onResetTasteAndHistory={() => {
                      setUserVector(DEFAULT_TASTE_VECTOR);
                      setFeedbackMap({});
                      setProgressMap({});
                      showToast(t('Taste model and history reset.', 'مدل سلیقه و سابقه تعاملات بازنشانی شد.'));
                    }}
                    onExportPersonalData={handleExportPersonalData}
                    onWipeLocalMemory={() => {
                      handleResetPrototype();
                      navigateTo('welcome');
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </StateBoundary>
        </main>

        {/* Mobile Compact Bottom Dock with Safe Area Inset & Sliding Pill */}
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-40 h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] border-t border-white/12 bg-[#06070C]/95 backdrop-blur-xl px-1.5 flex items-center justify-around"
          aria-label="Mobile Navigation"
        >
          {effectiveNavItems.map((nav) => {
            const active = route === nav.id;
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => navigateTo(nav.id)}
                className={`relative min-h-[44px] min-w-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-[10px] font-medium cursor-pointer transition-colors ${
                  active ? 'text-[#F5B942]' : 'text-[#A3AEC2]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="mobileDockPill"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-x-1 top-1 bottom-1 rounded-xl bg-[#F5B942]/12 border border-[#F5B942]/30"
                  />
                )}
                <span className="relative z-10 flex flex-col items-center gap-0.5">
                  {nav.icon}
                  <span className="truncate max-w-[60px]">{t(nav.en, nav.fa)}</span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Content Detail Modal / Bottom Sheet */}
        <ContentDetailModal
          item={selectedDetailItem}
          catalog={catalog}
          lang={lang}
          isFavorite={selectedDetailItem ? favoriteIds.has(selectedDetailItem.id) : false}
          downloadRecord={selectedDetailItem ? downloadsMap[selectedDetailItem.id] : undefined}
          progress={selectedDetailItem ? progressMap[selectedDetailItem.id] : undefined}
          feedback={selectedDetailItem ? feedbackMap[selectedDetailItem.id] : undefined}
          collections={collections}
          onClose={() => setSelectedDetailItem(null)}
          onPlay={handlePlayItem}
          onWatchTrailer={handleWatchTrailer}
          onDownload={(item, saveFile, quality) => void handleDownloadItem(item, saveFile, quality)}
          onSelectItem={handleOpenDetail}
          onToggleFavorite={handleToggleFavorite}
          onToggleCollectionItem={(colId, contentId) => {
            setCollections((prev) =>
              prev.map((c) => {
                if (c.id !== colId) return c;
                const exists = c.itemIds.includes(contentId);
                return {
                  ...c,
                  itemIds: exists
                    ? c.itemIds.filter((x) => x !== contentId)
                    : [...c.itemIds, contentId]
                };
              })
            );
          }}
          onFeedback={handleFeedback}
          onHide={handleHideItem}
          onSubmitReport={(item) => {
            handleHideItem(item);
          }}
          onOpenLanguagePicker={() => setLangPickerOpen(true)}
        />

        {/* World Languages Picker Modal */}
        <LanguagePickerModal
          isOpen={langPickerOpen}
          currentLang={lang}
          onSelect={setLang}
          onClose={() => setLangPickerOpen(false)}
        />

        {/* Undo / Notification Toast */}
        <ToastBanner toast={toast} onDismiss={() => setToast(null)} />
      </div>
    </MotionConfig>
  );
}
