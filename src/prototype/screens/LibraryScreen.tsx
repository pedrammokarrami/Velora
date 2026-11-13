import React, { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FolderHeart,
  HardDriveDownload,
  History,
  ListChecks,
  Play,
  Plus,
  Sparkles,
  Trash2
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type {
  ExplainedRecommendation,
  FeedbackRecord,
  LanguageCode,
  LibraryTab,
  OfflineDownloadRecord,
  PrototypeMediaItem,
  TasteVector6D,
  UserCollection,
  WatchProgressEntry
} from '../types';
import { cosineSimilarity6D } from '../tasteEngine';
import { formatBytes } from '../downloadEngine';
import { useT } from '../i18n';
import { Button, MediaCard, formatDuration } from '../components/UiPrimitives';

interface LibraryScreenProps {
  catalog: PrototypeMediaItem[];
  lang: LanguageCode;
  userVector: TasteVector6D;
  personalizationEnabled: boolean;
  progressMap: Record<string, WatchProgressEntry>;
  favoriteIds: Set<string>;
  downloadsMap: Record<string, OfflineDownloadRecord>;
  hiddenIds: Set<string>;
  recentIds: string[];
  feedbackMap: Record<string, FeedbackRecord>;
  collections: UserCollection[];
  initialTab?: LibraryTab;
  onOpenDetail: (item: PrototypeMediaItem) => void;
  onPlay: (item: PrototypeMediaItem) => void;
  onDownload: (item: PrototypeMediaItem, saveFileToDevice?: boolean) => void;
  onSaveDownloadToDevice: (item: PrototypeMediaItem) => void;
  onDeleteDownload: (contentId: string) => void;
  onToggleFavorite: (item: PrototypeMediaItem) => void;
  onFeedback: (item: PrototypeMediaItem, sentiment: 'like' | 'dislike' | 'less_like_this') => void;
  onHide: (item: PrototypeMediaItem) => void;
  onUnhide: (id: string) => void;
  onCreateCollection: (name: string) => void;
  onDeleteCollection: (id: string) => void;
  onRemoveFromCollection: (colId: string, contentId: string) => void;
  onClearHistory: () => void;
}

const LIBRARY_TABS: Array<{ id: LibraryTab; fa: string; en: string; icon: React.ReactNode }> = [
  { id: 'continue', fa: 'ادامه تماشا', en: 'Continue Watching', icon: <Clock className="h-3.5 w-3.5" /> },
  { id: 'downloads', fa: 'دانلودهای آفلاین', en: 'Offline Downloads', icon: <Download className="h-3.5 w-3.5" /> },
  { id: 'history', fa: 'تاریخچه تماشا', en: 'Watch History', icon: <History className="h-3.5 w-3.5" /> },
  { id: 'favorites', fa: 'علاقه‌مندی‌ها', en: 'Favorites', icon: <Bookmark className="h-3.5 w-3.5" /> },
  { id: 'collections', fa: 'کلکسیون‌ها', en: 'Saved Collections', icon: <FolderHeart className="h-3.5 w-3.5" /> },
  { id: 'recent', fa: 'مشاهده‌شده اخیر', en: 'Recently Viewed', icon: <Eye className="h-3.5 w-3.5" /> },
  { id: 'hidden', fa: 'موارد مخفی‌شده', en: 'Hidden Items', icon: <ListChecks className="h-3.5 w-3.5" /> },
  { id: 'lists', fa: 'فهرست‌های شخصی‌سازی‌شده', en: 'Personalized Lists', icon: <Sparkles className="h-3.5 w-3.5" /> }
];

export function LibraryScreen({
  catalog,
  lang,
  userVector,
  personalizationEnabled,
  progressMap,
  favoriteIds,
  downloadsMap,
  hiddenIds,
  recentIds,
  feedbackMap,
  collections,
  initialTab,
  onOpenDetail,
  onPlay,
  onDownload,
  onSaveDownloadToDevice,
  onDeleteDownload,
  onToggleFavorite,
  onFeedback,
  onHide,
  onUnhide,
  onCreateCollection,
  onDeleteCollection,
  onRemoveFromCollection,
  onClearHistory
}: LibraryScreenProps) {
  const { t } = useT();
  const [activeTab, setActiveTab] = useState<LibraryTab>(initialTab ?? 'continue');
  const [newColName, setNewColName] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'title'>('recent');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const toRec = (item: PrototypeMediaItem, reasonFa: string, reasonEn: string): ExplainedRecommendation => ({
    item,
    score: Math.max(
      55,
      Math.min(99, Math.round((personalizationEnabled ? cosineSimilarity6D(userVector, item.vector) : 0.74) * 100))
    ),
    reasonFa,
    reasonEn
  });

  const downloadEntries = useMemo(() => {
    return Object.values(downloadsMap)
      .sort((a, b) => b.downloadedAt.localeCompare(a.downloadedAt))
      .map((record) => ({
        record,
        item: catalog.find((c) => c.id === record.contentId)
      }))
      .filter((entry): entry is { record: OfflineDownloadRecord; item: PrototypeMediaItem } =>
        Boolean(entry.item)
      );
  }, [downloadsMap, catalog]);

  const activeItems = useMemo(() => {
    let list: ExplainedRecommendation[] = [];
    if (activeTab === 'continue') {
      list = Object.values(progressMap)
        .filter((p) => !p.completed && p.positionSec > 5)
        .sort((a, b) => b.lastWatchedAt.localeCompare(a.lastWatchedAt))
        .map((p) => catalog.find((c) => c.id === p.contentId))
        .filter((x): x is PrototypeMediaItem => Boolean(x))
        .map((item) => toRec(item, 'دارای پیشرفت ذخیره‌شده برای ادامه تماشا', 'Saved playback position'));
    } else if (activeTab === 'history') {
      list = Object.values(progressMap)
        .sort((a, b) => b.lastWatchedAt.localeCompare(a.lastWatchedAt))
        .map((p) => catalog.find((c) => c.id === p.contentId))
        .filter((x): x is PrototypeMediaItem => Boolean(x))
        .map((item) => toRec(item, 'ثبت‌شده در تاریخچه تماشای شما', 'Recorded in your watch history'));
    } else if (activeTab === 'favorites') {
      list = catalog
        .filter((c) => favoriteIds.has(c.id))
        .map((item) => toRec(item, 'نشان‌شده توسط شما', 'Bookmarked in Favorites'));
    } else if (activeTab === 'recent') {
      list = recentIds
        .map((id) => catalog.find((c) => c.id === id))
        .filter((x): x is PrototypeMediaItem => Boolean(x))
        .map((item) => toRec(item, 'بازدیدشده در همین نشست', 'Recently opened'));
    } else if (activeTab === 'hidden') {
      list = catalog
        .filter((c) => hiddenIds.has(c.id))
        .map((item) => toRec(item, 'مخفی‌شده از فید اصلی', 'Hidden from discovery feeds'));
    } else if (activeTab === 'lists') {
      list = catalog
        .filter((c) => !hiddenIds.has(c.id))
        .map((item) => toRec(item, 'پیشنهاد مبتنی بر بردار سلیقه ۶بعدی', 'Generated from 6D taste vector'))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);
    }

    if (sortBy === 'title') {
      return [...list].sort((a, b) =>
        t(a.item.titleEn, a.item.titleFa).localeCompare(t(b.item.titleEn, b.item.titleFa))
      );
    }
    return list;
  }, [activeTab, progressMap, catalog, favoriteIds, recentIds, hiddenIds, sortBy, t, personalizationEnabled, userVector]);

  return (
    <div className="space-y-6 sm:space-y-7 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F5F7FA]">
            {t('Personal Library & Offline Vault', 'کتابخانه شخصی و دانلودهای آفلاین')}
          </h1>
          <p className="text-xs sm:text-sm text-[#A3AEC2]">
            {t(
              'Manage watch progress, offline downloads, favorites, custom collections, and hidden items',
              'مدیریت تاریخچه، دانلودهای ذخیره‌شده، علاقه‌مندی‌ها، کلکسیون‌های سفارشی و موارد مخفی‌شده'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'title')}
            className="min-h-[40px] rounded-full border border-white/12 bg-[#0D101A] px-3.5 text-base sm:text-xs text-[#F5F7FA]"
          >
            <option value="recent">{t('Sort: Recent', 'مرتب‌سازی: پیش‌فرض / اخیر')}</option>
            <option value="title">{t('Sort: Title A-Z', 'مرتب‌سازی: حروف الفبا')}</option>
          </select>
          {activeTab === 'history' && Object.keys(progressMap).length > 0 && (
            <Button variant="danger" size="sm" onClick={onClearHistory}>
              <Trash2 className="h-3.5 w-3.5" />
              {t('Clear History', 'پاک‌سازی تاریخچه')}
            </Button>
          )}
        </div>
      </div>

      {/* Responsive Scrollable Tab Strip with Sliding Indicator */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap">
        {LIBRARY_TABS.map((tabItem) => {
          const active = activeTab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => setActiveTab(tabItem.id)}
              className={`relative min-h-[40px] shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 rounded-full px-4 text-xs font-medium transition-colors cursor-pointer border ${
                active
                  ? 'border-[#F5B942]/80 text-[#06070C]'
                  : 'border-white/12 bg-[#0D101A] text-[#A3AEC2] hover:text-white'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="libraryActiveTab"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-[#F5B942]"
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-1.5">
                {tabItem.icon}
                <span>
                  {t(tabItem.en, tabItem.fa)}
                  {tabItem.id === 'downloads' && downloadEntries.length > 0
                    ? ` (${downloadEntries.length})`
                    : ''}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Offline Downloads Manager */}
          {activeTab === 'downloads' ? (
            downloadEntries.length === 0 ? (
              <div className="rounded-[24px] border border-white/10 bg-[#0D101A] p-6 sm:p-8 text-center space-y-2.5">
                <Download className="mx-auto h-7 w-7 text-[#F5B942]" />
                <p className="text-sm font-medium text-[#F5F7FA]">
                  {t('No offline downloads saved yet.', 'هنوز هیچ اثری برای تماشای آفلاین دانلود نشده است.')}
                </p>
                <p className="text-xs text-[#A3AEC2] max-w-md mx-auto">
                  {t(
                    'Tap the download icon on any card or Open Details to store clips offline in-app or save directly to your device.',
                    'روی آیکون دانلود در هر کارت یا دکمه «ذخیره آفلاین» در پنجره جزئیات بزنید تا در حافظه داخل اپلیکیشن ذخیره شود یا فایل آن را روی دستگاه دانلود کنید.'
                  )}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {downloadEntries.map(({ record, item }) => {
                  const completed = record.status === 'completed';
                  const itemTitle = t(item.titleEn, item.titleFa);
                  return (
                    <div
                      key={record.contentId}
                      className="rounded-[22px] border border-white/12 bg-[#0D101A] p-4 flex flex-col sm:flex-row gap-4 justify-between"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={item.posterUrl}
                          alt={itemTitle}
                          className="h-20 w-28 rounded-xl object-cover shrink-0 bg-[#151A28]"
                        />
                        <div className="min-w-0 space-y-1">
                          <h2 className="truncate text-sm font-semibold text-[#F5F7FA]">{itemTitle}</h2>
                          <p className="text-xs text-[#A3AEC2]">
                            {record.quality} ·{' '}
                            <span dir="ltr" className="font-mono-tabular">
                              {formatBytes(record.fileSizeBytes)}
                            </span>
                          </p>
                          <p className="inline-flex items-center gap-1 text-[11px] text-[#34D399]">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            <span>
                              {completed
                                ? `${t('Ready Offline', 'آماده پخش آفلاین')} (${record.mimeType})`
                                : `${record.progressPct}%`}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap sm:flex-col items-center sm:items-end justify-end gap-2 shrink-0">
                        <Button size="sm" onClick={() => onPlay(item)}>
                          <Play className="h-3.5 w-3.5 fill-current" />
                          {t('Play Offline', 'پخش آفلاین')}
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onSaveDownloadToDevice(item)}
                          >
                            <HardDriveDownload className="h-3.5 w-3.5 text-[#F5B942]" />
                            <span>{t('Save File', 'ذخیره در دستگاه')}</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => onDeleteDownload(item.id)}
                            aria-label="Delete offline copy"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : activeTab === 'collections' ? (
            <div className="space-y-6">
              <form
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-[#0D101A] p-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newColName.trim()) return;
                  onCreateCollection(newColName.trim());
                  setNewColName('');
                }}
              >
                <input
                  type="text"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder={t(
                    'New collection name...',
                    'نام کلکسیون جدید (مثلاً: شب‌های بارانی)...'
                  )}
                  className="flex-1 min-w-[200px] min-h-[44px] rounded-full border border-white/12 bg-[#06070C] px-4 text-base sm:text-sm text-[#F5F7FA]"
                />
                <Button type="submit">
                  <Plus className="h-4 w-4" />
                  {t('Create Collection', 'ایجاد کلکسیون')}
                </Button>
              </form>

              {collections.length === 0 ? (
                <p className="text-sm text-[#A3AEC2]">
                  {t('No custom collections created yet.', 'هنوز کلکسیونی ایجاد نشده است.')}
                </p>
              ) : (
                <div className="space-y-5">
                  {collections.map((col) => {
                    const items = col.itemIds
                      .map((id) => catalog.find((c) => c.id === id))
                      .filter((x): x is PrototypeMediaItem => Boolean(x));
                    return (
                      <div
                        key={col.id}
                        className="rounded-[24px] border border-white/10 bg-[#0D101A] p-5 space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h2 className="text-base font-semibold text-[#F5F7FA]">{col.name}</h2>
                            <p className="text-xs text-[#A3AEC2]">
                              {items.length} {t('items saved', 'مورد ذخیره‌شده')}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteCollection(col.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-[#FCA5A5]" />
                            {t('Delete Collection', 'حذف کلکسیون')}
                          </Button>
                        </div>

                        {items.length === 0 ? (
                          <p className="text-xs text-[#8E9BB3]">
                            {t(
                              'Open any item Detail modal to assign it to this collection.',
                              'از پنجره جزئیات هر فیلم می‌توانید آن را به این کلکسیون اضافه کنید.'
                            )}
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map((item) => {
                              const itemTitle = t(item.titleEn, item.titleFa);
                              return (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#06070C]/65 p-3"
                                >
                                  <button
                                    type="button"
                                    onClick={() => onOpenDetail(item)}
                                    className="flex items-center gap-3 min-w-0 text-start cursor-pointer"
                                  >
                                    <img
                                      src={item.posterUrl}
                                      alt={itemTitle}
                                      className="h-12 w-16 rounded-lg object-cover shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <p className="truncate text-xs font-semibold text-[#F5F7FA]">
                                        {itemTitle}
                                      </p>
                                      <p dir="ltr" className="text-[11px] font-mono-tabular text-[#A3AEC2]">
                                        {formatDuration(item.durationSec)}
                                      </p>
                                    </div>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onRemoveFromCollection(col.id, item.id)}
                                    aria-label="Remove from collection"
                                    className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-full text-[#A3AEC2] hover:text-[#FCA5A5] cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'hidden' ? (
            activeItems.length === 0 ? (
              <div className="rounded-[24px] border border-white/10 bg-[#0D101A] p-8 text-center text-sm text-[#A3AEC2]">
                {t('You have not hidden any items.', 'هیچ موردی توسط شما مخفی نشده است.')}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeItems.map(({ item }) => {
                  const itemTitle = t(item.titleEn, item.titleFa);
                  const itemCat = t(item.categoryEn, item.categoryFa);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0D101A] p-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.posterUrl}
                          alt={itemTitle}
                          className="h-14 w-20 rounded-xl object-cover shrink-0 opacity-70"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#F5F7FA]">{itemTitle}</p>
                          <p className="truncate text-xs text-[#A3AEC2]">{itemCat}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => onUnhide(item.id)}>
                        {t('Unhide', 'بازگردانی')}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )
          ) : activeItems.length === 0 ? (
            <div className="rounded-[24px] border border-white/10 bg-[#0D101A] p-8 text-center text-sm text-[#A3AEC2]">
              {t(
                'This library section is currently empty. Bookmark or watch titles to populate it.',
                'این بخش از کتابخانه شما هنوز خالی است. پس از تماشا یا نشان‌گذاری، آثار اینجا جمع می‌شوند.'
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
              {activeItems.map((rec) => (
                <MediaCard
                  key={rec.item.id}
                  recommendation={rec}
                  lang={lang}
                  isFavorite={favoriteIds.has(rec.item.id)}
                  downloadRecord={downloadsMap[rec.item.id]}
                  progress={progressMap[rec.item.id]}
                  feedback={feedbackMap[rec.item.id]}
                  onOpenDetail={onOpenDetail}
                  onPlay={onPlay}
                  onDownload={(item) => onDownload(item, false)}
                  onToggleFavorite={onToggleFavorite}
                  onFeedback={onFeedback}
                  onHide={onHide}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
