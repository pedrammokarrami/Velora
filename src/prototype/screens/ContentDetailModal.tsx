import React, { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  Check,
  Clapperboard,
  Cpu,
  Download,
  ExternalLink,
  EyeOff,
  Film,
  Flag,
  FolderPlus,
  Globe2,
  HardDriveDownload,
  Loader2,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  Users
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type {
  FeedbackRecord,
  LanguageCode,
  OfflineDownloadRecord,
  PrototypeMediaItem,
  UserCollection,
  WatchProgressEntry
} from '../types';
import { cosineSimilarity6D } from '../tasteEngine';
import {
  fetchBackendFilmDetails,
  pickRandomCardinalEntrances,
  type BackendFilmDetailsResponse,
  type BackendStreamQuality
} from '../filmDetailsClient';
import { useT } from '../i18n';
import { AdaptiveModal, Button, formatDuration } from '../components/UiPrimitives';

export type ContentFeedbackIssueReason = 'broken_link' | 'quality_issue' | 'not_interested' | 'other';

interface ContentDetailModalProps {
  item: PrototypeMediaItem | null;
  catalog: PrototypeMediaItem[];
  lang: LanguageCode;
  isFavorite: boolean;
  downloadRecord?: OfflineDownloadRecord;
  progress?: WatchProgressEntry;
  feedback?: FeedbackRecord;
  collections: UserCollection[];
  onClose: () => void;
  onPlay: (item: PrototypeMediaItem, selectedQuality?: BackendStreamQuality) => void;
  onWatchTrailer: (item: PrototypeMediaItem, selectedQuality?: BackendStreamQuality) => void;
  onDownload: (
    item: PrototypeMediaItem,
    saveFileToDevice?: boolean,
    selectedQuality?: BackendStreamQuality
  ) => void;
  onSelectItem: (item: PrototypeMediaItem) => void;
  onToggleFavorite: (item: PrototypeMediaItem) => void;
  onToggleCollectionItem: (collectionId: string, contentId: string) => void;
  onFeedback: (item: PrototypeMediaItem, sentiment: 'like' | 'dislike' | 'less_like_this') => void;
  onHide: (item: PrototypeMediaItem) => void;
  onSubmitReport: (
    item: PrototypeMediaItem,
    reason: ContentFeedbackIssueReason,
    details: string
  ) => void;
  onOpenLanguagePicker: () => void;
}

export function ContentDetailModal({
  item,
  catalog,
  isFavorite,
  downloadRecord,
  progress,
  feedback,
  collections,
  onClose,
  onPlay,
  onWatchTrailer,
  onDownload,
  onSelectItem,
  onToggleFavorite,
  onToggleCollectionItem,
  onFeedback,
  onHide,
  onSubmitReport,
  onOpenLanguagePicker
}: ContentDetailModalProps) {
  const { t, lang, languageInfo, translateTexts, isTranslating } = useT();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ContentFeedbackIssueReason>('broken_link');
  const [reportDetails, setReportDetails] = useState('');

  const [details, setDetails] = useState<BackendFilmDetailsResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedQualityId, setSelectedQualityId] = useState<string>('');
  const [openSeq, setOpenSeq] = useState(0);

  // Fresh random 4-direction entrance (Left, Right, Top, Bottom) every time a film opens
  const cardEntrances = useMemo(() => pickRandomCardinalEntrances(8), [item?.id, openSeq]);

  useEffect(() => {
    if (!item) {
      setDetails(null);
      setSelectedQualityId('');
      return;
    }
    setOpenSeq((s) => s + 1);
    setLoadingDetails(true);
    let active = true;

    void fetchBackendFilmDetails(item).then((res) => {
      if (!active) return;
      setDetails(res);
      const recQuality = res.qualities.find((q) => q.recommended) || res.qualities[0];
      setSelectedQualityId(recQuality?.id || '');
      setLoadingDetails(false);
    });

    return () => {
      active = false;
    };
  }, [item]);

  // Proactively batch-translate ALL IMDb fields & backend quality texts whenever details or language changes
  useEffect(() => {
    if (!details || lang === 'en') return;
    const imdb = details.imdb;
    const textsToTranslate = [
      imdb.matchedTitle,
      imdb.director,
      imdb.typeLabel,
      imdb.timelineLabel,
      imdb.contentRating,
      imdb.country,
      imdb.plotSummary,
      imdb.imdbReferenceNote,
      ...imdb.cast,
      ...imdb.genres,
      ...imdb.spokenLanguages,
      ...details.qualities.map((q) => q.label),
      ...details.qualities.map((q) => q.batteryMode),
      ...details.qualities.map((q) => q.audio)
    ];
    void translateTexts(textsToTranslate);
  }, [details, lang, translateTexts]);

  const related = useMemo(() => {
    if (!item) return [];
    return catalog
      .filter((c) => c.id !== item.id && c.availabilityStatus === 'available')
      .map((c) => ({
        item: c,
        sim: cosineSimilarity6D(item.vector, c.vector) + (c.clusterId === item.clusterId ? 0.15 : 0)
      }))
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 3);
  }, [item, catalog]);

  if (!item) return null;

  const title = t(item.titleEn, item.titleFa);
  const creator = item.creatorEn ? t(item.creatorEn, item.creatorFa) : '';
  const category = t(item.categoryEn, item.categoryFa);
  const synopsis = t(item.synopsisEn, item.synopsisFa);
  const resumeSec =
    progress && !progress.completed && progress.positionSec > 5 ? progress.positionSec : 0;
  const isDownloading = downloadRecord?.status === 'downloading';
  const isDownloaded = downloadRecord?.status === 'completed';

  const imdb = details?.imdb;
  const backendQualities = details?.qualities || [];
  const activeQuality =
    backendQualities.find((q) => q.id === selectedQualityId) || backendQualities[0];

  const getMotionProps = (idx: number) => {
    const ent = cardEntrances[idx] || { initialX: 0, initialY: 28, delay: 0 };
    return {
      initial: { opacity: 0, x: ent.initialX, y: ent.initialY },
      animate: { opacity: 1, x: 0, y: 0 },
      transition: { type: 'spring' as const, stiffness: 280, damping: 24, delay: ent.delay }
    };
  };

  return (
    <AdaptiveModal
      isOpen={Boolean(item)}
      onClose={() => {
        setReportOpen(false);
        onClose();
      }}
      title={title}
      subtitle={`${category} · ${activeQuality ? activeQuality.resolution : item.quality} · ${formatDuration(item.durationSec)}`}
      maxWidthClass="max-w-5xl"
    >
      <div className="space-y-5 overflow-x-hidden">
        {/* Top Translate / Language Action Strip */}
        <motion.div
          key={`${item.id}-${openSeq}-translate-bar`}
          {...getMotionProps(0)}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F5B942]/30 bg-[#F5B942]/8 px-4 py-2.5"
        >
          <div className="flex items-center gap-2 text-xs text-[#F5F7FA]">
            <Sparkles className="h-4 w-4 text-[#F5B942] shrink-0" />
            <span>
              {t(
                'IMDb details & backend stream qualities auto-translate into your selected language.',
                'تمامی اطلاعات IMDb و لیست کیفیت‌های بک‌اند به زبان انتخابی شما ترجمه می‌شوند.'
              )}
            </span>
          </div>
          <Button size="sm" variant="secondary" onClick={onOpenLanguagePicker}>
            <Globe2 className="h-3.5 w-3.5 text-[#F5B942]" />
            <span>
              {isTranslating
                ? t('Translating...', 'در حال ترجمه...')
                : `${t('Translate', 'ترجمه')}: ${languageInfo.nativeName}`}
            </span>
          </Button>
        </motion.div>

        {/* Visual Banner + Primary Actions (Two Randomly Animated Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <motion.div
            key={`${item.id}-${openSeq}-poster`}
            {...getMotionProps(1)}
            className="md:col-span-5 overflow-hidden rounded-2xl border border-white/10 bg-[#151A28] aspect-[16/10] md:aspect-[4/3] relative"
          >
            <img src={item.posterUrl} alt={title} className="h-full w-full object-cover" />
            {imdb && (
              <div className="absolute top-3 start-3 inline-flex items-center gap-1.5 rounded-full bg-[#F5B942] px-3 py-1 text-xs font-bold text-[#06070C] shadow-lg">
                <span>IMDb</span>
                <Star className="h-3.5 w-3.5 fill-current" />
                <span dir="ltr" className="font-mono-tabular">
                  {imdb.imdbRating}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => onWatchTrailer(item, activeQuality)}
              className="absolute bottom-3 end-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-[#06070C]/85 px-3 py-1.5 text-xs font-semibold text-[#F5F7FA] backdrop-blur-md hover:border-[#F5B942] hover:text-[#F5B942] transition-colors cursor-pointer"
            >
              <Clapperboard className="h-3.5 w-3.5 text-[#F5B942]" />
              <span>{t('Watch Trailer', 'تماشای تریلر')}</span>
            </button>
          </motion.div>

          <motion.div
            key={`${item.id}-${openSeq}-actions`}
            {...getMotionProps(2)}
            className="md:col-span-7 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#06070C]/65 p-4"
          >
            <div className="space-y-2.5">
              {creator && (
                <p className="text-xs font-medium text-[#F5B942]">
                  {t('Creator / Director:', 'کارگردان / خالق:')} {imdb ? t(imdb.director) : creator}
                </p>
              )}

              <p className="text-xs text-[#A3AEC2]">
                {t(item.clusterLabelEn, item.clusterLabelFa)} ·{' '}
                <span dir="ltr" className="font-mono-tabular">
                  {imdb?.year || item.releaseYear}
                </span>{' '}
                · {item.sourceName}
              </p>

              <p className="text-sm text-[#D2DAE8] leading-relaxed">
                {imdb && imdb.plotSummary !== item.synopsisEn ? t(imdb.plotSummary) : synopsis}
              </p>

              <p className="inline-flex items-center gap-1.5 text-[11px] text-[#34D399]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>
                  {activeQuality
                    ? `${t('Selected Stream:', 'کیفیت انتخاب‌شده:')} ${t(activeQuality.label)} (${activeQuality.bitrateMbps} Mbps)`
                    : t('Verified Stream & Full Quality Ready', 'استریم تاییدشده و آماده پخش با کیفیت کامل')}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button size="lg" onClick={() => onPlay(item, activeQuality)}>
                <Play className="h-4 w-4 fill-current" />
                {resumeSec > 0
                  ? `${t('Resume', 'ادامه از')} ${formatDuration(resumeSec)}`
                  : activeQuality
                  ? `${t('Play', 'پخش')} (${activeQuality.resolution})`
                  : t('Play Stream', 'تماشا با کیفیت کامل')}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => onWatchTrailer(item, activeQuality)}
              >
                <Clapperboard className="h-4 w-4 text-[#F5B942]" />
                <span>{t('Watch Trailer', 'مشاهده تریلر')}</span>
              </Button>

              <Button
                variant="secondary"
                disabled={isDownloading}
                onClick={() => onDownload(item, false, activeQuality)}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{downloadRecord.progressPct}%</span>
                  </>
                ) : isDownloaded ? (
                  <>
                    <Check className="h-4 w-4 text-[#34D399]" />
                    <span>{t('Saved Offline', 'ذخیره آفلاین شد')}</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>{t('Save Offline', 'ذخیره آفلاین')}</span>
                  </>
                )}
              </Button>

              <Button
                variant="secondary"
                disabled={isDownloading}
                onClick={() => onDownload(item, true, activeQuality)}
              >
                <HardDriveDownload className="h-4 w-4 text-[#F5B942]" />
                <span>{t('Download to Device', 'دانلود فایل در دستگاه')}</span>
              </Button>

              <Button variant="ghost" onClick={() => onToggleFavorite(item)}>
                <Bookmark className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
                {isFavorite ? t('Saved', 'ذخیره‌شده') : t('Bookmark', 'علاقه‌مندی')}
              </Button>
            </div>

            {isDownloading && (
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#F5B942] transition-all duration-200"
                    style={{ width: `${downloadRecord.progressPct}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#A3AEC2]">
                  {t('Preparing offline clip...', 'در حال آماده‌سازی فایل آفلاین...')}{' '}
                  <span dir="ltr" className="font-mono-tabular">
                    ({downloadRecord.progressPct}%)
                  </span>
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* IMDb Live Database Record + Backend Stream Qualities List (Animated from Random Sides) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* IMDb Official Record Card */}
          <motion.div
            key={`${item.id}-${openSeq}-imdb`}
            {...getMotionProps(3)}
            className="lg:col-span-6 rounded-2xl border border-white/12 bg-[#06070C]/80 p-4 space-y-3.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#F5B942] px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-[#06070C]">
                  IMDb
                </span>
                <h3 className="text-sm font-semibold text-[#F5F7FA]">
                  {t('Official IMDb Film Record', 'اطلاعات دقیق فیلم از IMDb')}
                </h3>
              </div>
              {imdb && (
                <a
                  href={imdb.imdbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono-tabular text-[#38BDF8] hover:underline"
                >
                  <span>{imdb.imdbId}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {loadingDetails && !imdb ? (
              <div className="space-y-2.5 py-3 text-xs text-[#A3AEC2] flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#F5B942]" />
                <span>{t('Fetching live record from IMDb...', 'در حال دریافت اطلاعات دقیق از IMDb...')}</span>
              </div>
            ) : imdb ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                    <p className="text-[10px] text-[#8E9BB3]">{t('IMDb Rating', 'امتیاز IMDb')}</p>
                    <p dir="ltr" className="text-sm font-bold text-[#F5B942] font-mono-tabular">
                      ★ {imdb.imdbRating} / 10
                    </p>
                    <p dir="ltr" className="text-[10px] text-[#A3AEC2]">
                      {imdb.votesCount.toLocaleString()} {t('votes', 'رای')}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                    <p className="text-[10px] text-[#8E9BB3]">{t('Format & Year', 'نوع و سال')}</p>
                    <p className="text-xs font-semibold text-[#F5F7FA] truncate">
                      {t(imdb.typeLabel)}
                    </p>
                    <p dir="ltr" className="text-[10px] text-[#A3AEC2] font-mono-tabular">
                      {imdb.year} · {imdb.runtimeMinutes} {t('min', 'دقیقه')}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                    <p className="text-[10px] text-[#8E9BB3]">{t('Maturity & Rank', 'رده‌بندی')}</p>
                    <p className="text-xs font-semibold text-[#F5F7FA]">{t(imdb.contentRating)}</p>
                    <p dir="ltr" className="text-[10px] text-[#34D399] font-mono-tabular">
                      {imdb.imdbRank ? `#${imdb.imdbRank.toLocaleString()}` : t('Verified', 'تاییدشده')}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] text-[#8E9BB3] flex items-center gap-1.5">
                    <Film className="h-3.5 w-3.5 text-[#F5B942]" />
                    <span>{t('IMDb Title:', 'عنوان ثبت‌شده در IMDb:')}</span>
                    <span className="text-[#F5F7FA] font-medium">{t(imdb.matchedTitle)}</span>
                  </p>
                  <p className="text-[11px] text-[#8E9BB3] flex items-start gap-1.5">
                    <Users className="h-3.5 w-3.5 text-[#38BDF8] mt-0.5 shrink-0" />
                    <span>
                      {t('Stars / Cast:', 'بازیگران / عوامل:')}{' '}
                      <span className="text-[#D2DAE8]">{imdb.cast.map((c) => t(c)).join(' · ')}</span>
                    </span>
                  </p>
                  <p className="text-[11px] text-[#8E9BB3]">
                    {t('Country & Languages:', 'کشور و زبان:')}{' '}
                    <span className="text-[#D2DAE8]">
                      {t(imdb.country)} · {imdb.spokenLanguages.map((l) => t(l)).join(' / ')}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {imdb.genres.map((g) => (
                    <span
                      key={g}
                      className="rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-0.5 text-[11px] text-[#D2DAE8]"
                    >
                      {t(g)}
                    </span>
                  ))}
                </div>

                <p className="text-[11px] text-[#8E9BB3] leading-relaxed border-t border-white/10 pt-2">
                  {t(imdb.imdbReferenceNote)}
                </p>
              </div>
            ) : null}
          </motion.div>

          {/* Backend Available Stream Qualities List Card */}
          <motion.div
            key={`${item.id}-${openSeq}-qualities`}
            {...getMotionProps(4)}
            className="lg:col-span-6 rounded-2xl border border-white/12 bg-[#06070C]/80 p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-[#38BDF8]" />
                <h3 className="text-sm font-semibold text-[#F5F7FA]">
                  {t('Backend Stream Qualities', 'لیست کیفیت‌های موجود از بک‌اند')}
                </h3>
              </div>
              <span className="text-[11px] font-mono-tabular text-[#34D399]">
                {backendQualities.length} {t('Profiles Ready', 'کیفیت آماده')}
              </span>
            </div>

            {loadingDetails && backendQualities.length === 0 ? (
              <div className="py-4 flex items-center gap-2 text-xs text-[#A3AEC2]">
                <Loader2 className="h-4 w-4 animate-spin text-[#38BDF8]" />
                <span>{t('Loading stream profiles from backend...', 'در حال دریافت لیست کیفیت‌ها از سرور...')}</span>
              </div>
            ) : (
              <div className="space-y-2">
                {backendQualities.map((q) => {
                  const selected = q.id === activeQuality?.id;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setSelectedQualityId(q.id)}
                      className={`w-full flex items-center justify-between gap-3 rounded-xl border p-2.5 text-start transition-colors cursor-pointer ${
                        selected
                          ? 'border-[#F5B942] bg-[#F5B942]/12 text-[#F5F7FA]'
                          : 'border-white/10 bg-[#0D101A]/75 text-[#D2DAE8] hover:border-white/25'
                      }`}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-mono-tabular font-semibold text-[#F5B942]">
                            {q.resolution}
                          </span>
                          <span className="text-xs font-semibold truncate">{t(q.label)}</span>
                          {q.recommended && (
                            <span className="rounded-full bg-[#34D399]/15 border border-[#34D399]/40 px-2 py-0.5 text-[10px] text-[#34D399]">
                              {t('Recommended', 'پیشنهادی')}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#8E9BB3] truncate">
                          {q.codec} · {t(q.audio)} · {t(q.batteryMode)}
                        </p>
                      </div>

                      <div dir="ltr" className="shrink-0 text-end space-y-0.5 font-mono-tabular">
                        <p className="text-xs font-semibold text-[#F5F7FA]">{q.bitrateMbps} Mbps</p>
                        <p className="text-[10px] text-[#A3AEC2]">~{q.estimatedSizeMb} MB</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Feedback + Collections Bar */}
        <motion.div
          key={`${item.id}-${openSeq}-taste`}
          {...getMotionProps(5)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-[#06070C]/70 p-4"
        >
          <div className="space-y-2">
            <p className="text-xs font-medium text-[#A3AEC2]">
              {t('Quick Taste Signal', 'تأثیر فوری بر موتور سلیقه')}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={feedback?.sentiment === 'like' ? 'primary' : 'secondary'}
                onClick={() => onFeedback(item, 'like')}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                {t('Like', 'پسندیدم')}
              </Button>
              <Button
                size="sm"
                variant={feedback?.sentiment === 'less_like_this' ? 'danger' : 'secondary'}
                onClick={() => onFeedback(item, 'less_like_this')}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
                {t('Less Like This', 'کمتر از این سبک')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  onHide(item);
                  onClose();
                }}
              >
                <EyeOff className="h-3.5 w-3.5" />
                {t('Hide', 'مخفی کردن')}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-[#A3AEC2] flex items-center gap-1.5">
              <FolderPlus className="h-3.5 w-3.5 text-[#F5B942]" />
              <span>{t('Assign to Collections', 'افزودن به کلکسیون‌ها')}</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {collections.map((col) => {
                const inside = col.itemIds.includes(item.id);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => onToggleCollectionItem(col.id, item.id)}
                    className={`min-h-[34px] inline-flex items-center gap-1.5 rounded-full px-3 text-xs border transition-colors cursor-pointer ${
                      inside
                        ? 'border-[#F5B942] bg-[#F5B942]/15 text-[#F5B942]'
                        : 'border-white/12 bg-white/[0.04] text-[#A3AEC2] hover:text-white'
                    }`}
                  >
                    {inside && <Check className="h-3 w-3" />}
                    <span>{col.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Chapters */}
        {item.chapters.length > 0 && (
          <motion.div
            key={`${item.id}-${openSeq}-chapters`}
            {...getMotionProps(6)}
            className="space-y-2.5 rounded-2xl border border-white/10 bg-[#06070C]/55 p-4"
          >
            <h3 className="text-xs font-semibold text-[#A3AEC2]">{t('Chapters', 'فصل‌های ویدئو')}</h3>
            <div className="flex flex-wrap gap-2">
              {item.chapters.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => onPlay(item, activeQuality)}
                  className="min-h-[36px] rounded-full border border-white/10 bg-[#151A28] px-3.5 text-xs text-[#F5F7FA] hover:border-[#F5B942]/50 cursor-pointer"
                >
                  <span dir="ltr" className="font-mono-tabular text-[#F5B942] me-2">
                    {formatDuration(ch.timeSec)}
                  </span>
                  <span>{t(ch.labelEn, ch.labelFa)}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Animated Playback Feedback / Hide Drawer */}
        <div className="border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => setReportOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 text-xs text-[#A3AEC2] hover:text-[#FCA5A5] transition-colors cursor-pointer"
          >
            <Flag className="h-3.5 w-3.5" />
            <span>{t('Report Playback Issue or Hide Item', 'گزارش خطای پخش یا مخفی‌سازی از فید')}</span>
          </button>

          <AnimatePresence>
            {reportOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-2xl border border-[#EF4444]/35 bg-[#EF4444]/10 p-4 space-y-3">
                  <p className="text-xs font-semibold text-[#FCA5A5]">
                    {t(
                      'This title will immediately be hidden from your personal feed.',
                      'این مورد فوراً از فید شخصی شما مخفی می‌شود.'
                    )}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value as ContentFeedbackIssueReason)}
                      className="min-h-[42px] rounded-xl border border-white/15 bg-[#06070C] px-3 text-base sm:text-xs text-[#F5F7FA]"
                    >
                      <option value="broken_link">
                        {t('Broken Stream / Playback Error', 'خطای پخش یا کیفیت تصویر')}
                      </option>
                      <option value="quality_issue">
                        {t('Subtitle or Audio Sync Issue', 'ناهماهنگی صدا یا زیرنویس')}
                      </option>
                      <option value="not_interested">
                        {t('Not Matching My Taste', 'نامرتبط با سلیقه من')}
                      </option>
                      <option value="other">{t('Other Reason', 'سایر موارد')}</option>
                    </select>
                    <input
                      type="text"
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      placeholder={t('Optional details...', 'توضیح کوتاه (اختیاری)...')}
                      className="min-h-[42px] rounded-xl border border-white/15 bg-[#06070C] px-3 text-base sm:text-xs text-[#F5F7FA]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        onSubmitReport(
                          item,
                          reportReason,
                          reportDetails || t('Submitted from detail modal', 'ارسال‌شده از صفحه جزئیات')
                        );
                        setReportOpen(false);
                        onClose();
                      }}
                    >
                      {t('Hide & Save Feedback', 'تایید و مخفی‌سازی')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setReportOpen(false)}>
                      {t('Cancel', 'انصراف')}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Related Content */}
        {related.length > 0 && (
          <motion.div
            key={`${item.id}-${openSeq}-related`}
            {...getMotionProps(7)}
            className="space-y-3 pt-2 border-t border-white/10"
          >
            <h3 className="text-sm font-semibold text-[#F5F7FA]">
              {t('Related in Your Universe', 'آثار هم‌جنس در جهان شما')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {related.map(({ item: rel }) => {
                const relTitle = t(rel.titleEn, rel.titleFa);
                const relCategory = t(rel.categoryEn, rel.categoryFa);
                return (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => onSelectItem(rel)}
                    className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-[#06070C]/65 p-2.5 text-start hover:border-[#F5B942]/45 transition-colors cursor-pointer"
                  >
                    <img
                      src={rel.posterUrl}
                      alt={relTitle}
                      className="h-14 w-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[#F5F7FA] group-hover:text-[#F5B942]">
                        {relTitle}
                      </p>
                      <p className="truncate text-[11px] text-[#A3AEC2]">{relCategory}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </AdaptiveModal>
  );
}
