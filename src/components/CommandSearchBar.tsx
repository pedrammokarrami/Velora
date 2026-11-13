import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, RefreshCw, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type {
  AppLang,
  AutocompleteSuggestion,
  MoodVector,
  TasteInteraction
} from '../types/cinema';
import { fetchAutocompleteSuggestions } from '../services/cinemaApi';

const TYPEWRITER_EXAMPLES_FA = [
  'نوآر بارانی و معمایی مثل Se7en و Memories of Murder...',
  'سینمای ایران و کره: فرهادی، کیارستمی، پارک چان‌ووک...',
  'نئون توکیو و شب‌های بارانی وونگ کاروای...',
  'فیلم‌های کشف‌نشده و بی‌انتها از سینمای جهان...'
];

const TYPEWRITER_EXAMPLES_EN = [
  'Rainy night detective thriller like Cure or Se7en...',
  'Iranian & Korean masterpieces: Kiarostami, Park Chan-wook...',
  'Minimal dialogue, neon Tokyo, nocturnal longing...',
  'Endless world cinema: snowy cabins, velvet dreams...'
];

interface CommandSearchBarProps {
  query: string;
  onQueryChange: (val: string) => void;
  onSubmitSearch: (searchQuery: string) => void;
  mood: MoodVector;
  onMoodChange: (nextMood: MoodVector, triggerDiscovery?: boolean) => void;
  isResultsActive: boolean;
  onResetLanding: () => void;
  isLoading: boolean;
  lang: AppLang;
  interactions: TasteInteraction[];
  liveSuggestions: AutocompleteSuggestion[];
  onRefreshSuggestions: () => void;
}

