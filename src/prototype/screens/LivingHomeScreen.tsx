import React from 'react';
import {
  Clapperboard,
  Compass,
  Download,
  FolderHeart,
  Play,
  SlidersHorizontal,
  Sparkles,
  WifiOff
} from 'lucide-react';
import type {
  ExplainedRecommendation,
  FeedbackRecord,
  LanguageCode,
  OfflineDownloadRecord,
  PrototypeMediaItem,
  PrototypeRoute,
  TasteVector6D,
  UserCollection,
  WatchProgressEntry
} from '../types';
import { computeLivingHomepage } from '../tasteEngine';
import { useT } from '../i18n';
import { Button, MediaCard, formatDuration } from '../components/UiPrimitives';

interface LivingHomeScreenProps {
  catalog: PrototypeMediaItem[];
  lang: LanguageCode;
  userVector: TasteVector6D;
  personalizationEnabled: boolean;
  progressMap: Record<string, WatchProgressEntry>;
  favoriteIds: Set<string>;
  downloadsMap: Record<string, OfflineDownloadRecord>;
  hiddenIds: Set<string>;
  blockedTopics: string[];
  feedbackMap: Record<string, FeedbackRecord>;
  collections: UserCollection[];
  onNavigate: (route: PrototypeRoute) => void;
  onOpenDetail: (item: PrototypeMediaItem) => void;
  onPlay: (item: PrototypeMediaItem) => void;
  onWatchTrailer: (item: PrototypeMediaItem) => void;
  onDownload: (item: PrototypeMediaItem) => void;
  onToggleFavorite: (item: PrototypeMediaItem) => void;
  onFeedback: (item: PrototypeMediaItem, sentiment: 'like' | 'dislike' | 'less_like_this') => void;
  onHide: (item: PrototypeMediaItem) => void;
  onEnablePersonalization: () => void;
}

