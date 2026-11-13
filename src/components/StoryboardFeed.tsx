import React, { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe2,
  Infinity as InfinityIcon,
  Info,
  Loader2,
  Sparkles
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { AppLang, FilmRecommendation } from '../types/cinema';
import { resolvePosterAsset } from '../data/posters';

interface StoryboardFeedProps {
  films: FilmRecommendation[];
  isLoading: boolean;
  isLoadingMore: boolean;
  savedIds: Set<string>;
  lang: AppLang;
  onSelectFilm: (film: FilmRecommendation) => void;
  onToggleSave: (film: FilmRecommendation) => void;
  onSearchPivot: (pivotQuery: string) => void;
  onLoadMore: () => void;
}

export const StoryboardFeed: React.FC<StoryboardFeedProps> = ({
  films,
  isLoading,
  isLoadingMore,
  savedIds,
  lang,
  onSelectFilm,
  onToggleSave,
  onSearchPivot,
  onLoadMore
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const pointerStartX = useRef<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // Clamp activeIndex if films shrink after a fresh search
  useEffect(() => {
    if (films.length > 0 && activeIndex >= films.length) {
      setActiveIndex(0);
    }
  }, [films.length, activeIndex]);

  // Reset to #1 when a brand-new wave 1 search replaces the catalog
  useEffect(() => {
    if (isLoading) {
      setActiveIndex(0);
    }
  }, [isLoading]);

  // Endless auto-prefetch: whenever user approaches within 3 cards of the tail, load the next AI wave!
  useEffect(() => {
    if (films.length > 0 && activeIndex >= films.length - 3 && !isLoading && !isLoadingMore) {
      onLoadMore();
    }
  }, [activeIndex, films.length, isLoading, isLoadingMore, onLoadMore]);

  // Scroll filmstrip to keep active thumbnail centered
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const activeEl = strip.querySelector<HTMLElement>(`[data-story-thumb="${activeIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const handleNext = () => {
    if (films.length === 0) return;
    setDirection(1);
    if (activeIndex < films.length - 1) {
      setActiveIndex((i) => i + 1);
    } else if (!isLoadingMore) {
      onLoadMore();
    }
  };

  const handlePrev = () => {
    if (activeIndex <= 0) return;
    setDirection(-1);
    setActiveIndex((i) => Math.max(0, i - 1));
  };

  const handleJump = (idx: number) => {
    setDirection(idx >= activeIndex ? 1 : -1);
    setActiveIndex(idx);
  };

  if (isLoading && films.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8">
        <div className="poster-skeleton-shimmer h-[540px] w-full rounded-[32px] border border-white/10" />
      </div>
    );
  }

  const currentFilm = films[activeIndex];
  if (!currentFilm) return null;

  const isSaved = savedIds.has(currentFilm.id);
  const windowSize = 12;
  const windowStart = Math.floor(activeIndex / windowSize) * windowSize;
  const windowEnd = Math.min(films.length, windowStart + windowSize);

  return (
    <section className="w-full max-w-5xl mx-auto pt-3 pb-28">
      {/* Top Storyboard Progress Bars (12-film wave window + Endless Indicator) */}
      <div className="mb-3 flex items-center gap-2 px-1">
        <div className="flex-1 flex items-center gap-1.5">
          {films.slice(windowStart, windowEnd).map((f, idx) => {
            const globalIdx = windowStart + idx;
            const isPastOrCurrent = globalIdx <= activeIndex;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => handleJump(globalIdx)}
                aria-label={`Jump to film ${globalIdx + 1}: ${f.title}`}
                className="group py-2 flex-1 cursor-pointer focus:outline-none"
              >
                <div className="h-1.5 w-full rounded-full bg-white/12 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      globalIdx === activeIndex
                        ? 'bg-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.85)]'
                        : isPastOrCurrent
                        ? 'bg-[#D4AF37]/60'
                        : 'bg-transparent group-hover:bg-white/25'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/35 bg-[#0b1120]/80 px-3 py-1 text-[11px] font-mono-tabular text-[#D4AF37]">
          <span>
            #{String(activeIndex + 1).padStart(2, '0')} / {films.length}+
          </span>
          <InfinityIcon className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Main 3D Liquid-Glass Interactive Storyboard Card */}
      <div
        className="relative"
        onPointerDown={(e) => {
          pointerStartX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (pointerStartX.current === null) return;
          const delta = e.clientX - pointerStartX.current;
          pointerStartX.current = null;
          if (delta < -50) handleNext();
          else if (delta > 50) handlePrev();
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentFilm.id}
            initial={{ opacity: 0, x: direction > 0 ? 36 : -36, scale: 0.985 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction > 0 ? -36 : 36, scale: 0.985 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-[32px] border border-white/14 bg-[#0b1120]/90 shadow-[0_40px_90px_-18px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Visual Poster Stage */}
              <div className="md:col-span-5 relative aspect-[4/3] md:aspect-auto md:min-h-[480px] overflow-hidden bg-[#070b14]">
                <img
                  src={resolvePosterAsset(currentFilm.posterKey)}
                  alt={currentFilm.title}
                  className="h-full w-full object-cover scale-[1.03] transition-transform duration-700"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-[#070b14]/70 md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#0b1120]"
                />

                {/* Top Badges: AI Rank + Country + Match */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/50 bg-[#070b14]/80 px-3 py-1 text-xs font-mono-tabular font-semibold text-[#D4AF37] backdrop-blur-md">
                    <span>#{String(activeIndex + 1).padStart(2, '0')}</span>
                    <span className="text-white/40">•</span>
                    <span>{currentFilm.matchScore}%</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#070b14]/80 px-3 py-1 text-xs font-medium text-slate-100 backdrop-blur-md">
                    <Globe2 className="h-3.5 w-3.5 text-[#D4AF37]" />
                    <span>{currentFilm.country}</span>
                  </span>
                </div>
              </div>

              {/* Editorial Details + AI Ordering Context + Clickable Pivots */}
              <div
                className="md:col-span-7 p-5 sm:p-7 flex flex-col justify-between gap-5"
                dir={lang === 'fa' ? 'rtl' : 'ltr'}
              >
                <div>
                  {/* AI Ordering Explanation Chip */}
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/[0.08] px-3.5 py-1.5 text-xs text-[#fef3c7]">
                    <Sparkles className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                    <span className="font-medium">{currentFilm.aiOrderReason}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="uppercase tracking-[0.14em] text-[#D4AF37] font-semibold">
                      {currentFilm.vibeTag}
                    </span>
                    <span>•</span>
                    <span>{currentFilm.language}</span>
                    <span>•</span>
                    <span className="font-mono-tabular">{currentFilm.year}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-mono-tabular">
                      <Clock className="h-3.5 w-3.5 text-[#D4AF37]" />
                      {currentFilm.runtimeMin}m
                    </span>
                  </div>

                  <h2
                    dir="ltr"
                    className={`mt-2 font-editorial text-3xl sm:text-4xl font-semibold text-white leading-tight ${
                      lang === 'fa' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {currentFilm.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-300">
                    {lang === 'fa' ? 'کارگردان:' : 'Directed by'}{' '}
                    <span className="text-white font-medium">{currentFilm.director}</span>
                  </p>

                  <p className="mt-3.5 text-sm leading-relaxed text-slate-200">
                    {currentFilm.synopsis}
                  </p>

                  <div className="mt-3.5 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                    <p className="text-xs leading-relaxed text-slate-300">
                      <span className="text-[#D4AF37] font-semibold">
                        {lang === 'fa' ? 'تحلیل AI: ' : 'AI Curatorial Note: '}
                      </span>
                      {currentFilm.aiReasoning}
                    </p>
                  </div>

                  {/* Clickable AI Pivot Chips (Similar Films / Directions) */}
                  {currentFilm.similarFilms.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[11px] font-medium text-slate-400 mb-2">
                        {lang === 'fa'
                          ? 'ادامه مسیر با فیلم‌های مشابه (کلیک کنید):'
                          : 'Pivot AI Storyboard with Similar Films (Tap):'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {currentFilm.similarFilms.map((sim) => (
                          <button
                            key={sim}
                            type="button"
                            onClick={() => onSearchPivot(`Films like ${sim} and ${currentFilm.title}`)}
                            className="liquid-glass-pill min-h-[38px] px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:text-[#fef3c7] cursor-pointer"
                          >
                            ↗ {sim}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Controls Row */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectFilm(currentFilm)}
                      className="min-h-[44px] inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-5 py-2 text-xs font-semibold text-[#070b14] hover:bg-[#e5c258] active:scale-95 transition-all cursor-pointer"
                    >
                      <Info className="h-4 w-4" />
                      <span>{lang === 'fa' ? 'جزئیات و پلتفرم‌ها' : 'Details & Streams'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleSave(currentFilm)}
                      className={`min-h-[44px] inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                        isSaved
                          ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#fef3c7]'
                          : 'border-white/15 bg-white/[0.04] text-slate-200 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-current text-[#D4AF37]' : ''}`} />
                      <span>{isSaved ? (lang === 'fa' ? 'ذخیره شد' : 'Saved') : (lang === 'fa' ? 'ذخیره' : 'Save')}</span>
                    </button>
                  </div>

                  {/* Storyboard Prev / Next Round Liquid Glass Controls */}
                  <div className="flex items-center gap-2" dir="ltr">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={activeIndex === 0}
                      aria-label="Previous storyboard card"
                      className="liquid-glass-pill min-h-[44px] min-w-[44px] flex items-center justify-center text-white disabled:opacity-35 cursor-pointer"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Next storyboard card"
                      className="liquid-glass-pill min-h-[44px] px-4 flex items-center gap-1.5 text-xs font-semibold text-[#fef3c7] cursor-pointer"
                    >
                      <span>{lang === 'fa' ? 'بعدی' : 'Next'}</span>
                      {isLoadingMore && activeIndex >= films.length - 1 ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Endless Interactive Filmstrip Thumbnails + Instant Wave Loader */}
      <div className="mt-4 flex items-center gap-2.5">
        <div
          ref={stripRef}
          className="no-scrollbar flex-1 flex items-center gap-2.5 overflow-x-auto py-1 px-0.5"
        >
          {films.map((film, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={film.id}
                type="button"
                data-story-thumb={idx}
                onClick={() => handleJump(idx)}
                className={`group relative shrink-0 w-24 sm:w-28 aspect-[3/4] rounded-2xl overflow-hidden border transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/40 scale-[1.03]'
                    : 'border-white/12 opacity-70 hover:opacity-100 hover:border-white/35'
                }`}
              >
                <img
                  src={resolvePosterAsset(film.posterKey)}
                  alt={film.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-transparent to-[#070b14]/60" />
                <span className="absolute top-1.5 left-1.5 font-mono-tabular text-[10px] font-semibold text-[#D4AF37] bg-[#070b14]/80 px-1.5 py-0.5 rounded-full">
                  #{idx + 1}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-1.5 text-left">
                  <p className="truncate text-[10px] font-semibold text-white">{film.title}</p>
                  <p className="truncate text-[9px] text-slate-300">{film.country}</p>
                </div>
              </button>
            );
          })}

          {/* Endless Tail Card */}
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="shrink-0 w-28 aspect-[3/4] rounded-2xl border border-dashed border-[#D4AF37]/45 bg-[#D4AF37]/[0.06] flex flex-col items-center justify-center gap-2 p-3 text-center text-[#D4AF37] hover:bg-[#D4AF37]/[0.14] transition-colors cursor-pointer"
          >
            {isLoadingMore ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <InfinityIcon className="h-5 w-5" />
            )}
            <span className="text-[11px] font-semibold leading-tight">
              {isLoadingMore
                ? lang === 'fa'
                  ? 'در حال آوردن...'
                  : 'Loading...'
                : lang === 'fa'
                ? '+۱۲ فیلم دیگر از دنیا'
                : '+12 More World Films'}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
