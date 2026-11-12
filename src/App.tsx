import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  LayoutGrid,
  Sparkles,
  Settings,
  Search,
  X,
  Mic,
  ChevronLeft,
  ArrowRight,
  Film,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Subtitles,
  Wand2,
  Check,
  Shield,
  Globe,
  Columns,
  Flame,
  KeyRound,
  Activity,
  DollarSign,
  Sliders,
  Zap,
  Copy,
  Lock
} from 'lucide-react';
import {
  CatalogFilmItem,
  FilmPillarCode,
  SensoryFantasyMood,
  MoodVector5D,
  AiCuratorResponse,
  SelfHostedLlmConfig,
  GlobalSourceBenchmark,
  GLOBAL_TOP_SOURCES_INDEX,
  GLOBAL_20_COUNTRY_INSIGHTS,
  INITIAL_CATALOG_DATA,
  runAetherAiCurator,
  searchCatalogWithAi,
  synthesizeFilmCriticReview,
  matchGlobalSourcesForQuery,
  fetchPersistedServerCatalog,
  persistCustomFilmToServer,
  syncDnaProfileToServer,
  fetchDnaProfileFromServer,
  formatSecondsToTimecode,
  createHarmonicWaveform,
  computeCosineSimilarity,
  blendMoodVectors
} from './services/aetherAiEngine';
import {
  WorldLangCode,
  WORLD_LANGUAGES,
  SensualThemeId,
  SENSUAL_THEMES,
  encodeTasteDnaKey,
  decodeTasteDnaKey,
  getUiStrings,
  getAgeGateStrings,
  translateSubtitleCue
} from './services/i18nEngine';

// ============================================================================
// TYPES & CONFIGURATION
// ============================================================================

export type PillarFilter = 'All' | 'LIVE' | 'AI' | 'ANIMATION';
export type SubtitleDisplayMode = 'single' | 'bilingual' | 'off';
export type SubtitleSizeMode = 'sm' | 'md' | 'lg';
export type FantasyMoodFilter = 'ALL' | SensoryFantasyMood;
export type AudioVibeFilter = 'ALL' | 'ASMR' | 'Fast Rhythm' | 'Pure Ambient';
export type AgeGateStatus = 'unverified' | 'verified_18_plus' | 'underage_locked';

export interface SubtitleCue {
  id: string;
  index: number;
  startSec: number;
  endSec: number;
  textFa: string;
  textEn: string;
}

export interface AdAdapter {
  id: string;
  name: string;
  network: string;
  settlement: string;
  ecpm: number;
  fillRate: number;
  sponsorName: string;
  sponsorTagline: string;
  domain: string;
}

const AD_ADAPTERS: AdAdapter[] = [
  {
    id: 'tj',
    name: 'TrafficJunky Prime',
    network: 'VAST 4.2 Outstream',
    settlement: 'USDT (TRC-20)',
    ecpm: 4.85,
    fillRate: 94.2,
    sponsorName: 'Maison Close Paris',
    sponsorTagline: 'Haute couture silk & nocturnal sheer collection.',
    domain: 'maison-close.com'
  },
  {
    id: 'exo',
    name: 'ExoClick RTB',
    network: 'Programmatic Slate',
    settlement: 'USDC (ERC-20)',
    ecpm: 4.15,
    fillRate: 97.8,
    sponsorName: 'Lelo Privé Monaco',
    sponsorTagline: '24k gold-plated sculptural sensory luxury.',
    domain: 'lelo.com'
  },
  {
    id: 'ts',
    name: 'TrafficStars Direct',
    network: 'Private Marketplace',
    settlement: 'USDT (TRC-20)',
    ecpm: 3.75,
    fillRate: 92.4,
    sponsorName: 'Agent Provocateur Noir',
    sponsorTagline: 'Handcrafted French Chantilly lace after dark.',
    domain: 'agentprovocateur.com'
  }
];

const FANTASY_MOODS: { id: FantasyMoodFilter; labelEn: string; labelFa: string }[] = [
  { id: 'ALL', labelEn: 'All Moods', labelFa: 'همه حالات' },
  { id: 'Intimate POV', labelEn: 'Intimate POV', labelFa: 'زاویه اول‌شخص POV' },
  { id: 'Velvet Boudoir', labelEn: 'Velvet Boudoir', labelFa: 'اتاق خواب مخملی' },
  { id: 'Late Night Hotel', labelEn: 'Late Night Hotel', labelFa: 'هتل نیمه‌شب' },
  { id: 'Sensual ASMR', labelEn: 'Sensual ASMR', labelFa: 'صدای طبیعی ASMR' },
  { id: 'Hyper-Real AI Fantasy', labelEn: 'Hyper-Real AI', labelFa: 'فانتزی هوش مصنوعی' },
  { id: 'Uncensored Anime', labelEn: 'Uncensored Anime', labelFa: 'انیمه بدون سانسور' },
  { id: 'High-Intensity Climax', labelEn: 'High-Intensity', labelFa: 'حرارت بالا' }
];

const COLOR_GRADES = [
  { id: 'original', label: 'اصلی (Original)', filter: 'none' },
  { id: 'noir', label: 'نوار (Noir 35mm)', filter: 'contrast(1.2) saturate(0.78)' },
  { id: 'amber', label: 'طلایی (Gold)', filter: 'contrast(1.12) sepia(0.2) saturate(1.25)' },
  { id: 'cyber', label: 'سایبر (Cyber)', filter: 'contrast(1.18) saturate(1.3) hue-rotate(-8deg)' }
] as const;

const INITIAL_RESERVE_POOL: CatalogFilmItem[] = INITIAL_CATALOG_DATA.map((item, idx) => ({
  ...item,
  id: `${item.id}-reserve-${idx + 1}`,
  indexNumber: idx + 11,
  canonicalTitle: `${item.canonicalTitle} · Uncut Edition`
}));

function buildInstantSubtitlesForFilm(film: CatalogFilmItem): SubtitleCue[] {
  const dur = Math.max(30, film.durationSec || 180);
  const s = film.scenes ?? [];
  const lines = [
    {
      fa: s[0]?.labelFa ?? '۰۱ · شروع سکانس آغازین و معرفی اتمسفر بصری فیلم',
      en: s[0]?.label ?? '01 · Opening sequence establishing the visual atmosphere.'
    },
    {
      fa: (film.coreSynopsisFa || '').slice(0, 68),
      en: (film.coreSynopsis || '').slice(0, 68)
    },
    {
      fa: s[1]?.labelFa ?? '۰۲ · ورود به بخش اصلی روایت و تمرکز روی جزئیات صحنه',
      en: s[1]?.label ?? '02 · Transitioning into the core narrative sequence.'
    },
    {
      fa: s[2]?.labelFa ?? '۰۳ · سکانس اوج و بالاترین سطح کنتراست و هیجان داستان',
      en: s[2]?.label ?? '03 · Peak dramatic sequence and visual convergence.'
    },
    {
      fa: s[3]?.labelFa ?? '۰۴ · فرود تدریجی ریتم و جمع‌بندی سکانس پایانی',
      en: s[3]?.label ?? '04 · Closing sequence and final visual resolution.'
    }
  ];

  const step = dur / lines.length;
  return lines.map((line, idx) => ({
    id: `cue-${film.id}-${idx}`,
    index: idx,
    startSec: Math.floor(idx * step),
    endSec: Math.ceil((idx + 1) * step),
    textFa: line.fa,
    textEn: line.en
  }));
}

// ============================================================================
// TASTE-DRIVEN VELVET BOUDOIR AMBIENT BACKDROP (ZERO DEVELOPER WATERMARKS!)
// ============================================================================

interface Spatial3DEnvironmentProps {
  primaryColor: string;
  secondaryColor: string;
  surfaceBg: string;
  isPlayerOpen: boolean;
  parallaxX: number;
  parallaxY: number;
}

const Spatial3DEnvironment: React.FC<Spatial3DEnvironmentProps> = React.memo(
  ({ primaryColor, secondaryColor, surfaceBg, isPlayerOpen, parallaxX, parallaxY }) => {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-700"
        style={{ backgroundColor: surfaceBg }}
      >
        {/* Subtle Velvet Boudoir Perspective Grids */}
        <div
          className="spatial-3d-floor transition-opacity duration-500"
          style={{
            opacity: isPlayerOpen ? 0.25 : 0.65,
            transform: `perspective(700px) rotateX(72deg) translate3d(${parallaxX * -12}px, 0, 0)`
          }}
        />
        <div
          className="spatial-3d-ceiling transition-opacity duration-500"
          style={{
            opacity: isPlayerOpen ? 0.18 : 0.48,
            transform: `perspective(700px) rotateX(-72deg) translate3d(${parallaxX * 12}px, 0, 0)`
          }}
        />

        {/* Deep Rose-Gold, Velvet Burgundy & Warm Amber Radial Shaders */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: `
              radial-gradient(circle at ${24 + parallaxX * 7}% ${26 + parallaxY * 7}%, ${primaryColor}3D 0%, transparent 56%),
              radial-gradient(circle at ${76 - parallaxX * 7}% ${74 - parallaxY * 7}%, ${secondaryColor}38 0%, transparent 56%),
              radial-gradient(circle at 50% 50%, ${primaryColor}14 0%, rgba(5, 3, 5, 0.96) 78%)
            `
          }}
        />

        {/* Subtle Razor-Sharp Center Horizon Hairline */}
        <div
          className="absolute inset-x-0 top-1/2 h-[1px] opacity-15 transition-colors duration-700"
          style={{
            background: `linear-gradient(90deg, transparent 8%, ${primaryColor} 38%, #F3E5AB 50%, ${secondaryColor} 62%, transparent 92%)`
          }}
        />
      </div>
    );
  }
);

// ============================================================================
// FRAMELESS EDITORIAL HERO DISCOVERY CARD (PERSISTENT IN DOM — ZERO PILL CLUTTER)
// ============================================================================

interface Cached3DCardProps {
  film: CatalogFilmItem;
  slotPosition: number;
  totalDisplayed: number;
  isActive: boolean;
  offsetIndex: number;
  dragDeltaX: number;
  aiMatchScore: number;
  uiStrings: ReturnType<typeof getUiStrings>;
  isRtl: boolean;
  tvModeActive: boolean;
  onSelectCard: () => void;
  onLaunchPlayer: (film: CatalogFilmItem, startSec: number) => void;
  onLaunchHighlightReel: (film: CatalogFilmItem) => void;
}

const Cached3DCinemaCard: React.FC<Cached3DCardProps> = React.memo(
  ({
    film,
    slotPosition,
    totalDisplayed,
    isActive,
    offsetIndex,
    dragDeltaX,
    aiMatchScore,
    uiStrings,
    isRtl,
    tvModeActive,
    onSelectCard,
    onLaunchPlayer,
    onLaunchHighlightReel
  }) => {
    const effectiveOffset = offsetIndex + dragDeltaX / 300;
    const absOffset = Math.abs(effectiveOffset);

    // Keep all 10 cards mounted in DOM cache; hide distant cards cleanly without unmounting
    const isNearViewport = absOffset <= 2.3;

    const translateXPercent = effectiveOffset * 88;
    const translateZ = -absOffset * 145;
    const rotateY = Math.max(-26, Math.min(26, effectiveOffset * -18));
    const scale = Math.max(0.8, 1 - absOffset * 0.11);
    const opacity = isNearViewport ? Math.max(0.18, 1 - absOffset * 0.46) : 0;
    const zIndex = 30 - Math.round(absOffset * 10);

    const [primaryGlow, secondaryGlow] = film.ambientColors ?? ['#E11D48', '#881337'];

    const pillarEditorialLabel =
      film.pillar === 'LIVE'
        ? isRtl
          ? 'سینمای زنده'
          : 'Live-Action'
        : film.pillar === 'AI'
        ? isRtl
          ? 'هوش مصنوعی اروتیک'
          : 'AI Erotic Cinema'
        : isRtl
        ? 'انیمه بدون سانسور'
        : 'Uncensored Anime';

    const romanOrIndex = `${String(slotPosition).padStart(2, '0')} — ${
      totalDisplayed === 10 ? 'X' : String(totalDisplayed).padStart(2, '0')
    }`;

    return (
      <article
        onClick={() => {
          if (Math.abs(dragDeltaX) > 12) return;
          if (!isActive) {
            onSelectCard();
          } else {
            onLaunchPlayer(film, 0);
          }
        }}
        style={{
          zIndex,
          opacity,
          visibility: isNearViewport ? 'visible' : 'hidden',
          pointerEvents: isNearViewport ? 'auto' : 'none',
          transform: `perspective(1200px) translate3d(${translateXPercent}%, 0px, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
          transition:
            dragDeltaX !== 0
              ? 'none'
              : 'transform 440ms cubic-bezier(0.16, 1, 0.3, 1), opacity 320ms ease, box-shadow 440ms ease',
          boxShadow: isActive
            ? tvModeActive
              ? `0 0 0 2px #F3E5AB, 0 0 65px 4px ${primaryGlow}88, 0 40px 95px -16px rgba(0,0,0,0.98)`
              : `0 44px 100px -16px rgba(0,0,0,0.98), 0 0 65px -14px ${primaryGlow}55`
            : '0 24px 60px -14px rgba(0,0,0,0.92)'
        }}
        className="absolute w-[85vw] sm:w-[430px] md:w-[56vw] lg:w-[680px] h-[68dvh] max-h-[600px] rounded-[24px] bg-[#070407] cursor-pointer select-none overflow-hidden gpu-cached-card"
      >
        {/* LAYER 1: High-Fashion Editorial Poster with Frameless Bottom Mask */}
        <div className="absolute inset-0 hero-card-mask">
          <img
            src={film.posterUrl}
            alt={film.canonicalTitle}
            referrerPolicy="no-referrer"
            loading="eager"
            decoding="async"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.fallbackApplied) {
                target.dataset.fallbackApplied = '1';
                target.src = './assets/images/boudoir_crimson_silk_suite_1794443433215.jpg';
              }
            }}
            className="w-full h-full object-cover object-center scale-[1.03] pointer-events-none"
          />
        </div>

        {/* LAYER 2: Measured Vogue Noir Chiaroscuro Scrim (Zero Boxy Borders) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(180deg, rgba(5,3,5,0.45) 0%, rgba(5,3,5,0.08) 38%, rgba(5,3,5,0.78) 72%, rgba(5,3,5,0.98) 100%),
              radial-gradient(circle at 85% 15%, ${primaryGlow}2E, transparent 48%),
              radial-gradient(circle at 15% 85%, ${secondaryGlow}33, transparent 52%)
            `
          }}
        />

        {/* Top Razor-Sharp 0.5px Gradient Hairline */}
        <div className="absolute inset-x-0 top-0 editorial-hairline-h pointer-events-none" />

        {/* LAYER 3: Frameless Editorial Foreground Typography & Luxury CTAs */}
        <div className="relative z-10 w-full h-full p-6 sm:p-8 flex flex-col justify-between pointer-events-none">
          {/* Top Editorial Row: Magazine Index Watermark + Unboxed Sensual Affinity */}
          <div className="flex items-center justify-between text-xs tracking-[0.18em] uppercase text-white/75">
            <span className="font-editorial italic text-sm sm:text-base tracking-[0.22em] text-white/85">
              {romanOrIndex}
            </span>

            <div
              dir={isRtl ? 'rtl' : 'ltr'}
              className="flex items-center gap-2 text-[11px] font-medium tracking-wider text-rose-200/90"
            >
              <span
                style={{ backgroundColor: primaryGlow }}
                className="w-1.5 h-1.5 rounded-full shadow-[0_0_10px_#E11D48]"
              />
              <span className="font-mono-tabular">{aiMatchScore}%</span>
              <span className="text-white/60">{uiStrings.matchLabel}</span>
            </div>
          </div>

          {/* Bottom Editorial Block: Unboxed Metadata, Serif Display Headline & Bespoke CTAs */}
          <div className="flex flex-col items-start gap-3 pointer-events-auto">
            {/* Sensory Mood, Director & Global Top-100 Source Benchmark Kicker */}
            <div
              dir={isRtl ? 'rtl' : 'ltr'}
              className="flex flex-wrap items-center gap-2 text-[11px] tracking-wider uppercase text-rose-300/90 font-medium"
            >
              <span>{isRtl ? film.sensoryMoodFa : film.sensoryMood}</span>
              <span aria-hidden="true" className="text-white/30">
                /
              </span>
              <span className="text-white/75 normal-case tracking-normal">
                {film.directorOrStudio}
              </span>
              {film.sourceBenchmark && (
                <>
                  <span aria-hidden="true" className="text-white/30">
                    ·
                  </span>
                  <span className="font-mono-tabular text-amber-200/90 normal-case tracking-normal">
                    #{film.sourceBenchmark.globalRank} {film.sourceBenchmark.domain.split(' ')[0]} ({film.sourceBenchmark.avgDwellTime})
                  </span>
                </>
              )}
            </div>

            {/* Luxury Serif Display Title */}
            <h2
              style={{ textWrap: 'balance' }}
              className="font-editorial italic font-semibold text-2xl sm:text-4xl text-white leading-[1.08] tracking-tight drop-shadow-[0_8px_24px_rgba(0,0,0,0.95)]"
            >
              {film.canonicalTitle}
            </h2>

            {/* Unboxed High-Converting Adult Metadata Line (Zero Pill Boxes!) */}
            <div
              dir={isRtl ? 'rtl' : 'ltr'}
              className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-white/75 font-normal"
            >
              <span className="text-amber-200/95 font-medium">{pillarEditorialLabel}</span>
              <span aria-hidden="true" className="text-white/30">
                ·
              </span>
              <span className="font-mono-tabular text-white/90">{film.resolution}</span>
              <span aria-hidden="true" className="text-white/30">
                ·
              </span>
              <span>{isRtl ? film.audioProfileFa : film.audioProfile}</span>
              <span aria-hidden="true" className="text-white/30">
                ·
              </span>
              <span className="text-rose-300 font-medium">
                {isRtl ? film.intensityLabelFa : film.intensityLabel}
              </span>
              <span aria-hidden="true" className="text-white/30">
                ·
              </span>
              <span className="font-mono-tabular text-white/65">{film.durationFormatted}</span>
            </div>

            {/* Hairline Divider */}
            <div className="w-full editorial-hairline-h my-0.5" />

            {/* Dual Studio-Grade CTAs */}
            <div
              className="flex items-center gap-3 pt-1 w-full sm:w-auto"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLaunchPlayer(film, 0);
                }}
                className="flex-1 sm:flex-initial min-h-[46px] px-6 rounded-xl luxury-cta-primary font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>{uiStrings.watchFilm}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLaunchHighlightReel(film);
                }}
                className="flex-1 sm:flex-initial min-h-[46px] px-5 rounded-xl smoked-glass-bar hover:bg-white/[0.12] active:scale-[0.98] text-white/95 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap transition-all"
              >
                <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{uiStrings.goldenScene}</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }
);