export function LivingHomeScreen({
  catalog,
  lang,
  userVector,
  personalizationEnabled,
  progressMap,
  favoriteIds,
  downloadsMap,
  hiddenIds,
  blockedTopics,
  feedbackMap,
  collections,
  onNavigate,
  onOpenDetail,
  onPlay,
  onWatchTrailer,
  onDownload,
  onToggleFavorite,
  onFeedback,
  onHide,
  onEnablePersonalization
}: LivingHomeScreenProps) {
  const { t } = useT();

  const layout = computeLivingHomepage({
    catalog,
    userVector,
    personalizationEnabled,
    progressMap,
    favoriteIds,
    hiddenIds,
    blockedTopics,
    feedbackMap,
    lang
  });

  const hero = layout.heroPick;

  const renderShelf = (
    titleEn: string,
    titleFa: string,
    subtitleEn: string,
    subtitleFa: string,
    recs: ExplainedRecommendation[]
  ) => {
    if (recs.length === 0) return null;
    return (
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#F5F7FA]">
              {t(titleEn, titleFa)}
            </h2>
            <p className="text-xs text-[#A3AEC2]">{t(subtitleEn, subtitleFa)}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('discover')}>
            {t('View in Spatial Map', 'مشاهده در نقشه جهان')}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
          {recs.map((rec) => (
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
              onDownload={onDownload}
              onToggleFavorite={onToggleFavorite}
              onFeedback={onFeedback}
              onHide={onHide}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-8 sm:space-y-10 pb-6">
      {!personalizationEnabled && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/12 bg-[#0D101A] px-4 py-3.5">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#D2DAE8]">
            <WifiOff className="h-4 w-4 text-[#F5B942] shrink-0" />
            <span>
              {t(
                'Personalization is turned off — showing neutral editorial feeds without taste profiling.',
                'شخصی‌سازی غیرفعال است — در حال نمایش ردیف‌های عمومی بدون ردیابی سلیقه.'
              )}
            </span>
          </div>
          <Button size="sm" variant="secondary" onClick={onEnablePersonalization}>
            {t('Re-enable Personalization', 'فعال‌سازی دوباره شخصی‌سازی')}
          </Button>
        </div>
      )}

      {hero && (
        <section className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] border border-white/12 bg-[#0D101A]">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-7 relative min-h-[220px] sm:min-h-[340px] overflow-hidden">
              <img
                src={hero.item.posterUrl}
                alt={t(hero.item.titleEn, hero.item.titleFa)}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D101A] via-[#0D101A]/30 to-transparent lg:bg-gradient-to-l lg:from-[#0D101A] lg:via-[#0D101A]/40 lg:to-transparent" />
            </div>

            <div className="lg:col-span-5 p-5 sm:p-8 flex flex-col justify-between gap-5">
              <div className="space-y-3">
                <p className="text-xs font-medium text-[#F5B942] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>
                    {personalizationEnabled
                      ? `${t('Your Universe Highlight', 'اولویت اول جهان شما')} · ${hero.score}% ${t('Match', 'تطابق')}`
                      : t('Editorial Selection', 'برگزیده جهان')}
                  </span>
                </p>

                <h1 className="text-xl sm:text-3xl font-bold text-[#F5F7FA] leading-snug">
                  {t(hero.item.titleEn, hero.item.titleFa)}
                </h1>

                <p className="text-xs text-[#A3AEC2]">
                  {t(hero.item.categoryEn, hero.item.categoryFa)} ·{' '}
                  <span dir="ltr" className="font-mono-tabular">
                    {hero.item.quality}
                  </span>{' '}
                  ·{' '}
                  <span dir="ltr" className="font-mono-tabular">
                    {formatDuration(hero.item.durationSec)}
                  </span>
                  {hero.item.creatorEn || hero.item.creatorFa
                    ? ` · ${t(hero.item.creatorEn || hero.item.creatorFa || '', hero.item.creatorFa)}`
                    : ''}
                </p>

                <p className="text-xs sm:text-sm text-[#D2DAE8] leading-relaxed">
                  {t(hero.item.synopsisEn, hero.item.synopsisFa)}
                </p>

                <p className="rounded-2xl bg-[#151A28] px-3.5 py-2.5 text-xs text-[#A3AEC2]">
                  {t(hero.reasonEn, hero.reasonFa)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Button size="lg" onClick={() => onPlay(hero.item)}>
                  <Play className="h-4 w-4 fill-current" />
                  {progressMap[hero.item.id] && !progressMap[hero.item.id].completed
                    ? t('Resume Watching', 'ادامه تماشا')
                    : t('Watch Now', 'شروع تماشا')}
                </Button>
                <Button variant="secondary" onClick={() => onWatchTrailer(hero.item)}>
                  <Clapperboard className="h-4 w-4 text-[#F5B942]" />
                  {t('Watch Trailer', 'مشاهده تریلر')}
                </Button>
                <Button variant="secondary" onClick={() => onDownload(hero.item)}>
                  <Download className="h-4 w-4" />
                  {downloadsMap[hero.item.id]?.status === 'completed'
                    ? t('Downloaded', 'دانلودشده')
                    : t('Download', 'دانلود آفلاین')}
                </Button>
                <Button variant="ghost" onClick={() => onOpenDetail(hero.item)}>
                  {t('Details', 'جزئیات')}
                </Button>
                <Button variant="ghost" onClick={() => onNavigate('discover')}>
                  <Compass className="h-4 w-4" />
                  {t('Discover Map', 'کاوش سه‌بعدی')}
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {layout.continueWatching.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#F5F7FA]">
                {t('Continue Watching', 'ادامه تماشا')}
              </h2>
              <p className="text-xs text-[#A3AEC2]">
                {t('Pick up right where you paused', 'بازگشت دقیق به آخرین لحظه‌ای که توقف کردید')}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('library')}>
              {t('Full History', 'تمام سابقه در کتابخانه')}
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {layout.continueWatching.map(({ item, progress }) => {
              const pct = Math.min(100, Math.round((progress.positionSec / progress.durationSec) * 100));
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-[#0D101A] p-3 hover:border-[#F5B942]/45 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => onPlay(item)}
                    className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-[#151A28] cursor-pointer"
                  >
                    <img
                      src={item.posterUrl}
                      alt={t(item.titleEn, item.titleFa)}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                      <Play className="h-5 w-5 text-[#F5B942] fill-current" />
                    </span>
                  </button>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenDetail(item)}
                      className="block truncate text-sm font-semibold text-[#F5F7FA] hover:text-[#F5B942] cursor-pointer text-start w-full"
                    >
                      {t(item.titleEn, item.titleFa)}
                    </button>
                    <p dir="ltr" className="text-[11px] font-mono-tabular text-[#A3AEC2]">
                      {formatDuration(progress.positionSec)} / {formatDuration(progress.durationSec)} ({pct}%)
                    </p>
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-[#F5B942]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {renderShelf(
        personalizationEnabled ? 'Recommended for You' : 'Platform Highlights',
        personalizationEnabled ? 'پیشنهاد ویژه برای شما' : 'برگزیده‌های عمومی پلتفرم',
        personalizationEnabled
          ? 'Live-ranked via internal 6D cosine similarity and your interactions'
          : 'General editorial order',
        personalizationEnabled
          ? 'چیدمان زنده بر پایه بردار ۶بعدی سلیقه و بازخوردهای شما'
          : 'چیدمان عمومی بدون پروفایل سلیقه',
        layout.recommendedForYou
      )}

      {collections.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-[#0D101A] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#F5B942]/15 text-[#F5B942] flex items-center justify-center shrink-0">
              <FolderHeart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#F5F7FA]">
                {t('Your Collections', 'مجموعه‌های شخصی شما')}
              </h2>
              <p className="text-xs text-[#A3AEC2]">
                {collections.map((c) => `${c.name} (${c.itemIds.length})`).join(' · ')}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => onNavigate('library')}>
              {t('Library & Downloads', 'کتابخانه و دانلودها')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('settings')}>
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {t('Tune Preferences', 'تنظیمات سلیقه')}
            </Button>
          </div>
        </section>
      )}

      {renderShelf(
        'New Discoveries',
        'کشف‌های تازه',
        'Unwatched titles aligned closely with your current trajectory',
        'آثاری که هنوز ندیده‌اید اما نزدیک به روحیه شما هستند',
        layout.newDiscoveries
      )}

      {renderShelf(
        'Hidden Gems',
        'جواهرهای کم‌دیده',
        'High-craft selections curated for depth rather than clicks',
        'آثار با عمق بصری و روایی بالا خارج از فهرست‌های تکراری',
        layout.hiddenGems
      )}

      {renderShelf(
        'Explore Something Different',
        'پنجره تجربه متفاوت',
        'Deliberately contrasting picks to keep discovery alive',
        'خروج آگاهانه از دایره تکراری و کشف ژانرهای تازه',
        layout.exploreDifferent
      )}

      {renderShelf(
        'Recently Added',
        'تازه اضافه‌شده به جهان',
        'Latest curated arrivals in your universe',
        'جدیدترین آثار اضافه‌شده به آرشیو',
        layout.recentlyAdded
      )}
    </div>
  );
}