export const CommandSearchBar: React.FC<CommandSearchBarProps> = ({
  query,
  onQueryChange,
  onSubmitSearch,
  mood,
  onMoodChange,
  isResultsActive,
  onResetLanding,
  isLoading,
  lang,
  interactions,
  liveSuggestions,
  onRefreshSuggestions
}) => {
  const [placeholderText, setPlaceholderText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [slidersOpen, setSlidersOpen] = useState(false);
  const [dropdownSuggestions, setDropdownSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);
  const sliderCommitRef = useRef<number | null>(null);

  const examples = lang === 'fa' ? TYPEWRITER_EXAMPLES_FA : TYPEWRITER_EXAMPLES_EN;

  // Animated typewriter cycling while empty
  useEffect(() => {
    if (query.trim().length > 0) return;

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timerId: number;

    const tick = () => {
      const currentPhrase = examples[phraseIndex % examples.length];
      if (!deleting) {
        charIndex += 1;
        setPlaceholderText(currentPhrase.slice(0, charIndex));
        if (charIndex >= currentPhrase.length) {
          deleting = true;
          timerId = window.setTimeout(tick, 1800);
          return;
        }
        timerId = window.setTimeout(tick, 40);
      } else {
        charIndex -= 1;
        setPlaceholderText(currentPhrase.slice(0, Math.max(0, charIndex)));
        if (charIndex <= 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % examples.length;
          timerId = window.setTimeout(tick, 300);
          return;
        }
        timerId = window.setTimeout(tick, 20);
      }
    };

    timerId = window.setTimeout(tick, 200);
    return () => window.clearTimeout(timerId);
  }, [query, lang]);

  // Real-time predictive AI auto-suggest debounced at 260ms
  useEffect(() => {
    const trimmed = query.trim();
    if (!isFocused && trimmed.length < 2) {
      return;
    }

    const controller = new AbortController();
    setSuggestLoading(true);

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await fetchAutocompleteSuggestions(
          {
            query: trimmed,
            moodParams: mood,
            interactions: interactions.slice(0, 6),
            lang
          },
          controller.signal
        );
        if (!controller.signal.aborted) {
          setDropdownSuggestions(res.suggestions || []);
        }
      } catch {
        if (!controller.signal.aborted) {
          setDropdownSuggestions(liveSuggestions);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSuggestLoading(false);
        }
      }
    }, trimmed.length === 0 ? 80 : 260);

    return () => {
      controller.abort();
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, isFocused, mood.tension, mood.pace, mood.atmosphere, lang]);

  // Close dropdowns on outside pointer down
  useEffect(() => {
    const handleOutside = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    window.addEventListener('pointerdown', handleOutside);
    return () => window.removeEventListener('pointerdown', handleOutside);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFocused(false);
    setSlidersOpen(false);
    onSubmitSearch(query.trim());
  };

  const handleSuggestionTap = (item: AutocompleteSuggestion) => {
    const targetQuery = item.queryValue || item.text;
    onQueryChange(item.text);
    setIsFocused(false);
    setSlidersOpen(false);
    onSubmitSearch(targetQuery);
  };

  const handleSliderInput = (field: keyof MoodVector, value: number) => {
    const next = { ...mood, [field]: value };
    onMoodChange(next, false);

    if (sliderCommitRef.current) {
      window.clearTimeout(sliderCommitRef.current);
    }
    sliderCommitRef.current = window.setTimeout(() => {
      onMoodChange(next, true);
    }, 360);
  };

  const activeDropdownItems =
    dropdownSuggestions.length > 0 ? dropdownSuggestions : liveSuggestions;
  const showDropdown = isFocused && (activeDropdownItems.length > 0 || suggestLoading);

  const visibleDockSuggestions =
    liveSuggestions.length > 0 ? liveSuggestions : dropdownSuggestions;

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto z-30">
      <form
        onSubmit={handleFormSubmit}
        dir={lang === 'fa' ? 'rtl' : 'ltr'}
        className={`relative flex items-center gap-1.5 rounded-full border transition-all duration-300 backdrop-blur-xl px-3 py-1.5 ${
          isFocused
            ? 'border-[#D4AF37]/60 bg-[#0c1322]/92 shadow-[0_24px_60px_-14px_rgba(212,175,55,0.28)]'
            : 'border-white/14 bg-[#0b1120]/80 shadow-[0_24px_60px_-14px_rgba(0,0,0,0.85)]'
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center text-[#D4AF37]">
          <Search className="h-[18px] w-[18px]" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholderText || examples[0]}
          aria-label="Semantic cinema search"
          className="h-11 w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder:text-slate-400/80 focus:outline-none"
        />

        {query.length > 0 && (
          <button
            type="button"
            onClick={() => {
              onQueryChange('');
              inputRef.current?.focus();
              if (isResultsActive) {
                onResetLanding();
              }
            }}
            aria-label="Clear search query"
            className="min-h-[44px] min-w-[44px] shrink-0 flex items-center justify-center rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Tactile 1-Finger Mood Slider Toggle */}
        <button
          type="button"
          onClick={() => setSlidersOpen((prev) => !prev)}
          aria-label="Tactile mood triggers"
          aria-expanded={slidersOpen}
          className={`min-h-[44px] min-w-[44px] shrink-0 flex items-center justify-center rounded-full border transition-all cursor-pointer ${
            slidersOpen
              ? 'border-[#D4AF37]/60 bg-[#D4AF37]/15 text-[#D4AF37]'
              : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-100'
          }`}
        >
          <SlidersHorizontal className="h-[18px] w-[18px]" />
        </button>

        {/* Submit / Search CTA */}
        <button
          type="submit"
          disabled={isLoading}
          aria-label="Search cinema"
          className="min-h-[44px] min-w-[44px] shrink-0 flex items-center justify-center rounded-full bg-[#D4AF37] text-[#070b14] transition-transform active:scale-95 hover:bg-[#e4c158] disabled:opacity-60 cursor-pointer"
        >
          <ArrowUp className={`h-[18px] w-[18px] stroke-[2.4] ${isLoading ? 'animate-pulse' : ''}`} />
        </button>
      </form>

      {/* Predictive AI Auto-Suggest Dropdown (Pointer-safe: never swallowed by blur!) */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            dir={lang === 'fa' ? 'rtl' : 'ltr'}
            className="absolute left-0 right-0 mt-2.5 overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-[#0b1120]/96 shadow-[0_32px_70px_-15px_rgba(0,0,0,0.98)] backdrop-blur-2xl z-50"
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.07] bg-white/[0.02]">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#D4AF37]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>
                  {lang === 'fa'
                    ? 'پیشنهادهای هوشمند AI (برای اجرا کلیک کنید)'
                    : 'AI Smart Suggestions (Tap to explore)'}
                </span>
              </span>
              <button
                type="button"
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => setIsFocused(false)}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded-full cursor-pointer"
              >
                {lang === 'fa' ? 'بستن' : 'Close'}
              </button>
            </div>

            {suggestLoading && activeDropdownItems.length === 0 ? (
              <div className="flex items-center gap-2.5 px-4 py-4 text-xs text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-[#D4AF37] animate-pulse" />
                <span>
                  {lang === 'fa' ? 'در حال آماده‌سازی پیشنهادهای AI...' : 'Curating semantic matches...'}
                </span>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06] max-h-[340px] overflow-y-auto">
                {activeDropdownItems.map((item, idx) => (
                  <button
                    key={`${item.text}-${idx}`}
                    type="button"
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => handleSuggestionTap(item)}
                    className={`w-full min-h-[52px] flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[#D4AF37]/[0.1] active:bg-[#D4AF37]/[0.18] cursor-pointer ${
                      lang === 'fa' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-100">{item.text}</p>
                      <p className="truncate text-[11px] text-slate-400 mt-0.5">{item.hint}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-2.5 py-1 text-[10px] font-mono-tabular uppercase tracking-wider text-[#D4AF37]">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-Visible Clickable AI Suggestion Pills Dock (Zero Typing Required!) */}
      {visibleDockSuggestions.length > 0 && (
        <div className="mt-3.5" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#D4AF37]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {lang === 'fa'
                  ? 'پیشنهادهای فوری AI • با یک کلیک ترتیب فیلم‌ها را عوض کنید:'
                  : 'Instant AI Suggestions • One click re-orders world cinema:'}
              </span>
            </div>
            <button
              type="button"
              onClick={onRefreshSuggestions}
              disabled={isLoading}
              className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[11px] text-slate-300 hover:border-[#D4AF37]/50 hover:text-[#fef3c7] transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{lang === 'fa' ? 'پیشنهادهای جدید' : 'New Ideas'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {visibleDockSuggestions.map((item, idx) => {
              const isSelected =
                query.trim().toLowerCase() === item.text.trim().toLowerCase() ||
                (item.queryValue && query.trim().toLowerCase() === item.queryValue.trim().toLowerCase());
              return (
                <button
                  key={`${item.text}-${idx}`}
                  type="button"
                  onClick={() => handleSuggestionTap(item)}
                  className={`liquid-glass-pill min-h-[42px] px-3.5 py-2 inline-flex items-center gap-2 text-xs font-medium cursor-pointer ${
                    isSelected
                      ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#fef3c7]'
                      : 'text-slate-200 hover:text-white'
                  }`}
                  title={item.hint}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] shrink-0" />
                  <span className="truncate max-w-[260px]">{item.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Compact 1-Finger Tactile Mood Sliders (Zero-Typing Discovery) */}
      <AnimatePresence>
        {slidersOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="mt-3 rounded-3xl border border-white/12 bg-[#0b1120]/90 p-4 shadow-[0_28px_64px_-16px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="block">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="uppercase tracking-wider text-slate-300">
                    {lang === 'fa' ? 'تنش / Tension' : 'Tension'}
                  </span>
                  <span className="font-mono-tabular text-[#D4AF37]">{mood.tension}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={mood.tension}
                  onChange={(e) => handleSliderInput('tension', Number(e.target.value))}
                  className="aether-slider w-full"
                />
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="uppercase tracking-wider text-slate-300">
                    {lang === 'fa' ? 'ریتم / Pace' : 'Pace'}
                  </span>
                  <span className="font-mono-tabular text-[#D4AF37]">{mood.pace}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={mood.pace}
                  onChange={(e) => handleSliderInput('pace', Number(e.target.value))}
                  className="aether-slider w-full"
                />
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="uppercase tracking-wider text-slate-300">
                    {lang === 'fa' ? 'اتمسفر / Atmosphere' : 'Atmosphere'}
                  </span>
                  <span className="font-mono-tabular text-[#D4AF37]">{mood.atmosphere}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={mood.atmosphere}
                  onChange={(e) => handleSliderInput('atmosphere', Number(e.target.value))}
                  className="aether-slider w-full"
                />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
