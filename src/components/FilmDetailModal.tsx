import React, { useEffect } from 'react';
import { Bookmark, Clock, Film, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { FilmRecommendation } from '../types/cinema';
import { resolvePosterAsset } from '../data/posters';

interface FilmDetailModalProps {
  film: FilmRecommendation | null;
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: (film: FilmRecommendation) => void;
  onSearchSimilar: (title: string) => void;
}

export const FilmDetailModal: React.FC<FilmDetailModalProps> = ({
  film,
  isSaved,
  onClose,
  onToggleSave,
  onSearchSimilar
}) => {
  useEffect(() => {
    if (!film) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [film, onClose]);

  return (
    <AnimatePresence>
      {film && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={film.title}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
        >
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#04070e]/82 backdrop-blur-md"
          />

          {/* Bottom Sheet (Mobile) / Centered Editorial Card (Desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-3xl max-h-[90dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/12 bg-[#0b1120]/95 shadow-[0_40px_100px_-16px_rgba(0,0,0,0.98)] backdrop-blur-2xl"
          >
            {/* Mobile drag affordance */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center">
              <div className="h-1.5 w-10 rounded-full bg-white/20" />
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close film details"
              className="absolute top-4 right-4 z-20 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border border-white/12 bg-[#070b14]/80 text-slate-300 backdrop-blur-md hover:border-white/30 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-12">
              {/* Poster column */}
              <div className="sm:col-span-5 relative aspect-[4/3] sm:aspect-auto sm:min-h-[440px] overflow-hidden bg-[#070b14]">
                <img
                  src={resolvePosterAsset(film.posterKey)}
                  alt={film.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-transparent sm:to-[#0b1120]"
                />
              </div>

              {/* Details column */}
              <div className="sm:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3 pr-10">
                    <span className="font-mono-tabular text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.16em]">
                      {film.matchScore}% Match
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs uppercase tracking-[0.14em] text-slate-300">
                      {film.vibeTag}
                    </span>
                  </div>

                  <h2 className="mt-2 font-editorial text-3xl sm:text-4xl font-semibold text-white leading-tight">
                    {film.title}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span>{film.director}</span>
                    <span>•</span>
                    <span className="font-mono-tabular">{film.year}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-mono-tabular">
                      <Clock className="h-3.5 w-3.5 text-[#D4AF37]" />
                      {film.runtimeMin}m
                    </span>
                  </div>

                  {/* Synopsis */}
                  <p className="mt-5 text-sm leading-relaxed text-slate-200">{film.synopsis}</p>

                  {/* AI Reasoning */}
                  <div className="mt-5 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/[0.05] p-4">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#D4AF37]">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>AI Curatorial Note</span>
                    </div>
                    <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-300">
                      {film.aiReasoning}
                    </p>
                  </div>

                  {/* Streaming Availability */}
                  <div className="mt-5">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-2.5">
                      Available On
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {film.streamingOn.map((service) => (
                        <span
                          key={service}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-200"
                        >
                          <Film className="h-3 w-3 text-[#D4AF37]" />
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Similar Films */}
                  {film.similarFilms.length > 0 && (
                    <div className="mt-5">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-2.5">
                        Explore Similar
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {film.similarFilms.map((sim) => (
                          <button
                            key={sim}
                            type="button"
                            onClick={() => {
                              onClose();
                              onSearchSimilar(`Similar to ${sim}`);
                            }}
                            className="min-h-[40px] rounded-full border border-white/12 bg-[#070b14]/80 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors cursor-pointer"
                          >
                            {sim}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Thumb Action */}
                <div className="pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => onToggleSave(film)}
                    className={`w-full min-h-[48px] flex items-center justify-center gap-2 rounded-full border text-sm font-semibold transition-all cursor-pointer active:scale-[0.98] ${
                      isSaved
                        ? 'border-[#D4AF37] bg-[#D4AF37] text-[#070b14]'
                        : 'border-[#D4AF37]/45 bg-[#D4AF37]/12 text-[#fef3c7] hover:bg-[#D4AF37]/22'
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{isSaved ? 'Saved in Local Taste Profile' : 'Save to Taste Profile'}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
