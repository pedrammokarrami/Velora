import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bookmark,
  Check,
  Download,
  EyeOff,
  HelpCircle,
  Loader2,
  Lock,
  MoreVertical,
  Play,
  RefreshCw,
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
  WifiOff,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type {
  ExplainedRecommendation,
  FeedbackRecord,
  LanguageCode,
  OfflineDownloadRecord,
  PrototypeMediaItem,
  UiSimulationState,
  WatchProgressEntry
} from '../types';
import { useT } from '../i18n';

export function formatDuration(sec: number): string {
  const safe = Math.max(0, Math.floor(sec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  type = 'button',
  onClick,
  ...rest
}: ButtonProps) {
  const sizeCls =
    size === 'sm'
      ? 'min-h-[40px] px-3.5 py-1.5 text-xs gap-1.5'
      : size === 'lg'
      ? 'min-h-[48px] px-5 sm:px-6 py-3 text-sm gap-2'
      : 'min-h-[44px] px-4 sm:px-4.5 py-2 text-xs sm:text-sm gap-2';

  const variantCls =
    variant === 'primary'
      ? 'bg-[#F5B942] text-[#06070C] font-semibold shadow-[0_10px_26px_-8px_rgba(245,185,66,0.48)] hover:bg-[#fbd074]'
      : variant === 'danger'
      ? 'bg-[#EF4444]/15 text-[#FCA5A5] border border-[#EF4444]/40 hover:bg-[#EF4444]/25'
      : variant === 'ghost'
      ? 'bg-transparent text-[#A3AEC2] hover:text-[#F5F7FA] hover:bg-white/[0.06]'
      : 'liquid-glass-pill text-[#F5F7FA] border border-white/15 hover:border-[#F5B942]/50';

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={disabled || loading ? undefined : { y: -1 }}
      whileTap={disabled || loading ? undefined : { y: 1 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      className={`inline-flex items-center justify-center rounded-full transition-colors duration-200 cursor-pointer whitespace-nowrap select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06070C] disabled:opacity-45 disabled:cursor-not-allowed ${sizeCls} ${variantCls} ${className}`}
      {...(rest as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {loading && (
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </motion.button>
  );
}

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextInput({ label, error, hint, id, className = '', ...rest }: TextInputProps) {
  const inputId = id || `inp-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-xs font-medium text-[#A3AEC2]">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full min-h-[44px] rounded-2xl border bg-[#0D101A] px-4 py-2.5 text-base sm:text-sm text-[#F5F7FA] placeholder:text-[#7A869F] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] ${
          error ? 'border-[#EF4444]' : 'border-white/12 focus:border-[#F5B942]/60'
        } ${className}`}
        {...rest}
      />
      {error && <p className="text-xs text-[#FCA5A5]">{error}</p>}
      {!error && hint && <p className="text-[11px] text-[#8E9BB3]">{hint}</p>}
    </div>
  );
}

export interface AdaptiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export function AdaptiveModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidthClass = 'max-w-3xl'
}: AdaptiveModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#06070C]/80 backdrop-blur-md p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ y: 36, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 28, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            className={`relative w-full ${maxWidthClass} max-h-[92dvh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] border border-white/12 bg-[#0D101A] shadow-[0_32px_90px_-15px_rgba(0,0,0,0.95)] pb-[env(safe-area-inset-bottom)]`}
          >
            <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/10 bg-[#0D101A]/95 px-5 py-4 backdrop-blur-xl">
              <div className="min-w-0">
                <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-white/20 sm:hidden" />
                <h2 className="truncate text-base sm:text-lg font-semibold text-[#F5F7FA]">{title}</h2>
                {subtitle && <p className="truncate text-xs text-[#A3AEC2]">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-[#A3AEC2] hover:text-[#F5F7FA] hover:border-white/30 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 sm:p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export interface MediaCardProps {
  recommendation: ExplainedRecommendation;
  lang: LanguageCode;
  isFavorite: boolean;
  downloadRecord?: OfflineDownloadRecord;
  progress?: WatchProgressEntry;
  feedback?: FeedbackRecord;
  onOpenDetail: (item: PrototypeMediaItem) => void;
  onPlay: (item: PrototypeMediaItem) => void;
  onDownload: (item: PrototypeMediaItem) => void;
  onToggleFavorite: (item: PrototypeMediaItem) => void;
  onFeedback: (item: PrototypeMediaItem, sentiment: 'like' | 'dislike' | 'less_like_this') => void;
  onHide: (item: PrototypeMediaItem) => void;
}

export function MediaCard({
  recommendation,
  isFavorite,
  downloadRecord,
  progress,
  feedback,
  onOpenDetail,
  onPlay,
  onDownload,
  onToggleFavorite,
  onFeedback,
  onHide
}: MediaCardProps) {
  const { t } = useT();
  const { item, score, reasonFa, reasonEn } = recommendation;
  const [imgError, setImgError] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHoldingPreview, setIsHoldingPreview] = useState(false);

  const title = t(item.titleEn, item.titleFa);
  const category = t(item.categoryEn, item.categoryFa);
  const creator = item.creatorEn || item.creatorFa ? t(item.creatorEn || item.creatorFa || '', item.creatorFa) : '';
  const reason = t(reasonEn, reasonFa);
  const synopsis = t(item.synopsisEn, item.synopsisFa);
  const progressPct =
    progress && progress.durationSec > 0
      ? Math.min(100, Math.round((progress.positionSec / progress.durationSec) * 100))
      : 0;

  const isDownloading = downloadRecord?.status === 'downloading';
  const isDownloaded = downloadRecord?.status === 'completed';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#0D101A] transition-colors duration-300 hover:border-[#F5B942]/45 hover:shadow-[0_18px_42px_-16px_rgba(0,0,0,0.85)]"
      onMouseLeave={() => {
        setMenuOpen(false);
        setIsHoldingPreview(false);
      }}
    >
      {/* Visual Frame — Press & Hold for kinetic atmosphere preview (Zero scale/zoom!) */}
      <div
        className="relative aspect-[16/10] w-full overflow-hidden bg-[#151A28] select-none cursor-pointer"
        onClick={() => onOpenDetail(item)}
        onPointerDown={() => setIsHoldingPreview(true)}
        onPointerUp={() => setIsHoldingPreview(false)}
        onPointerCancel={() => setIsHoldingPreview(false)}
      >
        {!imgError ? (
          <img
            src={item.posterUrl}
            alt={title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className={`h-full w-full object-cover transition-all duration-500 ${
              isHoldingPreview ? 'brightness-110 saturate-110' : 'brightness-95 group-hover:brightness-105'
            }`}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center p-4 text-center"
            style={{
              background: `radial-gradient(circle at 30% 25%, ${item.accentHex}33, #0D101A 75%)`
            }}
          >
            <span className="text-xs font-medium text-[#A3AEC2]">{title}</span>
          </div>
        )}

        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
            isHoldingPreview
              ? 'bg-gradient-to-t from-[#06070C]/95 via-[#06070C]/25 to-transparent opacity-100'
              : 'bg-gradient-to-t from-[#06070C]/90 via-transparent to-[#06070C]/30'
          }`}
        />

        {/* Hold Preview Animated Caption */}
        <AnimatePresence>
          {isHoldingPreview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl bg-[#06070C]/85 px-3 py-2 backdrop-blur-md border border-[#F5B942]/35"
            >
              <p className="text-[11px] font-medium text-[#F5B942]">
                {t('Motion scene preview...', 'پیش‌نمایش صحنه انتخابی...')}
              </p>
              <p className="mt-0.5 line-clamp-1 text-xs text-[#F5F7FA]">{synopsis}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Row: Clean Action Controls */}
        <div
          className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span
            dir="ltr"
            className="rounded-full bg-[#06070C]/75 px-2.5 py-1 text-[11px] font-mono-tabular text-[#F5B942] backdrop-blur-md"
          >
            {score}% {t('Match', 'تطابق')}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onDownload(item)}
              aria-label={t('Download for offline', 'دانلود برای تماشای آفلاین')}
              className={`min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-full backdrop-blur-md transition-colors cursor-pointer px-2 gap-1 ${
                isDownloaded
                  ? 'bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40'
                  : isDownloading
                  ? 'bg-[#F5B942]/20 text-[#F5B942] border border-[#F5B942]/40'
                  : 'bg-[#06070C]/70 text-[#F5F7FA] hover:bg-[#06070C]'
              }`}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span dir="ltr" className="text-[10px] font-mono-tabular">
                    {downloadRecord.progressPct}%
                  </span>
                </>
              ) : isDownloaded ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onToggleFavorite(item)}
              aria-label={t('Bookmark', 'ذخیره در علاقه‌مندی‌ها')}
              className={`min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-[#F5B942] text-[#06070C]'
                  : 'bg-[#06070C]/70 text-[#F5F7FA] hover:bg-[#06070C]'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label={t('More options', 'گزینه‌های بیشتر')}
                className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-full bg-[#06070C]/70 text-[#F5F7FA] backdrop-blur-md hover:bg-[#06070C] transition-colors cursor-pointer"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute end-0 top-10 z-30 w-44 rounded-2xl border border-white/15 bg-[#0D101A]/95 p-1.5 shadow-2xl backdrop-blur-xl"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onFeedback(item, 'like');
                        setMenuOpen(false);
                      }}
                      className={`w-full min-h-[38px] flex items-center gap-2 rounded-xl px-3 text-xs text-start transition-colors cursor-pointer ${
                        feedback?.sentiment === 'like'
                          ? 'bg-[#F5B942]/15 text-[#F5B942]'
                          : 'text-[#F5F7FA] hover:bg-white/[0.06]'
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5 shrink-0" />
                      <span>{t('More like this', 'مشابه این بیشتر')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onFeedback(item, 'less_like_this');
                        setMenuOpen(false);
                      }}
                      className={`w-full min-h-[38px] flex items-center gap-2 rounded-xl px-3 text-xs text-start transition-colors cursor-pointer ${
                        feedback?.sentiment === 'less_like_this'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'text-[#A3AEC2] hover:bg-white/[0.06] hover:text-[#F5F7FA]'
                      }`}
                    >
                      <ThumbsDown className="h-3.5 w-3.5 shrink-0" />
                      <span>{t('Less like this', 'کمتر از این سبک')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDownload(item);
                        setMenuOpen(false);
                      }}
                      className="w-full min-h-[38px] flex items-center gap-2 rounded-xl px-3 text-xs text-start text-[#34D399] hover:bg-[#34D399]/10 transition-colors cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5 shrink-0" />
                      <span>{t('Download Offline', 'دانلود و ذخیره فایل')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onHide(item);
                        setMenuOpen(false);
                      }}
                      className="w-full min-h-[38px] flex items-center gap-2 rounded-xl px-3 text-xs text-start text-[#FCA5A5] hover:bg-[#EF4444]/15 transition-colors cursor-pointer"
                    >
                      <EyeOff className="h-3.5 w-3.5 shrink-0" />
                      <span>{t('Hide this item', 'عدم نمایش این مورد')}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Play Trigger Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlay(item);
          }}
          aria-label={`${t('Play', 'پخش')} ${title}`}
          className="absolute bottom-2.5 end-2.5 min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-full bg-[#F5B942] text-[#06070C] shadow-lg transition-colors duration-200 hover:bg-[#fbd074] cursor-pointer"
        >
          <Play className="h-4 w-4 fill-current" />
        </button>

        {/* Resume Progress Track */}
        {progressPct > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/15">
            <div className="h-full bg-[#F5B942]" style={{ width: `${progressPct}%` }} />
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-4 gap-3">
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => onOpenDetail(item)}
            className="text-start w-full text-sm sm:text-base font-semibold text-[#F5F7FA] hover:text-[#F5B942] transition-colors line-clamp-1 cursor-pointer"
          >
            {title}
          </button>

          <p className="text-xs text-[#A3AEC2] line-clamp-1">
            {category} · <span dir="ltr" className="font-mono-tabular">{item.quality}</span> ·{' '}
            <span dir="ltr" className="font-mono-tabular">
              {formatDuration(item.durationSec)}
            </span>
            {creator ? ` · ${creator}` : ''}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => setShowWhy((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#A3AEC2] hover:text-[#F5B942] transition-colors cursor-pointer"
          >
            <HelpCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{t('Why this?', 'چرا پیشنهاد شد؟')}</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenDetail(item)}
            className="text-[11px] font-medium text-[#F5B942] hover:underline cursor-pointer"
          >
            {t('Details & Download', 'جزئیات و دانلود')}
          </button>
        </div>

        <AnimatePresence>
          {showWhy && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden rounded-xl bg-[#151A28] px-3 py-2 text-[11px] leading-relaxed text-[#D2DAE8]"
            >
              {reason}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

export interface StateBoundaryProps {
  uiState: UiSimulationState;
  lang: LanguageCode;
  onRetry: () => void;
  onResetFilters?: () => void;
  onOpenDownloads?: () => void;
  children: React.ReactNode;
}

export function StateBoundary({
  uiState,
  onRetry,
  onResetFilters,
  onOpenDownloads,
  children
}: StateBoundaryProps) {
  const { t } = useT();

  if (uiState === 'normal') return <>{children}</>;

  if (uiState === 'loading') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 py-4" aria-busy="true">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="rounded-[22px] border border-white/10 bg-[#0D101A] overflow-hidden">
            <div className="aspect-[16/10] w-full poster-skeleton-shimmer" />
            <div className="p-4 space-y-2.5">
              <div className="h-4 w-3/4 rounded bg-white/10" />
              <div className="h-3 w-1/2 rounded bg-white/[0.06]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (uiState === 'slow_network') {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F5B942]/30 bg-[#F5B942]/10 px-4 py-3 text-xs text-[#F5F7FA]">
          <span>
            {t(
              'Slow network detected — streaming and assets stepped down to Lite Mode.',
              'اتصال کند شناسایی شد — پخش و تصاویر با کیفیت سبک‌سازی‌شده بارگذاری می‌شوند.'
            )}
          </span>
          <Button size="sm" variant="secondary" onClick={onRetry}>
            {t('Restore Full Quality', 'بازگشت به حالت عادی')}
          </Button>
        </div>
        {children}
      </div>
    );
  }

  if (uiState === 'partial_failure') {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-300 shrink-0" />
            <span>
              {t(
                'Some secondary shelves are unavailable; your personal feeds remain active.',
                'بخشی از فیدهای فرعی موقتاً در دسترس نیست؛ جهان شخصی شما بدون اختلال فعال است.'
              )}
            </span>
          </div>
          <Button size="sm" variant="secondary" onClick={onRetry}>
            <RefreshCw className="h-3.5 w-3.5" />
            {t('Retry', 'تلاش مجدد')}
          </Button>
        </div>
        {children}
      </div>
    );
  }

  const stateCopy: Record<
    Exclude<UiSimulationState, 'normal' | 'loading' | 'slow_network' | 'partial_failure'>,
    { icon: React.ReactNode; titleEn: string; titleFa: string; descEn: string; descFa: string }
  > = {
    empty: {
      icon: <HelpCircle className="h-7 w-7 text-[#F5B942]" />,
      titleEn: 'Nothing here yet',
      titleFa: 'این بخش هنوز خالی است',
      descEn: 'Explore the universe or tune preferences to populate this space.',
      descFa: 'با کاوش در جهان محتوا یا تنظیم علاقه‌مندی‌ها، پیشنهادهای دقیق اینجا ظاهر می‌شوند.'
    },
    error: {
      icon: <AlertTriangle className="h-7 w-7 text-[#FCA5A5]" />,
      titleEn: 'Unable to load stream catalog',
      titleFa: 'خطا در دریافت داده‌های محتوا',
      descEn: 'A temporary connection error occurred. Your local data remains safely preserved.',
      descFa: 'خطای موقت در پاسخگویی سرویس رخ داد. داده‌های محلی شما محفوظ هستند.'
    },
    offline: {
      icon: <WifiOff className="h-7 w-7 text-[#38BDF8]" />,
      titleEn: 'You are currently offline',
      titleFa: 'اتصال اینترنت قطع است',
      descEn: 'Live streaming is paused while offline, though your downloaded items remain playable.',
      descFa: 'پخش آنلاین موقتاً متوقف شده اما فایل‌های دانلودشده و تاریخچه در حافظه برنامه در دسترس‌اند.'
    },
    no_results: {
      icon: <HelpCircle className="h-7 w-7 text-[#A3AEC2]" />,
      titleEn: 'No matching results found',
      titleFa: 'نتیجه‌ای با این فیلترها پیدا نشد',
      descEn: 'Relax duration, quality, or blocked-tag constraints to expand results.',
      descFa: 'فیلترهای مدت‌زمان، کیفیت یا موضوعات مسدودشده را بازبینی کنید تا جهان بازتر شود.'
    }
  };

  const info = stateCopy[uiState];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="my-8 mx-auto max-w-xl rounded-[28px] border border-white/12 bg-[#0D101A] p-6 sm:p-8 text-center space-y-4"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.05] border border-white/10">
        {info.icon}
      </div>
      <h3 className="text-lg font-semibold text-[#F5F7FA]">{t(info.titleEn, info.titleFa)}</h3>
      <p className="text-sm text-[#A3AEC2] leading-relaxed">{t(info.descEn, info.descFa)}</p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          {t('Retry', 'تلاش مجدد')}
        </Button>
        {uiState === 'offline' && onOpenDownloads && (
          <Button variant="secondary" onClick={onOpenDownloads}>
            <Download className="h-4 w-4" />
            {t('Open Offline Downloads', 'تماشای دانلودهای آفلاین')}
          </Button>
        )}
        {uiState === 'no_results' && onResetFilters && (
          <Button variant="secondary" onClick={onResetFilters}>
            {t('Reset Filters', 'پاک کردن فیلترها')}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export interface ToastMessage {
  id: string;
  text: string;
  undoLabel?: string;
  onUndo?: () => void;
}

export function ToastBanner({
  toast,
  onDismiss
}: {
  toast: ToastMessage | null;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] sm:bottom-6 start-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md rounded-2xl border border-[#F5B942]/40 bg-[#0D101A]/95 px-4 py-3 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3"
        >
          <p className="text-xs sm:text-sm text-[#F5F7FA]">{toast.text}</p>
          <div className="flex items-center gap-2 shrink-0">
            {toast.onUndo && toast.undoLabel && (
              <button
                type="button"
                onClick={() => {
                  toast.onUndo?.();
                  onDismiss();
                }}
                className="min-h-[34px] rounded-full bg-[#F5B942] px-3 text-xs font-semibold text-[#06070C] cursor-pointer"
              >
                {toast.undoLabel}
              </button>
            )}
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="min-h-[34px] min-w-[34px] inline-flex items-center justify-center rounded-full text-[#A3AEC2] hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