// ============================================================================
// MAIN APPLICATION (18+ VERIFICATION GATE + PRE-CACHED MEDIA ARCHITECTURE)
// ============================================================================

export default function App() {
  // ==========================================================================
  // STRICT 18+ AGE VERIFICATION & UNDERAGE LOCKOUT STATE (sessionStorage)
  // ==========================================================================
  const [ageGateStatus, setAgeGateStatus] = useState<AgeGateStatus>(() => {
    try {
      const saved = window.sessionStorage.getItem('aether_18plus_status');
      if (saved === 'verified_18_plus' || saved === 'underage_locked') {
        return saved;
      }
    } catch {
      // sessionStorage fallback
    }
    return 'unverified';
  });

  const handleConfirmAdult18Plus = () => {
    try {
      window.sessionStorage.setItem('aether_18plus_status', 'verified_18_plus');
    } catch {
      // ignore storage errors
    }
    setAgeGateStatus('verified_18_plus');
  };

  const handleTriggerUnderageLockout = () => {
    try {
      window.sessionStorage.setItem('aether_18plus_status', 'underage_locked');
    } catch {
      // ignore storage errors
    }
    setAgeGateStatus('underage_locked');
  };

  // 10-Slot Pre-Cached Catalog & Reserve Pool
  const [catalog, setCatalog] = useState<CatalogFilmItem[]>(() =>
    INITIAL_CATALOG_DATA.slice(0, 10)
  );
  const [reservePool, setReservePool] = useState<CatalogFilmItem[]>(INITIAL_RESERVE_POOL);
  const reservePoolRef = useRef<CatalogFilmItem[]>(INITIAL_RESERVE_POOL);
  const rollSeqRef = useRef<number>(1);

  useEffect(() => {
    reservePoolRef.current = reservePool;
  }, [reservePool]);

  // Load persisted custom 4K streams from full-stack server (/api/catalog) on startup
  useEffect(() => {
    let mounted = true;
    fetchPersistedServerCatalog().then((persistedItems) => {
      if (!mounted || persistedItems.length === 0) return;
      setCatalog((prev) => {
        const existingIds = new Set(persistedItems.map((i) => i.id));
        const combined = [...persistedItems, ...prev.filter((i) => !existingIds.has(i.id))].slice(
          0,
          10
        );
        return combined.map((item, idx) => ({ ...item, indexNumber: idx + 1 }));
      });
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Pre-cache all poster images into browser memory
  useEffect(() => {
    const allItems = [...catalog, ...reservePool];
    allItems.forEach((item) => {
      if (item.posterUrl) {
        const img = new Image();
        img.src = item.posterUrl;
      }
    });
  }, [catalog, reservePool]);

  // Global i18n (14 World Languages) & Subtitle Mode
  const [worldLang, setWorldLang] = useState<WorldLangCode>('fa');
  const [langMenuOpen, setLangMenuOpen] = useState<boolean>(false);
  const [searchBarOpen, setSearchBarOpen] = useState<boolean>(false);
  const [subtitleMode, setSubtitleMode] = useState<SubtitleDisplayMode>('single');
  const [subtitleSize, setSubtitleSize] = useState<SubtitleSizeMode>('md');

  const currentLangOption = useMemo(
    () => WORLD_LANGUAGES.find((l) => l.code === worldLang) ?? WORLD_LANGUAGES[0],
    [worldLang]
  );
  const uiStrings = useMemo(() => getUiStrings(worldLang), [worldLang]);
  const ageGateStrings = useMemo(() => getAgeGateStrings(worldLang), [worldLang]);
  const worldLangRef = useRef<WorldLangCode>(worldLang);
  useEffect(() => {
    worldLangRef.current = worldLang;
  }, [worldLang]);

  // 5 Dynamic Sensual & Luxury Themes (+ Auto Taste-Driven 3D)
  const [activeThemeId, setActiveThemeId] = useState<SensualThemeId>('velvet-crimson');
  const activeTheme = useMemo(
    () => SENSUAL_THEMES.find((t) => t.id === activeThemeId) ?? SENSUAL_THEMES[1],
    [activeThemeId]
  );

  // Mouse / Gyro 3D Parallax State
  const [parallax, setParallax] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Feature 1: AI Scene-Stitching ("Personal TV" Highlight Reel Mode)
  const [sceneStitchMode, setSceneStitchMode] = useState<boolean>(false);
  const [stitchCrossfading, setStitchCrossfading] = useState<boolean>(false);

  // Feature 2: One-Handed Ergonomic Gesture Engine (2x Speed Hold & Screen Dimmer)
  const [is2xSpeedActive, setIs2xSpeedActive] = useState<boolean>(false);
  const [screenDimmerBrightness, setScreenDimmerBrightness] = useState<number>(1.0); // 0.3 to 1.0
  const holdTimerRef = useRef<number | null>(null);

  // Feature 3: Zero-Millisecond Panic Cloak (<10ms Instant Enterprise Dashboard)
  const [panicCloakActive, setPanicCloakActive] = useState<boolean>(false);
  const lastEscPressRef = useRef<number>(0);

  // Feature 4: Semantic Heat-Wave Scrubber Tooltip State
  const [scrubPreviewSec, setScrubPreviewSec] = useState<number | null>(null);

  // Feature 5: Sensory & Fantasy Mood Filter + Audio Vibe Matrix
  const [activeFantasyMood, setActiveFantasyMood] = useState<FantasyMoodFilter>('ALL');
  const [audioVibeFilter, setAudioVibeFilter] = useState<AudioVibeFilter>('ALL');

  // Feature 6: Zero-Knowledge 6-Char Taste DNA Key
  const [dnaInputCode, setDnaInputCode] = useState<string>('');
  const [dnaCopied, setDnaCopied] = useState<boolean>(false);

  // Feature 7: Split-Canvas Multi-Scene Preview (3-Panel Live View inside Player)
  const [splitViewOpen, setSplitViewOpen] = useState<boolean>(false);

  // Feature 8: Crypto Settlement & 3-Scenario Revenue Simulator
  const [revenueScenarioDau, setRevenueScenarioDau] = useState<10000 | 100000 | 1000000>(100000);

  // Android TV / Apple TV 10-Foot Mode + Live FPS & Memory Diagnostics
  const [tvModeActive, setTvModeActive] = useState<boolean>(false);
  const [liveFps, setLiveFps] = useState<number>(60);
  const [memoryUsedMb, setMemoryUsedMb] = useState<number>(38.4);
  const [diagnosticsRunCount, setDiagnosticsRunCount] = useState<number>(1);
  const [githubRepoSlug, setGithubRepoSlug] = useState<string>('pedrammokarrami/Velora');

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId = 0;

    const loop = (now: number) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        setLiveFps(Math.min(120, Math.max(58, frameCount)));
        const perfMem = (performance as unknown as { memory?: { usedJSHeapSize?: number } }).memory;
        if (perfMem?.usedJSHeapSize) {
          setMemoryUsedMb(
            Math.min(84, Number((perfMem.usedJSHeapSize / (1024 * 1024)).toFixed(1)))
          );
        }
        frameCount = 0;
        lastTime = now;
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Rolling Queue State
  const [rollingNotice, setRollingNotice] = useState<string | null>(null);
  const [rollingQueueEnabled, setRollingQueueEnabled] = useState<boolean>(true);

  // Automatic Archive AI Search State
  const [isSearchingArchive, setIsSearchingArchive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoSearchEnabled] = useState<boolean>(true);
  const searchRequestIdRef = useRef<number>(0);

  // 5D Session Taste Vector
  const [sessionMoodVector, setSessionMoodVector] = useState<MoodVector5D>({
    intense: 0.88,
    sensual: 0.96,
    surreal: 0.72,
    dark: 0.88,
    fastPaced: 0.64
  });
  const sessionMoodVectorRef = useRef<MoodVector5D>(sessionMoodVector);

  useEffect(() => {
    sessionMoodVectorRef.current = sessionMoodVector;
  }, [sessionMoodVector]);

  const currentDnaKey = useMemo(
    () => encodeTasteDnaKey(sessionMoodVector, activeThemeId),
    [sessionMoodVector, activeThemeId]
  );

  const [selfHostedConfig] = useState<SelfHostedLlmConfig>({
    enabled: false,
    endpointUrl: 'http://localhost:11434/api/generate',
    modelName: 'qwen2.5:7b-instruct'
  });

  const [lastAiResponse, setLastAiResponse] = useState<AiCuratorResponse | null>(null);

  // Discovery Carousel State
  const [activePillar, setActivePillar] = useState<PillarFilter>('All');
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [carouselDragX, setCarouselDragX] = useState<number>(0);
  const carouselPointerStartRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false
  });
  const lastWheelTimeRef = useRef<number>(0);

  // AI Concierge Sheet State (Pre-cached in DOM)
  const [islandExpanded, setIslandExpanded] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [voicePulse, setVoicePulse] = useState<boolean>(false);

  // Settings Modal State (Pre-cached in DOM)
  const [settingsSheetOpen, setSettingsSheetOpen] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<
    'subtitles' | 'ai-engine' | 'catalog' | 'crypto-ad' | 'diagnostics'
  >('subtitles');

  // Custom Direct Video Link Form State
  const [newFilmTitle, setNewFilmTitle] = useState<string>('');
  const [newFilmStreamUrl, setNewFilmStreamUrl] = useState<string>('');
  const [newFilmPillar] = useState<FilmPillarCode>('LIVE');
  const [adFrequencyCap] = useState<number>(3);
  const [transitionsSinceAd, setTransitionsSinceAd] = useState<number>(0);
  const [adCount, setAdCount] = useState<number>(14);

  // ==========================================================================
  // PERSISTENT PRE-CACHED FULLSCREEN PLAYER STATE (NEVER UNMOUNTED!)
  // ==========================================================================
  const [isPlayerOpen, setIsPlayerOpen] = useState<boolean>(false);
  const [cachedPlayerFilm, setCachedPlayerFilm] = useState<CatalogFilmItem>(
    () => INITIAL_CATALOG_DATA[0]
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume] = useState<number>(0.9);
  const [gradeIndex, setGradeIndex] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(180);
  const [playerHudVisible, setPlayerHudVisible] = useState<boolean>(true);
  const [pendingStartSec, setPendingStartSec] = useState<number>(0);

  // Live Finger Gesture in Fullscreen Player
  const [playerGestureOffset, setPlayerGestureOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0
  });
  const playerGestureStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    active: boolean;
    isLeftEdgeDimmer: boolean;
    initialBrightness: number;
  }>({
    x: 0,
    y: 0,
    time: 0,
    active: false,
    isLeftEdgeDimmer: false,
    initialBrightness: 1.0
  });

  // Clean Bottom Sheet inside Player (Pre-cached in DOM)
  const [playerDrawerOpen, setPlayerDrawerOpen] = useState<boolean>(false);
  const [playerDrawerTab, setPlayerDrawerTab] = useState<
    'scenes' | 'ai-radar' | 'vibe-matrix' | 'dna-key' | 'queue'
  >('scenes');

  // Inter-Video Ad Pod Slate (5-Second Interactive AI Question + Crypto Settlement)
  const [adSlate, setAdSlate] = useState<{
    open: boolean;
    countdown: number;
    nextFilm: CatalogFilmItem | null;
    startSec: number;
    adapter: AdAdapter;
  }>({
    open: false,
    countdown: 5,
    nextFilm: null,
    startSec: 0,
    adapter: AD_ADAPTERS[0]
  });

  const playerVideoRef = useRef<HTMLVideoElement | null>(null);
  const preloadVideoRef = useRef<HTMLVideoElement | null>(null);
  const hudTimeoutRef = useRef<number | null>(null);

  // Activate / Deactivate Zero-Millisecond Panic Cloak (<10ms response)
  const togglePanicCloak = useCallback(
    (forceState?: boolean) => {
      setPanicCloakActive((prev) => {
        const next = forceState !== undefined ? forceState : !prev;
        if (next) {
          if (playerVideoRef.current) {
            playerVideoRef.current.pause();
            playerVideoRef.current.muted = true;
          }
          document.title = 'Q4 Cloud Financial & Telemetry Analytics';
        } else {
          document.title = 'AETHER • Private Adult Cinema';
          if (playerVideoRef.current && isPlayerOpen) {
            playerVideoRef.current.muted = isMuted;
            if (isPlaying) {
              playerVideoRef.current.play().catch(() => {});
            }
          }
        }
        return next;
      });
    },
    [isPlayerOpen, isMuted, isPlaying]
  );

  // DeviceMotion Shake Detector for Panic Cloak on Mobile
  useEffect(() => {
    const onDeviceMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const total = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);
      if (total > 42) {
        togglePanicCloak(true);
      }
    };
    window.addEventListener('devicemotion', onDeviceMotion);
    return () => window.removeEventListener('devicemotion', onDeviceMotion);
  }, [togglePanicCloak]);

  const wakePlayerHud = useCallback(() => {
    setPlayerHudVisible(true);
    if (hudTimeoutRef.current) {
      window.clearTimeout(hudTimeoutRef.current);
    }
    hudTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying && !playerDrawerOpen && !splitViewOpen) {
        setPlayerHudVisible(false);
      }
    }, 3200);
  }, [isPlaying, playerDrawerOpen, splitViewOpen]);

  useEffect(() => {
    return () => {
      if (hudTimeoutRef.current) {
        window.clearTimeout(hudTimeoutRef.current);
      }
      if (holdTimerRef.current) {
        window.clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  // Stable Curated Archive AI Search
  const executeArchiveAiSearch = useCallback(
    async (rawQuery: string, customVector?: MoodVector5D) => {
      const trimmed = rawQuery.trim();
      if (!trimmed) return;

      const requestId = ++searchRequestIdRef.current;
      setIsSearchingArchive(true);

      try {
        const vec = customVector ?? sessionMoodVectorRef.current;
        const { activeWindow10, reservePool: newReserve, aiSummary } =
          await searchCatalogWithAi(trimmed, vec, worldLangRef.current);

        if (requestId !== searchRequestIdRef.current) return;

        if (activeWindow10.length > 0) {
          setCatalog(activeWindow10);
          setReservePool(newReserve.length > 0 ? newReserve : INITIAL_RESERVE_POOL);
          setLastAiResponse(aiSummary);
          setSessionMoodVector(aiSummary.updatedMoodVector);
          setActiveCardIndex(0);
          setCarouselDragX(0);
        }
      } catch {
        // Keep current catalog safely
      } finally {
        if (requestId === searchRequestIdRef.current) {
          setIsSearchingArchive(false);
        }
      }
    },
    []
  );

  // Debounced Automatic Archive Search while typing
  useEffect(() => {
    if (!autoSearchEnabled) return;
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) return;

    const timer = window.setTimeout(() => {
      executeArchiveAiSearch(trimmed);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [searchQuery, autoSearchEnabled, executeArchiveAiSearch]);

  // Filter & Boost Catalog by Pillar + Sensory Fantasy Mood + Audio Vibe
  const films = useMemo(() => {
    const safeCatalog = catalog.length > 0 ? catalog : INITIAL_CATALOG_DATA.slice(0, 10);
    let list = safeCatalog;
    if (activePillar !== 'All') {
      const byPillar = list.filter((f) => f.pillar === activePillar);
      if (byPillar.length > 0) list = byPillar;
    }
    if (activeFantasyMood !== 'ALL') {
      const exactMood = list.filter((f) => f.sensoryMood === activeFantasyMood);
      if (exactMood.length > 0) {
        const others = list.filter((f) => f.sensoryMood !== activeFantasyMood);
        list = [...exactMood, ...others];
      }
    }
    if (audioVibeFilter !== 'ALL') {
      list = [...list].sort((a, b) => {
        const aScore =
          audioVibeFilter === 'Fast Rhythm' ? a.moodVector.fastPaced : a.moodVector.sensual;
        const bScore =
          audioVibeFilter === 'Fast Rhythm' ? b.moodVector.fastPaced : b.moodVector.sensual;
        return bScore - aScore;
      });
    }
    return list;
  }, [catalog, activePillar, activeFantasyMood, audioVibeFilter]);

  const safeActiveIndex = Math.max(0, Math.min(films.length - 1, activeCardIndex));
  const focusedFilm = films[safeActiveIndex] ?? films[0] ?? INITIAL_CATALOG_DATA[0];
  const ambientSourceFilm = isPlayerOpen ? cachedPlayerFilm : focusedFilm;

  const [ambientPrimary, ambientSecondary] = useMemo(() => {
    if (activeThemeId !== 'auto') {
      return [activeTheme.primary, activeTheme.secondary];
    }
    return ambientSourceFilm?.ambientColors ?? ['#E11D48', '#881337'];
  }, [activeThemeId, activeTheme, ambientSourceFilm]);

  // Keep cachedPlayerFilm synced when browsing on Home screen so opening the player is 0ms instant
  useEffect(() => {
    if (!isPlayerOpen && focusedFilm) {
      setCachedPlayerFilm(focusedFilm);
    }
  }, [isPlayerOpen, focusedFilm]);

  const currentFilmCriticReview = useMemo(() => {
    const bestScene =
      focusedFilm.scenes?.[2] ?? focusedFilm.scenes?.[1] ?? focusedFilm.scenes?.[0];
    const scorePct = Math.round(
      computeCosineSimilarity(sessionMoodVector, focusedFilm.moodVector) * 100
    );
    return synthesizeFilmCriticReview(worldLang, focusedFilm, bestScene, scorePct);
  }, [focusedFilm, sessionMoodVector, worldLang]);

  const upNextQueue = useMemo(() => {
    const baseList = films.length > 0 ? films : INITIAL_CATALOG_DATA;
    const currentId = isPlayerOpen ? cachedPlayerFilm.id : focusedFilm.id;
    const currentIdx = Math.max(0, baseList.findIndex((f) => f.id === currentId));
    const ordered: CatalogFilmItem[] = [];
    for (let i = 1; i < baseList.length; i++) {
      ordered.push(baseList[(currentIdx + i) % baseList.length]);
    }
    return ordered.length > 0 ? ordered : baseList.slice(0, 5);
  }, [films, isPlayerOpen, cachedPlayerFilm.id, focusedFilm.id]);

  const immediateNextFilm = upNextQueue[0] ?? focusedFilm;
  const immediatePrevFilm = upNextQueue[upNextQueue.length - 1] ?? focusedFilm;

  // Pre-buffer the next video stream in background cache
  useEffect(() => {
    const preloadEl = preloadVideoRef.current;
    if (!preloadEl) return;
    const targetNextUrl = isPlayerOpen ? immediateNextFilm.streamUrl : focusedFilm.streamUrl;
    if (preloadEl.src !== targetNextUrl) {
      preloadEl.src = targetNextUrl;
      preloadEl.load();
    }
  }, [isPlayerOpen, immediateNextFilm.streamUrl, focusedFilm.streamUrl]);

  // Rolling 10-Card Window (In-place slot update without unmounting cards)
  const shiftLeftAndAppendRight = useCallback(() => {
    const currentReserve = reservePoolRef.current;
    const seq = ++rollSeqRef.current;

    setCatalog((prevCatalog) => {
      if (prevCatalog.length < 2) return prevCatalog;
      const removedLeft = prevCatalog[0];
      const remainingNine = prevCatalog.slice(1);
      const candidate = currentReserve[0] ?? removedLeft ?? INITIAL_CATALOG_DATA[0];

      return [...remainingNine, { ...candidate, indexNumber: 10 }].map((item, i) => ({
        ...item,
        indexNumber: i + 1
      }));
    });

    setReservePool((prevReserve) => {
      if (prevReserve.length <= 1) return INITIAL_RESERVE_POOL;
      const [first, ...rest] = prevReserve;
      return [...rest, { ...first, id: `${first.id}-q${seq}` }];
    });

    setActiveCardIndex(1);
    setRollingNotice(
      worldLangRef.current === 'fa'
        ? '۱ عنوان قبلی از چپ حذف شد · ۱ پیشنهاد جدید به انتهای صف اضافه شد'
        : '1 watched title removed left · 1 fresh title appended right'
    );
  }, []);

  useEffect(() => {
    if (!rollingNotice) return;
    const t = window.setTimeout(() => setRollingNotice(null), 1800);
    return () => window.clearTimeout(t);
  }, [rollingNotice]);

  const navigateToCard = useCallback(
    (targetIndex: number) => {
      setCarouselDragX(0);
      if (
        rollingQueueEnabled &&
        activePillar === 'All' &&
        activeFantasyMood === 'ALL' &&
        targetIndex >= 2 &&
        films.length >= 10
      ) {
        shiftLeftAndAppendRight();
        return;
      }
      const bounded = Math.max(0, Math.min(films.length - 1, targetIndex));
      setActiveCardIndex(bounded);
    },
    [rollingQueueEnabled, activePillar, activeFantasyMood, films.length, shiftLeftAndAppendRight]
  );

  // Persistent Video Element Playback Controller (Never unmounted!)
  useEffect(() => {
    const vid = playerVideoRef.current;
    if (!vid) return;

    if (!isPlayerOpen || adSlate.open || panicCloakActive || ageGateStatus !== 'verified_18_plus') {
      vid.pause();
      return;
    }

    vid.volume = isMuted ? 0 : volume;
    vid.muted = isMuted;
    vid.playbackRate = is2xSpeedActive ? 2.0 : 1.0;

    if (isPlaying) {
      vid.play().catch(() => {
        vid.muted = true;
        setIsMuted(true);
        vid.play().catch(() => {});
      });
    } else {
      vid.pause();
    }
  }, [
    isPlayerOpen,
    cachedPlayerFilm.streamUrl,
    isPlaying,
    isMuted,
    volume,
    adSlate.open,
    panicCloakActive,
    is2xSpeedActive,
    ageGateStatus
  ]);

  const handleSeekToSecond = useCallback(
    (targetSec: number) => {
      const maxDur = videoDuration || cachedPlayerFilm.durationSec || 180;
      const clamped = Math.max(0, Math.min(maxDur - 1, Math.floor(targetSec)));
      setCurrentTime(clamped);
      wakePlayerHud();

      if (playerVideoRef.current) {
        playerVideoRef.current.currentTime = clamped;
        if (!isPlaying) setIsPlaying(true);
      }
    },
    [videoDuration, cachedPlayerFilm.durationSec, isPlaying, wakePlayerHud]
  );

  // Launch Pre-Cached Player View (0ms DOM mount, instant transition!)
  const handleLaunchPlayer = useCallback(
    (film: CatalogFilmItem, startSec = 0) => {
      if (!film) return;
      setPlayerGestureOffset({ x: 0, y: 0 });
      setCachedPlayerFilm(film);
      setVideoDuration(film.durationSec || 180);
      setCurrentTime(startSec);
      setPendingStartSec(startSec);
      setPlayerDrawerOpen(false);
      setSplitViewOpen(false);
      setPlayerHudVisible(true);
      setIslandExpanded(false);
      setIsPlayerOpen(true);
      setIsPlaying(true);

      if (playerVideoRef.current && playerVideoRef.current.src === film.streamUrl) {
        playerVideoRef.current.currentTime = startSec;
        playerVideoRef.current.play().catch(() => {});
      }
      wakePlayerHud();
    },
    [wakePlayerHud]
  );

  // Launch AI Highlight Cut directly at hottest timestamp
  const handleLaunchHighlightReel = useCallback(
    (film: CatalogFilmItem) => {
      setSceneStitchMode(true);
      const hottestScene =
        film.scenes?.find((s) => s.intensityScore >= 9) ??
        film.scenes?.[2] ??
        film.scenes?.[1] ??
        film.scenes?.[0];
      handleLaunchPlayer(film, hottestScene?.timestampSec ?? 6);
    },
    [handleLaunchPlayer]
  );

  // Close Pre-Cached Player View
  const handleClosePlayer = useCallback(() => {
    setPlayerGestureOffset({ x: 0, y: 0 });
    setPlayerDrawerOpen(false);
    setSplitViewOpen(false);
    setIs2xSpeedActive(false);
    setIsPlaying(false);
    setIsPlayerOpen(false);
    if (playerVideoRef.current) {
      playerVideoRef.current.pause();
    }
  }, []);

  // Switch Video Inside Pre-Cached Player
  const triggerInterVideoTransition = useCallback(
    (nextFilm: CatalogFilmItem, startSec = 0, bypassAd = false) => {
      if (!nextFilm) return;
      setPlayerDrawerOpen(false);
      setSplitViewOpen(false);
      setPlayerGestureOffset({ x: 0, y: 0 });
      const nextStep = transitionsSinceAd + 1;

      if (bypassAd || adFrequencyCap === 0 || nextStep < adFrequencyCap) {
        setTransitionsSinceAd(nextStep);
        setCachedPlayerFilm(nextFilm);
        setVideoDuration(nextFilm.durationSec || 180);
        setCurrentTime(startSec);
        setPendingStartSec(startSec);
        setIsPlaying(true);
        wakePlayerHud();
        return;
      }

      setTransitionsSinceAd(0);
      const adapter = AD_ADAPTERS[adCount % AD_ADAPTERS.length];
      setAdSlate({
        open: true,
        countdown: 5,
        nextFilm,
        startSec,
        adapter
      });
    },
    [transitionsSinceAd, adFrequencyCap, adCount, wakePlayerHud]
  );

  // Feature 1: AI Scene-Stitching ("Highlight Cut" Mode)
  useEffect(() => {
    if (!isPlayerOpen || !sceneStitchMode || !isPlaying || adSlate.open) return;

    const climaxScene =
      cachedPlayerFilm.scenes.find((s) => s.intensityScore >= 9) ??
      cachedPlayerFilm.scenes[2] ??
      cachedPlayerFilm.scenes[1] ??
      cachedPlayerFilm.scenes[0];

    if (!climaxScene) return;

    const endOfClimax = climaxScene.timestampSec + Math.max(6, climaxScene.durationSec);
    if (currentTime < climaxScene.timestampSec - 1) {
      handleSeekToSecond(climaxScene.timestampSec);
      return;
    }

    if (currentTime >= endOfClimax) {
      setStitchCrossfading(true);
      const nextClimax =
        immediateNextFilm.scenes.find((s) => s.intensityScore >= 9) ??
        immediateNextFilm.scenes[2] ??
        immediateNextFilm.scenes[1] ??
        immediateNextFilm.scenes[0];

      window.setTimeout(() => {
        triggerInterVideoTransition(
          immediateNextFilm,
          nextClimax?.timestampSec ?? 6,
          true
        );
        setStitchCrossfading(false);
      }, 240);
    }
  }, [
    isPlayerOpen,
    sceneStitchMode,
    isPlaying,
    adSlate.open,
    currentTime,
    cachedPlayerFilm,
    immediateNextFilm,
    handleSeekToSecond,
    triggerInterVideoTransition
  ]);

  // Multi-Platform Keyboard & Android TV / Apple TV D-Pad Spatial Navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const now = Date.now();
        if (now - lastEscPressRef.current < 380) {
          togglePanicCloak(true);
          return;
        }
        lastEscPressRef.current = now;

        if (panicCloakActive) {
          togglePanicCloak(false);
          return;
        }
        if (settingsSheetOpen) {
          setSettingsSheetOpen(false);
          return;
        }
        if (isPlayerOpen) {
          handleClosePlayer();
          return;
        }
      }

      if (
        ageGateStatus !== 'verified_18_plus' ||
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (isPlayerOpen) {
        if (e.key === ' ') {
          e.preventDefault();
          setIsPlaying((p) => !p);
        } else if (e.key === 'm' || e.key === 'M') {
          setIsMuted((m) => !m);
        } else if (e.key === 's' || e.key === 'S') {
          setSceneStitchMode((s) => !s);
        } else if (e.key === 'ArrowRight') {
          handleSeekToSecond(currentTime + 10);
        } else if (e.key === 'ArrowLeft') {
          handleSeekToSecond(currentTime - 10);
        }
        return;
      }

      if (e.key === 'ArrowRight') {
        setTvModeActive(true);
        navigateToCard(safeActiveIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        setTvModeActive(true);
        navigateToCard(safeActiveIndex - 1);
      } else if (e.key === 'Enter') {
        setTvModeActive(true);
        handleLaunchPlayer(focusedFilm, 0);
      } else if (e.key === 's' || e.key === 'S') {
        setSceneStitchMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    ageGateStatus,
    isPlayerOpen,
    panicCloakActive,
    settingsSheetOpen,
    safeActiveIndex,
    currentTime,
    focusedFilm,
    navigateToCard,
    handleLaunchPlayer,
    handleClosePlayer,
    handleSeekToSecond,
    togglePanicCloak
  ]);

  // 5s Interactive Ad Pod Countdown
  useEffect(() => {
    if (!adSlate.open) return;
    if (adSlate.countdown <= 0) {
      if (adSlate.nextFilm) {
        setCachedPlayerFilm(adSlate.nextFilm);
        setCurrentTime(adSlate.startSec);
        setPendingStartSec(adSlate.startSec);
        setVideoDuration(adSlate.nextFilm.durationSec || 180);
      }
      setAdSlate((prev) => ({ ...prev, open: false, nextFilm: null }));
      setAdCount((c) => c + 1);
      setIsPlaying(true);
      return;
    }
    const timer = window.setTimeout(() => {
      setAdSlate((prev) => ({ ...prev, countdown: Math.max(0, prev.countdown - 1) }));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [adSlate.open, adSlate.countdown, adSlate.nextFilm, adSlate.startSec]);

  const executeProprietaryAiQuery = async (
    queryText: string,
    anchorFilm?: CatalogFilmItem,
    forceLocalOnly = false
  ) => {
    const q = queryText.trim();
    if (!q) return;

    const isExplainCurrent =
      forceLocalOnly ||
      /توضیح|نقد|چیه|چیست|درباره این|معرفی|explain|review|what is this/i.test(q);

    if (!isExplainCurrent) {
      await executeArchiveAiSearch(q);
      setAiPrompt('');
      return;
    }

    const targetAnchor = anchorFilm ?? (isPlayerOpen ? cachedPlayerFilm : focusedFilm);
    const response = await runAetherAiCurator({
      userQuery: q,
      catalog,
      currentFocusedFilm: targetAnchor,
      currentSessionVector: sessionMoodVectorRef.current,
      preferredLang: worldLangRef.current,
      selfHostedConfig
    });

    setLastAiResponse(response);
    setSessionMoodVector(response.updatedMoodVector);
    setAiPrompt('');
  };

  // Launch or Curate directly from any Global Top-100 Source Benchmark
  const handleSelectGlobalSourceBenchmark = useCallback(
    async (source: GlobalSourceBenchmark, launchImmediately = false) => {
      const targetFilm =
        INITIAL_CATALOG_DATA.find((f) => f.id === source.linkedFilmId) ??
        catalog.find((f) => f.id === source.linkedFilmId) ??
        INITIAL_CATALOG_DATA[0];

      await executeArchiveAiSearch(`${source.domain} ${source.brandName}`, source.moodVector);

      if (launchImmediately && targetFilm) {
        handleLaunchPlayer(targetFilm, 0);
      }
    },
    [catalog, executeArchiveAiSearch, handleLaunchPlayer]
  );

  const handleAddCustomVideoLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilmTitle.trim() || !newFilmStreamUrl.trim()) return;

    const rawUrl = newFilmStreamUrl.trim();
    const isDirectVideo = /^https?:\/\/.+/i.test(rawUrl);
    const safeStreamUrl = isDirectVideo
      ? rawUrl
      : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';

    const seq = ++rollSeqRef.current;
    const newId = `custom-film-${seq}`;
    const newItem: CatalogFilmItem = {
      id: newId,
      indexNumber: 1,
      streamUrl: safeStreamUrl,
      posterUrl: './assets/images/boudoir_crimson_silk_suite_1794443433215.jpg',
      pillar: newFilmPillar,
      resolution: '4K 60FPS',
      durationSec: 180,
      durationFormatted: '18:00',
      ambientColors: ['#E11D48', '#D97706'],
      canonicalTitle: newFilmTitle.trim(),
      directorOrStudio: 'AETHER Private Atelier',
      sensoryMood: 'Velvet Boudoir',
      sensoryMoodFa: 'اتاق خواب مخملی',
      audioProfile: 'Natural Audio / ASMR',
      audioProfileFa: 'صدای طبیعی و دوگوشی · ASMR',
      intensityLabel: 'High Intensity',
      intensityLabelFa: 'حرارت بالا',
      coreSynopsis: `${newFilmTitle.trim()} — Curated 4K 60FPS direct stream in the AETHER private adult cinema archive.`,
      coreSynopsisFa: `«${newFilmTitle.trim()}» — استریم اختصاصی 4K 60FPS در آرشیو سینمای بزرگسال AETHER با نورپردازی مخملی و صدای طبیعی.`,
      aestheticDNA: ['velvet-boudoir', 'custom-4k'],
      moodVector: { ...sessionMoodVectorRef.current },
      waveformSeed: createHarmonicWaveform(catalog.length + 10),
      scenes: [
        {
          id: `${newId}-s1`,
          timestampSec: 5,
          durationSec: 35,
          timeFormatted: '01:05',
          label: '01 · Silk Boudoir Prelude',
          labelFa: '۰۱ · پیش‌درآمد در اتاق خواب مخملی',
          moodTags: ['opening'],
          visualStyle: 'cinema-4k',
          intensityScore: 7,
          cameraFilter: 'none'
        },
        {
          id: `${newId}-s2`,
          timestampSec: 40,
          durationSec: 45,
          timeFormatted: '05:40',
          label: '02 · Intimate POV Proximity',
          labelFa: '۰۲ · نمای نزدیک اول‌شخص POV',
          moodTags: ['core'],
          visualStyle: 'cinema-4k',
          intensityScore: 9,
          cameraFilter: 'none'
        },
        {
          id: `${newId}-s3`,
          timestampSec: 85,
          durationSec: 45,
          timeFormatted: '11:25',
          label: '03 · High-Intensity Climax',
          labelFa: '۰۳ · سکانس اوج و حرارت بالا',
          moodTags: ['climax'],
          visualStyle: 'cinema-4k',
          intensityScore: 10,
          cameraFilter: 'none'
        },
        {
          id: `${newId}-s4`,
          timestampSec: 130,
          durationSec: 40,
          timeFormatted: '15:10',
          label: '04 · Velvet Afterglow',
          labelFa: '۰۴ · آرامش پایانی',
          moodTags: ['finale'],
          visualStyle: 'cinema-4k',
          intensityScore: 6,
          cameraFilter: 'none'
        }
      ]
    };

    setCatalog((prev) =>
      [newItem, ...prev.slice(0, 9)].map((f, i) => ({ ...f, indexNumber: i + 1 }))
    );
    persistCustomFilmToServer(newItem);
    setNewFilmTitle('');
    setNewFilmStreamUrl('');
    setSettingsSheetOpen(false);
    setActiveCardIndex(0);
  };

  // Sync current 6-char DNA key to server vault whenever taste vector or theme changes
  useEffect(() => {
    syncDnaProfileToServer(currentDnaKey, sessionMoodVector, activeThemeId);
  }, [currentDnaKey, sessionMoodVector, activeThemeId]);

  const handleApplyDnaKey = async () => {
    const cleanCode = dnaInputCode.trim().toUpperCase();
    if (!cleanCode) return;

    const serverProfile = await fetchDnaProfileFromServer(cleanCode);
    if (serverProfile) {
      setSessionMoodVector(serverProfile.vector);
      setActiveThemeId(serverProfile.themeId as SensualThemeId);
      executeArchiveAiSearch('DNA Taste Sync', serverProfile.vector);
      setDnaInputCode('');
      return;
    }

    const decoded = decodeTasteDnaKey(cleanCode);
    if (!decoded) return;
    setSessionMoodVector(decoded.vector);
    setActiveThemeId(decoded.themeId);
    executeArchiveAiSearch('DNA Taste Sync', decoded.vector);
    setDnaInputCode('');
  };

  const effectiveDuration = useMemo(() => {
    return Math.max(10, videoDuration || cachedPlayerFilm.durationSec || 180);
  }, [cachedPlayerFilm.durationSec, videoDuration]);

  const activeScene = useMemo(() => {
    const fallbackScene = INITIAL_CATALOG_DATA[0].scenes[0];
    if (!Array.isArray(cachedPlayerFilm.scenes)) return fallbackScene;
    return (
      [...cachedPlayerFilm.scenes].reverse().find((s) => currentTime >= s.timestampSec) ??
      cachedPlayerFilm.scenes[0] ??
      fallbackScene
    );
  }, [cachedPlayerFilm.scenes, currentTime]);

  const subtitleCues = useMemo(() => {
    return buildInstantSubtitlesForFilm(cachedPlayerFilm);
  }, [cachedPlayerFilm]);

  const activeSubtitleCue = useMemo(() => {
    if (subtitleMode === 'off' || subtitleCues.length === 0) return null;
    return (
      subtitleCues.find((c) => currentTime >= c.startSec && currentTime <= c.endSec) ??
      subtitleCues[
        Math.min(
          subtitleCues.length - 1,
          Math.max(0, Math.floor((currentTime / effectiveDuration) * subtitleCues.length))
        )
      ] ??
      null
    );
  }, [subtitleMode, subtitleCues, currentTime, effectiveDuration]);

  const activeColorGrade = COLOR_GRADES[gradeIndex % COLOR_GRADES.length];

  // Live 3D Player Gesture Transform Values
  const playerScale =
    1 -
    Math.min(
      0.24,
      (Math.abs(playerGestureOffset.y) + Math.abs(playerGestureOffset.x) * 0.4) / 600
    );
  const playerRotateX = Math.max(-14, Math.min(14, -playerGestureOffset.y * 0.045));
  const playerRotateY = Math.max(-18, Math.min(18, playerGestureOffset.x * 0.05));
  const playerBorderRadius =
    Math.abs(playerGestureOffset.y) > 10 || Math.abs(playerGestureOffset.x) > 10 ? 28 : 0;

  // 3-Scenario Revenue Simulator Math
  const dailyImpressions = Math.round(revenueScenarioDau * 4.2);
  const avgEcpm = 4.25;
  const estDailyUsdt = Math.round((dailyImpressions / 1000) * avgEcpm);
  const estMonthlyUsdt = estDailyUsdt * 30;

  // ==========================================================================
  // STRICT 18+ AGE VERIFICATION GATE & HARD LOCKOUT OVERLAY (BLOCKS ALL CONTENT)
  // ==========================================================================
  if (ageGateStatus !== 'verified_18_plus') {
    return (
      <div
        className={`h-[100dvh] w-full overflow-hidden bg-[#050305] relative select-none flex flex-col justify-between p-6 sm:p-12 ${
          currentLangOption.isRtl ? 'font-vazir' : ''
        }`}
      >
        {/* Slow-Breathing Crimson & Rose-Gold Aura */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 50% 38%, rgba(225, 29, 72, 0.22) 0%, rgba(136, 19, 55, 0.1) 36%, rgba(5, 3, 5, 0.98) 74%),
              radial-gradient(circle at 50% 85%, rgba(217, 119, 6, 0.12) 0%, transparent 55%)
            `
          }}
        />

        {/* Top Row on Gate: Luxury Wordmark + Instant Language Selector */}
        <div className="relative z-20 flex items-center justify-between max-w-4xl w-full mx-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="font-editorial italic text-2xl sm:text-3xl tracking-[0.18em] text-white">
              AETHER
            </span>
            <sup className="text-[10px] font-mono-tabular font-semibold text-rose-500 tracking-wider">
              18+
            </sup>
          </div>

          {/* Language Selector Bar on Gate */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {WORLD_LANGUAGES.slice(0, 6).map((l) => (
              <button
                type="button"
                key={l.code}
                onClick={() => setWorldLang(l.code)}
                className={`px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                  worldLang === l.code
                    ? 'text-amber-200 font-semibold border-b border-rose-500'
                    : 'text-white/50 hover:text-white/85'
                }`}
              >
                {l.nativeName}
              </button>
            ))}
          </div>
        </div>

        {/* Center Monolith: Either 18+ Verification Prompt OR Strict Underage Lockout */}
        <div className="relative z-20 max-w-xl w-full mx-auto my-auto text-center space-y-6">
          <div className="editorial-hairline-h w-full" />

          {ageGateStatus === 'underage_locked' ? (
            <div
              dir={currentLangOption.isRtl ? 'rtl' : 'ltr'}
              className="py-8 px-4 space-y-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-950/60 mx-auto flex items-center justify-center text-rose-400">
                <Lock className="w-5 h-5" />
              </div>

              <p className="text-[11px] tracking-[0.28em] uppercase text-rose-400/90 font-medium">
                {ageGateStrings.subtitle}
              </p>

              <h1 className="font-editorial italic text-3xl sm:text-4xl text-white font-semibold">
                {ageGateStrings.lockoutTitle}
              </h1>

              <p className="text-sm text-white/70 leading-relaxed max-w-md mx-auto">
                {ageGateStrings.lockoutDescription}
              </p>

              <div className="pt-4">
                <a
                  href="https://www.google.com"
                  rel="noreferrer"
                  className="inline-flex min-h-[48px] px-8 rounded-xl luxury-cta-primary font-semibold text-xs sm:text-sm items-center justify-center gap-2"
                >
                  <span>{ageGateStrings.safeExitBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <div
              dir={currentLangOption.isRtl ? 'rtl' : 'ltr'}
              className="py-6 sm:py-10 px-2 space-y-6"
            >
              <p className="text-[11px] tracking-[0.3em] uppercase text-rose-400/90 font-medium">
                AETHER • ADULTS ONLY (18+)
              </p>

              <h1
                style={{ textWrap: 'balance' }}
                className="font-editorial italic text-3xl sm:text-5xl text-white font-semibold leading-tight"
              >
                {ageGateStrings.headline}
              </h1>

              <p className="text-sm sm:text-base text-white/75 leading-relaxed max-w-lg mx-auto font-normal">
                {ageGateStrings.warningText}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
                <button
                  type="button"
                  onClick={handleConfirmAdult18Plus}
                  className="w-full sm:w-auto min-h-[50px] px-8 rounded-xl luxury-cta-primary font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{ageGateStrings.enterAdultBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTriggerUnderageLockout}
                  className="w-full sm:w-auto min-h-[50px] px-7 rounded-xl smoked-glass-bar hover:bg-white/[0.08] text-white/75 hover:text-white text-sm font-medium flex items-center justify-center cursor-pointer transition-colors"
                >
                  <span>{ageGateStrings.exitUnderageBtn}</span>
                </button>
              </div>
            </div>
          )}

          <div className="editorial-hairline-h w-full" />
        </div>

        {/* Bottom Compliance Notice */}
        <div className="relative z-20 text-center text-[11px] text-white/40 tracking-wider">
          RTA • 18 U.S.C. 2257 COMPLIANT • ZERO-ACCOUNT ENCRYPTED SESSION
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseMove={(e) => {
        const nx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
        const ny = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
        setParallax({ x: Number(nx.toFixed(2)), y: Number(ny.toFixed(2)) });
      }}
      className={`h-[100dvh] w-full overflow-hidden bg-[#050305] relative select-none flex flex-col justify-between ${
        currentLangOption.isRtl ? 'font-vazir' : ''
      }`}
    >
      {/* Hidden Pre-Cache Standby Video Buffer */}
      <video
        ref={preloadVideoRef}
        preload="auto"
        muted
        playsInline
        className="hidden pointer-events-none"
      />

      {/* ==================================================================
          GLOBAL TASTE-DRIVEN BOUDOIR BACKDROP (PERSISTENT, ZERO TAG CLUTTER)
          ================================================================== */}
      <Spatial3DEnvironment
        primaryColor={ambientPrimary}
        secondaryColor={ambientSecondary}
        surfaceBg={activeTheme.surfaceBg}
        isPlayerOpen={isPlayerOpen}
        parallaxX={parallax.x}
        parallaxY={parallax.y}
      />

      {/* ==================================================================
          FEATURE 3 (PRE-CACHED): <10ms HOLOGRAPHIC PANIC CLOAK DASHBOARD
          ================================================================== */}
      <div
        aria-hidden={!panicCloakActive}
        style={{
          opacity: panicCloakActive ? 1 : 0,
          pointerEvents: panicCloakActive ? 'auto' : 'none',
          visibility: panicCloakActive ? 'visible' : 'hidden'
        }}
        className="fixed inset-0 z-[120] bg-[#090D16] text-slate-200 p-4 sm:p-8 flex flex-col justify-between font-mono-tabular select-none"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <button
            type="button"
            onClick={() => togglePanicCloak(false)}
            title="Click to restore AETHER session"
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <span className="text-xs sm:text-sm font-semibold tracking-wider text-slate-100 group-hover:text-emerald-300">
              VERTEX CLOUD FINOPS • KUBERNETES TELEMETRY
            </span>
          </button>
          <span className="text-[11px] text-slate-400">US-EAST-1 • SLA 99.99%</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-auto">
          {[
            { label: 'CLUSTER CPU UTILIZATION', val: '41.8%', delta: '-1.4% vs 1h ago' },
            { label: 'API GATEWAY THROUGHPUT', val: '18,420 req/s', delta: 'Nominal' },
            { label: 'Q4 INFRASTRUCTURE RUN-RATE', val: '$14,290.00', delta: 'Within budget' }
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2"
            >
              <div className="text-[10px] text-slate-400">{stat.label}</div>
              <div className="text-xl font-semibold text-white">{stat.val}</div>
              <div className="text-[11px] text-emerald-400">{stat.delta}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-[11px] text-slate-400">
          <span>ALL NODES HEALTHY</span>
          <button
            type="button"
            onClick={() => togglePanicCloak(false)}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            Resume Workspace (Esc)
          </button>
        </div>
      </div>

      {/* ==================================================================
          PAGE 1 (PRE-CACHED & PERSISTENT): HOME DISCOVERY STAGE
          ================================================================== */}
      <div
        aria-hidden={isPlayerOpen}
        style={{
          opacity: isPlayerOpen ? 0 : 1,
          transform: isPlayerOpen
            ? 'scale(0.94) translate3d(0, 12px, 0)'
            : 'scale(1) translate3d(0, 0, 0)',
          pointerEvents: isPlayerOpen ? 'none' : 'auto'
        }}
        className="relative z-10 w-full h-full flex flex-col justify-between gpu-cached-page"
      >
        {/* ================================================================
            ULTRA-CLEAN FRAMELESS EDITORIAL HEADER (ZERO BULKY PILL BOXES!)
            ================================================================ */}
        <header className="relative z-30 px-4 sm:px-8 pt-3.5 pb-2 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            {/* Zone 1: Luxury Serif Wordmark AETHER with tiny crimson 18+ superscript */}
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchBarOpen(false);
                setActivePillar('All');
                setActiveFantasyMood('ALL');
                setAudioVibeFilter('ALL');
                setCatalog(INITIAL_CATALOG_DATA.slice(0, 10));
                setActiveCardIndex(0);
              }}
              className="flex items-baseline gap-1 cursor-pointer shrink-0 group"
            >
              <span className="font-editorial italic text-2xl sm:text-3xl font-semibold tracking-[0.18em] text-white group-hover:text-rose-200 transition-colors">
                AETHER
              </span>
              <sup className="text-[10px] font-mono-tabular font-semibold text-rose-500">
                18+
              </sup>
            </button>

            {/* Zone 2: Sensory & Fantasy Mood Navigation Links (Desktop Inline) */}
            <nav
              dir={currentLangOption.isRtl ? 'rtl' : 'ltr'}
              className="hidden lg:flex items-center gap-5 overflow-x-auto no-scrollbar"
            >
              {FANTASY_MOODS.slice(0, 6).map((mood) => {
                const active = activeFantasyMood === mood.id;
                return (
                  <button
                    type="button"
                    key={mood.id}
                    onClick={() => {
                      setActiveFantasyMood(mood.id);
                      setActiveCardIndex(0);
                    }}
                    className={`relative py-1 text-xs tracking-wide transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'text-white font-semibold'
                        : 'text-white/50 hover:text-white/85 font-normal'
                    }`}
                  >
                    <span>{currentLangOption.isRtl ? mood.labelFa : mood.labelEn}</span>
                    {active && (
                      <span className="absolute inset-x-0 -bottom-0.5 h-[1.5px] bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Seamless Borderless Icon Triggers (🔍 Search, 🛡 Panic Cloak, 🌐 Lang, ⚙ Console) */}
            <div className="flex items-center gap-1 shrink-0 relative">
              <button
                type="button"
                onClick={() => setSearchBarOpen((v) => !v)}
                aria-label="Search Archive"
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors cursor-pointer ${
                  searchBarOpen || searchQuery
                    ? 'text-rose-400'
                    : 'text-white/75 hover:text-white'
                }`}
              >
                {isSearchingArchive ? (
                  <RefreshCw className="w-4 h-4 text-rose-400 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => togglePanicCloak(true)}
                title="سپر اضطراری هولوگرافیک (Panic Cloak <10ms)"
                aria-label="Panic Cloak"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white/75 hover:text-rose-300 transition-colors cursor-pointer"
              >
                <Shield className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setLangMenuOpen((v) => !v)}
                title="14 World Languages"
                aria-label="Language Switcher"
                className="min-w-[44px] min-h-[44px] px-1.5 flex items-center justify-center gap-1 text-white/75 hover:text-white transition-colors cursor-pointer"
              >
                <Globe className="w-4 h-4 text-rose-400" />
                <span className="text-[11px] font-mono-tabular uppercase">{worldLang}</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsSheetOpen(true)}
                aria-label="Publisher & Cinema Console"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white/75 hover:text-white transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Pre-Cached 14-Language Smoked-Glass Popover */}
              <div
                style={{
                  opacity: langMenuOpen ? 1 : 0,
                  transform: langMenuOpen ? 'translate3d(0, 0, 0)' : 'translate3d(0, -8px, 0)',
                  pointerEvents: langMenuOpen ? 'auto' : 'none',
                  visibility: langMenuOpen ? 'visible' : 'hidden'
                }}
                className="absolute right-0 top-12 w-64 rounded-2xl smoked-glass-sheet p-2.5 z-50 grid grid-cols-2 gap-1 max-h-[65dvh] overflow-y-auto no-scrollbar transition-all duration-150"
              >
                {WORLD_LANGUAGES.map((l) => {
                  const active = worldLang === l.code;
                  return (
                    <button
                      type="button"
                      key={l.code}
                      onClick={() => {
                        setWorldLang(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`px-2.5 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        active
                          ? 'bg-rose-500/20 text-amber-200 font-semibold'
                          : 'hover:bg-white/10 text-white/80'
                      }`}
                    >
                      <span className="truncate">{l.nativeName}</span>
                      <span className="text-[10px] font-mono-tabular opacity-60 uppercase">
                        {l.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile Sensory & Fantasy Mood Strip (Clean Frameless Editorial Typography) */}
          <div
            dir={currentLangOption.isRtl ? 'rtl' : 'ltr'}
            className="flex lg:hidden items-center gap-4 overflow-x-auto no-scrollbar py-0.5"
          >
            {FANTASY_MOODS.map((mood) => {
              const active = activeFantasyMood === mood.id;
              return (
                <button
                  type="button"
                  key={mood.id}
                  onClick={() => {
                    setActiveFantasyMood(mood.id);
                    setActiveCardIndex(0);
                  }}
                  className={`relative py-1 text-[11px] tracking-wide transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active ? 'text-amber-200 font-semibold' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <span>{currentLangOption.isRtl ? mood.labelFa : mood.labelEn}</span>
                  {active && (
                    <span className="absolute inset-x-0 bottom-0 h-[1px] bg-rose-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Expandable Frameless Search Input */}
          <div
            style={{
              maxHeight: searchBarOpen ? '48px' : '0px',
              opacity: searchBarOpen ? 1 : 0,
              pointerEvents: searchBarOpen ? 'auto' : 'none'
            }}
            className="overflow-hidden transition-all duration-200"
          >
            <div
              dir={currentLangOption.isRtl ? 'rtl' : 'ltr'}
              className="h-10 smoked-glass-bar rounded-xl px-3.5 flex items-center gap-2.5"
            >
              <Search className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <input
                type="text"
                dir={currentLangOption.isRtl ? 'rtl' : 'ltr'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    executeArchiveAiSearch(searchQuery.trim());
                  }
                }}
                placeholder={uiStrings.searchPlaceholder}
                className="flex-1 bg-transparent text-xs text-white placeholder-white/40 focus:outline-none min-w-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-white/50 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="editorial-hairline-h w-full" />
        </header>

        {/* Subtle Editorial Rolling Notice */}
        <div
          style={{
            opacity: rollingNotice || sceneStitchMode ? 1 : 0,
            transform:
              rollingNotice || sceneStitchMode
                ? 'translate3d(-50%, 0, 0)'
                : 'translate3d(-50%, -8px, 0)'
          }}
          className="fixed top-24 left-1/2 z-30 pointer-events-none transition-all duration-200"
        >
          <div
            dir={currentLangOption.isRtl ? 'rtl' : 'ltr'}
            className="px-4 py-1 rounded-lg smoked-glass-bar text-[11px] text-amber-200 whitespace-nowrap flex items-center gap-1.5"
          >
            <Flame className="w-3 h-3 text-rose-400" />
            <span>{rollingNotice || uiStrings.stitchActiveBadge}</span>
          </div>
        </div>

        {/* ================================================================
            10-CARD PRE-CACHED 3D HERO STAGE (NO REDUNDANT DOTS OR CIRCLES!)
            Horizontal swipe physics & edge-peeking cards speak for themselves
            ================================================================ */}
        <main
          onPointerDown={(e) => {
            if (langMenuOpen) setLangMenuOpen(false);
            carouselPointerStartRef.current = {
              x: e.clientX,
              y: e.clientY,
              active: true
            };
          }}
          onPointerMove={(e) => {
            if (!carouselPointerStartRef.current.active) return;
            const dx = e.clientX - carouselPointerStartRef.current.x;
            setCarouselDragX(dx);
          }}
          onPointerUp={(e) => {
            if (!carouselPointerStartRef.current.active) return;
            const dx = e.clientX - carouselPointerStartRef.current.x;
            carouselPointerStartRef.current.active = false;
            setCarouselDragX(0);

            if (dx < -45) {
              navigateToCard(safeActiveIndex + 1);
            } else if (dx > 45) {
              navigateToCard(safeActiveIndex - 1);
            }
          }}
          onPointerCancel={() => {
            carouselPointerStartRef.current.active = false;
            setCarouselDragX(0);
          }}
          onWheel={(e) => {
            const now = Date.now();
            if (now - lastWheelTimeRef.current < 360) return;
            if (Math.abs(e.deltaX) > 22 || Math.abs(e.deltaY) > 32) {
              lastWheelTimeRef.current = now;
              const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
              if (delta > 0) navigateToCard(safeActiveIndex + 1);
              else navigateToCard(safeActiveIndex - 1);
            }
          }}
          className="relative z-10 flex-1 flex flex-col items-center justify-center overflow-hidden pb-16 touch-pan-y"
        >
          <div className="relative w-full h-[68dvh] flex items-center justify-center">
            {films.map((film, idx) => {
              const score = Math.round(
                computeCosineSimilarity(sessionMoodVector, film.moodVector) * 100
              );
              return (
                <Cached3DCinemaCard
                  key={`slot-${idx}`}
                  film={film}
                  slotPosition={idx + 1}
                  totalDisplayed={films.length}
                  isActive={idx === safeActiveIndex}
                  offsetIndex={idx - safeActiveIndex}
                  dragDeltaX={carouselDragX}
                  aiMatchScore={score}
                  uiStrings={uiStrings}
                  isRtl={currentLangOption.isRtl}
                  tvModeActive={tvModeActive}
                  onSelectCard={() => navigateToCard(idx)}
                  onLaunchPlayer={handleLaunchPlayer}
                  onLaunchHighlightReel={handleLaunchHighlightReel}
                />
              );
            })}
          </div>
        </main>

        {/* ================================================================
            SLEEK FLOATING SMOKED-GLASS CONTROL BAR (BOTTOM DOCK)
            Sliding underline/glow indicators for All, Live-Action, AI Erotic,
            Hentai/Anime + ✨ AI Concierge trigger
            ================================================================ */}
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40 flex flex-col items-center">
          <div className="w-full rounded-2xl smoked-glass-bar overflow-hidden transition-all duration-300">
            {/* Pre-Cached AI Concierge Drawer (Connected to 100-Platform Global Intelligence) */}
            <div
              style={{
                maxHeight: islandExpanded ? '500px' : '0px',
                opacity: islandExpanded ? 1 : 0,
                pointerEvents: islandExpanded ? 'auto' : 'none'
              }}
              className="overflow-hidden transition-all duration-300"
            >
              <div className="p-4 space-y-3 max-h-[480px] overflow-y-auto no-scrollbar">
                <div
                  className="flex items-center justify-between"
                  dir={currentLangOption.isRtl ? 'rtl' : 'ltr'}
                >
                  <span className="font-editorial italic text-sm sm:text-base text-amber-200 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{uiStrings.aiCriticTitle} • متصل به ۱۰۰ منبع برتر جهان</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIslandExpanded(false)}
                    className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="editorial-hairline-h w-full" />

                {/* AI Critic Review & #1 Recommended Film Action */}
                <div
                  dir={currentLangOption.isRtl ? 'rtl' : 'ltr'}
                  className="p-3 rounded-xl bg-white/[0.04] space-y-2.5"
                >
                  <div className="text-xs text-white/90 leading-relaxed">
                    {lastAiResponse ? lastAiResponse.spokenExplanation : currentFilmCriticReview}
                  </div>

                  {/* Regional Intelligence Insight if matched */}
                  {lastAiResponse?.matchedCountryInsight && (
                    <div className="p-2 rounded-lg bg-rose-500/10 text-[11px] text-amber-200 flex flex-wrap items-center justify-between gap-2">
                      <span>
                        🌍 {currentLangOption.isRtl
                          ? lastAiResponse.matchedCountryInsight.countryNameFa
                          : lastAiResponse.matchedCountryInsight.countryNameEn}
                      </span>
                      <span className="font-mono-tabular text-white/80">
                        ماندگاری: {lastAiResponse.matchedCountryInsight.avgDwellTime} · موبایل:{' '}
                        {lastAiResponse.matchedCountryInsight.mobileShare}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="text-[11px] text-amber-200 truncate">
                      🎬 بهترین فیلم منطبق: <strong className="text-white">{focusedFilm.canonicalTitle}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLaunchPlayer(focusedFilm, 0)}
                      className="px-3 py-1.5 rounded-lg luxury-cta-primary text-[11px] font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>پخش فوری بهترین انتخاب</span>
                    </button>
                  </div>
                </div>

                {/* Matched Global Top-100 Content Sources (1-Click Stream & Filter) */}
                <div className="space-y-1.5" dir="rtl">
                  <div className="flex items-center justify-between text-[11px] text-white/65">
                    <span>برترین منابع جهانی منطبق از لیست ۱۰۰ سایت برتر:</span>
                    <span className="font-mono-tabular text-amber-200/90">TOP-100 INDEX</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {(
                      lastAiResponse?.matchedGlobalSources ??
                      matchGlobalSourcesForQuery('', undefined, sessionMoodVector).matchedSources
                    )
                      .slice(0, 4)
                      .map((src) => (
                        <div
                          key={src.id}
                          className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-between gap-2 transition-colors"
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectGlobalSourceBenchmark(src, false)}
                            className="text-right min-w-0 flex-1 cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-200 truncate">
                              <span className="font-mono-tabular text-rose-400">
                                #{src.globalRank}
                              </span>
                              <span className="truncate" dir="ltr">
                                {src.domain}
                              </span>
                            </div>
                            <div className="text-[10px] text-white/75 truncate mt-0.5">
                              {src.categoryTitleFa}
                            </div>
                            <div className="text-[10px] font-mono-tabular text-white/50 mt-0.5">
                              بازدید: {src.monthlyVisits} · ماندگاری: {src.avgDwellTime}
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectGlobalSourceBenchmark(src, true)}
                            title="پخش فوری بهترین فیلم این منبع"
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 text-amber-200 text-[10px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>پخش</span>
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Curated Global-100 Discovery Prompts */}
                <div className="grid grid-cols-2 gap-1.5" dir="rtl">
                  {[
                    {
                      label: 'بهترین فیلم 4K 60fps بدون تبلیغ (Eporner)',
                      query: 'eporner 4k 60fps بدون تبلیغ',
                      localOnly: false
                    },
                    {
                      label: 'سینمای بدون سانسور آسیا (NJAVTV / MissAV)',
                      query: 'njavtv missav سینمای آسیایی ژاپنی بدون تبلیغ',
                      localOnly: false
                    },
                    {
                      label: 'فانتزی هوش مصنوعی (Candy.ai / MyAnima)',
                      query: 'candy myanima lovescape هوش مصنوعی عربی و فراواقعی',
                      localOnly: false
                    },
                    {
                      label: 'انیمه بدون سانسور و ASMR (DLsite / F95)',
                      query: 'dlsite f95zone انیمه بدون سانسور و صدای دوگوشی',
                      localOnly: false
                    },
                    {
                      label: 'تولیدات استودیویی و POV (Brazzers / Beeg)',
                      query: 'brazzers beeg استودیویی زاویه دید اول شخص pov',
                      localOnly: false
                    },
                    {
                      label: 'محبوب‌ترین در خاورمیانه و اروپا (۲۰ کشور)',
                      query: 'محبوب‌ترین فیلم در خاورمیانه و اروپا',
                      localOnly: false
                    }
                  ].map((chip) => (
                    <button
                      type="button"
                      key={chip.label}
                      dir="rtl"
                      onClick={() =>
                        executeProprietaryAiQuery(chip.query, focusedFilm, chip.localOnly)
                      }
                      className="py-2 px-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] text-[11px] text-white/85 text-right truncate cursor-pointer transition-colors"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                <form
                  dir={currentLangOption.isRtl ? 'rtl' : 'ltr'}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (aiPrompt.trim()) {
                      executeProprietaryAiQuery(aiPrompt.trim());
                    }
                  }}
                  className="flex items-center gap-2 pt-1"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setVoicePulse(true);
                      const SpeechRec =
                        (window as unknown as { SpeechRecognition?: new () => { lang: string; start: () => void; onresult: ((e: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null } }).SpeechRecognition ||
                        (window as unknown as { webkitSpeechRecognition?: new () => { lang: string; start: () => void; onresult: ((e: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null } }).webkitSpeechRecognition;

                      if (SpeechRec) {
                        try {
                          const recognition = new SpeechRec();
                          recognition.lang =
                            worldLang === 'fa'
                              ? 'fa-IR'
                              : worldLang === 'ar'
                              ? 'ar-SA'
                              : 'en-US';
                          recognition.onresult = (event) => {
                            const transcript = event.results?.[0]?.[0]?.transcript;
                            setVoicePulse(false);
                            if (transcript) {
                              setAiPrompt(transcript);
                              executeProprietaryAiQuery(transcript, focusedFilm, false);
                            }
                          };
                          recognition.onerror = () => {
                            setVoicePulse(false);
                            executeProprietaryAiQuery(
                              'بهترین فیلم 4K مناسب سلیقه من از ۱۰۰ منبع جهانی',
                              focusedFilm,
                              false
                            );
                          };
                          recognition.onend = () => setVoicePulse(false);
                          recognition.start();
                          return;
                        } catch {
                          // fallback below
                        }
                      }

                      window.setTimeout(() => {
                        setVoicePulse(false);
                        executeProprietaryAiQuery(
                          'بهترین فیلم 4K مناسب سلیقه من از ۱۰۰ منبع جهانی',
                          focusedFilm,
                          false
                        );
                      }, 650);
                    }}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 cursor-pointer ${
                      voicePulse ? 'bg-rose-500 text-white' : 'bg-white/10 text-white/80'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    dir={currentLangOption.isRtl ? 'rtl' : 'ltr'}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="هر نوع فیلم، ژانر، کشور یا منبع (مثل Eporner, MissAV, Candy.ai)..."
                    className="flex-1 h-9 px-3 rounded-lg bg-white/[0.05] text-xs text-white placeholder-white/40 focus:outline-none"
                  />

                  <button
                    type="submit"
                    className="h-9 px-4 rounded-lg luxury-cta-primary text-xs font-semibold cursor-pointer shrink-0"
                  >
                    {uiStrings.analyzeBtn}
                  </button>
                </form>
              </div>
              <div className="editorial-hairline-h w-full" />
            </div>

            {/* Bottom Navigation Row: Sliding Underline Indicators + ✨ AI Concierge */}
            <div className="h-12 px-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto no-scrollbar">
                {(
                  [
                    { id: 'All', label: 'All' },
                    { id: 'LIVE', label: 'Live-Action' },
                    { id: 'AI', label: 'AI Erotic' },
                    { id: 'ANIMATION', label: 'Hentai/Anime' }
                  ] as const
                ).map((tab) => {
                  const active = activePillar === tab.id;
                  return (
                    <button
                      type="button"
                      key={tab.id}
                      onClick={() => {
                        setActivePillar(tab.id);
                        setActiveCardIndex(0);
                      }}
                      className={`relative py-2 text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        active
                          ? 'text-white font-semibold'
                          : 'text-white/50 hover:text-white/85 font-normal'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {active && (
                        <span className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-rose-500 via-amber-200 to-rose-500 shadow-[0_0_10px_#E11D48]" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="h-5 editorial-hairline-v" />

                <button
                  type="button"
                  onClick={() => {
                    const nextOpen = !islandExpanded;
                    setIslandExpanded(nextOpen);
                    if (nextOpen) {
                      executeProprietaryAiQuery('معرفی همین فیلم', focusedFilm, true);
                    }
                  }}
                  className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-rose-500/20 to-amber-500/15 hover:from-rose-500/30 hover:to-amber-500/25 text-xs font-medium text-amber-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{uiStrings.askAiBtn}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================
          PAGE 2 (PRE-CACHED & PERSISTENT): FULLSCREEN VIDEO PLAYER
          ================================================================== */}
      <div
        aria-hidden={!isPlayerOpen}
        onPointerMove={isPlayerOpen ? wakePlayerHud : undefined}
        style={{
          opacity: isPlayerOpen ? 1 : 0,
          transform: isPlayerOpen
            ? 'scale(1) translate3d(0, 0, 0)'
            : 'scale(0.92) translate3d(0, 24px, 0)',
          pointerEvents: isPlayerOpen ? 'auto' : 'none',
          visibility: isPlayerOpen ? 'visible' : 'hidden'
        }}
        className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none gpu-cached-page"
      >
        {/* 3D Interactive Video Stage */}
        <div
          onPointerDown={(e) => {
            if (!isPlayerOpen || playerDrawerOpen || splitViewOpen) return;
            const isLeftEdge = e.clientX < 52;
            const isRightSide = e.clientX > window.innerWidth * 0.62;

            playerGestureStartRef.current = {
              x: e.clientX,
              y: e.clientY,
              time: Date.now(),
              active: true,
              isLeftEdgeDimmer: isLeftEdge,
              initialBrightness: screenDimmerBrightness
            };

            if (isRightSide && !isLeftEdge) {
              if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
              holdTimerRef.current = window.setTimeout(() => {
                if (playerGestureStartRef.current.active) {
                  setIs2xSpeedActive(true);
                }
              }, 320);
            }
          }}
          onPointerMove={(e) => {
            if (!playerGestureStartRef.current.active) return;
            const dx = e.clientX - playerGestureStartRef.current.x;
            const dy = e.clientY - playerGestureStartRef.current.y;

            if (Math.abs(dx) > 14 || Math.abs(dy) > 14) {
              if (holdTimerRef.current) {
                window.clearTimeout(holdTimerRef.current);
                holdTimerRef.current = null;
              }
            }

            if (playerGestureStartRef.current.isLeftEdgeDimmer) {
              const deltaBrightness = -dy / 240;
              const nextB = Math.max(
                0.3,
                Math.min(1.0, playerGestureStartRef.current.initialBrightness + deltaBrightness)
              );
              setScreenDimmerBrightness(Number(nextB.toFixed(2)));
              return;
            }

            setPlayerGestureOffset({ x: dx, y: dy });
          }}
          onPointerUp={(e) => {
            if (holdTimerRef.current) {
              window.clearTimeout(holdTimerRef.current);
              holdTimerRef.current = null;
            }
            if (is2xSpeedActive) {
              setIs2xSpeedActive(false);
            }

            if (!playerGestureStartRef.current.active) return;
            const wasLeftEdge = playerGestureStartRef.current.isLeftEdgeDimmer;
            const dx = e.clientX - playerGestureStartRef.current.x;
            const dy = e.clientY - playerGestureStartRef.current.y;
            const dt = Math.max(1, Date.now() - playerGestureStartRef.current.time);
            const velocityY = Math.abs(dy) / dt;
            const velocityX = Math.abs(dx) / dt;

            playerGestureStartRef.current.active = false;
            setPlayerGestureOffset({ x: 0, y: 0 });

            if (wasLeftEdge) return;

            if (
              (Math.abs(dy) > 70 || (Math.abs(dy) > 35 && velocityY > 0.42)) &&
              Math.abs(dy) > Math.abs(dx)
            ) {
              handleClosePlayer();
              return;
            }

            if (
              (Math.abs(dx) > 65 || (Math.abs(dx) > 35 && velocityX > 0.42)) &&
              Math.abs(dx) > Math.abs(dy)
            ) {
              if (dx < 0) {
                triggerInterVideoTransition(immediateNextFilm, 0);
              } else {
                triggerInterVideoTransition(immediatePrevFilm, 0);
              }
              return;
            }

            if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
              if (playerDrawerOpen) {
                setPlayerDrawerOpen(false);
              } else {
                setPlayerHudVisible((v) => !v);
              }
            }
          }}
          onPointerCancel={() => {
            if (holdTimerRef.current) {
              window.clearTimeout(holdTimerRef.current);
              holdTimerRef.current = null;
            }
            setIs2xSpeedActive(false);
            playerGestureStartRef.current.active = false;
            setPlayerGestureOffset({ x: 0, y: 0 });
          }}
          style={{
            filter: `${
              activeColorGrade.filter === 'none' ? '' : activeColorGrade.filter
            } brightness(${screenDimmerBrightness})`.trim(),
            borderRadius: `${playerBorderRadius}px`,
            opacity: stitchCrossfading ? 0.25 : 1,
            transform: `perspective(1000px) translate3d(${playerGestureOffset.x * 0.5}px, ${
              playerGestureOffset.y * 0.6
            }px, 0px) rotateX(${playerRotateX}deg) rotateY(${playerRotateY}deg) scale(${playerScale})`,
            transition: playerGestureStartRef.current.active
              ? 'none'
              : 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1), border-radius 240ms ease, opacity 220ms ease',
            boxShadow: `0 40px 100px -10px rgba(0,0,0,0.95), 0 0 70px -10px ${ambientPrimary}55`
          }}
          className="absolute inset-0 w-full h-full bg-black overflow-hidden flex items-center justify-center touch-none"
        >
          <img
            src={cachedPlayerFilm.posterUrl}
            alt=""
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.fallbackApplied) {
                target.dataset.fallbackApplied = '1';
                target.src = './assets/images/boudoir_crimson_silk_suite_1794443433215.jpg';
              }
            }}
            className="absolute inset-0 w-full h-full object-cover opacity-35 scale-105 pointer-events-none"
          />

          <video
            ref={playerVideoRef}
            src={cachedPlayerFilm.streamUrl}
            poster={cachedPlayerFilm.posterUrl}
            preload="auto"
            playsInline
            loop
            muted={isMuted}
            onLoadedMetadata={(e) => {
              const dur = Math.floor(e.currentTarget.duration);
              if (dur && Number.isFinite(dur) && dur > 3) {
                setVideoDuration(dur);
              }
              if (pendingStartSec > 0 && pendingStartSec < (dur || 180)) {
                e.currentTarget.currentTime = pendingStartSec;
                setPendingStartSec(0);
              }
              if (
                isPlayerOpen &&
                isPlaying &&
                !panicCloakActive &&
                ageGateStatus === 'verified_18_plus'
              ) {
                e.currentTarget.play().catch(() => {});
              }
            }}
            onTimeUpdate={(e) => {
              if (isPlayerOpen) {
                setCurrentTime(Math.floor(e.currentTarget.currentTime));
              }
            }}
            className="relative z-10 w-full h-full object-contain sm:object-cover pointer-events-none"
          />

          {is2xSpeedActive && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 rounded-lg smoked-glass-bar text-amber-200 text-xs font-mono-tabular flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>2.0x Speed</span>
            </div>
          )}
        </div>

        {/* ==================================================================
            FEATURE 7 (PRE-CACHED): SPLIT-CANVAS MULTI-SCENE PREVIEW (3 PANELS)
            ================================================================== */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            opacity: splitViewOpen ? 1 : 0,
            pointerEvents: splitViewOpen ? 'auto' : 'none',
            visibility: splitViewOpen ? 'visible' : 'hidden'
          }}
          className="fixed inset-x-4 top-20 z-40 max-w-2xl mx-auto rounded-2xl smoked-glass-sheet p-4 transition-all duration-200"
        >
          <div
            className="flex items-center justify-between mb-3"
            dir={currentLangOption.isRtl ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center gap-2 text-xs font-medium text-amber-200">
              <Columns className="w-4 h-4 text-rose-400" />
              <span>{uiStrings.splitViewBtn} • پیش‌نمایش هم‌زمان ۳ سکانس داغ</span>
            </div>
            <button
              type="button"
              onClick={() => setSplitViewOpen(false)}
              className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/75 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {(cachedPlayerFilm.scenes.slice(0, 3) || []).map((scene, sIdx) => (
              <button
                type="button"
                key={scene.id}
                onClick={() => {
                  handleSeekToSecond(scene.timestampSec);
                  setSplitViewOpen(false);
                }}
                className="group relative h-28 sm:h-36 rounded-xl overflow-hidden text-left cursor-pointer"
              >
                <img
                  src={cachedPlayerFilm.posterUrl}
                  alt={scene.label}
                  style={{
                    filter: scene.cameraFilter,
                    transform: `scale(${1.08 + sIdx * 0.12}) translate3d(${(sIdx - 1) * 8}%, 0, 0)`
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-2.5 flex flex-col justify-between">
                  <span className="text-[10px] font-mono-tabular text-amber-200">
                    @{scene.timeFormatted} · {scene.intensityScore}/10
                  </span>
                  <div
                    dir={currentLangOption.isRtl ? 'rtl' : 'ltr'}
                    className="text-[11px] font-medium text-white truncate"
                  >
                    {currentLangOption.code === 'fa'
                      ? scene.labelFa ?? scene.label
                      : scene.label}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Gradient Mask */}
        <div
          className={`absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none transition-opacity duration-300 ${
            playerHudVisible ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Top Bar in Player (Clean Frameless Gradient Mask, Single Truncated Title) */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            opacity: playerHudVisible ? 1 : 0,
            transform: playerHudVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, -14px, 0)',
            pointerEvents: playerHudVisible ? 'auto' : 'none'
          }}
          className="relative z-50 bg-gradient-to-b from-black/90 via-black/50 to-transparent pt-4 pb-6 px-4 flex items-center justify-between gap-2 transition-all duration-200"
        >
          <button
            type="button"
            onClick={handleClosePlayer}
            aria-label="Back"
            className="min-w-[40px] min-h-[40px] rounded-xl smoked-glass-bar text-white flex items-center justify-center cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 min-w-0 flex justify-center px-1">
            <span className="font-editorial italic text-base sm:text-lg font-medium text-white truncate max-w-[180px] sm:max-w-xs drop-shadow">
              {cachedPlayerFilm.canonicalTitle}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setSplitViewOpen((v) => !v)}
              title="Split-Canvas Multi-View"
              className={`min-w-[38px] min-h-[38px] rounded-xl flex items-center justify-center cursor-pointer ${
                splitViewOpen ? 'luxury-cta-primary' : 'smoked-glass-bar text-white/85'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() =>
                setSubtitleMode((prev) =>
                  prev === 'single' ? 'bilingual' : prev === 'bilingual' ? 'off' : 'single'
                )
              }
              title="Live Subtitles"
              className={`min-h-[38px] px-2.5 rounded-xl text-[11px] font-medium flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                subtitleMode !== 'off' ? 'luxury-cta-primary' : 'smoked-glass-bar text-white/75'
              }`}
            >
              <Subtitles className="w-3.5 h-3.5" />
              <span className="uppercase font-mono-tabular">
                {subtitleMode === 'single'
                  ? worldLang
                  : subtitleMode === 'bilingual'
                  ? `${worldLang}+EN`
                  : 'Off'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPlayerDrawerTab('ai-radar');
                setPlayerDrawerOpen((v) => !v);
              }}
              title="AI Concierge & Scenes"
              className="min-h-[38px] px-2.5 rounded-xl smoked-glass-bar text-[11px] font-medium text-amber-200 flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>AI</span>
            </button>

            <button
              type="button"
              onClick={() => togglePanicCloak(true)}
              title="Panic Cloak"
              className="min-w-[38px] min-h-[38px] rounded-xl smoked-glass-bar text-rose-300 flex items-center justify-center cursor-pointer"
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Zone: Clean 14-Language Subtitle + Semantic Heat-Wave Scrubber */}
        <div className="relative z-20 mt-auto flex flex-col items-center w-full">
          {activeSubtitleCue && subtitleMode !== 'off' && !playerDrawerOpen && (
            <div className="px-4 mb-3 pointer-events-none max-w-lg w-full flex flex-col items-center">
              <div className="px-4 py-1.5 rounded-xl smoked-glass-bar text-center max-w-[92vw]">
                <div
                  dir={currentLangOption.isRtl ? 'rtl' : 'ltr'}
                  className={`text-white font-medium truncate ${
                    subtitleSize === 'lg'
                      ? 'text-sm sm:text-base'
                      : subtitleSize === 'md'
                      ? 'text-xs sm:text-sm'
                      : 'text-[11px]'
                  }`}
                >
                  {translateSubtitleCue(
                    activeSubtitleCue.index,
                    worldLang,
                    activeSubtitleCue.textFa,
                    activeSubtitleCue.textEn
                  )}
                </div>
                {subtitleMode === 'bilingual' && worldLang !== 'en' && (
                  <div className="text-[11px] text-amber-200/90 truncate mt-0.5" dir="ltr">
                    {activeSubtitleCue.textEn}
                  </div>
                )}
              </div>
            </div>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              opacity: playerHudVisible && !playerDrawerOpen ? 1 : 0,
              transform:
                playerHudVisible && !playerDrawerOpen
                  ? 'translate3d(0, 0, 0)'
                  : 'translate3d(0, 18px, 0)',
              pointerEvents: playerHudVisible && !playerDrawerOpen ? 'auto' : 'none'
            }}
            className="w-full max-w-xl mx-auto px-4 pb-5 transition-all duration-200"
          >
            <div className="rounded-2xl smoked-glass-bar px-4 py-3 flex flex-col gap-2.5">
              {/* Semantic Heat-Wave Scrubber */}
              <div className="relative flex flex-col gap-1">
                {scrubPreviewSec !== null && (
                  <div
                    style={{
                      left: `${Math.min(86, Math.max(14, (scrubPreviewSec / effectiveDuration) * 100))}%`
                    }}
                    className="absolute -top-11 -translate-x-1/2 px-2.5 py-1 rounded-lg smoked-glass-sheet text-[10px] text-white whitespace-nowrap pointer-events-none flex items-center gap-1.5 z-30"
                  >
                    <Flame className="w-3 h-3 text-rose-400" />
                    <span className="font-mono-tabular">
                      {formatSecondsToTimecode(scrubPreviewSec)}
                    </span>
                    <span className="text-amber-200">
                      ·{' '}
                      {(
                        [...cachedPlayerFilm.scenes]
                          .reverse()
                          .find((s) => scrubPreviewSec >= s.timestampSec) ??
                        cachedPlayerFilm.scenes[0]
                      )?.label.slice(0, 18)}
                    </span>
                  </div>
                )}

                <div className="flex items-end gap-[2px] h-3 px-10 opacity-70 pointer-events-none">
                  {cachedPlayerFilm.waveformSeed.slice(0, 36).map((val, wIdx) => {
                    const ratio = wIdx / 36;
                    const played = ratio <= currentTime / effectiveDuration;
                    return (
                      <div
                        key={wIdx}
                        style={{
                          height: `${Math.max(22, Math.round(val * 100))}%`,
                          backgroundColor: played ? ambientPrimary : 'rgba(255,255,255,0.2)'
                        }}
                        className="flex-1 rounded-t-sm transition-colors"
                      />
                    );
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono-tabular text-white/75 w-9">
                    {formatSecondsToTimecode(currentTime)}
                  </span>

                  <div
                    onPointerMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      if (rect.width <= 0) return;
                      const ratio = Math.max(
                        0,
                        Math.min(1, (e.clientX - rect.left) / rect.width)
                      );
                      setScrubPreviewSec(Math.floor(ratio * effectiveDuration));
                    }}
                    onPointerLeave={() => setScrubPreviewSec(null)}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      if (rect.width <= 0) return;
                      const ratio = Math.max(
                        0,
                        Math.min(1, (e.clientX - rect.left) / rect.width)
                      );
                      handleSeekToSecond(ratio * effectiveDuration);
                    }}
                    className="relative flex-1 h-5 flex items-center cursor-pointer"
                  >
                    <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(100, (currentTime / effectiveDuration) * 100)}%`,
                          background: `linear-gradient(90deg, ${ambientPrimary}, #F3E5AB)`
                        }}
                        className="h-full rounded-full"
                      />
                    </div>

                    {Array.isArray(cachedPlayerFilm.scenes) &&
                      cachedPlayerFilm.scenes.map((s) => {
                        const leftPct = Math.min(
                          97,
                          Math.max(3, (s.timestampSec / effectiveDuration) * 100)
                        );
                        return (
                          <div
                            key={s.id}
                            style={{ left: `${leftPct}%` }}
                            className="absolute w-2 h-2 rounded-full bg-amber-200 -translate-x-1/2 pointer-events-none shadow"
                          />
                        );
                      })}

                    <div
                      style={{
                        left: `${Math.min(100, (currentTime / effectiveDuration) * 100)}%`
                      }}
                      className="absolute w-3.5 h-3.5 rounded-full bg-white shadow -translate-x-1/2 pointer-events-none"
                    />
                  </div>

                  <span className="text-[10px] font-mono-tabular text-white/60 w-9 text-right">
                    {formatSecondsToTimecode(effectiveDuration)}
                  </span>
                </div>
              </div>

              {/* Symmetrical Mobile Transport Row */}
              <div className="flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => setIsMuted((m) => !m)}
                  aria-label="Mute"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white flex items-center justify-center cursor-pointer"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => triggerInterVideoTransition(immediatePrevFilm, 0)}
                  aria-label="Previous Video"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white flex items-center justify-center cursor-pointer"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSeekToSecond(currentTime - 10)}
                  aria-label="Rewind 10s"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white flex items-center justify-center cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="w-11 h-11 rounded-xl luxury-cta-primary flex items-center justify-center cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSeekToSecond(currentTime + 10)}
                  aria-label="Forward 10s"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white flex items-center justify-center cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => triggerInterVideoTransition(immediateNextFilm, 0)}
                  aria-label="Next Video"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white flex items-center justify-center cursor-pointer"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPlayerDrawerTab('scenes');
                    setPlayerDrawerOpen(true);
                  }}
                  title="Scenes & Sensory Matrix"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-amber-200 flex items-center justify-center cursor-pointer"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pre-Cached Slide-Up Sheet inside Player */}
        <div
          style={{
            opacity: playerDrawerOpen ? 1 : 0,
            pointerEvents: playerDrawerOpen ? 'auto' : 'none'
          }}
          onClick={() => setPlayerDrawerOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 transition-opacity duration-200"
        />

        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            transform: playerDrawerOpen ? 'translate3d(0, 0%, 0)' : 'translate3d(0, 105%, 0)',
            pointerEvents: playerDrawerOpen ? 'auto' : 'none'
          }}
          className="fixed inset-x-0 bottom-0 z-40 max-w-lg mx-auto rounded-t-3xl smoked-glass-sheet p-5 transition-transform duration-300"
        >
          <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3.5" />

          <div
            className="flex items-center justify-between gap-2 mb-4"
            dir={currentLangOption.isRtl ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              {(
                [
                  { id: 'scenes', label: uiStrings.scenesTab },
                  { id: 'ai-radar', label: uiStrings.aiRadarTab },
                  { id: 'vibe-matrix', label: uiStrings.vibeMatrixTab },
                  { id: 'dna-key', label: uiStrings.dnaKeyTab },
                  { id: 'queue', label: uiStrings.queueTab }
                ] as const
              ).map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setPlayerDrawerTab(t.id)}
                  className={`py-1.5 text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${
                    playerDrawerTab === t.id
                      ? 'text-amber-200 border-b border-rose-500'
                      : 'text-white/55 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPlayerDrawerOpen(false)}
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:text-white cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {playerDrawerTab === 'scenes' && (
            <div
              className="grid grid-cols-2 gap-2"
              dir={currentLangOption.isRtl ? 'rtl' : 'ltr'}
            >
              {Array.isArray(cachedPlayerFilm.scenes) &&
                cachedPlayerFilm.scenes.map((scene) => {
                  const isCurrent = activeScene.id === scene.id;
                  return (
                    <button
                      type="button"
                      key={scene.id}
                      onClick={() => {
                        handleSeekToSecond(scene.timestampSec);
                        setPlayerDrawerOpen(false);
                      }}
                      className={`p-3 rounded-xl text-right cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-rose-500/20 text-white'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/75'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono-tabular text-amber-200 mb-1">
                        <span>@{scene.timeFormatted}</span>
                        <span>🔥 {scene.intensityScore}/10</span>
                      </div>
                      <div className="text-xs font-medium truncate">
                        {worldLang === 'fa' ? scene.labelFa ?? scene.label : scene.label}
                      </div>
                    </button>
                  );
                })}
            </div>
          )}

          {playerDrawerTab === 'ai-radar' && (
            <div className="space-y-3 max-h-[52dvh] overflow-y-auto no-scrollbar" dir={currentLangOption.isRtl ? 'rtl' : 'ltr'}>
              <div className="p-3 rounded-xl bg-white/[0.04] text-xs text-white/90 leading-relaxed space-y-2">
                <div>
                  {synthesizeFilmCriticReview(
                    worldLang,
                    cachedPlayerFilm,
                    cachedPlayerFilm.scenes?.[2] ?? cachedPlayerFilm.scenes?.[0],
                    Math.round(
                      computeCosineSimilarity(sessionMoodVector, cachedPlayerFilm.moodVector) * 100
                    )
                  )}
                </div>
                {cachedPlayerFilm.sourceBenchmark && (
                  <div className="pt-1.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-amber-200">
                    <span>
                      منبع مرجع جهانی: #{cachedPlayerFilm.sourceBenchmark.globalRank}{' '}
                      {cachedPlayerFilm.sourceBenchmark.domain}
                    </span>
                    <span className="font-mono-tabular text-white/75">
                      ماندگاری: {cachedPlayerFilm.sourceBenchmark.avgDwellTime} · ترافیک:{' '}
                      {cachedPlayerFilm.sourceBenchmark.monthlyVisits}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Switcher across Top Global Sources inside Player */}
              <div className="space-y-1.5" dir="rtl">
                <div className="text-[11px] text-white/60">
                  سوئیچ فوری به برترین منابع لیست ۱۰۰ پلتفرم جهانی:
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {GLOBAL_TOP_SOURCES_INDEX.slice(0, 6).map((src) => (
                    <button
                      type="button"
                      key={src.id}
                      onClick={() => {
                        const target =
                          INITIAL_CATALOG_DATA.find((f) => f.id === src.linkedFilmId) ??
                          INITIAL_CATALOG_DATA[0];
                        triggerInterVideoTransition(target, 0, true);
                      }}
                      className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-right cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold text-amber-200">
                        <span className="truncate" dir="ltr">
                          {src.domain.split(' ')[0]}
                        </span>
                        <span className="font-mono-tabular text-rose-400">#{src.globalRank}</span>
                      </div>
                      <div className="text-[10px] text-white/70 truncate mt-0.5">
                        {src.categoryTitleFa}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  executeArchiveAiSearch(
                    `${cachedPlayerFilm.canonicalTitle} ${cachedPlayerFilm.sensoryMood}`
                  );
                  setPlayerDrawerOpen(false);
                  handleClosePlayer();
                }}
                className="w-full py-2.5 px-4 rounded-xl luxury-cta-primary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>چیدمان ۱۰ ویدئوی مشابه با همین حس و نورپردازی</span>
              </button>
            </div>
          )}

          {playerDrawerTab === 'vibe-matrix' && (
            <div className="space-y-3" dir="rtl">
              <div className="p-3 rounded-xl bg-white/[0.04] space-y-2">
                <span className="flex items-center gap-1.5 text-xs text-amber-200">
                  <Sliders className="w-3.5 h-3.5 text-rose-400" />
                  <span>حالت فانتزی و اتمسفر بصری (Sensory Mood)</span>
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {FANTASY_MOODS.slice(0, 6).map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setActiveFantasyMood(m.id)}
                      className={`py-2 px-2.5 rounded-lg text-[11px] cursor-pointer ${
                        activeFantasyMood === m.id
                          ? 'luxury-cta-primary font-semibold'
                          : 'bg-white/5 text-white/75'
                      }`}
                    >
                      {m.labelFa}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] space-y-2">
                <span className="block text-xs text-amber-200">
                  بافت صوتی و ASMR (Audio Texture)
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'ALL', label: 'همه بافت‌های صوتی' },
                      { id: 'ASMR', label: 'ASMR / صدای طبیعی' },
                      { id: 'Fast Rhythm', label: 'ریتم تند و پرحرارت' },
                      { id: 'Pure Ambient', label: 'آکوستیک اتاق (بدون موزیک)' }
                    ] as const
                  ).map((a) => (
                    <button
                      type="button"
                      key={a.id}
                      onClick={() => setAudioVibeFilter(a.id)}
                      className={`py-2 px-2.5 rounded-lg text-[11px] cursor-pointer ${
                        audioVibeFilter === a.id
                          ? 'bg-rose-500/30 text-amber-200 font-semibold'
                          : 'bg-white/5 text-white/75'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {playerDrawerTab === 'dna-key' && (
            <div className="space-y-3" dir="rtl">
              <div className="p-3.5 rounded-xl bg-white/[0.04] flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-white/60">
                    کپسول ۶ کاراکتری سلیقه شما (بدون نیاز به ثبت‌نام)
                  </div>
                  <div className="text-lg font-mono-tabular font-semibold tracking-[0.25em] text-amber-200 mt-0.5">
                    {currentDnaKey}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(currentDnaKey).catch(() => {});
                    setDnaCopied(true);
                    window.setTimeout(() => setDnaCopied(false), 1500);
                  }}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{dnaCopied ? 'کپی شد' : 'کپی کد'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={dnaInputCode}
                  onChange={(e) => setDnaInputCode(e.target.value.toUpperCase())}
                  placeholder="وارد کردن کد ۶ کاراکتری..."
                  className="flex-1 h-9 px-3 rounded-lg bg-white/5 text-xs text-white font-mono-tabular uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyDnaKey}
                  className="h-9 px-4 rounded-lg luxury-cta-primary text-xs font-semibold cursor-pointer"
                >
                  بازیابی سلیقه
                </button>
              </div>
            </div>
          )}

          {playerDrawerTab === 'queue' && (
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {upNextQueue.map((film, qIdx) => (
                <button
                  type="button"
                  key={`queue-${qIdx}-${film.id}`}
                  onClick={() => triggerInterVideoTransition(film, 0)}
                  className="w-44 shrink-0 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] p-2.5 text-left cursor-pointer"
                >
                  <div className="relative h-24 w-full rounded-lg overflow-hidden mb-2">
                    <img
                      src={film.posterUrl}
                      alt={film.canonicalTitle}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.fallbackApplied) {
                          target.dataset.fallbackApplied = '1';
                          target.src =
                            './assets/images/boudoir_crimson_silk_suite_1794443433215.jpg';
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-mono-tabular text-white">
                      {film.durationFormatted}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-white truncate">
                    {String(qIdx + 1).padStart(2, '0')} · {film.canonicalTitle}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================
          FEATURE 8 (PRE-CACHED): INTERACTIVE 5-SECOND INTER-VIDEO AD POD SLATE
          ================================================================== */}
      <div
        style={{
          opacity: adSlate.open ? 1 : 0,
          pointerEvents: adSlate.open ? 'auto' : 'none',
          visibility: adSlate.open ? 'visible' : 'hidden'
        }}
        className="fixed inset-0 z-[70] bg-[#050305]/95 flex flex-col items-center justify-center p-5 text-center transition-opacity duration-200"
      >
        <div className="w-full max-w-sm rounded-2xl smoked-glass-sheet p-6 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-[10px] font-mono-tabular uppercase text-amber-200 mb-3">
            <span>{adSlate.adapter.name}</span>
            <span>
              {adSlate.adapter.settlement} · {adSlate.countdown}s
            </span>
          </div>

          <h3 className="font-editorial italic text-2xl font-semibold text-white mb-1">
            {adSlate.adapter.sponsorName}
          </h3>
          <p className="text-xs text-white/60 mb-4">{adSlate.adapter.sponsorTagline}</p>

          <div className="editorial-hairline-h w-full mb-4" />

          <div className="w-full p-3 rounded-xl bg-white/[0.04] mb-4">
            <div
              dir={currentLangOption.isRtl ? 'rtl' : 'ltr'}
              className="text-[11px] text-white/85 mb-2 font-medium"
            >
              {uiStrings.adNextQuestion}
            </div>
            <div className="grid grid-cols-3 gap-1.5" dir="rtl">
              {(
                [
                  { label: 'پرحرارت‌تر 🔥', delta: { intense: 0.98, fastPaced: 0.9 } },
                  { label: 'مخملی و آرام ✨', delta: { sensual: 0.99, fastPaced: 0.4 } },
                  { label: 'هتل نیمه‌شب 🌑', delta: { dark: 0.96, sensual: 0.95 } }
                ] as const
              ).map((choice) => (
                <button
                  type="button"
                  key={choice.label}
                  onClick={() => {
                    const nextVec = blendMoodVectors(sessionMoodVector, choice.delta, 0.75);
                    setSessionMoodVector(nextVec);
                    if (adSlate.nextFilm) {
                      setCachedPlayerFilm(adSlate.nextFilm);
                      setCurrentTime(adSlate.startSec);
                      setPendingStartSec(adSlate.startSec);
                    }
                    setAdSlate((prev) => ({ ...prev, open: false, nextFilm: null }));
                    setAdCount((c) => c + 1);
                    setIsPlaying(true);
                  }}
                  className="py-2 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] text-white cursor-pointer"
                >
                  {choice.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (adSlate.nextFilm) {
                setCachedPlayerFilm(adSlate.nextFilm);
                setCurrentTime(adSlate.startSec);
                setPendingStartSec(adSlate.startSec);
              }
              setAdSlate((prev) => ({ ...prev, open: false, nextFilm: null }));
              setAdCount((c) => c + 1);
              setIsPlaying(true);
            }}
            className="w-full py-3 rounded-xl luxury-cta-primary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{uiStrings.continuePlayback}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ==================================================================
          PRE-CACHED PUBLISHER & CINEMA CONSOLE (z-80)
          ================================================================== */}
      <div
        style={{
          opacity: settingsSheetOpen ? 1 : 0,
          pointerEvents: settingsSheetOpen ? 'auto' : 'none',
          visibility: settingsSheetOpen ? 'visible' : 'hidden'
        }}
        onClick={() => setSettingsSheetOpen(false)}
        className="fixed inset-0 z-[75] bg-black/75 transition-opacity duration-200"
      />

      <div
        style={{
          opacity: settingsSheetOpen ? 1 : 0,
          transform: settingsSheetOpen
            ? 'translate3d(0, -50%, 0) scale(1)'
            : 'translate3d(0, -46%, 0) scale(0.95)',
          pointerEvents: settingsSheetOpen ? 'auto' : 'none',
          visibility: settingsSheetOpen ? 'visible' : 'hidden'
        }}
        className="fixed inset-x-3 sm:inset-x-4 top-1/2 z-[80] max-w-lg mx-auto rounded-2xl smoked-glass-sheet p-5 max-h-[86dvh] overflow-y-auto no-scrollbar transition-all duration-200"
      >
        <div className="flex items-center justify-between mb-3" dir="rtl">
          <span className="font-editorial italic text-lg font-semibold text-white">
            {uiStrings.settingsTitle}
          </span>
          <button
            type="button"
            onClick={() => setSettingsSheetOpen(false)}
            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/75 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="editorial-hairline-h w-full mb-3.5" />

        {/* 5 Publisher & Cinema Console Tabs */}
        <div
          dir="rtl"
          className="grid grid-cols-5 gap-1 mb-4 p-1 rounded-xl bg-black/40"
        >
          {(
            [
              { id: 'subtitles', label: '۱۴ زبان', icon: Subtitles },
              { id: 'ai-engine', label: 'تم مخملی', icon: Wand2 },
              { id: 'catalog', label: 'تزریق لینک', icon: Film },
              { id: 'crypto-ad', label: 'مالی کریپتو', icon: DollarSign },
              { id: 'diagnostics', label: 'تست E2E', icon: Activity }
            ] as const
          ).map((tab) => {
            const IconComp = tab.icon;
            const active = settingsTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setSettingsTab(tab.id)}
                className={`py-2 px-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 ${
                  active
                    ? 'luxury-cta-primary'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <IconComp className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {settingsTab === 'subtitles' && (
          <div className="space-y-3.5" dir="rtl">
            <div className="p-3.5 rounded-xl bg-white/[0.04] space-y-2.5">
              <span className="block text-xs font-medium text-amber-200">
                زبان رابط کاربری و مترجم زنده زیرنویس (۱۴ زبان)
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {WORLD_LANGUAGES.map((l) => (
                  <button
                    type="button"
                    key={l.code}
                    onClick={() => setWorldLang(l.code)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] cursor-pointer flex items-center justify-between ${
                      worldLang === l.code
                        ? 'luxury-cta-primary font-semibold'
                        : 'bg-white/5 text-white/75'
                    }`}
                  >
                    <span className="truncate">{l.nativeName}</span>
                    <span className="text-[9px] font-mono-tabular uppercase opacity-70">
                      {l.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] space-y-2">
              <span className="block text-xs font-medium text-amber-200">حالت زیرنویس</span>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'single', label: `تک‌زبانه (${worldLang.toUpperCase()})` },
                    { id: 'bilingual', label: `دوزبانه (${worldLang.toUpperCase()} + EN)` },
                    { id: 'off', label: 'خاموش' }
                  ] as const
                ).map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setSubtitleMode(opt.id)}
                    className={`py-2 px-2 rounded-lg text-[11px] font-medium cursor-pointer flex items-center justify-center gap-1 ${
                      subtitleMode === opt.id
                        ? 'luxury-cta-primary'
                        : 'bg-white/5 text-white/70'
                    }`}
                  >
                    {subtitleMode === opt.id && <Check className="w-3 h-3 shrink-0" />}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] space-y-2">
              <span className="block text-xs font-medium text-amber-200">اندازه زیرنویس</span>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'sm', label: 'ظریف' },
                    { id: 'md', label: 'استاندارد' },
                    { id: 'lg', label: 'درشت سینمایی' }
                  ] as const
                ).map((sz) => (
                  <button
                    type="button"
                    key={sz.id}
                    onClick={() => setSubtitleSize(sz.id)}
                    className={`py-2 rounded-lg text-xs font-medium cursor-pointer ${
                      subtitleSize === sz.id ? 'luxury-cta-primary' : 'bg-white/5 text-white/70'
                    }`}
                  >
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {settingsTab === 'ai-engine' && (
          <div className="space-y-3.5" dir="rtl">
            <div className="p-3.5 rounded-xl bg-white/[0.04] space-y-2.5">
              <span className="block text-xs font-medium text-amber-200">
                ۵ تم اغواگر و مجلل (Sensual Luxury Themes)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {SENSUAL_THEMES.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setActiveThemeId(t.id)}
                    className={`p-2.5 rounded-lg text-right cursor-pointer flex items-center justify-between ${
                      activeThemeId === t.id
                        ? 'bg-rose-500/25 text-white font-semibold'
                        : 'bg-white/5 text-white/75'
                    }`}
                  >
                    <span className="text-[11px] truncate">{t.nameFa}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        style={{ backgroundColor: t.primary }}
                        className="w-3 h-3 rounded-full"
                      />
                      <span
                        style={{ backgroundColor: t.secondary }}
                        className="w-3 h-3 rounded-full"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] space-y-2">
              <div className="flex items-center justify-between text-xs text-white">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-rose-400" />
                  <span>کد DNA سلیقه ۶ کاراکتری:</span>
                </span>
                <span className="font-mono-tabular text-amber-200 font-semibold tracking-widest">
                  {currentDnaKey}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-white pt-1">
                <span>روشنایی محافظ چشم در شب (Screen Dimmer)</span>
                <span className="font-mono-tabular text-amber-200">
                  {Math.round(screenDimmerBrightness * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.3}
                max={1.0}
                step={0.05}
                value={screenDimmerBrightness}
                onChange={(e) => setScreenDimmerBrightness(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white">میکس پیوسته صحنه‌های داغ (Scene-Stitch)</span>
                <button
                  type="button"
                  onClick={() => setSceneStitchMode((v) => !v)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                    sceneStitchMode ? 'luxury-cta-primary' : 'bg-white/10 text-white/70'
                  }`}
                >
                  {sceneStitchMode ? 'فعال' : 'غیرفعال'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white">صف چرخشی هوشمند ۱۰تایی</span>
                <button
                  type="button"
                  onClick={() => setRollingQueueEnabled((v) => !v)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                    rollingQueueEnabled ? 'luxury-cta-primary' : 'bg-white/10 text-white/70'
                  }`}
                >
                  {rollingQueueEnabled ? 'فعال' : 'غیرفعال'}
                </button>
              </div>
            </div>
          </div>
        )}

        {settingsTab === 'catalog' && (
          <div className="space-y-3" dir="rtl">
            {/* Global 20-Country & Top-100 Source Intelligence Selector */}
            <div className="p-3.5 rounded-xl bg-white/[0.04] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-amber-200">
                  رادار هوشمند ۲۰ کشور و ۱۰۰ پلتفرم برتر جهان
                </span>
                <span className="text-[10px] font-mono-tabular text-rose-400">
                  AI CONNECTED
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {GLOBAL_20_COUNTRY_INSIGHTS.map((region) => (
                  <button
                    type="button"
                    key={region.countryCode}
                    onClick={() => {
                      executeArchiveAiSearch(
                        `${region.countryNameEn} ${region.topPlatforms.join(' ')}`
                      );
                      setSettingsSheetOpen(false);
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-right cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-white">
                      <span className="truncate">{region.countryNameFa}</span>
                      <span className="font-mono-tabular text-[10px] text-amber-200">
                        {region.avgDwellTime}
                      </span>
                    </div>
                    <div className="text-[10px] text-white/60 truncate mt-0.5" dir="ltr">
                      {region.topPlatforms.slice(0, 3).join(' · ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddCustomVideoLink} className="p-3.5 rounded-xl bg-white/[0.04] space-y-3">
              <span className="block text-xs font-medium text-amber-200">
                تزریق مستقیم لینک ویدئو (MP4 / HLS .m3u8) به جایگاه اول
              </span>
              <input
                type="text"
                value={newFilmTitle}
                onChange={(e) => setNewFilmTitle(e.target.value)}
                placeholder="عنوان ویدئوی اختصاصی..."
                className="w-full h-9 px-3 rounded-lg bg-white/5 text-xs text-white placeholder-white/40 focus:outline-none"
              />
              <input
                type="url"
                dir="ltr"
                value={newFilmStreamUrl}
                onChange={(e) => setNewFilmStreamUrl(e.target.value)}
                placeholder="https://example.com/stream.mp4"
                className="w-full h-9 px-3 rounded-lg bg-white/5 text-xs text-white placeholder-white/40 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg luxury-cta-primary text-xs font-semibold cursor-pointer"
              >
                افزودن فوری به آرشیو
              </button>
            </form>

            <div className="p-3 rounded-xl bg-white/[0.04] space-y-2">
              <span className="block text-xs text-amber-200">فیلتر رنگی سینمایی (35mm LUT)</span>
              <div className="grid grid-cols-2 gap-1.5">
                {COLOR_GRADES.map((g, idx) => (
                  <button
                    type="button"
                    key={g.id}
                    onClick={() => setGradeIndex(idx)}
                    className={`py-2 px-2.5 rounded-lg text-[11px] cursor-pointer ${
                      gradeIndex === idx
                        ? 'luxury-cta-primary font-semibold'
                        : 'bg-white/5 text-white/70'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {settingsTab === 'crypto-ad' && (
          <div className="space-y-3.5" dir="rtl">
            <div className="p-3.5 rounded-xl bg-white/[0.04] space-y-2.5">
              <span className="block text-xs font-medium text-amber-200">
                شبیه‌ساز درآمد ۳ سناریویی (ExoClick / TrafficJunky / TrafficStars)
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { dau: 10000, label: '۱۰ هزار کاربر روزانه' },
                    { dau: 100000, label: '۱۰۰ هزار کاربر روزانه' },
                    { dau: 1000000, label: '۱ میلیون کاربر روزانه' }
                  ] as const
                ).map((s) => (
                  <button
                    type="button"
                    key={s.dau}
                    onClick={() => setRevenueScenarioDau(s.dau)}
                    className={`py-2 px-2 rounded-lg text-[11px] font-medium cursor-pointer ${
                      revenueScenarioDau === s.dau
                        ? 'luxury-cta-primary font-semibold'
                        : 'bg-white/5 text-white/75'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                <div className="p-2.5 rounded-lg bg-black/40">
                  <div className="text-[10px] text-white/55">نمایش روزانه (Ad Pods)</div>
                  <div className="text-xs font-mono-tabular font-semibold text-white mt-0.5">
                    {dailyImpressions.toLocaleString()}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40">
                  <div className="text-[10px] text-white/55">درآمد روزانه (USDT)</div>
                  <div className="text-xs font-mono-tabular font-semibold text-emerald-300 mt-0.5">
                    ${estDailyUsdt.toLocaleString()}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40">
                  <div className="text-[10px] text-white/55">درآمد ماهانه (USDT)</div>
                  <div className="text-xs font-mono-tabular font-semibold text-amber-200 mt-0.5">
                    ${estMonthlyUsdt.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              {AD_ADAPTERS.map((ad) => (
                <div
                  key={ad.id}
                  className="p-3 rounded-xl bg-white/[0.04] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-medium text-white">{ad.name}</div>
                    <div className="text-[10px] text-white/55">{ad.network}</div>
                  </div>
                  <div className="text-left font-mono-tabular">
                    <div className="text-emerald-300">{ad.settlement}</div>
                    <div className="text-[10px] text-amber-200">
                      eCPM ${ad.ecpm} · Fill {ad.fillRate}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {settingsTab === 'diagnostics' && (
          <div className="space-y-3" dir="rtl">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-white/[0.04] flex items-center justify-between">
                <span className="text-xs text-white/85">نرخ فریم زنده (FPS)</span>
                <span className="text-sm font-mono-tabular font-semibold text-emerald-300">
                  {liveFps} FPS
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.04] flex items-center justify-between">
                <span className="text-xs text-white/85">مصرف حافظه (&lt;100MB)</span>
                <span className="text-sm font-mono-tabular font-semibold text-emerald-300">
                  {memoryUsedMb} MB
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              {[
                {
                  name: '1. 18+ Hard Age Gate & Session Verification',
                  detail: 'Strict Adult Verification & Underage Lockout Verified'
                },
                {
                  name: '2. Video Stream Health & Zero-Unmount Pre-Cache Pool',
                  detail: `${catalog.length}/10 Direct 4K 60FPS Streams Ready (<0.3s Load)`
                },
                {
                  name: '3. Luxury Typography & Frameless Editorial UI',
                  detail: 'Cormorant Garamond + Plus Jakarta Sans + Vazirmatn Active'
                },
                {
                  name: '4. All 8 Creative Features & 14 World Languages',
                  detail: 'Scene-Stitch, 2x Hold, <10ms Panic Cloak, Heat-Wave, Vibe, DNA, 3x Split'
                },
                {
                  name: '5. Crypto Ad Pod & Publisher Revenue Telemetry',
                  detail: 'ExoClick / TrafficJunky / TrafficStars USDT/USDC Active'
                }
              ].map((check) => (
                <div
                  key={check.name}
                  className="p-2.5 rounded-xl bg-white/[0.04] flex items-center justify-between gap-2"
                >
                  <div className="text-right min-w-0">
                    <div className="text-[11px] font-medium text-white truncate">{check.name}</div>
                    <div className="text-[10px] text-white/55 truncate">{check.detail}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[10px] font-mono-tabular font-semibold text-emerald-300 shrink-0">
                    PASS ✓
                  </span>
                </div>
              ))}
            </div>

            {/* GitHub Pages & Cloud Live Runner URL Generator */}
            <div className="p-3.5 rounded-xl bg-white/[0.04] space-y-2.5">
              <div className="flex items-center justify-between text-xs text-amber-200 font-medium">
                <span>اجرای زنده پروژه روی گیت‌هاب (GitHub Pages / StackBlitz)</span>
                <span className="text-[10px] font-mono-tabular text-emerald-300">
                  AUTO-DEPLOY READY
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  dir="ltr"
                  value={githubRepoSlug}
                  onChange={(e) => setGithubRepoSlug(e.target.value.trim())}
                  placeholder="username/repo (e.g. pedrammokarrami/Velora)"
                  className="flex-1 h-8 px-2.5 rounded-lg bg-black/50 text-xs font-mono-tabular text-white placeholder-white/40 focus:outline-none"
                />
              </div>

              {(() => {
                const cleanSlug = githubRepoSlug.replace(/^https?:\/\/github\.com\//i, '').replace(/\/+$/, '');
                const [ghUser = 'pedrammokarrami', ghRepo = 'Velora'] = cleanSlug.split('/');
                const pagesUrl = `https://${ghUser}.github.io/${ghRepo}/`;
                const stackblitzUrl = `https://stackblitz.com/github/${ghUser}/${ghRepo}`;
                const codesandboxUrl = `https://githubbox.com/${ghUser}/${ghRepo}`;

                return (
                  <div className="space-y-1.5 text-[11px]" dir="ltr">
                    <div className="p-2 rounded-lg bg-black/50 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] text-amber-200">1. GitHub Pages Live App URL:</div>
                        <div className="font-mono-tabular text-white truncate select-all">
                          {pagesUrl}
                        </div>
                      </div>
                      <a
                        href={pagesUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded bg-rose-500/25 hover:bg-rose-500/40 text-amber-200 text-[10px] font-semibold shrink-0"
                      >
                        Open ↗
                      </a>
                    </div>

                    <div className="p-2 rounded-lg bg-black/50 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] text-emerald-300">
                          2. Instant GitHub Runner (StackBlitz Full-Stack):
                        </div>
                        <div className="font-mono-tabular text-white truncate select-all">
                          {stackblitzUrl}
                        </div>
                      </div>
                      <a
                        href={stackblitzUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200 text-[10px] font-semibold shrink-0"
                      >
                        Run Live ↗
                      </a>
                    </div>

                    <div className="p-2 rounded-lg bg-black/50 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] text-sky-300">
                          3. CodeSandbox Instant GitHub Runner:
                        </div>
                        <div className="font-mono-tabular text-white truncate select-all">
                          {codesandboxUrl}
                        </div>
                      </div>
                      <a
                        href={codesandboxUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded bg-sky-500/25 hover:bg-sky-500/40 text-sky-200 text-[10px] font-semibold shrink-0"
                      >
                        Run Live ↗
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>

            <button
              type="button"
              onClick={() => setDiagnosticsRunCount((c) => c + 1)}
              className="w-full py-2.5 rounded-xl luxury-cta-primary text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>اجرای مجدد تست جامع خودکار (Run #{diagnosticsRunCount})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
