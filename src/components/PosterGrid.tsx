import React, { useEffect, useRef, useState } from 'react';
import { Globe2, Infinity as InfinityIcon, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import type { AppLang, FilmRecommendation } from '../types/cinema';
import { resolvePosterAsset } from '../data/posters';

interface PosterGridProps {
  films: FilmRecommendation[];
  isLoading: boolean;
  isLoadingMore: boolean;
  subRefinements: string[];
  activeRefinement?: string;
  onSelectRefinement: (chip: string) => void;
  onSelectFilm: (film: FilmRecommendation) => void;
  onLoadMore: () => void;
  savedIds: Set<string>;
  lang: AppLang;
}

const PosterCardImage: React.FC<{ posterKey: string; title: string }> = ({
  posterKey,
  title
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="absolute inset-0 flex items-end bg-gradient-to-br from-[#131d33] via-[#0a101d] to-[#070b14] p-4">
        <span className="font-editorial text-xl text-[#D4AF37]/80">{title}</span>
      </div>
    );
  }

  return (
    <img
      src={resolvePosterAsset(posterKey)}
      alt={title}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover scale-[1.04] transition-transform duration-500 ease-out group-hover:scale-[1.09]"
    />
  );
};

export const PosterGrid: React.FC<PosterGridProps> = ({
  films,
  isLoading,
  isLoadingMore,
  subRefinements,
  activeRefinement,
  onSelectRefinement,
  onSelectFilm,
  onLoadMore,
  savedIds,
  lang
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Automatic Infinite Scroll across World Cinema Waves
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || isLoading || isLoadingMore || films.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '360px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isLoading, isLoadingMore, films.length, onLoadMore]);

  return (
    <section className="w-full max-w-7xl mx-auto pt-4 pb-28">
      {/* Clickable Sub-Refinement Chips */}
      {subRefinements.length > 0 && (
        <div
          className="mb-5 flex flex-wrap items-center gap-2.5"
          dir={lang === 'fa' ? 'rtl' : 'ltr'}
        >
          {subRefinements.slice(0, 4).map((chip) => {
            const isActive = activeRefinement === chip;
            return (
              <button
                key={chip}
                type="button"
                disabled={isLoading}
                onClick={() => onSelectRefinement(chip)}
                className={`min-h-[44px] rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#fef3c7] shadow-[0_0_24px_rgba(212,175,55,0.28)]'
                    : 'liquid-glass-pill text-slate-200 hover:text-white'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      )}

      {/* Cinematic Shimmer Skeleton Loaders */}
      {isLoading ? (
        <div
          aria-label="Loading curated films"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6"
        >
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="poster-skeleton-shimmer aspect-[3/4] rounded-3xl border border-white/[0.07]"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
            {films.map((film, index) => {
              const isSaved = savedIds.has(film.id);
              return (
                <motion.button
                  key={film.id}
                  type="button"
                  onClick={() => onSelectFilm(film)}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min((index % 12) * 0.03, 0.24),
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="group relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-white/12 bg-[#0b1120] text-left shadow-[0_24px_54px_-14px_rgba(0,0,0,0.92)] transition-all duration-300 hover:border-[#D4AF37]/50 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] cursor-pointer"
                >
                  <PosterCardImage posterKey={film.posterKey} title={film.title} />

                  {/* Top dark vignette */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#070b14]/85 to-transparent"
                  />

                  {/* Bottom scrim */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#070b14] via-[#070b14]/82 to-transparent"
                  />

                  {/* Top AI Order Rank + Country */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-[#070b14]/80 px-2.5 py-1 text-[10px] font-medium text-slate-200 backdrop-blur-md truncate max-w-[58%]">
                      <Globe2 className="h-3 w-3 text-[#D4AF37] shrink-0" />
                      <span className="truncate">{film.country}</span>
                    </span>

                    <div className="flex items-center gap-1 rounded-full border border-[#D4AF37]/45 bg-[#070b14]/82 px-2.5 py-1 backdrop-blur-md">
                      <span className="font-mono-tabular text-[10px] font-semibold text-[#D4AF37]">
                        #{index + 1} • {film.matchScore}%
                      </span>
                    </div>
                  </div>

                  {isSaved && (
                    <div
                      aria-label="Saved to taste profile"
                      className="absolute top-12 left-3 h-2.5 w-2.5 rounded-full bg-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.85)]"
                    />
                  )}

                  {/* Metadata + AI Order Reason */}
                  <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
                    <p
                      dir={lang === 'fa' ? 'rtl' : 'ltr'}
                      className="mb-1 text-[10px] text-slate-300/90 truncate flex items-center gap-1"
                    >
                      <Sparkles className="h-2.5 w-2.5 text-[#D4AF37] shrink-0" />
                      <span className="truncate">{film.aiOrderReason}</span>
                    </p>
                    <h3 className="font-editorial text-lg sm:text-xl font-semibold leading-tight text-slate-50 truncate">
                      {film.title}
                    </h3>
                    <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#D4AF37] truncate">
                      {film.vibeTag} · {film.year}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Endless World Cinema Infinite Scroll Sentinel + Manual Wave Trigger */}
          <div ref={sentinelRef} className="mt-10 flex flex-col items-center justify-center gap-3">
            <button
              type="button"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="liquid-glass-pill min-h-[48px] px-6 py-3 inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#fef3c7] cursor-pointer disabled:opacity-60"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#D4AF37]" />
                  <span>
                    {lang === 'fa'
                      ? 'هوش مصنوعی در حال انتخاب ۱۲ فیلم جدید از سینمای جهان...'
                      : 'AI sequencing next 12 unique world cinema films...'}
                  </span>
                </>
              ) : (
                <>
                  <InfinityIcon className="h-4 w-4 text-[#D4AF37]" />
                  <span>
                    {lang === 'fa'
                      ? `نمایش ۱۲ فیلم دیگر از سینمای دنیا (مجموع فعلی: ${films.length})`
                      : `Discover Next 12 World Films (${films.length} loaded • Endless)`}
                  </span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </section>
  );
};
