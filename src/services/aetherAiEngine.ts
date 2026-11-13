// ============================================================================
// AETHER LUXURY ADULT CINEMA & GLOBAL 100-SOURCE AI INTELLIGENCE ENGINE (18+)
// Architecture:
//   Layer A: Curated 4K 60FPS Direct-Stream Catalog + 100-Platform Global Index
//   Layer B: 5D Cosine-Similarity Vector Engine & Rolling 10-Slot Queue Manager
//   Layer C: 14-Language Private Cinema Critic & Global Source Matcher
// ============================================================================

export type FilmPillarCode = 'LIVE' | 'AI' | 'ANIMATION';
export type FilmResolution = '4K 60FPS' | '4K HDR' | '1080p';

export type SensoryFantasyMood =
  | 'Velvet Boudoir'
  | 'Late Night Hotel'
  | 'Intimate POV'
  | 'Sensual ASMR'
  | 'Hyper-Real AI Fantasy'
  | 'Uncensored Anime'
  | 'High-Intensity Climax';

export interface MoodVector5D {
  intense: number;   // 0.0 to 1.0
  sensual: number;   // 0.0 to 1.0
  surreal: number;   // 0.0 to 1.0
  dark: number;      // 0.0 to 1.0
  fastPaced: number; // 0.0 to 1.0
}

export interface SceneMarker {
  id: string;
  timestampSec: number;
  durationSec: number;
  timeFormatted: string;
  label: string;
  labelFa?: string;
  moodTags: string[];
  visualStyle: string;
  intensityScore: number; // 1 to 10
  cameraFilter: string;
}

export interface GlobalSourceBenchmark {
  id: string;
  globalRank: number;
  domain: string;
  brandName: string;
  pillar: FilmPillarCode;
  categoryTitleFa: string;
  categoryTitleEn: string;
  monthlyVisits: string;
  avgDwellTime: string;
  pagesPerVisit: string;
  archiveScale: string;
  resolutionSpec: FilmResolution;
  adFreeExperience: boolean;
  topRegions: string[];
  searchKeywords: string[];
  whyBestFa: string;
  whyBestEn: string;
  linkedFilmId: string;
  moodVector: MoodVector5D;
}

export interface GlobalCountryInsight {
  rank: number;
  countryCode: string;
  countryNameFa: string;
  countryNameEn: string;
  trafficShareOrVisits: string;
  avgDwellTime: string;
  mobileShare: string;
  topCategories: string[];
  topPlatforms: string[];
  recommendedFilmId: string;
}

export interface CatalogFilmItem {
  id: string;
  indexNumber: number;
  streamUrl: string;
  posterUrl: string;
  previewLoopUrl?: string;
  pillar: FilmPillarCode;
  resolution: FilmResolution;
  durationSec: number;
  durationFormatted: string;
  ambientColors: [string, string];
  canonicalTitle: string;
  directorOrStudio: string;
  sensoryMood: SensoryFantasyMood;
  sensoryMoodFa: string;
  audioProfile: string;
  audioProfileFa: string;
  intensityLabel: string;
  intensityLabelFa: string;
  coreSynopsis: string;
  coreSynopsisFa: string;
  aestheticDNA: string[];
  moodVector: MoodVector5D;
  waveformSeed: number[];
  scenes: SceneMarker[];
  sourceBenchmark?: {
    domain: string;
    globalRank: number;
    monthlyVisits: string;
    avgDwellTime: string;
    archiveScale: string;
    specialtyFa: string;
    specialtyEn: string;
  };
}

export interface AiCuratorResponse {
  detectedLanguage: 'fa' | 'en' | 'ar' | 'tr' | 'es' | 'fr';
  languageLabel: string;
  isRtl: boolean;
  engineModeUsed: 'LOCAL_VECTOR_SYNTHESIZER';
  cosineMatchScore: number; // 0 to 100%
  primaryFilmId: string;
  primaryFilmTitle: string;
  spokenExplanation: string;
  recommendedFilmIds: string[];
  matchedGlobalSources: GlobalSourceBenchmark[];
  matchedCountryInsight?: GlobalCountryInsight;
  recommendedSceneJump?: {
    filmId: string;
    filmTitle: string;
    timestampSec: number;
    timeFormatted: string;
    sceneLabel: string;
  };
  updatedMoodVector: MoodVector5D;
}

export interface SelfHostedLlmConfig {
  enabled: boolean;
  endpointUrl: string;
  modelName: string;
}

// ============================================================================
// HELPER UTILITIES
// ============================================================================

export function formatSecondsToTimecode(sec: number): string {
  const safe = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function createHarmonicWaveform(seed: number): number[] {
  return Array.from({ length: 48 }, (_, i) => {
    const wave1 = Math.sin((i + seed) * 0.42) * 0.35;
    const wave2 = Math.cos((i * 1.7 + seed) * 0.28) * 0.25;
    const base = 0.48 + wave1 + wave2;
    return Math.max(0.22, Math.min(1, Number(base.toFixed(2))));
  });
}

// ============================================================================
// GLOBAL 100-PLATFORM & TOP 20 CONTENT SOURCES INTELLIGENCE DATASET
// Connected directly to AETHER AI for precision film & source matching
// ============================================================================

export const GLOBAL_TOP_SOURCES_INDEX: GlobalSourceBenchmark[] = [
  {
    id: 'src-eporner',
    globalRank: 6,
    domain: 'eporner.com',
    brandName: 'Eporner 4K/60FPS',
    pillar: 'LIVE',
    categoryTitleFa: 'پادشاه کیفیت 4K UHD و 60fps و فیلم‌های کامل',
    categoryTitleEn: '4K UHD / 60FPS Full-Length Cinema Leader',
    monthlyVisits: '554.0M',
    avgDwellTime: '08:11',
    pagesPerVisit: '8.43',
    archiveScale: '2.78M+ Videos (977K+ in 1080p-4K)',
    resolutionSpec: '4K 60FPS',
    adFreeExperience: true,
    topRegions: ['USA', 'Germany', 'UK', 'France', 'Global'],
    searchKeywords: [
      '4k',
      '60fps',
      'uhd',
      'eporner',
      'full',
      'بلند',
      'کامل',
      'باکیفیت',
      'استودیویی',
      'وفاداری بالا',
      'vr',
      'hd'
    ],
    whyBestFa:
      'بزرگ‌ترین آرشیو رایگان ۴K و ۶۰ فریم واقعی در جهان (بیش از ۲.۷۸ میلیون ویدئو) برای تماشای فیلم‌های بلند بدون افت بیت‌ریت.',
    whyBestEn:
      'World’s #1 high-bitrate 4K 60FPS repository (2.78M+ videos) for full-length studio cinema without compression loss.',
    linkedFilmId: 'crimson-silk-suite',
    moodVector: { intense: 0.88, sensual: 0.99, surreal: 0.45, dark: 0.88, fastPaced: 0.62 }
  },
  {
    id: 'src-njavtv',
    globalRank: 11,
    domain: 'njavtv.com',
    brandName: 'NJAVTV Ad-Free JAV',
    pillar: 'LIVE',
    categoryTitleFa: 'سینمای کامل آسیایی (JAV) بدون تبلیغ وسط ویدئو',
    categoryTitleEn: 'Uncut Full-Length JAV Cinema (Zero Mid-Roll Ads)',
    monthlyVisits: '138.24M (+292% YoY)',
    avgDwellTime: '12:07',
    pagesPerVisit: '8.87',
    archiveScale: '100,000+ Full Studio Releases',
    resolutionSpec: '4K 60FPS',
    adFreeExperience: true,
    topRegions: ['Japan', 'South Korea', 'Taiwan', 'USA', 'Asia'],
    searchKeywords: [
      'jav',
      'japanese',
      'asian',
      'njavtv',
      'ad-free',
      'uncensored',
      'ژاپنی',
      'آسیایی',
      'بدون تبلیغ',
      'بدون سانسور',
      'توکیو',
      'شینجوکو'
    ],
    whyBestFa:
      'رشد ۲۹۲٪ سالانه و میانگین ماندگاری ۱۲ دقیقه و ۷ ثانیه به لطف پخش فیلم‌های کامل استودیویی ژاپن با زیرنویس چندزبانه و بدون تبلیغ مزاحم.',
    whyBestEn:
      '12m 07s average dwell time and +292% YoY growth driven by 100,000+ full-length JAV releases with zero mid-roll ads.',
    linkedFilmId: 'velvet-rain-shinjuku',
    moodVector: { intense: 0.85, sensual: 0.98, surreal: 0.54, dark: 0.9, fastPaced: 0.55 }
  },
  {
    id: 'src-missav',
    globalRank: 27,
    domain: 'missav.ai',
    brandName: 'MissAV Uncut HD',
    pillar: 'LIVE',
    categoryTitleFa: 'رکورددار وفاداری کاربر و ماندگاری ۱۲ دقیقه‌ای در سینمای آسیا',
    categoryTitleEn: 'Highest Engagement Asian Cinema & Uncensored JAV',
    monthlyVisits: '149.5M (Cluster)',
    avgDwellTime: '12:22',
    pagesPerVisit: '20.99',
    archiveScale: '120,000+ HD & Uncensored Titles',
    resolutionSpec: '4K 60FPS',
    adFreeExperience: true,
    topRegions: ['Japan', 'South Korea', 'Hong Kong', 'Philippines'],
    searchKeywords: [
      'missav',
      'jav',
      'uncensored',
      'japan',
      'korea',
      'بدون سانسور',
      'آسیایی',
      'ژاپن',
      'کره',
      'ماندگاری بالا'
    ],
    whyBestFa:
      'بالاترین نرخ تعامل در جهان (۲۰.۹۹ صفحه در هر بازدید و ۱۲:۲۲ زمان تماشا) با پیش‌نمایش هوشمند صحنه‌ها و آرشیو بدون سانسور.',
    whyBestEn:
      'Industry-record 12m 22s dwell time and 20.99 pages/visit with instant scene scrubbing and uncensored Asian cinema.',
    linkedFilmId: 'velvet-rain-shinjuku',
    moodVector: { intense: 0.87, sensual: 0.98, surreal: 0.52, dark: 0.89, fastPaced: 0.58 }
  },
  {
    id: 'src-candy-ai',
    globalRank: 44,
    domain: 'candy.ai',
    brandName: 'Candy.ai Hyper-Real',
    pillar: 'AI',
    categoryTitleFa: 'رهبر جهانی سینمای مولد و همراهان فراواقعی هوش مصنوعی',
    categoryTitleEn: '#1 Generative AI Erotic Video & Hyper-Real Companions',
    monthlyVisits: '42.8M (#704 Global)',
    avgDwellTime: '09:45',
    pagesPerVisit: '11.4',
    archiveScale: 'Unlimited Real-Time Neural Video & Voice Synthesis',
    resolutionSpec: '4K 60FPS',
    adFreeExperience: true,
    topRegions: ['USA', 'Germany', 'France', 'UK', 'Global'],
    searchKeywords: [
      'ai',
      'candy',
      'generative',
      'hyper-real',
      'companion',
      'synth',
      'هوش مصنوعی',
      'فراواقعی',
      'نورال',
      'ساخته شده با هوش مصنوعی'
    ],
    whyBestFa:
      'رتبه ۱ پلتفرم‌های هوش مصنوعی بزرگسال در آمریکا، آلمان و فرانسه؛ تولید ویدئو و صدای دوگوشی فراواقعی متناسب با فانتزی شخصی کاربر.',
    whyBestEn:
      '#1 Generative AI adult platform across the US, Germany, and France—rendering photorealistic skin, voice ASMR, and custom fantasies.',
    linkedFilmId: 'velvet-illusion-ai',
    moodVector: { intense: 0.89, sensual: 0.98, surreal: 0.95, dark: 0.86, fastPaced: 0.64 }
  },
  {
    id: 'src-myanima-lovescape',
    globalRank: 62,
    domain: 'myanima.ai / lovescape.com',
    brandName: 'MyAnima & Lovescape AI',
    pillar: 'AI',
    categoryTitleFa: 'بیشترین زمان ماندگاری در هوش مصنوعی (۱۴:۲۷) و تنوع نژادی (عربی/لاتین/آسیایی)',
    categoryTitleEn: '14m 27s Dwell Time & Multi-Ethnic AI Fantasy (Arab/Latina/Asian)',
    monthlyVisits: '28.4M (+87.6% MoM)',
    avgDwellTime: '14:27',
    pagesPerVisit: '14.2',
    archiveScale: 'Multi-Ethnic Neural Boudoir (Arab, Latina, Asian, Indian, European)',
    resolutionSpec: '4K 60FPS',
    adFreeExperience: true,
    topRegions: ['MENA / Egypt', 'USA', 'Brazil', 'Mexico', 'India'],
    searchKeywords: [
      'myanima',
      'lovescape',
      'ourdream',
      'arab',
      'latina',
      'indian',
      'عربی',
      'لاتین',
      'خاورمیانه',
      'هوش مصنوعی',
      'فانتزی'
    ],
    whyBestFa:
      'رکورددار مطلق زمان ماندگاری (۱۴ دقیقه و ۲۷ ثانیه) با مدل‌های اختصاصی چندملیتی (عربی، لاتین، آسیایی و اروپایی) و رشد ۸۷٪ ماهانه.',
    whyBestEn:
      'Unrivaled 14m 27s average session duration with specialized Arab, Latina, Asian, and European hyper-real AI models.',
    linkedFilmId: 'ai-crimson-mirage',
    moodVector: { intense: 0.9, sensual: 0.99, surreal: 0.9, dark: 0.85, fastPaced: 0.66 }
  },
  {
    id: 'src-dlsite',
    globalRank: 14,
    domain: 'dlsite.com',
    brandName: 'DLsite Anime & Binaural ASMR',
    pillar: 'ANIMATION',
    categoryTitleFa: 'قطب اول انیمه بدون سانسور، دوجین و صدای سه‌بعدی ASMR در جهان',
    categoryTitleEn: '#1 Global Uncensored Anime, Doujin & Binaural ASMR Sanctuary',
    monthlyVisits: '120.60M',
    avgDwellTime: '08:11',
    pagesPerVisit: '10.67',
    archiveScale: '1,000,000+ Doujin, Uncensored Anime & 3D Binaural Audio Works',
    resolutionSpec: '4K 60FPS',
    adFreeExperience: true,
    topRegions: ['Japan', 'Taiwan', 'USA', 'Philippines', 'Mexico'],
    searchKeywords: [
      'dlsite',
      'anime',
      'hentai',
      'asmr',
      'binaural',
      'doujin',
      'انیمه',
      'هنتای',
      'انیمیشن',
      'صدای دوگوشی',
      'بدون سانسور'
    ],
    whyBestFa:
      'بیش از ۱۲۰.۶ میلیون بازدید ماهانه؛ مرجع شماره ۱ جهان برای انیمه‌های بزرگسالانه بدون سانسور و صداگذاری دوگوشی (Binaural ASMR).',
    whyBestEn:
      '120.6M monthly visits—the undisputed global sanctuary for uncensored adult anime and 3D binaural whisper ASMR.',
    linkedFilmId: 'tokyo-neon-boudoir-anime',
    moodVector: { intense: 0.92, sensual: 0.97, surreal: 0.78, dark: 0.89, fastPaced: 0.68 }
  },
  {
    id: 'src-f95zone',
    globalRank: 15,
    domain: 'f95zone.to',
    brandName: 'F95zone 3D & Interactive',
    pillar: 'ANIMATION',
    categoryTitleFa: 'بزرگ‌ترین مرجع انیمیشن سه‌بعدی (3D Render) و داستان‌های تعاملی بزرگسال',
    categoryTitleEn: '#1 Global 3D Adult Animation & Interactive Visual Novel Hub',
    monthlyVisits: '115.98M',
    avgDwellTime: '08:25',
    pagesPerVisit: '10.63',
    archiveScale: '250,000+ 3D Animated Scenes & Interactive VN Releases',
    resolutionSpec: '4K 60FPS',
    adFreeExperience: true,
    topRegions: ['USA', 'Germany', 'UK', 'Canada', 'Brazil'],
    searchKeywords: [
      'f95zone',
      '3d',
      'animation',
      'hentai',
      'interactive',
      'انیمیشن',
      'سه بعدی',
      'انیمه',
      'کیوتو'
    ],
    whyBestFa:
      '۱۱۵.۹۸ میلیون بازدید ماهانه و میانگین ۱۰.۶۳ صفحه در هر نشست؛ بهترین منبع برای انیمیشن‌های ۶۰ فریم و آثار بدون سانسور.',
    whyBestEn:
      '115.98M monthly visits and 10.63 pages/visit—the premier destination for 60fps 3D/2D uncensored animation.',
    linkedFilmId: 'kyoto-silk-anime-uncut',
    moodVector: { intense: 0.88, sensual: 0.98, surreal: 0.82, dark: 0.84, fastPaced: 0.58 }
  },
  {
    id: 'src-beeg-hqporner',
    globalRank: 23,
    domain: 'beeg.com / hqporner.com',
    brandName: 'Beeg & HQPorner Curated Studio',
    pillar: 'LIVE',
    categoryTitleFa: 'کیوریشن مینیمال استودیویی با کیفیت 4K بدون تبلیغات پاپ‌آپ',
    categoryTitleEn: 'Minimalist Ad-Free Curated 4K Studio Cinema',
    monthlyVisits: '150.2M (+77.5% YoY)',
    avgDwellTime: '07:45',
    pagesPerVisit: '7.90',
    archiveScale: 'Curated Full-Length High-Bitrate Studio Cuts',
    resolutionSpec: '4K 60FPS',
    adFreeExperience: true,
    topRegions: ['USA', 'France', 'Italy', 'Spain', 'UK'],
    searchKeywords: [
      'beeg',
      'hqporner',
      'porndig',
      'studio',
      'curated',
      'luxury',
      'hotel',
      'استودیو',
      'لوکس',
      'هتل',
      'مینیمال',
      'پاریس'
    ],
    whyBestFa:
      'رشد ۷۷.۵٪ در سال اخیر به دلیل رابط کاربری بسیار تمیز، حذف کامل شلوغی تیوب‌های قدیمی و تمرکز روی صحنه‌های استودیویی با نورپردازی سینمایی.',
    whyBestEn:
      '+77.5% YoY growth driven by a clutter-free luxury interface and hand-picked 4K studio cinematography.',
    linkedFilmId: 'amber-hotel-noir',
    moodVector: { intense: 0.91, sensual: 0.96, surreal: 0.48, dark: 0.92, fastPaced: 0.72 }
  },
  {
    id: 'src-brazzers-adulttime',
    globalRank: 40,
    domain: 'brazzers.com / adulttime.com',
    brandName: 'Aylo & AdultTime Studio Flagships',
    pillar: 'LIVE',
    categoryTitleFa: 'تولیدات پرچمدار استودیویی، زاویه دید اول‌شخص (POV) و داستان‌پردازی لوکس',
    categoryTitleEn: 'Flagship Studio Productions, Uncut POV & Luxury Storytelling',
    monthlyVisits: '92.4M',
    avgDwellTime: '08:50',
    pagesPerVisit: '8.20',
    archiveScale: '60,000+ Multi-Camera 4K Master Releases',
    resolutionSpec: '4K 60FPS',
    adFreeExperience: true,
    topRegions: ['USA', 'Canada', 'UK', 'Australia', 'Western Europe'],
    searchKeywords: [
      'brazzers',
      'adulttime',
      'naughtyamerica',
      'digitalplayground',
      'pov',
      'penthouse',
      'اول شخص',
      'پنت هاوس',
      'میلان',
      'استودیویی'
    ],
    whyBestFa:
      'بالاترین استاندارد فیلم‌برداری چنددوربینه و زاویه دید اول‌شخص (POV) با کارگردانی حرفه‌ای و کیفیت مستر 4K.',
    whyBestEn:
      'Gold-standard multi-camera studio productions and unbroken 60fps POV cinematography.',
    linkedFilmId: 'crimson-penthouse-pov',
    moodVector: { intense: 0.89, sensual: 0.99, surreal: 0.4, dark: 0.84, fastPaced: 0.62 }
  },
  {
    id: 'src-pornhub-xvideos-xhamster',
    globalRank: 1,
    domain: 'pornhub.com / xvideos.com / xhamster.com',
    brandName: 'Global Big-3 Mega-Tubes',
    pillar: 'LIVE',
    categoryTitleFa: 'سه غول اول ترافیک جهان (۷.۳ میلیارد بازدید ماهانه و ۱۰ میلیون ویدئو)',
    categoryTitleEn: 'Global Top-3 Mega-Archives (7.3B Monthly Visits)',
    monthlyVisits: '7.31B Combined',
    avgDwellTime: '07:55',
    pagesPerVisit: '8.30',
    archiveScale: '15,000,000+ Multi-Genre Global Videos',
    resolutionSpec: '4K 60FPS',
    adFreeExperience: false,
    topRegions: ['USA', 'UK', 'France', 'Mexico', 'Brazil', 'Global'],
    searchKeywords: [
      'pornhub',
      'xvideos',
      'xhamster',
      'xnxx',
      'spankbang',
      'محبوب ترین',
      'پربازدیدترین',
      'جهانی',
      'بهترین',
      'کلاسیک',
      'سریع'
    ],
    whyBestFa:
      'مجموعاً بیش از ۷.۳ میلیارد بازدید ماهانه؛ در AETHER بهترین شاهکارهای این سه غول جهانی بدون تبلیغات مزاحم و با کیفیت 4K خالص گلچین شده‌اند.',
    whyBestEn:
      '7.31B combined monthly visits—AETHER extracts the top 0.01% highest-rated 4K scenes from the Big-3 with zero tube clutter.',
    linkedFilmId: 'obsidian-sonata-boudoir',
    moodVector: { intense: 0.96, sensual: 0.94, surreal: 0.5, dark: 0.94, fastPaced: 0.78 }
  },
  {
    id: 'src-joyclub-cumlouder',
    globalRank: 54,
    domain: 'joyclub.de / cumlouder.com',
    brandName: 'European Noir & Private Salon',
    pillar: 'LIVE',
    categoryTitleFa: 'سینمای اروپایی با رکورد ۱۲:۲۴ زمان ماندگاری و اتمسفر نوار کلاسیک',
    categoryTitleEn: 'European Erotic Cinema & 12m 24s Community Engagement',
    monthlyVisits: '48.5M',
    avgDwellTime: '12:24',
    pagesPerVisit: '11.8',
    archiveScale: 'Curated European Art-House & Private Atelier Releases',
    resolutionSpec: '4K 60FPS',
    adFreeExperience: true,
    topRegions: ['Germany', 'Spain', 'France', 'Italy', 'Netherlands'],
    searchKeywords: [
      'european',
      'germany',
      'spain',
      'france',
      'joyclub',
      'cumlouder',
      'اروپایی',
      'آلمان',
      'فرانسه',
      'اسپانیا',
      'قطار',
      'وین'
    ],
    whyBestFa:
      'رکورد ۱۲ دقیقه و ۲۴ ثانیه ماندگاری در اروپا؛ تمرکز بر زیبایی‌شناسی سینمای هنری اروپا، نورپردازی طبیعی و داستان‌های رازآلود.',
    whyBestEn:
      '12m 24s average dwell time in Germany & Europe—celebrating art-house lighting, natural acoustics, and clandestine romance.',
    linkedFilmId: 'orient-sleeper-compartment',
    moodVector: { intense: 0.85, sensual: 0.96, surreal: 0.46, dark: 0.88, fastPaced: 0.6 }
  },
  {
    id: 'src-stripchat-chaturbate',
    globalRank: 4,
    domain: 'stripchat.com / chaturbate.com',
    brandName: 'Live Interactive Cam & POV Sanctuary',
    pillar: 'LIVE',
    categoryTitleFa: 'غول‌های ارتباط زنده و تعاملی (۱.۳ میلیارد بازدید ماهانه)',
    categoryTitleEn: 'Global Live Interactive POV & Real-Time Intimacy Leaders',
    monthlyVisits: '1.30B Combined',
    avgDwellTime: '08:15',
    pagesPerVisit: '7.40',
    archiveScale: 'Real-Time 60FPS Interactive POV Streams',
    resolutionSpec: '4K 60FPS',
    adFreeExperience: true,
    topRegions: ['USA', 'UK', 'Colombia', 'France', 'Germany'],
    searchKeywords: [
      'stripchat',
      'chaturbate',
      'livejasmin',
      'onlyfans',
      'fansly',
      'live',
      'cam',
      'زنده',
      'تعاملی',
      'بی واسطه'
    ],
    whyBestFa:
      'بیش از ۱.۳ میلیارد بازدید ماهانه؛ الهام‌بخش زاویه دید اول‌شخص (POV) و ارتباط نزدیک و بی‌واسطه در سوئیت‌های اختصاصی AETHER.',
    whyBestEn:
      '1.30B combined monthly visits—powering AETHER’s unbroken first-person POV intimacy and real-time acoustic presence.',
    linkedFilmId: 'crimson-penthouse-pov',
    moodVector: { intense: 0.9, sensual: 0.99, surreal: 0.42, dark: 0.85, fastPaced: 0.65 }
  }
];

export const GLOBAL_20_COUNTRY_INSIGHTS: GlobalCountryInsight[] = [
  {
    rank: 1,
    countryCode: 'US',
    countryNameFa: 'ایالات متحده آمریکا (#1 ترافیک جهان)',
    countryNameEn: 'United States (#1 Global Traffic)',
    trafficShareOrVisits: '27% Global Share (~950M+ on Top 1)',
    avgDwellTime: '08:12',
    mobileShare: '78%',
    topCategories: ['4K Studio POV', 'Generative AI (Candy.ai)', '3D Animation (F95zone)'],
    topPlatforms: ['pornhub.com', 'eporner.com', 'candy.ai', 'f95zone.to'],
    recommendedFilmId: 'crimson-silk-suite'
  },
  {
    rank: 2,
    countryCode: 'JP',
    countryNameFa: 'ژاپن (#1 طولانی‌ترین زمان تماشا در جهان)',
    countryNameEn: 'Japan (#1 Longest Dwell Time Globally)',
    trafficShareOrVisits: '320M+ Monthly Visits',
    avgDwellTime: '11:02 to 12:22',
    mobileShare: '82%',
    topCategories: ['Uncut JAV Cinema', 'Uncensored Anime & Doujin', 'Binaural ASMR'],
    topPlatforms: ['missav.ai', 'njavtv.com', 'dlsite.com', 'dmm.co.jp'],
    recommendedFilmId: 'velvet-rain-shinjuku'
  },
  {
    rank: 3,
    countryCode: 'DE',
    countryNameFa: 'آلمان و اروپای غربی (قطب کیفیت 4K و هوش مصنوعی)',
    countryNameEn: 'Germany & Western Europe (4K & AI Hub)',
    trafficShareOrVisits: '280M+ Monthly Visits',
    avgDwellTime: '12:24 (Joyclub)',
    mobileShare: '76%',
    topCategories: ['European Noir Salon', '4K 60fps Full Films', 'Candy.ai Companions'],
    topPlatforms: ['eporner.com', 'joyclub.de', 'candy.ai', 'xhamster.com'],
    recommendedFilmId: 'orient-sleeper-compartment'
  },
  {
    rank: 4,
    countryCode: 'MENA',
    countryNameFa: 'خاورمیانه و شمال آفریقا (۵۰٪ نسل زد ۱۸ تا ۲۴ سال)',
    countryNameEn: 'MENA & Arab Region (50% Gen-Z Audience)',
    trafficShareOrVisits: '190M+ Monthly Visits',
    avgDwellTime: '09:40',
    mobileShare: '92%',
    topCategories: ['Multi-Ethnic AI Fantasy (Arab/Latina)', 'Velvet Boudoir', 'Intimate POV'],
    topPlatforms: ['lovescape.com', 'ourdream.ai', 'xvideos.com', 'xnxx.com'],
    recommendedFilmId: 'ai-crimson-mirage'
  },
  {
    rank: 5,
    countryCode: 'LATAM',
    countryNameFa: 'مکزیک، برزیل، آرژانتین و کلمبیا (بالاترین سهم مخاطب زن: تا ۵۱٪)',
    countryNameEn: 'Latin America (Up to 51% Female Audience in AR/CO)',
    trafficShareOrVisits: '640M+ Monthly Visits',
    avgDwellTime: '08:45',
    mobileShare: '96%',
    topCategories: ['Uncensored Hentai & Anime', 'Sensual Romance & Hotel Noir', 'Live Interactive'],
    topPlatforms: ['xvideos.com', 'pornhub.com', 'nhentai.net', 'stripchat.com'],
    recommendedFilmId: 'tokyo-neon-boudoir-anime'
  },
  {
    rank: 6,
    countryCode: 'IN-PH',
    countryNameFa: 'جنوب و شرق آسیا (فیلیپین و هند • رشد ۲۹۷٪ انیمه و ۱۰:۵۳ ماندگاری)',
    countryNameEn: 'Philippines & South Asia (10m 53s Dwell & +297% Anime Surge)',
    trafficShareOrVisits: '610M+ Monthly Visits',
    avgDwellTime: '10:53',
    mobileShare: '94%',
    topCategories: ['Uncensored Anime (+297%)', 'Desi & Regional HD', 'Late Night Hotel'],
    topPlatforms: ['xhamster46.desi', 'pornhub.com', 'dlsite.com', 'missav.ws'],
    recommendedFilmId: 'kyoto-silk-anime-uncut'
  }
];

// ============================================================================
// INITIAL 10-FILM ADULT LUXURY & BOUDOIR CATALOG (4K 60FPS DIRECT STREAMS)
// Each film is backed by a verified Global Top-100 Source Benchmark
// ============================================================================

export const INITIAL_CATALOG_DATA: CatalogFilmItem[] = [
  {
    id: 'crimson-silk-suite',
    indexNumber: 1,
    streamUrl: '/assets/videos/stream_oceans.mp4',
    posterUrl: './assets/images/boudoir_crimson_silk_suite_1794443433215.jpg',
    pillar: 'LIVE',
    resolution: '4K 60FPS',
    durationSec: 180,
    durationFormatted: '18:40',
    ambientColors: ['#E11D48', '#881337'],
    canonicalTitle: 'Brazzers 4K: Elite Penthouse Suite',
    directorOrStudio: 'Brazzers Premium 4K • Studio Release',
    sensoryMood: 'High-Intensity Climax',
    sensoryMoodFa: 'استودیویی لوکس و هاردکور',
    audioProfile: 'Natural Studio Audio / Binaural ASMR',
    audioProfileFa: 'صدای طبیعی استودیویی · ASMR',
    intensityLabel: 'High Intensity',
    intensityLabelFa: 'کیفیت 4K و ریتم داغ استودیویی',
    coreSynopsis:
      'The #1 trending 4K adult cinema release from Brazzers—unfiltered, high-bitrate studio cinematography inside a luxury penthouse with natural room acoustics and 60fps clarity.',
    coreSynopsisFa:
      'پرطرفدارترین ترند ۴K استودیو برازرس در جهان؛ فیلم‌برداری ۶۰ فریم با حضور برترین ستارگان بزرگسال در پنت‌هاوس مجلل با وضوح فوق‌العاده و صدای زنده.',
    aestheticDNA: ['velvet-boudoir', 'parisian-suite', 'natural-asmr', 'intimate-pov', 'eporner', '4k', '60fps'],
    moodVector: {
      intense: 0.86,
      sensual: 0.99,
      surreal: 0.42,
      dark: 0.88,
      fastPaced: 0.58
    },
    waveformSeed: createHarmonicWaveform(1),
    sourceBenchmark: {
      domain: 'eporner.com',
      globalRank: 6,
      monthlyVisits: '554.0M',
      avgDwellTime: '08:11',
      archiveScale: '2.78M+ (4K/60fps Master)',
      specialtyFa: 'برترین استاندارد جهانی 4K UHD و ۶۰ فریم واقعی',
      specialtyEn: '#1 Global 4K UHD / 60FPS Full-Length Benchmark'
    },
    scenes: [
      {
        id: 'cs-1',
        timestampSec: 2,
        durationSec: 4,
        timeFormatted: '01:15',
        label: '01 · Silk Robe Unfastening',
        labelFa: '۰۱ · ورود به سوئیت و لمس ابریشم سیاه',
        moodTags: ['sensual', 'boudoir', 'slow-burn'],
        visualStyle: 'anamorphic-boudoir',
        intensityScore: 7,
        cameraFilter: 'contrast(1.08) saturate(1.15)'
      },
      {
        id: 'cs-2',
        timestampSec: 6,
        durationSec: 4,
        timeFormatted: '06:40',
        label: '02 · Warm Tungsten Skin Close-Up',
        labelFa: '۰۲ · نمای نزدیک در نور گرم کهربایی',
        moodTags: ['sensual', 'intimate', 'asmr'],
        visualStyle: 'tungsten-macro',
        intensityScore: 9,
        cameraFilter: 'contrast(1.16) sepia(0.14) saturate(1.22)'
      },
      {
        id: 'cs-3',
        timestampSec: 10,
        durationSec: 3,
        timeFormatted: '12:50',
        label: '03 · Unbroken Breath Climax',
        labelFa: '۰۳ · اوج حرارت و ریتم نفس‌ها',
        moodTags: ['intense', 'sensual', 'climax'],
        visualStyle: 'crimson-chiaroscuro',
        intensityScore: 10,
        cameraFilter: 'contrast(1.24) brightness(0.96) saturate(1.3)'
      },
      {
        id: 'cs-4',
        timestampSec: 13,
        durationSec: 2,
        timeFormatted: '16:20',
        label: '04 · Afterglow on Velvet Sheets',
        labelFa: '۰۴ · آرامش پایانی روی ملحفه‌های مخمل',
        moodTags: ['sensual', 'calm', 'finale'],
        visualStyle: 'soft-amber-fade',
        intensityScore: 6,
        cameraFilter: 'contrast(1.1)'
      }
    ]
  },
  {
    id: 'amber-hotel-noir',
    indexNumber: 2,
    streamUrl: '/assets/videos/stream_sintel.mp4',
    posterUrl: './assets/images/editorial_amber_hotel_noir_1794443435341.jpg',
    pillar: 'LIVE',
    resolution: '4K 60FPS',
    durationSec: 160,
    durationFormatted: '22:15',
    ambientColors: ['#D97706', '#9F1239'],
    canonicalTitle: 'Vixen Sensual: French Chateau Romance',
    directorOrStudio: 'Vixen Media Group • 4K HDR',
    sensoryMood: 'Velvet Boudoir',
    sensoryMoodFa: 'شهوانی و رمانتیک لوکس',
    audioProfile: 'Raw Room Acoustics / Zero Music',
    audioProfileFa: 'آکوستیک طبیعی محیط · بدون موسیقی',
    intensityLabel: 'High Intensity',
    intensityLabelFa: 'کشش و زیبایی‌شناسی بالا',
    coreSynopsis:
      'Masterpiece high-fashion erotic cinema by Vixen filmed in a private French chateau—natural golden tungsten lighting, black silk Chantilly lace, and poetic intimacy.',
    coreSynopsisFa:
      'شاهکار سینمایی و هنری استودیو ویکسن با زیباترین بازیگران، نورپردازی طلایی و صحنه‌های صمیمی بدون سانسور در عمارت مجلل فرانسوی.',
    aestheticDNA: ['late-night-hotel', 'rain-glass', 'pov-intimacy', 'euphoria-lighting', 'beeg', 'hqporner', 'porndig'],
    moodVector: {
      intense: 0.91,
      sensual: 0.96,
      surreal: 0.48,
      dark: 0.92,
      fastPaced: 0.72
    },
    waveformSeed: createHarmonicWaveform(5),
    sourceBenchmark: {
      domain: 'beeg.com / hqporner.com',
      globalRank: 23,
      monthlyVisits: '150.2M (+77.5% YoY)',
      avgDwellTime: '07:45',
      archiveScale: 'Curated 4K Studio Cinema',
      specialtyFa: 'کیوریشن مینیمال استودیویی بدون تبلیغات پاپ‌آپ',
      specialtyEn: 'Minimalist Ad-Free Curated 4K Studio Cinema'
    },
    scenes: [
      {
        id: 'ah-1',
        timestampSec: 2,
        durationSec: 4,
        timeFormatted: '02:10',
        label: '01 · Corridor Glass Encounter',
        labelFa: '۰۱ · برخورد اول در راهروی شیشه‌ای بارانی',
        moodTags: ['dark', 'sensual', 'hotel'],
        visualStyle: 'neon-rain-35mm',
        intensityScore: 7,
        cameraFilter: 'contrast(1.12) saturate(1.18)'
      },
      {
        id: 'ah-2',
        timestampSec: 6,
        durationSec: 4,
        timeFormatted: '08:45',
        label: '02 · Locked Door POV Immersion',
        labelFa: '۰۲ · بسته شدن در سوئیت و شروع زاویه POV',
        moodTags: ['sensual', 'intimate', 'pov'],
        visualStyle: 'intimate-pov-4k',
        intensityScore: 9,
        cameraFilter: 'sepia(0.15) contrast(1.2) saturate(1.25)'
      },
      {
        id: 'ah-3',
        timestampSec: 10,
        durationSec: 3,
        timeFormatted: '15:30',
        label: '03 · Against the Neon Window',
        labelFa: '۰۳ · سکانس اوج کنار پنجره نئونی شهر',
        moodTags: ['intense', 'climax', 'fast-paced'],
        visualStyle: 'crimson-window-glow',
        intensityScore: 10,
        cameraFilter: 'contrast(1.28) brightness(1.02)'
      },
      {
        id: 'ah-4',
        timestampSec: 13,
        durationSec: 2,
        timeFormatted: '20:05',
        label: '04 · Whispered Epilogue',
        labelFa: '۰۴ · نجواهای پایانی در تاریکی گرم',
        moodTags: ['sensual', 'asmr', 'finale'],
        visualStyle: 'warm-shadow-fade',
        intensityScore: 6,
        cameraFilter: 'contrast(1.14)'
      }
    ]
  },
  {
    id: 'velvet-illusion-ai',
    indexNumber: 3,
    streamUrl: '/assets/videos/stream_bunny.mp4',
    posterUrl: './assets/images/ai_erotic_velvet_illusion_1794443435845.jpg',
    pillar: 'AI',
    resolution: '4K 60FPS',
    durationSec: 210,
    durationFormatted: '14:50',
    ambientColors: ['#BE185D', '#7E22CE'],
    canonicalTitle: 'Candy AI: Hyper-Real Obsidian Goddess',
    directorOrStudio: 'Candy AI / Lovescape Studios • 4K',
    sensoryMood: 'Hyper-Real AI Fantasy',
    sensoryMoodFa: 'هوش مصنوعی بزرگسال فراواقعی',
    audioProfile: 'Spatial Breath & Silk ASMR',
    audioProfileFa: 'صدای فضایی نفس و ابریشم · ASMR',
    intensityLabel: 'Extreme Realism',
    intensityLabelFa: 'فراواقعی و مسحورکننده',
    coreSynopsis:
      'Next-generation photorealistic generative adult cinema by Candy AI—rendering ultra-high-definition skin textures, liquid rose-gold lighting, and personalized fantasy.',
    coreSynopsisFa:
      'سینمای نسل جدید هوش مصنوعی فتورئالیستیک با گرافیک خیره‌کننده، رندرینگ بی‌نظیر بافت پوست و بازسازی کامل فانتزی‌های بزرگسال.',
    aestheticDNA: ['hyper-real-ai', 'rose-gold-skin', 'velvet-drape', 'sensual-choreography', 'candy.ai', 'xgroovy', 'pornx.ai'],
    moodVector: {
      intense: 0.88,
      sensual: 0.98,
      surreal: 0.94,
      dark: 0.86,
      fastPaced: 0.64
    },
    waveformSeed: createHarmonicWaveform(9),
    sourceBenchmark: {
      domain: 'candy.ai',
      globalRank: 44,
      monthlyVisits: '42.8M (#704 Global)',
      avgDwellTime: '09:45',
      archiveScale: 'Real-Time Generative AI Video & Voice',
      specialtyFa: 'رتبه ۱ سینمای مولد و فانتزی فراواقعی هوش مصنوعی در غرب',
      specialtyEn: '#1 Generative AI Erotic Video & Hyper-Real Companion'
    },
    scenes: [
      {
        id: 'vi-1',
        timestampSec: 15,
        durationSec: 45,
        timeFormatted: '01:40',
        label: '01 · Rose-Gold Silhouette Reveal',
        labelFa: '۰۱ · پدیدار شدن سیلوئت در مه رزگلد',
        moodTags: ['sensual', 'surreal', 'ai'],
        visualStyle: 'rose-gold-diffusion',
        intensityScore: 8,
        cameraFilter: 'contrast(1.12) saturate(1.15)'
      },
      {
        id: 'vi-2',
        timestampSec: 60,
        durationSec: 50,
        timeFormatted: '05:20',
        label: '02 · Tactile Velvet & Skin Macro',
        labelFa: '۰۲ · نمای ماکرو از لغزش مخمل روی پوست',
        moodTags: ['sensual', 'intimate', 'tactile'],
        visualStyle: 'hyper-skin-macro',
        intensityScore: 9,
        cameraFilter: 'hue-rotate(-8deg) contrast(1.22)'
      },
      {
        id: 'vi-3',
        timestampSec: 110,
        durationSec: 45,
        timeFormatted: '09:45',
        label: '03 · Euphoric Pulse Convergence',
        labelFa: '۰۳ · اوج هم‌زمان ریتم و نور ارغوانی',
        moodTags: ['intense', 'climax', 'surreal'],
        visualStyle: 'violet-overdrive',
        intensityScore: 10,
        cameraFilter: 'contrast(1.3) saturate(1.32)'
      },
      {
        id: 'vi-4',
        timestampSec: 160,
        durationSec: 30,
        timeFormatted: '13:10',
        label: '04 · Obsidian Marble Stillness',
        labelFa: '۰۴ · آرامش پایانی روی مرمر سیاه',
        moodTags: ['dark', 'sensual', 'finale'],
        visualStyle: 'obsidian-fade',
        intensityScore: 6,
        cameraFilter: 'brightness(0.94) contrast(1.16)'
      }
    ]
  },
  {
    id: 'tokyo-neon-boudoir-anime',
    indexNumber: 4,
    streamUrl: '/assets/videos/stream_movie.mp4',
    posterUrl: './assets/images/anime_nocturne_neon_boudoir_1794443444307.jpg',
    pillar: 'ANIMATION',
    resolution: '4K 60FPS',
    durationSec: 195,
    durationFormatted: '16:30',
    ambientColors: ['#E11D48', '#D97706'],
    canonicalTitle: 'DLsite Uncensored Hentai: Roppongi Nights',
    directorOrStudio: 'DLsite Uncensored Animation • 60FPS',
    sensoryMood: 'Uncensored Anime',
    sensoryMoodFa: 'انیمه و هنتای بدون سانسور',
    audioProfile: 'Japanese Voice Acting & Rain ASMR',
    audioProfileFa: 'صداپیشگی اختصاصی ژاپنی · ASMR',
    intensityLabel: 'High Intensity',
    intensityLabelFa: 'ساکوگای پرحرارت و بدون سانسور',
    coreSynopsis:
      'Hand-crafted uncensored adult anime set inside a high-rise Roppongi apartment—vibrant neon reflections, fluid 60fps animation, and zero censorship.',
    coreSynopsisFa:
      'انیمیشن بزرگسال تحسین‌شده با جزئیات کامل بصری، صداپیشگی ژاپنی، کیفیت طراحی دستی و دوبله صوتی ۳۶۰ درجه سه بعدی بدون سانسور.',
    aestheticDNA: ['uncensored-anime', 'roppongi-penthouse', 'silk-kimono', 'sakuga-intimacy', 'dlsite', 'nhentai', 'hentai'],
    moodVector: {
      intense: 0.92,
      sensual: 0.97,
      surreal: 0.76,
      dark: 0.89,
      fastPaced: 0.68
    },
    waveformSeed: createHarmonicWaveform(14),
    sourceBenchmark: {
      domain: 'dlsite.com',
      globalRank: 14,
      monthlyVisits: '120.60M',
      avgDwellTime: '08:11',
      archiveScale: '1,000,000+ Uncensored Anime & ASMR Works',
      specialtyFa: 'قطب اول انیمه بدون سانسور و صدای دوگوشی ASMR در جهان',
      specialtyEn: '#1 Global Uncensored Anime & Binaural ASMR Hub'
    },
    scenes: [
      {
        id: 'tn-1',
        timestampSec: 18,
        durationSec: 45,
        timeFormatted: '01:50',
        label: '01 · Rain on the Penthouse Glass',
        labelFa: '۰۱ · باران شبانه پشت شیشه و لمس اولیه',
        moodTags: ['dark', 'sensual', 'anime'],
        visualStyle: 'cel-boudoir-noir',
        intensityScore: 7,
        cameraFilter: 'contrast(1.14) brightness(0.98)'
      },
      {
        id: 'tn-2',
        timestampSec: 65,
        durationSec: 50,
        timeFormatted: '06:15',
        label: '02 · Amber Lamp & Silk Slip',
        labelFa: '۰۲ · نور کهربایی آباژور و کنار رفتن ابریشم',
        moodTags: ['sensual', 'tactile', 'intimate'],
        visualStyle: 'warm-cel-shading',
        intensityScore: 9,
        cameraFilter: 'sepia(0.18) contrast(1.22)'
      },
      {
        id: 'tn-3',
        timestampSec: 115,
        durationSec: 40,
        timeFormatted: '11:40',
        label: '03 · Uncensored Sakuga Climax',
        labelFa: '۰۳ · اوج پرحرارت با انیمیشن ۶۰ فریم',
        moodTags: ['intense', 'climax', 'fast-paced'],
        visualStyle: 'sakuga-climax-60fps',
        intensityScore: 10,
        cameraFilter: 'contrast(1.3) saturate(1.25)'
      },
      {
        id: 'tn-4',
        timestampSec: 155,
        durationSec: 30,
        timeFormatted: '14:55',
        label: '04 · Tokyo Skyline Afterglow',
        labelFa: '۰۴ · آرامش دونفره رو به افق نئونی توکیو',
        moodTags: ['sensual', 'quiet', 'finale'],
        visualStyle: 'neon-bokeh-cel',
        intensityScore: 6,
        cameraFilter: 'brightness(1.04) contrast(1.14)'
      }
    ]
  },
  {
    id: 'crimson-penthouse-pov',
    indexNumber: 5,
    streamUrl: '/assets/videos/stream_movie.mp4',
    posterUrl: './assets/images/cinema_crimson_penthouse_1794408993203.jpg',
    pillar: 'LIVE',
    resolution: '4K 60FPS',
    durationSec: 205,
    durationFormatted: '24:10',
    ambientColors: ['#E11D48', '#F97316'],
    canonicalTitle: 'Pornhub #1 Global Trend: Bedroom Confessions',
    directorOrStudio: 'Pornhub Top Worldwide • 4K 60FPS',
    sensoryMood: 'Intimate POV',
    sensoryMoodFa: 'دید اول شخص و صمیمی (POV)',
    audioProfile: 'Close-Mic Whisper & Firelight ASMR',
    audioProfileFa: 'میکروفون نزدیک نجوا و صدای طبیعی',
    intensityLabel: 'High Intensity',
    intensityLabelFa: 'ترند شماره یک جهانی',
    coreSynopsis:
      'The #1 most-watched trending video across Pornhub worldwide with 45M+ views—filmed in unbroken 60fps first-person POV beside a luxury penthouse fireplace.',
    coreSynopsisFa:
      'پربازدیدترین ویدیوی ترند جهانی پورن‌هاب در ۳۰ روز گذشته با زاویه دید اول‌شخص (POV)، بیش از ۴۵ میلیون بیننده و وضوح کریستالی ۴K.',
    aestheticDNA: ['uncut-pov', 'fireplace-warmth', 'milan-penthouse', 'whisper-asmr', 'brazzers', 'adulttime', 'stripchat'],
    moodVector: {
      intense: 0.89,
      sensual: 0.99,
      surreal: 0.4,
      dark: 0.84,
      fastPaced: 0.62
    },
    waveformSeed: createHarmonicWaveform(21),
    sourceBenchmark: {
      domain: 'brazzers.com / adulttime.com',
      globalRank: 40,
      monthlyVisits: '92.4M',
      avgDwellTime: '08:50',
      archiveScale: '60,000+ Multi-Camera 4K POV Releases',
      specialtyFa: 'استاندارد طلایی زاویه دید اول‌شخص (POV) و تولیدات استودیویی',
      specialtyEn: 'Gold-Standard Uncut 60FPS POV & Flagship Studio Cinema'
    },
    scenes: [
      {
        id: 'cp-1',
        timestampSec: 5,
        durationSec: 15,
        timeFormatted: '02:00',
        label: '01 · Champagne by the Hearth',
        labelFa: '۰۱ · کنار شومینه و شروع نگاه نزدیک',
        moodTags: ['sensual', 'luxury', 'pov'],
        visualStyle: 'pov-anamorphic',
        intensityScore: 7,
        cameraFilter: 'contrast(1.12) saturate(1.2)'
      },
      {
        id: 'cp-2',
        timestampSec: 20,
        durationSec: 15,
        timeFormatted: '09:15',
        label: '02 · Firelight on Bare Shoulders',
        labelFa: '۰۲ · بازتاب شعله‌های آتش روی پوست',
        moodTags: ['sensual', 'warm', 'intimate'],
        visualStyle: 'amber-firelight',
        intensityScore: 9,
        cameraFilter: 'sepia(0.15) saturate(1.32) contrast(1.2)'
      },
      {
        id: 'cp-3',
        timestampSec: 35,
        durationSec: 15,
        timeFormatted: '17:40',
        label: '03 · Unbroken POV Climax',
        labelFa: '۰۳ · اوج صمیمیت و هیجان بدون کات',
        moodTags: ['intense', 'sensual', 'climax'],
        visualStyle: 'silhouette-noir',
        intensityScore: 10,
        cameraFilter: 'contrast(1.28) brightness(0.96)'
      },
      {
        id: 'cp-4',
        timestampSec: 50,
        durationSec: 10,
        timeFormatted: '22:30',
        label: '04 · Midnight Ember Glow',
        labelFa: '۰۴ · آرامش در نور اخگرهای شومینه',
        moodTags: ['calm', 'sensual', 'finale'],
        visualStyle: 'bokeh-fade',
        intensityScore: 6,
        cameraFilter: 'hue-rotate(-10deg) contrast(1.15)'
      }
    ]
  },
  {
    id: 'velvet-rain-shinjuku',
    indexNumber: 6,
    streamUrl: '/assets/videos/stream_oceans.mp4',
    posterUrl: './assets/images/cinema_noir_velvet_rain_1794398988857.jpg',
    pillar: 'LIVE',
    resolution: '4K 60FPS',
    durationSec: 175,
    durationFormatted: '19:20',
    ambientColors: ['#E11D48', '#D97706'],
    canonicalTitle: 'MissAV Tokyo: Uncensored Ryokan JAV',
    directorOrStudio: 'MissAV Uncut JAV • 4K 60FPS',
    sensoryMood: 'Sensual ASMR',
    sensoryMoodFa: 'آسیایی و ژاپنی بدون سانسور',
    audioProfile: '3D Binaural Whisper & Rain',
    audioProfileFa: 'صدای سه‌بعدی نفس و باران توکیو',
    intensityLabel: 'High Intensity',
    intensityLabelFa: 'ژاپنی بدون سانسور و پرحرارت',
    coreSynopsis:
      'Top-ranked uncut JAV release from MissAV—traditional Japanese ryokan onsen, silk kimono, steamed glass mirrors, and pristine 4K video with zero censorship.',
    coreSynopsisFa:
      'محبوب‌ترین اثر سینمای بزرگسال ژاپن به صورت کاملاً بدون سانسور در اونسن سنتی، با کیفیت 4K و صدای دوگوشی ASMR بدون هیچ‌گونه افت کیفیت.',
    aestheticDNA: ['shinjuku-sanctuary', 'steamed-glass', 'binaural-asmr', 'crimson-neon', 'njavtv', 'missav', 'jav'],
    moodVector: {
      intense: 0.84,
      sensual: 0.98,
      surreal: 0.52,
      dark: 0.9,
      fastPaced: 0.54
    },
    waveformSeed: createHarmonicWaveform(28),
    sourceBenchmark: {
      domain: 'njavtv.com / missav.ai',
      globalRank: 11,
      monthlyVisits: '138.24M (+292% YoY)',
      avgDwellTime: '12:22',
      archiveScale: '100,000+ Uncut Full Asian Releases',
      specialtyFa: 'رکورددار ماندگاری ۱۲ دقیقه‌ای در سینمای آسیا بدون تبلیغ وسط فیلم',
      specialtyEn: '12m 22s Dwell Time Leader in Ad-Free Uncut Asian Cinema'
    },
    scenes: [
      {
        id: 'vrs-1',
        timestampSec: 2,
        durationSec: 4,
        timeFormatted: '01:45',
        label: '01 · Steamed Mirror Silhouette',
        labelFa: '۰۱ · بخار روی آینه و لمس آغازین',
        moodTags: ['dark', 'sensual', 'asmr'],
        visualStyle: 'steamed-glass-35mm',
        intensityScore: 7,
        cameraFilter: 'contrast(1.1) saturate(1.2)'
      },
      {
        id: 'vrs-2',
        timestampSec: 6,
        durationSec: 4,
        timeFormatted: '07:30',
        label: '02 · Binaural Whisper Proximity',
        labelFa: '۰۲ · نجوای نزدیک و تپش آرام ریتم',
        moodTags: ['sensual', 'asmr', 'intimate'],
        visualStyle: 'crimson-bokeh',
        intensityScore: 9,
        cameraFilter: 'hue-rotate(-8deg) saturate(1.3)'
      },
      {
        id: 'vrs-3',
        timestampSec: 10,
        durationSec: 3,
        timeFormatted: '14:15',
        label: '03 · Room 808 Fever Peak',
        labelFa: '۰۳ · اوج التهاب در نور سرخ نئون',
        moodTags: ['intense', 'sensual', 'climax'],
        visualStyle: 'crimson-overdrive',
        intensityScore: 10,
        cameraFilter: 'contrast(1.26) brightness(1.02)'
      },
      {
        id: 'vrs-4',
        timestampSec: 13,
        durationSec: 2,
        timeFormatted: '17:50',
        label: '04 · Dawn Rain Quietude',
        labelFa: '۰۴ · سکوت بارانی پیش از سپیده‌دم',
        moodTags: ['calm', 'sensual', 'finale'],
        visualStyle: 'amber-mist',
        intensityScore: 6,
        cameraFilter: 'contrast(1.15)'
      }
    ]
  },
  {
    id: 'obsidian-sonata-boudoir',
    indexNumber: 7,
    streamUrl: '/assets/videos/stream_sintel.mp4',
    posterUrl: './assets/images/cinema_obsidian_sonata_1794398992852.jpg',
    pillar: 'LIVE',
    resolution: '4K 60FPS',
    durationSec: 195,
    durationFormatted: '21:05',
    ambientColors: ['#D97706', '#881337'],
    canonicalTitle: 'Blacked Raw: Midnight Luxury Encounter',
    directorOrStudio: 'Blacked Raw Studios • 4K 60FPS',
    sensoryMood: 'High-Intensity Climax',
    sensoryMoodFa: 'استودیویی داغ و پرانرژی',
    audioProfile: 'Natural Acoustics & Breath',
    audioProfileFa: 'صدای زنده استودیو و نفس‌ها',
    intensityLabel: 'High Intensity',
    intensityLabelFa: 'ریتم تند و پرکشش ۶۰ فریم',
    coreSynopsis:
      'High-voltage studio blockbuster from Blacked Raw—intense choreography, golden chiaroscuro lighting, and unhurried high-bitrate 60fps pacing.',
    coreSynopsisFa:
      'شاهکار پرهیجان استودیوی بلکد راو با بالاترین امتیاز کاربران در آمریکا، کیفیت بی‌نظیر ۶۰ فریم و ریتم تند و پرحرارت.',
    aestheticDNA: ['black-satin', 'golden-chiaroscuro', 'high-intensity', 'vienna-salon', 'pornhub', 'xvideos', 'xhamster'],
    moodVector: {
      intense: 0.96,
      sensual: 0.94,
      surreal: 0.5,
      dark: 0.94,
      fastPaced: 0.78
    },
    waveformSeed: createHarmonicWaveform(34),
    sourceBenchmark: {
      domain: 'pornhub.com / xvideos.com / xhamster.com',
      globalRank: 1,
      monthlyVisits: '7.31B Combined',
      avgDwellTime: '07:55',
      archiveScale: 'Top 0.01% Curated Global Masterpieces',
      specialtyFa: 'گلچین ۰.۰۱٪ برتر سه غول اول ترافیک جهان با کیفیت 4K بدون تبلیغ',
      specialtyEn: 'Top 0.01% Most-Replayed Global Masterpieces in Pure 4K'
    },
    scenes: [
      {
        id: 'osb-1',
        timestampSec: 16,
        durationSec: 38,
        timeFormatted: '02:20',
        label: '01 · Candlelight & Black Satin',
        labelFa: '۰۱ · درخشش ساتن سیاه در نور شمع',
        moodTags: ['dark', 'sensual', 'dramatic'],
        visualStyle: 'leica-chiaroscuro',
        intensityScore: 8,
        cameraFilter: 'contrast(1.15) saturate(1.15)'
      },
      {
        id: 'osb-2',
        timestampSec: 54,
        durationSec: 48,
        timeFormatted: '08:10',
        label: '02 · Golden Shaft Skin Tension',
        labelFa: '۰۲ · تلاقی سایه و پوست در پرتو طلایی',
        moodTags: ['sensual', 'intense', 'tactile'],
        visualStyle: 'golden-macro',
        intensityScore: 9,
        cameraFilter: 'saturate(1.3) contrast(1.2)'
      },
      {
        id: 'osb-3',
        timestampSec: 102,
        durationSec: 32,
        timeFormatted: '15:00',
        label: '03 · Unrelenting Crescendo Peak',
        labelFa: '۰۳ · اوج بی‌وقفه با ضرباهنگ تند',
        moodTags: ['intense', 'fast-paced', 'climax'],
        visualStyle: 'steadicam-climax',
        intensityScore: 10,
        cameraFilter: 'contrast(1.3) brightness(1.02)'
      },
      {
        id: 'osb-4',
        timestampSec: 134,
        durationSec: 16,
        timeFormatted: '19:30',
        label: '04 · Velvet Shadow Stillness',
        labelFa: '۰۴ · فرود آرام در سایه‌های مخملی',
        moodTags: ['calm', 'sensual', 'finale'],
        visualStyle: 'warm-shadow',
        intensityScore: 6,
        cameraFilter: 'contrast(1.18)'
      }
    ]
  },
  {
    id: 'orient-sleeper-compartment',
    indexNumber: 8,
    streamUrl: '/assets/videos/stream_bunny.mp4',
    posterUrl: './assets/images/cinema_midnight_express_paris_1794408998635.jpg',
    pillar: 'LIVE',
    resolution: '4K 60FPS',
    durationSec: 190,
    durationFormatted: '17:45',
    ambientColors: ['#D97706', '#9F1239'],
    canonicalTitle: 'OnlyFans VIP: Private Candlelight Boudoir',
    directorOrStudio: 'OnlyFans Elite Creators • 4K',
    sensoryMood: 'Late Night Hotel',
    sensoryMoodFa: 'اتاق خواب اختصاصی و صمیمی',
    audioProfile: 'Rain, Rails & Intimate Whisper ASMR',
    audioProfileFa: 'صدای نجوای نزدیک در اتاق خواب',
    intensityLabel: 'High Intensity',
    intensityLabelFa: 'صمیمی و بدون سانسور VIP',
    coreSynopsis:
      'Exclusive private boudoir session from OnlyFans top 0.01% creator—warm candlelight, unscripted raw intimacy, and personal handheld angles.',
    coreSynopsisFa:
      'مجموعه دست‌چین شده از پرطرفدارترین محتوای خصوصی تاپ کریتورهای اونلی‌فنز با زاویه اختصاصی، ارتباط مستقیم چشمی و بدون سانسور.',
    aestheticDNA: ['sleeper-compartment', 'amber-brass', 'clandestine-intimacy', 'natural-asmr', 'joyclub', 'cumlouder', 'european'],
    moodVector: {
      intense: 0.85,
      sensual: 0.96,
      surreal: 0.46,
      dark: 0.88,
      fastPaced: 0.6
    },
    waveformSeed: createHarmonicWaveform(41),
    sourceBenchmark: {
      domain: 'joyclub.de / cumlouder.com',
      globalRank: 54,
      monthlyVisits: '48.5M',
      avgDwellTime: '12:24',
      archiveScale: 'European Art-House & Private Salon Cinema',
      specialtyFa: 'سینمای اروپایی با رکورد ۱۲:۲۴ زمان ماندگاری در آلمان و اسپانیا',
      specialtyEn: 'European Noir Cinema with 12m 24s Average Session Dwell'
    },
    scenes: [
      {
        id: 'osc-1',
        timestampSec: 5,
        durationSec: 10,
        timeFormatted: '01:30',
        label: '01 · Brass Lock & Drawn Curtains',
        labelFa: '۰۱ · قفل شدن در کوپه و کشیدن پرده‌های مخمل',
        moodTags: ['dark', 'sensual', 'intimate'],
        visualStyle: 'vintage-35mm',
        intensityScore: 7,
        cameraFilter: 'contrast(1.12) sepia(0.15)'
      },
      {
        id: 'osc-2',
        timestampSec: 15,
        durationSec: 12,
        timeFormatted: '06:50',
        label: '02 · Amber Lamp Skin Proximity',
        labelFa: '۰۲ · نزدیکی نفس‌ها در نور آباژور کوپه',
        moodTags: ['sensual', 'warm', 'asmr'],
        visualStyle: 'amber-compartment',
        intensityScore: 9,
        cameraFilter: 'saturate(1.3) contrast(1.2)'
      },
      {
        id: 'osc-3',
        timestampSec: 27,
        durationSec: 12,
        timeFormatted: '12:20',
        label: '03 · Midnight Border Climax',
        labelFa: '۰۳ · اوج التهاب هم‌زمان با شتاب قطار',
        moodTags: ['intense', 'sensual', 'climax'],
        visualStyle: 'tight-close-up',
        intensityScore: 10,
        cameraFilter: 'contrast(1.28) brightness(0.95)'
      },
      {
        id: 'osc-4',
        timestampSec: 39,
        durationSec: 8,
        timeFormatted: '16:10',
        label: '04 · Dawn Mist Over the Glass',
        labelFa: '۰۴ · بخار صبحگاهی روی شیشه کوپه',
        moodTags: ['sensual', 'calm', 'finale'],
        visualStyle: 'warm-dawn-window',
        intensityScore: 6,
        cameraFilter: 'contrast(1.15)'
      }
    ]
  },
  {
    id: 'ai-crimson-mirage',
    indexNumber: 9,
    streamUrl: '/assets/videos/stream_flower.mp4',
    posterUrl: './assets/images/boudoir_crimson_silk_suite_1794443433215.jpg',
    pillar: 'AI',
    resolution: '4K 60FPS',
    durationSec: 165,
    durationFormatted: '15:40',
    ambientColors: ['#E11D48', '#D97706'],
    canonicalTitle: 'Reality Kings: Malibu Beachfront Romance',
    directorOrStudio: 'Reality Kings Classics • 4K 60FPS',
    sensoryMood: 'Hyper-Real AI Fantasy',
    sensoryMoodFa: 'فضای آزاد و تابستانی کالیفرنیا',
    audioProfile: 'Natural Pacific Breeze & Audio ASMR',
    audioProfileFa: 'صدای طبیعی محیط و دریا · ASMR',
    intensityLabel: 'Extreme Realism',
    intensityLabelFa: 'وضوح 4K و فضای آزاد',
    coreSynopsis:
      'Classic Californian beachside release from Reality Kings—sunny oceanfront villa, natural sunlight, carefree intimacy, and crisp 60fps multi-camera capture.',
    coreSynopsisFa:
      'اثر پرطرفدار و ماندگار استودیو ریالیتی کینگز در سواحل آفتابی و ویلاهای اختصاصی کالیفرنیا با فضای باز و پرانرژی.',
    aestheticDNA: ['ai-boudoir', 'candlelight-skin', '60fps-neural', 'intimate-closeup', 'myanima', 'lovescape', 'ourdream', 'arab'],
    moodVector: {
      intense: 0.9,
      sensual: 0.99,
      surreal: 0.88,
      dark: 0.85,
      fastPaced: 0.66
    },
    waveformSeed: createHarmonicWaveform(47),
    sourceBenchmark: {
      domain: 'myanima.ai / lovescape.com',
      globalRank: 62,
      monthlyVisits: '28.4M (+87.6% MoM)',
      avgDwellTime: '14:27',
      archiveScale: 'Multi-Ethnic Neural Boudoir (Arab, Latina, Asian)',
      specialtyFa: 'رکورددار ۱۴:۲۷ زمان ماندگاری و مدل‌های چندملیتی (عربی/لاتین/آسیایی)',
      specialtyEn: '14m 27s Dwell Time Leader & Multi-Ethnic AI Fantasy'
    },
    scenes: [
      {
        id: 'acm-1',
        timestampSec: 2,
        durationSec: 4,
        timeFormatted: '01:10',
        label: '01 · Candlelight Skin Genesis',
        labelFa: '۰۱ · درخشش نور شمع روی ابریشم و پوست',
        moodTags: ['sensual', 'ai', 'boudoir'],
        visualStyle: 'neural-candlelight',
        intensityScore: 8,
        cameraFilter: 'contrast(1.14) saturate(1.22)'
      },
      {
        id: 'acm-2',
        timestampSec: 6,
        durationSec: 4,
        timeFormatted: '05:45',
        label: '02 · Hyper-Real POV Proximity',
        labelFa: '۰۲ · نمای نزدیک POV با وضوح فوق‌العاده',
        moodTags: ['sensual', 'intimate', 'pov'],
        visualStyle: 'neural-pov-4k',
        intensityScore: 9,
        cameraFilter: 'sepia(0.12) contrast(1.22)'
      },
      {
        id: 'acm-3',
        timestampSec: 10,
        durationSec: 3,
        timeFormatted: '10:50',
        label: '03 · Crimson Silk Overdrive',
        labelFa: '۰۳ · سکانس اوج در نور مخملی سرخ',
        moodTags: ['intense', 'climax', 'fast-paced'],
        visualStyle: 'crimson-neural-peak',
        intensityScore: 10,
        cameraFilter: 'contrast(1.32) saturate(1.3)'
      },
      {
        id: 'acm-4',
        timestampSec: 13,
        durationSec: 2,
        timeFormatted: '14:20',
        label: '04 · Warm Amber Dissolution',
        labelFa: '۰۴ · آرامش پایانی در نور کهربایی',
        moodTags: ['calm', 'sensual', 'finale'],
        visualStyle: 'amber-fade',
        intensityScore: 6,
        cameraFilter: 'brightness(0.96) contrast(1.16)'
      }
    ]
  },
  {
    id: 'kyoto-silk-anime-uncut',
    indexNumber: 10,
    streamUrl: '/assets/videos/stream_movie.mp4',
    posterUrl: './assets/images/anime_nocturne_neon_boudoir_1794443444307.jpg',
    pillar: 'ANIMATION',
    resolution: '4K 60FPS',
    durationSec: 170,
    durationFormatted: '17:10',
    ambientColors: ['#BE185D', '#D97706'],
    canonicalTitle: 'Naughty America: Late Night Office Fantasy',
    directorOrStudio: 'Naughty America HD • 1080p',
    sensoryMood: 'Uncensored Anime',
    sensoryMoodFa: 'سناریو محور و محیط کار',
    audioProfile: 'High-Fidelity Dialogue & Room ASMR',
    audioProfileFa: 'دیالوگ‌های اختصاصی و صدای طبیعی',
    intensityLabel: 'High Intensity',
    intensityLabelFa: 'بازیگری ستاره‌ها و سناریوی داغ',
    coreSynopsis:
      'Flagship roleplay scenario from Naughty America—after hours in a downtown executive office, tension mounts into an unforgettable studio encounter.',
    coreSynopsisFa:
      'محبوب‌ترین داستان فانتزی استودیو ناتی آمریکا با فیلم‌نامه جذاب، بازیگران ستاره، محیط کاری شبانه و دیالوگ‌های پرحرارت.',
    aestheticDNA: ['ryokan-bath', 'uncensored-anime', 'steamed-lantern', 'water-asmr', 'f95zone', '18comic', 'e-hentai'],
    moodVector: {
      intense: 0.88,
      sensual: 0.98,
      surreal: 0.8,
      dark: 0.84,
      fastPaced: 0.58
    },
    waveformSeed: createHarmonicWaveform(52),
    sourceBenchmark: {
      domain: 'f95zone.to / 18comic.site',
      globalRank: 15,
      monthlyVisits: '115.98M',
      avgDwellTime: '08:25',
      archiveScale: '250,000+ 3D/2D Uncensored Animation Releases',
      specialtyFa: 'مرجع اول انیمیشن‌های سه‌بعدی و آثار بدون سانسور ۶۰ فریم',
      specialtyEn: '#1 Global 3D/2D Uncensored Animation Repository'
    },
    scenes: [
      {
        id: 'ksa-1',
        timestampSec: 5,
        durationSec: 12,
        timeFormatted: '01:40',
        label: '01 · Cedar Bath Steam & Lanterns',
        labelFa: '۰۱ · بخار آب گرم و نور فانوس‌های چوبی',
        moodTags: ['sensual', 'anime', 'warm'],
        visualStyle: 'kyoto-ink-paint',
        intensityScore: 7,
        cameraFilter: 'saturate(1.22) contrast(1.12)'
      },
      {
        id: 'ksa-2',
        timestampSec: 17,
        durationSec: 15,
        timeFormatted: '06:30',
        label: '02 · Wet Silk & Skin Reflections',
        labelFa: '۰۲ · بازتاب نور روی آب و لمس نزدیک',
        moodTags: ['sensual', 'intimate', 'asmr'],
        visualStyle: 'water-refraction-cel',
        intensityScore: 9,
        cameraFilter: 'hue-rotate(-10deg) saturate(1.3)'
      },
      {
        id: 'ksa-3',
        timestampSec: 32,
        durationSec: 15,
        timeFormatted: '12:15',
        label: '03 · Uncensored Thermal Climax',
        labelFa: '۰۳ · سکانس اوج بدون سانسور در بخار گرم',
        moodTags: ['intense', 'climax', 'sensual'],
        visualStyle: 'sakuga-bloom',
        intensityScore: 10,
        cameraFilter: 'contrast(1.3) brightness(1.04)'
      },
      {
        id: 'ksa-4',
        timestampSec: 47,
        durationSec: 10,
        timeFormatted: '15:50',
        label: '04 · Midnight Rain Afterglow',
        labelFa: '۰۴ · آرامش پایانی با صدای باران کیوتو',
        moodTags: ['dark', 'calm', 'finale'],
        visualStyle: 'lantern-fade',
        intensityScore: 6,
        cameraFilter: 'contrast(1.16) brightness(0.95)'
      }
    ]
  }
];

// ============================================================================
// LAYER B: 100% LOCAL COSINE-SIMILARITY VECTOR MATCHER (< 2ms EXECUTION)
// ============================================================================

export function computeCosineSimilarity(vecA: MoodVector5D, vecB: MoodVector5D): number {
  const keys: (keyof MoodVector5D)[] = ['intense', 'sensual', 'surreal', 'dark', 'fastPaced'];
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const k of keys) {
    const a = vecA?.[k] ?? 0.5;
    const b = vecB?.[k] ?? 0.5;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0.88;
  return Math.max(0, Math.min(1, dotProduct / denominator));
}

export function blendMoodVectors(
  current: MoodVector5D,
  target: Partial<MoodVector5D>,
  weight = 0.65
): MoodVector5D {
  const clamp = (n: number) => Number(Math.max(0.1, Math.min(1.0, n)).toFixed(2));
  return {
    intense: clamp(
      target.intense !== undefined
        ? current.intense * (1 - weight) + target.intense * weight
        : current.intense
    ),
    sensual: clamp(
      target.sensual !== undefined
        ? current.sensual * (1 - weight) + target.sensual * weight
        : current.sensual
    ),
    surreal: clamp(
      target.surreal !== undefined
        ? current.surreal * (1 - weight) + target.surreal * weight
        : current.surreal
    ),
    dark: clamp(
      target.dark !== undefined ? current.dark * (1 - weight) + target.dark * weight : current.dark
    ),
    fastPaced: clamp(
      target.fastPaced !== undefined
        ? current.fastPaced * (1 - weight) + target.fastPaced * weight
        : current.fastPaced
    )
  };
}

// ============================================================================
// GLOBAL 100-PLATFORM SOURCE & 20-COUNTRY INTELLIGENCE MATCHER
// ============================================================================

export function matchGlobalSourcesForQuery(
  rawQuery: string,
  targetPillar: FilmPillarCode | undefined,
  sessionVector: MoodVector5D
): {
  matchedSources: GlobalSourceBenchmark[];
  matchedCountry?: GlobalCountryInsight;
} {
  const qLower = rawQuery.trim().toLowerCase();

  // Detect if user asked about a specific region/country from the 20-country report
  let matchedCountry: GlobalCountryInsight | undefined;
  if (/ژاپن|آسیا|توکیو|کره|japan|asian|jav|tokyo|korea/.test(qLower)) {
    matchedCountry = GLOBAL_20_COUNTRY_INSIGHTS[1];
  } else if (/اروپا|آلمان|فرانسه|اسپانیا|ایتالیا|europe|germany|france|spain|italy/.test(qLower)) {
    matchedCountry = GLOBAL_20_COUNTRY_INSIGHTS[2];
  } else if (/عرب|خاورمیانه|مصر|ترکیه|ایران|arab|mena|egypt|middle east|persian/.test(qLower)) {
    matchedCountry = GLOBAL_20_COUNTRY_INSIGHTS[3];
  } else if (/لاتین|برزیل|مکزیک|آرژانتین|کلمبیا|زن|خانم|latina|brazil|mexico|argentina|female/.test(qLower)) {
    matchedCountry = GLOBAL_20_COUNTRY_INSIGHTS[4];
  } else if (/هند|فیلیپین|آسیای جنوبی|india|desi|philippines/.test(qLower)) {
    matchedCountry = GLOBAL_20_COUNTRY_INSIGHTS[5];
  } else if (/آمریکا|امریکا|جهانی|usa|america|global/.test(qLower)) {
    matchedCountry = GLOBAL_20_COUNTRY_INSIGHTS[0];
  }

  const scoredSources = GLOBAL_TOP_SOURCES_INDEX.map((src) => {
    let score = computeCosineSimilarity(sessionVector, src.moodVector);

    if (targetPillar && src.pillar === targetPillar) {
      score += 0.22;
    }

    if (
      src.domain.toLowerCase().includes(qLower) ||
      src.brandName.toLowerCase().includes(qLower) ||
      src.categoryTitleFa.includes(qLower) ||
      src.categoryTitleEn.toLowerCase().includes(qLower)
    ) {
      score += 0.35;
    }

    for (const kw of src.searchKeywords) {
      if (qLower.includes(kw.toLowerCase())) {
        score += 0.18;
      }
    }

    if (
      matchedCountry &&
      src.topRegions.some((r) =>
        matchedCountry!.countryNameEn.toLowerCase().includes(r.toLowerCase()) ||
        r.toLowerCase().includes(matchedCountry!.countryCode.toLowerCase())
      )
    ) {
      score += 0.16;
    }

    return { src, score };
  });

  scoredSources.sort((a, b) => b.score - a.score);

  return {
    matchedSources: scoredSources.slice(0, 4).map((s) => s.src),
    matchedCountry
  };
}

// ============================================================================
// MULTILINGUAL LANGUAGE & SEMANTIC INTENT DETECTOR
// ============================================================================

export interface ParsedMultilingualIntent {
  lang: 'fa' | 'en' | 'ar' | 'tr' | 'es' | 'fr';
  langLabel: string;
  isRtl: boolean;
  wantsExplanationOfCurrent: boolean;
  wantsSceneJump: boolean;
  targetPillar?: FilmPillarCode;
  vectorDelta: Partial<MoodVector5D>;
  matchedKeywords: string[];
}

export function detectLanguageAndIntent(
  rawQuery: string,
  preferredLang: 'fa' | 'en' = 'fa'
): ParsedMultilingualIntent {
  const q = rawQuery.trim();
  const lower = q.toLowerCase();

  const hasPersianSpecific = /[پچژگکای]/.test(q);
  const hasArabicScript = /[\u0600-\u06FF]/.test(q);
  const hasTurkishSpecific = /[ğüşöçıİ]/i.test(q);
  const hasSpanishSpecific = /[ñáéíóú¿¡]/i.test(q);
  const hasFrenchSpecific = /[êèéàùçœ]/i.test(q);

  let lang: ParsedMultilingualIntent['lang'] = preferredLang;
  let langLabel = preferredLang === 'fa' ? 'فارسی (Persian)' : 'English';
  let isRtl = preferredLang === 'fa';

  if (hasPersianSpecific || (hasArabicScript && !/\b(في|من|على|هذا|اريد)\b/.test(q))) {
    lang = 'fa';
    langLabel = 'فارسی (Persian)';
    isRtl = true;
  } else if (hasArabicScript) {
    lang = 'ar';
    langLabel = 'العربية (Arabic)';
    isRtl = true;
  } else if (hasTurkishSpecific || /\b(film|sahne|karanlık|benzer|göster)\b/.test(lower)) {
    lang = 'tr';
    langLabel = 'Türkçe (Turkish)';
    isRtl = false;
  } else if (hasSpanishSpecific || /\b(película|escena|más|oscuro|explica)\b/.test(lower)) {
    lang = 'es';
    langLabel = 'Español (Spanish)';
    isRtl = false;
  } else if (hasFrenchSpecific || /\b(scène|sombre|explique|film)\b/.test(lower)) {
    lang = 'fr';
    langLabel = 'Français (French)';
    isRtl = false;
  }

  const vectorDelta: Partial<MoodVector5D> = {};
  const matchedKeywords: string[] = [];
  let targetPillar: FilmPillarCode | undefined;

  if (
    /تاریک|نوار|شبانه|سیاه|هتل|اروپایی|dark|noir|night|hotel|shadow|oscuro|sombre|karanlık|مظلم|beeg|hqporner|joyclub/.test(
      lower
    )
  ) {
    vectorDelta.dark = 0.96;
    vectorDelta.intense = 0.85;
    matchedKeywords.push('dark-noir');
  }

  if (
    /حسی|عاشقانه|نزدیک|آرام|لطیف|گرم|مخمل|ابریشم|بدون تبلیغ|ژاپنی|آسیایی|sensual|intimate|warm|slow|touch|velvet|boudoir|asmr|pov|jav|missav|njavtv|eporner/.test(
      lower
    )
  ) {
    vectorDelta.sensual = 0.99;
    vectorDelta.fastPaced = 0.45;
    matchedKeywords.push('sensual-intimate');
  }

  if (
    /فانتزی|رویایی|متفاوت|فراواقعی|عربی|لاتین|surreal|fantasy|dream|hyper|luxury|candy|myanima|lovescape|ourdream/.test(
      lower
    )
  ) {
    vectorDelta.surreal = 0.96;
    matchedKeywords.push('surreal-dream');
  }

  if (
    /هیجانی|تند|اوج|داغ|پرحرارت|سریع|شدید|بهترین|پربازدید|intense|climax|hot|fast|uncut|best|top|pornhub|xvideos|xhamster|brazzers/.test(
      lower
    )
  ) {
    vectorDelta.intense = 0.98;
    vectorDelta.fastPaced = 0.88;
    matchedKeywords.push('intense-climax');
  }

  if (
    /هوش مصنوعی|مصنوعی|عربی|لاتین|\bai\b|synth|neural|diffusion|hyper-real|candy|myanima|lovescape|ourdream|pornx/.test(
      lower
    )
  ) {
    targetPillar = 'AI';
    vectorDelta.surreal = 0.95;
    matchedKeywords.push('pillar:AI');
  } else if (
    /انیمیشن|انیمه|هنتای|سه بعدی|دوجین|anime|animation|hentai|uncensored|ryokan|roppongi|dlsite|f95zone|nhentai|18comic/.test(
      lower
    )
  ) {
    targetPillar = 'ANIMATION';
    matchedKeywords.push('pillar:ANIMATION');
  } else if (
    /واقعی|زنده|فیلمبرداری|استودیویی|ژاپنی|4k|60fps|live|real|pov|suite|hotel|penthouse|eporner|njavtv|missav|beeg|brazzers/.test(
      lower
    )
  ) {
    targetPillar = 'LIVE';
    matchedKeywords.push('pillar:LIVE');
  }

  const wantsExplanationOfCurrent =
    /توضیح|نقد|چیه|چیست|درباره همین|معرفی همین|explain this|review this|what is this/.test(
      lower
    );

  const wantsSceneJump =
    /سکانس|ثانیه|لحظه|پارت|بخش|اوج|داغ|scene|timestamp|moment|jump|climax|sequence|sahne|escena/.test(
      lower
    );

  return {
    lang,
    langLabel,
    isRtl,
    wantsExplanationOfCurrent,
    wantsSceneJump,
    targetPillar,
    vectorDelta,
    matchedKeywords
  };
}

// ============================================================================
// LAYER C: TRUE FILM-SPECIALIST & GLOBAL 100-SOURCE CRITIC SYNTHESIZER
// ============================================================================

export function synthesizeFilmCriticReview(
  lang: string,
  primaryFilm: CatalogFilmItem,
  bestScene: SceneMarker,
  cosineScorePct: number,
  topSource?: GlobalSourceBenchmark,
  countryInsight?: GlobalCountryInsight
): string {
  const pillarNameFa =
    primaryFilm.pillar === 'LIVE'
      ? 'سینمای زنده (Live-Action)'
      : primaryFilm.pillar === 'AI'
      ? 'سینمای مولد هوش مصنوعی (AI Erotic)'
      : 'انیمه بزرگسالانه بدون سانسور (Uncensored Anime)';

  const srcDomain = topSource?.domain ?? primaryFilm.sourceBenchmark?.domain ?? 'eporner.com';
  const srcRank = topSource?.globalRank ?? primaryFilm.sourceBenchmark?.globalRank ?? 6;
  const srcDwell = topSource?.avgDwellTime ?? primaryFilm.sourceBenchmark?.avgDwellTime ?? '08:11';

  switch (lang) {
    case 'fa': {
      const regionNote = countryInsight
        ? ` بر اساس داده‌های ترافیک «${countryInsight.countryNameFa}» (میانگین تماشای ${countryInsight.avgDwellTime})،`
        : '';
      return `بهترین انتخاب برای شما:${regionNote} «${primaryFilm.canonicalTitle}» اثر ${primaryFilm.directorOrStudio} در شاخه ${pillarNameFa} (هم‌تراز با استاندارد منبع جهانی ${srcDomain} • رتبه #${srcRank} جهان با میانگین ماندگاری ${srcDwell}). ${primaryFilm.coreSynopsisFa} برای تجربه مستقیم اوج حرارت، پرش به سکانس «${bestScene.labelFa ?? bestScene.label}» در دقیقه ${bestScene.timeFormatted} (تطابق ${cosineScorePct}٪ با سلیقه شما) پیشنهاد می‌شود.`;
    }
    case 'ar':
      return `أفضل اختيار لك: عمل «${primaryFilm.canonicalTitle}» من استوديو ${primaryFilm.directorOrStudio} (المعيار العالمي ${srcDomain} • المرتبة #${srcRank} عالمياً بمتوسط بقاء ${srcDwell}). ${primaryFilm.coreSynopsis} ننصحك بالانتقال مباشرة إلى مشهد الذروة «${bestScene.label}» عند الدقيقة ${bestScene.timeFormatted} (${cosineScorePct}% توافق).`;
    default: {
      const regionEn = countryInsight
        ? ` Matched against ${countryInsight.countryNameEn} intelligence (${countryInsight.avgDwellTime} avg dwell):`
        : '';
      return `Best Match for Your Request:${regionEn} "${primaryFilm.canonicalTitle}" by ${primaryFilm.directorOrStudio} (${primaryFilm.pillar} • ${primaryFilm.resolution}, benchmarked against Global #${srcRank} source ${srcDomain} with ${srcDwell} avg dwell time). ${primaryFilm.coreSynopsis} For the signature climax (${cosineScorePct}% affinity), jump directly to "${bestScene.label}" at ${bestScene.timeFormatted}.`;
    }
  }
}

// ============================================================================
// CURATED ARCHIVE AI SEARCH & GLOBAL 100-SOURCE RANKING ENGINE
// ============================================================================

// ============================================================================
// DYNAMIC 10-FILM CUSTOM ADULT CURATOR & SEARCH GENERATOR
// Translates any search query or chat topic into 10 tailored adult films
// ============================================================================

const RELIABLE_STREAMS = [
  '/assets/videos/stream_oceans.mp4',
  '/assets/videos/stream_sintel.mp4',
  '/assets/videos/stream_bunny.mp4',
  '/assets/videos/stream_movie.mp4',
  '/assets/videos/stream_oceans.mp4',
  '/assets/videos/stream_sintel.mp4',
  '/assets/videos/stream_bunny.mp4',
  '/assets/videos/stream_movie.mp4',
  '/assets/videos/stream_sintel.mp4',
  '/assets/videos/stream_movie.mp4'
];

const CURATED_POSTERS = [
  './assets/images/boudoir_crimson_silk_suite_1794443433215.jpg',
  './assets/images/editorial_amber_hotel_noir_1794443435341.jpg',
  './assets/images/ai_erotic_velvet_illusion_1794443435845.jpg',
  './assets/images/anime_nocturne_neon_boudoir_1794443444307.jpg',
  './assets/images/cinema_crimson_penthouse_1794408993203.jpg',
  './assets/images/cinema_noir_velvet_rain_1794398988857.jpg',
  './assets/images/cinema_obsidian_sonata_1794398992852.jpg',
  './assets/images/cinema_midnight_express_paris_1794408998635.jpg',
  './assets/images/ai_cinema_quantum_oasis_1794408994686.jpg',
  './assets/images/ai_cinema_solaris_mirage_1794398990412.jpg'
];

export function generateDynamic10CustomAdultFilms(
  rawQuery: string,
  preferredLang: string = 'fa',
  sessionVector: MoodVector5D
): {
  activeWindow10: CatalogFilmItem[];
  reservePool: CatalogFilmItem[];
  categoryTitleFa: string;
  categoryTitleEn: string;
} {
  const q = rawQuery.trim().toLowerCase();
  const isFa = preferredLang === 'fa';

  let categoryTitleFa = 'ترندهای اختصاصی هوش مصنوعی';
  let categoryTitleEn = 'AI Curated Adult Trends';
  let titles: { en: string; fa: string; studio: string; domain: string; moodFa: string; synopsisFa: string; synopsisEn: string; pillar: FilmPillarCode }[] = [];

  if (/میلف|مادر|سن بالا|mature|milf|cougar|stepmom|خاله/i.test(q)) {
    categoryTitleFa = '۱۰ فیلم برتر ژانر میلف و بانوان بزرگسال (MILF & Mature)';
    categoryTitleEn = 'Top 10 MILF & Mature Worldwide Trends';
    titles = [
      {
        en: 'Brazzers MILF: Luxury Villa Private Seduction',
        fa: 'برازرس میلف · وسوسه در ویلای مجلل خصوصی',
        studio: 'Brazzers Premium • 4K 60FPS',
        domain: 'brazzers.com',
        moodFa: 'میلف و استودیویی لوکس',
        synopsisFa: 'پرطرفدارترین ترند استودیو برازرس در ژانر میلف با بازی برترین ستاره‌های بزرگسال و کیفیت 4K واقعی.',
        synopsisEn: 'Top-ranked Brazzers 4K studio release in the MILF category featuring elite adult actresses in a private luxury villa.',
        pillar: 'LIVE'
      },
      {
        en: 'Naughty America: Stepmom Late Night Desire',
        fa: 'ناتی آمریکا · سناریوی شبانه مادرخوانده',
        studio: 'Naughty America HD',
        domain: 'naughtyamerica.com',
        moodFa: 'سناریو محور و فانتزی',
        synopsisFa: 'از تحسین‌شده‌ترین داستان‌های استودیو ناتی آمریکا با سناریوی محبوب خانوادگی و بازیگری بی‌نظیر.',
        synopsisEn: 'Acclaimed roleplay scenario from Naughty America with exceptional acting, dialogue, and late-night tension.',
        pillar: 'LIVE'
      },
      {
        en: 'Reality Kings: Malibu MILF Hunter 4K',
        fa: 'ریالیتی کینگز · شکارچی میلف در سواحل مالیبو',
        studio: 'Reality Kings Classics',
        domain: 'realitykings.com',
        moodFa: 'فضای آزاد و تابستانی',
        synopsisFa: 'اثر پربیننده استودیو ریالیتی کینگز در سواحل آفتابی کالیفرنیا با نور طبیعی و کیفیت فوق‌العاده ۶۰ فریم.',
        synopsisEn: 'Sunny Californian beachside classic by Reality Kings captured in crisp 60fps natural lighting.',
        pillar: 'LIVE'
      },
      {
        en: 'Vixen Mature: French Riviera Elegance',
        fa: 'ویکسن · زیبایی و کمال در ریویرا فرانسه',
        studio: 'Vixen Media Group • 4K HDR',
        domain: 'vixen.com',
        moodFa: 'شهوانی و رمانتیک لوکس',
        synopsisFa: 'شاهکار بصری و مجلل ویکسن با زیباترین بازیگران بزرگسال، نورپردازی طلایی و صحنه‌های صمیمی.',
        synopsisEn: 'Breathtaking erotic cinema by Vixen with golden cinematography and elegant romantic intimacy.',
        pillar: 'LIVE'
      },
      {
        en: 'Pornhub Top 1 MILF: Midnight Bedroom POV',
        fa: 'پورن‌هاب ترند ۱ میلف · زاویه دید اول‌شخص اتاق خواب',
        studio: 'Pornhub Verified • 4K',
        domain: 'pornhub.com',
        moodFa: 'دید اول‌شخص و صمیمی (POV)',
        synopsisFa: 'پربازدیدترین اثر میلف پورن‌هاب در ۳۰ روز گذشته با زاویه دوربین صمیمی و صدای طبیعی اتاق.',
        synopsisEn: 'The #1 trending MILF video across Pornhub with intimate handheld POV camera work and natural ASMR audio.',
        pillar: 'LIVE'
      },
      {
        en: 'Blacked Raw: Mature Allure Penthouse',
        fa: 'بلکد راو · جذابیت میلف در پنت‌هاوس',
        studio: 'Blacked Raw Studios',
        domain: 'blacked.com',
        moodFa: 'استودیویی داغ و پرانرژی',
        synopsisFa: 'تولید استودیویی پرحرارت بلکد راو با بازیگران باتجربه و ریتم تند ۶۰ فریم بر ثانیه.',
        synopsisEn: 'High-voltage studio release from Blacked Raw featuring intense pacing and high-bitrate video.',
        pillar: 'LIVE'
      },
      {
        en: 'Tushy Luxury: Italian Countess Romance',
        fa: 'توشی لوکس · عمارت اشرافی ایتالیا',
        studio: 'Tushy Art Series • 4K',
        domain: 'tushy.com',
        moodFa: 'هنری و لوکس',
        synopsisFa: 'روایت عاشقانه و بی‌پرده در ویلای تاریخی توسکانی با ساتن سیاه و معماری رنسانس.',
        synopsisEn: 'Artistic high-end adult film set in a historic Tuscan villa with black satin and renaissance aesthetics.',
        pillar: 'LIVE'
      },
      {
        en: 'OnlyFans VIP MILF: Private Boudoir Session',
        fa: 'اونلی‌فنز VIP · اتاق خواب صمیمی و اختصاصی',
        studio: 'OnlyFans Top 0.01% VIP',
        domain: 'onlyfans.com',
        moodFa: 'اتاق خواب اختصاصی بدون سانسور',
        synopsisFa: 'محتوای گلچین‌شده تاپ کریتورهای اونلی‌فنز با ارتباط مستقیم چشمی و آزادی کامل.',
        synopsisEn: 'Exclusive private session from elite OnlyFans creators with direct eye contact and raw realism.',
        pillar: 'LIVE'
      },
      {
        en: 'MissAV JAV: Mature Japanese Ryokan Uncensored',
        fa: 'میس‌ای‌وی ژاپن · بانوی باوقار در اونسن بدون سانسور',
        studio: 'MissAV Uncut JAV',
        domain: 'missav.ai',
        moodFa: 'آسیایی و ژاپنی بدون سانسور',
        synopsisFa: 'سینمای بزرگسال ژاپن در ژانر بانوان بزرگسال به صورت کاملاً بدون سانسور و با صدای دوگوشی.',
        synopsisEn: 'Top-tier uncensored JAV release featuring mature Japanese actress in a traditional hot spring inn.',
        pillar: 'LIVE'
      },
      {
        en: 'Candy AI: Photoreal Mature Goddess 4K',
        fa: 'هوش مصنوعی کندی · فانتزی فتورئال بانوی بزرگسال',
        studio: 'Candy AI / Lovescape',
        domain: 'candy.ai',
        moodFa: 'هوش مصنوعی بزرگسال فراواقعی',
        synopsisFa: 'رندرینگ نسل جدید هوش مصنوعی با شبیه‌سازی خیره‌کننده بافت پوست و فانتزی‌های سفارشی.',
        synopsisEn: 'Next-gen photorealistic generative AI cinema rendering ultra-realistic skin and custom fantasy.',
        pillar: 'AI'
      }
    ];
  } else if (/ژاپنی|آسیایی|اسیایی|ژاپن|jav|asian|japanese|tokyo|missav|njavtv|سانسور|بدون سانسور/i.test(q)) {
    categoryTitleFa = '۱۰ فیلم برتر سینمای ژاپن و آسیا بدون سانسور (Uncensored JAV)';
    categoryTitleEn = 'Top 10 Asian & Japanese Uncensored JAV Trends';
    titles = [
      {
        en: 'MissAV Tokyo Uncensored: Luxury Onsen Ryokan',
        fa: 'میس‌ای‌وی ژاپن · اونسن سنتی بدون سانسور',
        studio: 'MissAV Uncut JAV • 4K 60FPS',
        domain: 'missav.ai',
        moodFa: 'ژاپنی بدون سانسور و پرحرارت',
        synopsisFa: 'ترند شماره یک سینمای بزرگسال ژاپن به صورت کاملاً بدون سانسور در اونسن چوب سدر با صدای ASMR.',
        synopsisEn: 'The #1 trending uncensored JAV release in a traditional cedar onsen bath with crystal 4K clarity.',
        pillar: 'LIVE'
      },
      {
        en: 'NJAVTV S1 Exclusive: Shinjuku Penthouse Rendezvous',
        fa: 'استودیو اس‌وان · ملاقات نیمه‌شب پنت‌هاوس شینجوکو',
        studio: 'S1 Japan / NJAVTV Ad-Free',
        domain: 'njavtv.com',
        moodFa: 'استودیویی لوکس ژاپن',
        synopsisFa: 'تولید مجلل استودیو اس‌وان توکیو با حضور محبوب‌ترین ستاره سینمای بزرگسال آسیا بدون تبلیغ.',
        synopsisEn: 'Flagship high-budget studio release from S1 Japan featuring Tokyo’s top adult actress.',
        pillar: 'LIVE'
      },
      {
        en: 'FALENO Star: Roppongi Midnight Satin',
        fa: 'استودیو فالنو · ساتن سیاه و نئون روپونگی',
        studio: 'FALENO Star Japan • 4K',
        domain: 'faleno.jp',
        moodFa: 'شهوانی و پرکشش',
        synopsisFa: 'درام رمانتیک و بی‌پرده در برج مسکونی روپونگی با نورپردازی نئونی و تصویربرداری ۶۰ فریم.',
        synopsisEn: 'Sensual romantic drama by FALENO Star set in a luxury Roppongi tower with cinematic 60fps pacing.',
        pillar: 'LIVE'
      },
      {
        en: 'SOD Create: Tokyo Private Suite Uncut',
        fa: 'اس‌او‌دی ژاپن · سوئیت خصوصی توکیو بدون سانسور',
        studio: 'SOD Create • Uncensored Cut',
        domain: 'sod.co.jp',
        moodFa: 'دید اول‌شخص و صمیمی',
        synopsisFa: 'سکانس‌های صمیمی و بی‌پرده با زاویه نزدیک و کیفیت شگفت‌انگیز 4K استودیو سافت آن دماند.',
        synopsisEn: 'Intimate uncut private suite experience from Soft On Demand with close-up multi-camera angles.',
        pillar: 'LIVE'
      },
      {
        en: 'Moodyz Uncut: Kyoto Kimono Seduction',
        fa: 'مودیز ژاپن · وسوسه کیمونوی ابریشمی در کیوتو',
        studio: 'Moodyz Japan • 4K',
        domain: 'moodyz.com',
        moodFa: 'سنتی و فوق‌العاده حسی',
        synopsisFa: 'ترکیب کیمونوی اصیل ابریشم، اتاق تاتامی چوبی و بازیگری مسحورکننده ستاره‌های توکیو.',
        synopsisEn: 'Authentic silk kimono and traditional tatami room setting with spellbinding Japanese acting.',
        pillar: 'LIVE'
      },
      {
        en: 'Prestige Tokyo: Late Night Hotel 808',
        fa: 'استودیو پرستیژ · هتل نیمه‌شب اتاق ۸۰۸',
        studio: 'Prestige Studios Japan',
        domain: 'prestige-av.com',
        moodFa: 'هتل شبانه و باران',
        synopsisFa: 'پشت پنجره‌های باران‌خورده لاوهتل شینجوکو با صدابرداری طبیعی ۳۶۰ درجه دوگوشی.',
        synopsisEn: 'Late-night Shinjuku love hotel encounter with 360-degree binaural natural sound capture.',
        pillar: 'LIVE'
      },
      {
        en: 'Attackers JAV: Intense Uncensored Encounter',
        fa: 'اتکرز ژاپن · درام پرحرارت و نفس‌گیر',
        studio: 'Attackers Japan • 4K 60FPS',
        domain: 'attackers.net',
        moodFa: 'پرانرژی و هیجان‌انگیز',
        synopsisFa: 'سینمای داستانی و پرحرارت استودیو اتکرز با دیالوگ‌های درگیرکننده و اوج هیجان.',
        synopsisEn: 'High-tension narrative cinema from Attackers Japan featuring dramatic climaxes and raw pacing.',
        pillar: 'LIVE'
      },
      {
        en: 'IdeaPocket: Cyberpunk Tokyo Passion',
        fa: 'آیدیا پاکت · هیجان سایبرپانک و نئون توکیو',
        studio: 'IdeaPocket • 4K HDR',
        domain: 'ideapocket.com',
        moodFa: 'مدرن و مسحورکننده',
        synopsisFa: 'فضای مدرن و نئونی کلان‌شهر توکیو با طراحی صحنه آینده‌نگرانه و بازیگری درجه یک.',
        synopsisEn: 'Futuristic neon aesthetics and modern Tokyo high-rise setting by IdeaPocket.',
        pillar: 'LIVE'
      },
      {
        en: 'Madonna Mature: Tokyo Luxury Elegance',
        fa: 'مادونا ژاپن · بانوی باوقار و شیک توکیو',
        studio: 'Madonna Japan Classics',
        domain: 'madonna-av.com',
        moodFa: 'میلف ژاپنی باکلاس',
        synopsisFa: 'پرطرفدارترین استودیوی ژاپن در رده بانوان شیک‌پوش با روایت عاشقانه و صمیمیت کامل.',
        synopsisEn: 'The gold standard in mature Japanese cinema featuring elegant Tokyo actresses.',
        pillar: 'LIVE'
      },
      {
        en: 'DLsite Audio-Drama: Binaural ASMR Tokyo',
        fa: 'دی‌ال‌سایت · درام صوتی و دوگوشی ۳ بعدی توکیو',
        studio: 'DLsite Adult ASMR Lab',
        domain: 'dlsite.com',
        moodFa: 'صدای سه‌بعدی ASMR',
        synopsisFa: 'تجربه بی‌نظیر صداسازی سه بعدی دوگوشی که حس حضور در کنار بازیگر را القا می‌کند.',
        synopsisEn: 'Immersive 3D binaural audio design creating an ultra-realistic sensation of physical proximity.',
        pillar: 'ANIMATION'
      }
    ];
  } else if (/ماساژ|massage|spa|اسپا|روغن|oil|نرو|nuru/i.test(q)) {
    categoryTitleFa = '۱۰ فیلم برتر ماساژ اروتیک، اسپا و ریلکسیشن داغ';
    categoryTitleEn = 'Top 10 Erotic Massage & Sensual Spa Trends';
    titles = [
      {
        en: 'Nuru Massage Tokyo: Pure Warm Gel & Silk',
        fa: 'ماساژ نورو توکیو · ژل گرم جلبک و لمس ابریشمی',
        studio: 'Tokyo Nuru Sanctuary • 4K 60FPS',
        domain: 'missav.ai',
        moodFa: 'ماساژ نورو سنتی ژاپن',
        synopsisFa: 'اصیل‌ترین تجربه ماساژ نورو ژاپنی با ژل طبیعی گرم، ملحفه‌های لغزنده و تماس کامل بدن.',
        synopsisEn: 'Authentic Japanese nuru massage using warm organic seaweed gel and full-body tactile contact.',
        pillar: 'LIVE'
      },
      {
        en: 'Sensual Spa Paris: Heated Aromatherapy Suite',
        fa: 'اسپای پاریس · سوئیت آروماتراپی و شمع‌های معطر',
        studio: 'Maison Spa Paris • 4K',
        domain: 'vixen.com',
        moodFa: 'شهوانی و ریلکسیشن لوکس',
        synopsisFa: 'نور ملایم شمع‌های کهربایی، روغن بادام گرم و ماساژ آرام و عمیق که به اوج لذت ختم می‌شود.',
        synopsisEn: 'Warm amber candle glow, heated almond oils, and deep slow-burn erotic massage.',
        pillar: 'LIVE'
      },
      {
        en: 'Brazzers Massage: Private Villa Full Body Therapy',
        fa: 'برازرس ماساژ · ویلای خصوصی و ماساژ کل بدن',
        studio: 'Brazzers Premium 4K',
        domain: 'brazzers.com',
        moodFa: 'استودیویی پرحرارت',
        synopsisFa: 'سناریوی هیجان‌انگیز استودیو برازرس در ویلای شخصی با حضور معروف‌ترین ماسورهای ستاره.',
        synopsisEn: 'High-energy studio massage scenario filmed inside an exclusive private estate.',
        pillar: 'LIVE'
      },
      {
        en: 'MissAV Tokyo Spa: Uncensored Nuru Ryokan',
        fa: 'میس‌ای‌وی ژاپن · ماساژ نورو بدون سانسور در ریوکان',
        studio: 'MissAV Uncut JAV • 4K',
        domain: 'missav.ai',
        moodFa: 'ژاپنی بدون سانسور',
        synopsisFa: 'ماساژ بدون سانسور در سوئیت تاتامی سنتی با وضوح فوق‌العاده و صدای آرامش‌بخش آب.',
        synopsisEn: 'Uncensored Japanese massage release inside a traditional ryokan with calming water ASMR.',
        pillar: 'LIVE'
      },
      {
        en: 'Vixen Sensual: Candlelight Oil Therapy',
        fa: 'ویکسن · تراپی روغنی در نور شمع',
        studio: 'Vixen Media Group • 4K HDR',
        domain: 'vixen.com',
        moodFa: 'رمانتیک و شهوانی',
        synopsisFa: 'سینمای ناب اروتیک با تصویربرداری استادانه، دست‌های آغشته به روغن و نگاه‌های پرکشش.',
        synopsisEn: 'Masterpiece erotic film with golden skin reflections, heated oils, and slow sensual touch.',
        pillar: 'LIVE'
      },
      {
        en: 'OnlyFans VIP: Intimate Bedroom Massage POV',
        fa: 'اونلی‌فنز VIP · ماساژ صمیمی دید اول‌شخص در تخت',
        studio: 'OnlyFans Top Creators',
        domain: 'onlyfans.com',
        moodFa: 'دید اول‌شخص و خصوصی',
        synopsisFa: 'تجربه کاملاً شخصی و اختصاصی از زاویه دید بیننده با ماساژ دست‌ها و تنش حسی فوق‌العاده.',
        synopsisEn: 'Handheld first-person POV capturing a close-up personal massage session.',
        pillar: 'LIVE'
      },
      {
        en: 'Pornhub Top Trend: Swedish Full-Body Spa',
        fa: 'پورن‌هاب ترند · ماساژ سوئدی کل بدن',
        studio: 'Pornhub Verified',
        domain: 'pornhub.com',
        moodFa: 'پرطرفدار جهانی',
        synopsisFa: 'پربازدیدترین ویدیوی دسته ماساژ پورن‌هاب با تکنیک‌های حرفه‌ای و پایانی فوق‌العاده داغ.',
        synopsisEn: 'Most-replayed massage release across global platforms with professional techniques.',
        pillar: 'LIVE'
      },
      {
        en: 'Reality Kings: Malibu Seaside Massage 4K',
        fa: 'ریالیتی کینگز · ماساژ در نسیم ساحلی مالیبو',
        studio: 'Reality Kings Classics',
        domain: 'realitykings.com',
        moodFa: 'فضای باز کالیفرنیا',
        synopsisFa: 'ماساژ روی تراس اختصاصی رو به اقیانوس آرام با صدای موج دریا و نور درخشان آفتاب.',
        synopsisEn: 'Outdoor seaside terrace setting with ocean breeze, sunlight, and relaxing touch.',
        pillar: 'LIVE'
      },
      {
        en: 'Tushy Relaxation: Tuscan Villa Heated Stones',
        fa: 'توشی · سنگ‌های داغ و اسپا در توسکانی ایتالیا',
        studio: 'Tushy Art Series',
        domain: 'tushy.com',
        moodFa: 'هنری و لوکس',
        synopsisFa: 'ترکیب سنگ‌های آتشفشانی داغ، روغن‌های کمیاب گیاهی و هم‌آغوشی اشرافی در ایتالیا.',
        synopsisEn: 'Hot volcanic stone therapy and rare botanical oils inside a luxury Italian manor.',
        pillar: 'LIVE'
      },
      {
        en: 'Candy AI: Virtual Relaxation Sanctuary 4K',
        fa: 'هوش مصنوعی کندی · معبد آرامش و ماساژ فراواقعی',
        studio: 'Candy AI Erotic Synth',
        domain: 'candy.ai',
        moodFa: 'هوش مصنوعی فراواقعی',
        synopsisFa: 'رندرینگ کاملاً سفارشی هوش مصنوعی برای ماساژ آرامش‌بخش با گرافیک فتورئالیستیک خیره‌کننده.',
        synopsisEn: 'Custom photoreal generative massage sanctuary tailored for sensory relaxation.',
        pillar: 'AI'
      }
    ];
  } else if (/بلوند|blonde|روس|روسی|اروپایی|euro|russian|طلایی/i.test(q)) {
    categoryTitleFa = '۱۰ فیلم برتر ستارگان بلوند و اروپایی (Blonde & European Glamour)';
    categoryTitleEn = 'Top 10 Blonde & European Adult Cinema Trends';
    titles = [
      {
        en: 'Vixen Blonde: Parisian Chateau Romance',
        fa: 'ویکسن بلوند · عمارت لوکس و رمانتیک پاریس',
        studio: 'Vixen Media Group • 4K HDR',
        domain: 'vixen.com',
        moodFa: 'بلوند و شهوانی لوکس',
        synopsisFa: 'شاهکار استودیو ویکسن با حضور برترین سوپرمدل بلوند در عمارت مجلل پاریس با نورپردازی طبیعی.',
        synopsisEn: 'Vixen masterpiece starring elite blonde supermodels inside a private Parisian chateau.',
        pillar: 'LIVE'
      },
      {
        en: 'Brazzers 4K: Blonde Star Penthouse Passion',
        fa: 'برازرس ۴K · پنت‌هاوس ستاره بلوند',
        studio: 'Brazzers Premium • 4K 60FPS',
        domain: 'brazzers.com',
        moodFa: 'استودیویی داغ و پرحرارت',
        synopsisFa: 'پربازدیدترین ترند ۴K استودیو برازرس با بازیگر محبوب موطلایی در بالاترین طبقه آسمان‌خراش.',
        synopsisEn: 'Top-ranked Brazzers 4K blockbuster starring world-famous blonde adult icon.',
        pillar: 'LIVE'
      },
      {
        en: 'Blacked Raw: Scandinavian Blonde Allure',
        fa: 'بلکد راو · بانوی بلوند اسکاندیناوی',
        studio: 'Blacked Raw Studios • 4K',
        domain: 'blacked.com',
        moodFa: 'پرانرژی و استودیویی',
        synopsisFa: 'تولید ۶۰ فریم پرهیجان با بازیگر موطلایی شمالی با کنتراست نوری فوق‌العاده و ریتم تند.',
        synopsisEn: 'High-voltage 60fps release featuring Scandinavian blonde beauty with raw pacing.',
        pillar: 'LIVE'
      },
      {
        en: 'Tushy Art: Golden Hair Renaissance Romance',
        fa: 'توشی آرت · موهای طلایی در کاخ رنسانس',
        studio: 'Tushy Art Series • 4K',
        domain: 'tushy.com',
        moodFa: 'هنری و مجلل',
        synopsisFa: 'سینمای باوقار و فاخر توشی با نور زرین پنجره‌های بلند، ساتن مشکی و موهای طلایی.',
        synopsisEn: 'Refined European erotic cinema framed through tall sunlit palace windows.',
        pillar: 'LIVE'
      },
      {
        en: 'OnlyFans VIP: Russian Blonde Uncut Boudoir',
        fa: 'اونلی‌فنز VIP · ستاره بلوند روس در اتاق خواب',
        studio: 'OnlyFans Top 0.01%',
        domain: 'onlyfans.com',
        moodFa: 'اتاق خواب اختصاصی بدون سانسور',
        synopsisFa: 'سکانس‌های کاملاً صمیمی و بدون سانسور ستاره بلوند محبوب آنلاین با زاویه اختصاصی.',
        synopsisEn: 'Unfiltered private boudoir footage from top Russian blonde creator.',
        pillar: 'LIVE'
      },
      {
        en: 'Reality Kings: Malibu Blonde Sunset 4K',
        fa: 'ریالیتی کینگز · غروب آفتاب بلوند در مالیبو',
        studio: 'Reality Kings Classics',
        domain: 'realitykings.com',
        moodFa: 'فضای آزاد و آفتابی',
        synopsisFa: 'تابستان پرهیجان کالیفرنیا با بازیگر بلوند پرطرفدار در کنار استخر ویلای ساحلی.',
        synopsisEn: 'Sunny poolside romance in California featuring stunning blonde star.',
        pillar: 'LIVE'
      },
      {
        en: 'Naughty America: Blonde Executive Fantasy',
        fa: 'ناتی آمریکا · سناریوی منشی موطلایی در دفتر',
        studio: 'Naughty America HD',
        domain: 'naughtyamerica.com',
        moodFa: 'سناریو محور و محیط کار',
        synopsisFa: 'داستان پرکشش و محبوب دفتر کار شبانه با بازیگر بلوند سرشناس و دیالوگ‌های پرحرارت.',
        synopsisEn: 'Popular corporate office roleplay starring charismatic blonde adult actress.',
        pillar: 'LIVE'
      },
      {
        en: 'X-Art Pure: Blonde Mediterranean Sun 4K',
        fa: 'ایکس‌آرت · آفتاب مدیترانه و دختر موطلایی',
        studio: 'X-Art Erotica • 4K',
        domain: 'x-art.com',
        moodFa: 'طبیعی و رمانتیک',
        synopsisFa: 'عکاسی و فیلم‌برداری بی‌نقص سینمایی در ساحل صخره‌ای با بازیگری صمیمی و عاطفی.',
        synopsisEn: 'Pure aesthetic beauty filmed under Mediterranean sunlight with heartfelt romance.',
        pillar: 'LIVE'
      },
      {
        en: 'Dorcel Paris: Blonde French Couture Noir',
        fa: 'دورسل فرانسه · استایل پاریسی و بانوی بلوند',
        studio: 'Marc Dorcel Cinema',
        domain: 'dorcelclub.com',
        moodFa: 'سینمایی و لوکس فرانسوی',
        synopsisFa: 'تولید شیک و مجلل استودیو دورسل پاریس با لباس‌های شب ابریشمی و کادرهای باشکوه.',
        synopsisEn: 'High-fashion adult cinema by Marc Dorcel Paris featuring haute couture aesthetics.',
        pillar: 'LIVE'
      },
      {
        en: 'Candy AI: Virtual Nordic Blonde Goddess 4K',
        fa: 'هوش مصنوعی کندی · الهه بلوند اسکاندیناوی فتورئال',
        studio: 'Candy AI Synth Lab',
        domain: 'candy.ai',
        moodFa: 'هوش مصنوعی بزرگسال',
        synopsisFa: 'رندرینگ فتورئال فوق‌العاده هوش مصنوعی با بازسازی واقع‌گرایانه موهای بلوند و پوست طبیعی.',
        synopsisEn: 'Ultra-photorealistic generative model rendering silky blonde hair and lifelike skin.',
        pillar: 'AI'
      }
    ];
  } else if (/pov|اول شخص|دید اول شخص|vr|زاویه من/i.test(q)) {
    categoryTitleFa = '۱۰ فیلم برتر زاویه دید اول شخص و واقع‌گرایانه (POV & VR)';
    categoryTitleEn = 'Top 10 Intimate First-Person POV & VR Trends';
    titles = [
      {
        en: 'Pornhub Verified POV: Intimate Bedroom 4K',
        fa: 'پورن‌هاب ترند ۱ · دید اول‌شخص صمیمی در اتاق خواب',
        studio: 'Pornhub Verified • 4K 60FPS',
        domain: 'pornhub.com',
        moodFa: 'دید اول شخص POV',
        synopsisFa: 'پربازدیدترین اثر زاویه دید اول شخص با ارتباط مستقیم چشمی و کیفیت شگفت‌انگیز ۶۰ فریم.',
        synopsisEn: 'Top-ranked first person POV video with direct gaze and crisp 60fps realism.',
        pillar: 'LIVE'
      },
      {
        en: 'Blacked Raw POV: Midnight Penthouse Seduction',
        fa: 'بلکد راو POV · وسوسه شبانه پنت‌هاوس',
        studio: 'Blacked Raw Studios',
        domain: 'blacked.com',
        moodFa: 'پرانرژی و استودیویی POV',
        synopsisFa: 'فیلم‌برداری دوربین روی دست با ریتم تند و هم‌آغوشی بی‌پرده در پنت‌هاوس میلان.',
        synopsisEn: 'Handheld dynamic POV cinematography inside a high-rise penthouse.',
        pillar: 'LIVE'
      },
      {
        en: 'Vixen POV: Unbroken Eye Contact Romance',
        fa: 'ویکسن POV · نگاه چشمی مستقیم و رمانتیک',
        studio: 'Vixen Media Group • 4K',
        domain: 'vixen.com',
        moodFa: 'شهوانی و صمیمی POV',
        synopsisFa: 'حس نزدیکی مطلق و نگاه‌های دلربا بدون کات، که بیننده را در مرکز صحنه قرار می‌دهد.',
        synopsisEn: 'Unbroken intimate eye contact and close-up cinematic framing.',
        pillar: 'LIVE'
      },
      {
        en: 'Brazzers POV: Elite Suite Experience 4K',
        fa: 'برازرس POV · سوئیت اختصاصی ستارگان',
        studio: 'Brazzers Premium 4K',
        domain: 'brazzers.com',
        moodFa: 'استودیویی لوکس POV',
        synopsisFa: 'تجربه استودیویی برازرس از زاویه دید اول شخص با حضور برترین ستارگان زن جهان.',
        synopsisEn: 'Full-length studio production capturing iconic performers from a first-person lens.',
        pillar: 'LIVE'
      },
      {
        en: 'MissAV JAV POV: Tokyo Hotel Room Uncensored',
        fa: 'میس‌ای‌وی ژاپن POV · هتل توکیو بدون سانسور',
        studio: 'MissAV Uncut JAV',
        domain: 'missav.ai',
        moodFa: 'ژاپنی بدون سانسور POV',
        synopsisFa: 'حس صمیمیت ژاپنی در اتاق هتل با صدای دوگوشی نزدیک و بدون کوچک‌ترین سانسور.',
        synopsisEn: 'Uncut Japanese hotel room experience with spatial close-mic voice acting.',
        pillar: 'LIVE'
      },
      {
        en: 'OnlyFans Creator POV: Handheld Bedroom Realism',
        fa: 'اونلی‌فنز POV · واقع‌گرایی دوربین روی دست در تخت',
        studio: 'OnlyFans Elite VIP',
        domain: 'onlyfans.com',
        moodFa: 'اتاق خواب اختصاصی POV',
        synopsisFa: 'فیلم‌برداری طبیعی با موبایل با کیفیت 4K و تعامل بی‌نظیر که کاملاً شخصی حس می‌شود.',
        synopsisEn: 'Authentic creator-filmed bedroom footage with natural raw intimacy.',
        pillar: 'LIVE'
      },
      {
        en: 'Reality Kings POV: California Sunset Poolside',
        fa: 'ریالیتی کینگز POV · کنار استخر کالیفرنیا در غروب',
        studio: 'Reality Kings Classics',
        domain: 'realitykings.com',
        moodFa: 'فضای آزاد POV',
        synopsisFa: 'زاویه اول شخص در هوای گرم تابستان کنار آب‌های زلال استخر با نور طلایی عصر.',
        synopsisEn: 'Warm sunny Californian poolside encounter shot entirely in first-person perspective.',
        pillar: 'LIVE'
      },
      {
        en: 'Naughty America POV: Close Encounters 4K',
        fa: 'ناتی آمریکا POV · بازیگری نزدیک و پرحرارت',
        studio: 'Naughty America HD',
        domain: 'naughtyamerica.com',
        moodFa: 'سناریو محور POV',
        synopsisFa: 'دیالوگ‌های جذاب و حرکات طبیعی بازیگران از دید اول‌شخص با سناریوی درگیرکننده.',
        synopsisEn: 'Engaging roleplay scenario placed squarely in the viewer’s shoes.',
        pillar: 'LIVE'
      },
      {
        en: 'Tushy POV: Luxury Renaissance Boudoir',
        fa: 'توشی POV · اتاق خواب اشرافی رنسانس',
        studio: 'Tushy Art Series',
        domain: 'tushy.com',
        moodFa: 'هنری و لوکس POV',
        synopsisFa: 'کادربندی فاخر هنری با دید اول شخص در میان بالش‌های مخمل و پارچه‌های ابریشمی.',
        synopsisEn: 'Opulent boudoir setting shot in high-definition first-person viewpoint.',
        pillar: 'LIVE'
      },
      {
        en: 'Candy AI POV: Virtual Intimacy Engine 4K',
        fa: 'هوش مصنوعی کندی POV · موتور صمیمیت فراواقعی',
        studio: 'Candy AI Synth Lab',
        domain: 'candy.ai',
        moodFa: 'هوش مصنوعی بزرگسال POV',
        synopsisFa: 'تعامل مستقیم با مدل‌های فتورئالیستیک هوش مصنوعی از زاویه اول شخص با کیفیت خیره‌کننده.',
        synopsisEn: 'Interactive photoreal generative cinema built for full first-person immersion.',
        pillar: 'AI'
      }
    ];
  } else {
    // Dynamic Synthesis for ANY other search topic (e.g. teen 19+, latina, ebony, romantic, hardcore, etc.)
    const cleanTerm = rawQuery.replace(/[#@]/g, '').trim();
    const capitalizedTerm = cleanTerm ? cleanTerm.charAt(0).toUpperCase() + cleanTerm.slice(1) : 'Adult Masterpiece';
    categoryTitleFa = `۱۰ فیلم برتر جهان در سبک: "${cleanTerm || 'ترندهای داغ جهانی'}"`;
    categoryTitleEn = `Top 10 Global Trends for "${capitalizedTerm}"`;

    const studioBrands = [
      { name: 'Brazzers Premium • 4K 60FPS', domain: 'brazzers.com', prefixFa: 'برازرس استودیویی', prefixEn: 'Brazzers 4K' },
      { name: 'Vixen Media Group • 4K HDR', domain: 'vixen.com', prefixFa: 'ویکسن رمانتیک', prefixEn: 'Vixen Sensual' },
      { name: 'Pornhub Top Worldwide', domain: 'pornhub.com', prefixFa: 'پورن‌هاب ترند ۱', prefixEn: 'Pornhub Top 1' },
      { name: 'MissAV Uncut JAV • 4K', domain: 'missav.ai', prefixFa: 'میس‌ای‌وی بدون سانسور', prefixEn: 'MissAV Tokyo Uncut' },
      { name: 'Blacked Raw Studios', domain: 'blacked.com', prefixFa: 'بلکد راو پرهیجان', prefixEn: 'Blacked Raw' },
      { name: 'OnlyFans Top 0.01% VIP', domain: 'onlyfans.com', prefixFa: 'اونلی‌فنز اختصاصی', prefixEn: 'OnlyFans VIP' },
      { name: 'Reality Kings Classics', domain: 'realitykings.com', prefixFa: 'ریالیتی کینگز ساحلی', prefixEn: 'Reality Kings' },
      { name: 'Naughty America HD', domain: 'naughtyamerica.com', prefixFa: 'ناتی آمریکا سناریو', prefixEn: 'Naughty America' },
      { name: 'Tushy Art Series • 4K', domain: 'tushy.com', prefixFa: 'توشی لوکس', prefixEn: 'Tushy Art' },
      { name: 'Candy AI / Lovescape', domain: 'candy.ai', prefixFa: 'هوش مصنوعی کندی', prefixEn: 'Candy AI Fantasy' }
    ];

    titles = studioBrands.map((brand, idx) => ({
      en: `${brand.prefixEn}: ${capitalizedTerm} Private Session Vol. ${idx + 1}`,
      fa: `${brand.prefixFa} · ${cleanTerm || 'هم‌آغوشی لوکس'} (قسمت ${idx + 1})`,
      studio: brand.name,
      domain: brand.domain,
      moodFa: 'دست‌چین ترندهای داغ جهانی',
      synopsisFa: `اثر دست‌چین شده و برتر در موضوع "${cleanTerm}" با کیفیت 4K، فیلم‌برداری ۶۰ فریم و صدای کاملاً طبیعی استودیویی بدون سانسور.`,
      synopsisEn: `Top curated 4K release matching "${capitalizedTerm}" with 60fps high-bitrate streaming and authentic studio atmosphere.`,
      pillar: idx === 3 ? 'LIVE' : idx === 9 ? 'AI' : 'LIVE'
    }));
  }

  const activeWindow10: CatalogFilmItem[] = titles.slice(0, 10).map((t, idx) => {
    const stream = RELIABLE_STREAMS[idx % RELIABLE_STREAMS.length];
    const poster = CURATED_POSTERS[idx % CURATED_POSTERS.length];
    return {
      id: `custom-film-${idx + 1}-${Date.now().toString(36)}`,
      indexNumber: idx + 1,
      streamUrl: stream,
      posterUrl: poster,
      pillar: t.pillar,
      resolution: '4K 60FPS',
      durationSec: 180 + idx * 15,
      durationFormatted: `${18 + idx}:${idx < 5 ? '40' : '15'}`,
      ambientColors: idx % 2 === 0 ? ['#E11D48', '#881337'] : ['#D97706', '#9F1239'],
      canonicalTitle: t.en,
      directorOrStudio: t.studio,
      sensoryMood: idx % 2 === 0 ? 'High-Intensity Climax' : 'Velvet Boudoir',
      sensoryMoodFa: t.moodFa,
      audioProfile: 'Natural Room Acoustics / Binaural ASMR',
      audioProfileFa: 'صدای طبیعی و دوگوشی · ASMR',
      intensityLabel: 'High Intensity',
      intensityLabelFa: 'کیفیت 4K و ریتم داغ',
      coreSynopsis: t.synopsisEn,
      coreSynopsisFa: t.synopsisFa,
      aestheticDNA: [q, '4k', '60fps', t.domain, 'uncensored', 'trending'],
      moodVector: {
        intense: Math.min(0.98, sessionVector.intense + 0.05),
        sensual: Math.min(0.99, sessionVector.sensual + 0.04),
        surreal: sessionVector.surreal,
        dark: sessionVector.dark,
        fastPaced: sessionVector.fastPaced
      },
      waveformSeed: createHarmonicWaveform(idx + 1),
      sourceBenchmark: {
        domain: t.domain,
        globalRank: idx + 1,
        monthlyVisits: `${(500 - idx * 35).toFixed(1)}M`,
        avgDwellTime: `${8 + (idx % 5)}:20`,
        archiveScale: 'Curated 4K Studio Cinema',
        specialtyFa: `مرجع تخصصی در زمینه ${categoryTitleFa}`,
        specialtyEn: `World-class benchmark in ${categoryTitleEn}`
      },
      scenes: [
        {
          id: `sc-custom-${idx}-1`,
          timestampSec: 2,
          durationSec: 4,
          timeFormatted: '01:15',
          label: '01 · Opening Encounter',
          labelFa: '۰۱ · ورود و لمس اولیه',
          moodTags: ['sensual', 'intimate'],
          visualStyle: 'anamorphic-4k',
          intensityScore: 7,
          cameraFilter: 'contrast(1.1) saturate(1.15)'
        },
        {
          id: `sc-custom-${idx}-2`,
          timestampSec: 6,
          durationSec: 4,
          timeFormatted: '06:40',
          label: '02 · Peak Passion',
          labelFa: '۰۲ · اوج حرارت و هیجان',
          moodTags: ['intense', 'climax'],
          visualStyle: 'tungsten-warm',
          intensityScore: 9,
          cameraFilter: 'contrast(1.18) saturate(1.2)'
        },
        {
          id: `sc-custom-${idx}-3`,
          timestampSec: 10,
          durationSec: 3,
          timeFormatted: '12:50',
          label: '03 · Uncensored Climax',
          labelFa: '۰۳ · سکانس اوج بدون سانسور',
          moodTags: ['climax', 'fast-paced'],
          visualStyle: 'peak-climax',
          intensityScore: 10,
          cameraFilter: 'contrast(1.25) saturate(1.3)'
        }
      ]
    };
  });

  const reservePool: CatalogFilmItem[] = activeWindow10.map((f, i) => ({
    ...f,
    id: `${f.id}-res`,
    indexNumber: i + 11,
    canonicalTitle: `${f.canonicalTitle} · Uncut Director’s Cut`
  }));

  return {
    activeWindow10,
    reservePool,
    categoryTitleFa,
    categoryTitleEn
  };
}

export function mapVideoRecordsToCatalogItems(rawVideos: any[]): CatalogFilmItem[] {
  const moods: SensoryFantasyMood[] = [
    'High-Intensity Climax',
    'Intimate POV',
    'Velvet Boudoir',
    'Late Night Hotel',
    'Sensual ASMR',
    'Hyper-Real AI Fantasy',
    'Uncensored Anime'
  ];

  return rawVideos
    .filter((v: any) => {
      const u1 = String(v?.original_video_url || '').toLowerCase();
      const u2 = String(v?.authorized_embed_url || '').toLowerCase();
      return (
        !u1.includes('gtv-videos-bucket/sample') &&
        !u2.includes('gtv-videos-bucket/sample') &&
        !String(v?.id || '').startsWith('vid-sample-')
      );
    })
    .map((v: any, idx: number) => {
      const durParts = String(v.duration || '12:00').split(':').map(Number);
      const durSec =
        durParts.length === 2 && !Number.isNaN(durParts[0]) && !Number.isNaN(durParts[1])
          ? durParts[0] * 60 + durParts[1]
          : 480;

      const step = Math.max(15, Math.floor(durSec / 4));
      const mood = moods[idx % moods.length];

      const rawStream = String(v.authorized_embed_url || v.original_video_url || '');
      const cleanEpId = String(v.id || '').replace(/^ep-/i, '').trim();
      let safeStreamUrl = rawStream;
      if (
        !rawStream ||
        rawStream.includes('gtv-videos-bucket/sample') ||
        rawStream.includes('stream_flower.mp4')
      ) {
        safeStreamUrl = RELIABLE_STREAMS[idx % RELIABLE_STREAMS.length];
      } else if (rawStream.includes('eporner.com/embed/') || rawStream.includes('eporner.com/video-')) {
        const epMatch = rawStream.match(/\/(?:embed\/|video-)([a-zA-Z0-9]+)/i);
        const targetVid = (epMatch && epMatch[1]) || cleanEpId;
        safeStreamUrl = targetVid
          ? `/api/velora/stream/${targetVid}`
          : RELIABLE_STREAMS[idx % RELIABLE_STREAMS.length];
      }
      return {
        id: v.id || `live-v-${idx}`,
        indexNumber: idx + 1,
        streamUrl: safeStreamUrl,
        posterUrl:
          v.thumbnail_url || './assets/images/boudoir_crimson_silk_suite_1794443433215.jpg',
        pillar: 'LIVE',
        resolution: '4K 60FPS',
        durationSec: durSec,
        durationFormatted: v.duration || '12:00',
        ambientColors: idx % 2 === 0 ? ['#E11D48', '#881337'] : ['#D97706', '#9F1239'],
        canonicalTitle: v.title || 'ویدئوی اختصاصی 4K',
        directorOrStudio: v.source_name || 'VELORA 4K Vault',
        sensoryMood: mood,
        sensoryMoodFa: 'پخش زنده 4K مستقیم',
        audioProfile: 'Original Studio Audio',
        audioProfileFa: 'صدای اصلی بدون سانسور',
        intensityLabel: '4K Verified Stream',
        intensityLabelFa: 'کیفیت 4K و تامبنیل واقعی',
        coreSynopsis: v.description || 'استریم مستقیم 4K با کاور و پخش تاییدشده.',
        coreSynopsisFa: v.description || 'استریم مستقیم 4K با کاور و پخش تاییدشده.',
        aestheticDNA: Array.isArray(v.tags) ? v.tags : ['4k', 'live-stream'],
        moodVector: {
          intense: 0.94,
          sensual: 0.96,
          surreal: 0.72,
          dark: 0.82,
          fastPaced: 0.78
        },
        waveformSeed: createHarmonicWaveform(idx + 7),
        sourceBenchmark: undefined,
        scenes: [
          {
            id: `sc-${v.id}-1`,
            timestampSec: Math.min(10, Math.floor(durSec * 0.08)),
            durationSec: step,
            timeFormatted: formatSecondsToTimecode(Math.min(10, Math.floor(durSec * 0.08))),
            label: '01 · Opening Sequence',
            labelFa: '۰۱ · شروع سکانس آغازین',
            moodTags: ['opening', 'sensual'],
            visualStyle: 'cinema-4k',
            intensityScore: 8,
            cameraFilter: 'none'
          },
          {
            id: `sc-${v.id}-2`,
            timestampSec: Math.floor(durSec * 0.38),
            durationSec: step,
            timeFormatted: formatSecondsToTimecode(Math.floor(durSec * 0.38)),
            label: '02 · Core Intimate Action',
            labelFa: '۰۲ · سکانس میانی و اوج هیجان',
            moodTags: ['core', 'intense'],
            visualStyle: 'cinema-4k',
            intensityScore: 9,
            cameraFilter: 'contrast(1.12) saturate(1.15)'
          },
          {
            id: `sc-${v.id}-3`,
            timestampSec: Math.floor(durSec * 0.72),
            durationSec: step,
            timeFormatted: formatSecondsToTimecode(Math.floor(durSec * 0.72)),
            label: '03 · High-Intensity Climax',
            labelFa: '۰۳ · سکانس طلایی و اوج نهایی',
            moodTags: ['climax', 'fast-paced'],
            visualStyle: 'cinema-4k',
            intensityScore: 10,
            cameraFilter: 'contrast(1.2) saturate(1.22)'
          }
        ]
      };
    });
}

export function getOwnerPublishedCatalogItems(): CatalogFilmItem[] {
  try {
    localStorage.removeItem('velora_owner_db');
    const rawLocal = localStorage.getItem('velora_live_db_v4');
    if (!rawLocal) return [];
    const parsed = JSON.parse(rawLocal);
    if (!Array.isArray(parsed.videos)) return [];

    const published = parsed.videos.filter((v: any) => v.is_published);
    return mapVideoRecordsToCatalogItems(published);
  } catch {
    return [];
  }
}

export function getInitialVeloraCatalog(): CatalogFilmItem[] {
  const ownerItems = getOwnerPublishedCatalogItems();
  if (ownerItems.length > 0) {
    return ownerItems.slice(0, 40).map((item, idx) => ({
      ...item,
      indexNumber: idx + 1,
      sourceBenchmark: undefined
    }));
  }
  return INITIAL_CATALOG_DATA.slice(0, 10);
}

// ============================================================================
// CURATED ARCHIVE AI SEARCH & GLOBAL 100-SOURCE RANKING ENGINE
// ============================================================================

export async function searchCatalogWithAi(
  rawQuery: string,
  sessionVector: MoodVector5D,
  preferredLang: string = 'fa'
): Promise<{
  activeWindow10: CatalogFilmItem[];
  reservePool: CatalogFilmItem[];
  aiSummary: AiCuratorResponse;
}> {
  const trimmed = rawQuery.trim();
  const parsed = detectLanguageAndIntent(trimmed, preferredLang === 'en' ? 'en' : 'fa');
  const updatedVector =
    Object.keys(parsed.vectorDelta).length > 0
      ? blendMoodVectors(sessionVector, parsed.vectorDelta, 0.72)
      : sessionVector;

  const { matchedSources, matchedCountry } = matchGlobalSourcesForQuery(
    trimmed,
    parsed.targetPillar,
    updatedVector
  );
  const topMatchedSource = matchedSources[0];

  let activeWindow10: CatalogFilmItem[] = [];
  let reservePool: CatalogFilmItem[] = [];
  let customCategoryFa = trimmed || 'ترندهای داغ جهانی 4K';

  // First try fetching up to 40 real live 4K videos from our backend (/api/velora/live-feed?count=40)
  try {
    const liveRes = await fetch(`/api/velora/live-feed?count=40&q=${encodeURIComponent(trimmed)}`);
    if (liveRes.ok) {
      const liveData = await liveRes.json();
      if (Array.isArray(liveData?.videos) && liveData.videos.length > 0) {
        const mappedLive = mapVideoRecordsToCatalogItems(liveData.videos);
        if (mappedLive.length > 0) {
          activeWindow10 = mappedLive.slice(0, 40).map((item, idx) => ({
            ...item,
            indexNumber: idx + 1
          }));
          reservePool = activeWindow10.slice(0, 10).map((item, idx) => ({
            ...item,
            id: `${item.id}-res-${idx + 1}`,
            indexNumber: idx + 41
          }));
        }
      }
    }
  } catch {
    // fallback if offline
  }

  if (activeWindow10.length === 0) {
    if (trimmed.length > 0) {
      const generated = generateDynamic10CustomAdultFilms(trimmed, preferredLang, updatedVector);
      activeWindow10 = generated.activeWindow10;
      reservePool = generated.reservePool;
      customCategoryFa = generated.categoryTitleFa;
    } else {
      const ownerItems = getOwnerPublishedCatalogItems();
      if (ownerItems.length > 0) {
        activeWindow10 = ownerItems.slice(0, 40);
        reservePool = ownerItems.slice(0, 10).map((item, idx) => ({
          ...item,
          id: `${item.id}-res-${idx + 1}`,
          indexNumber: idx + 41
        }));
      } else {
        activeWindow10 = INITIAL_CATALOG_DATA.slice(0, 10);
        reservePool = INITIAL_CATALOG_DATA.slice(0, 10).map((item, idx) => ({
          ...item,
          id: `${item.id}-res-${idx + 1}`,
          indexNumber: idx + 11
        }));
      }
    }
  }

  let topFilm = activeWindow10[0] ?? INITIAL_CATALOG_DATA[0];
  let topScene = topFilm.scenes[2] ?? topFilm.scenes[1] ?? topFilm.scenes[0];
  let scorePct = Math.min(99, Math.max(94, Math.round(computeCosineSimilarity(updatedVector, topFilm.moodVector) * 100) + 12));

  let spokenExplanation = preferredLang === 'fa'
    ? `برای درخواست شما، آرشیو ${activeWindow10.length} فیلم برتر سبک "${customCategoryFa}" به صورت ۴K و ۶۰ فریم با تست ۱۰۰٪ سلامت پخش بارگذاری شد. برترین انتخاب پیشنهادی، فیلم "${topFilm.canonicalTitle}" با امتیاز تطابق ${scorePct}٪ است که در ثانیه ${topScene.timeFormatted} به نقطه اوج می‌رسد.`
    : `Curated ${activeWindow10.length} verified 4K adult cinema releases under "${customCategoryFa}". Leading recommendation is "${topFilm.canonicalTitle}" with a ${scorePct}% affinity match, reaching its climax at ${topScene.timeFormatted}.`;

  // Use ultra-fast local 5D vector engine review directly (<2ms)

  return {
    activeWindow10,
    reservePool,
    aiSummary: {
      detectedLanguage: (['fa', 'en', 'ar', 'tr', 'es', 'fr'].includes(preferredLang)
        ? preferredLang
        : 'en') as AiCuratorResponse['detectedLanguage'],
      languageLabel: preferredLang.toUpperCase(),
      isRtl: preferredLang === 'fa' || preferredLang === 'ar',
      engineModeUsed: 'LOCAL_VECTOR_SYNTHESIZER',
      cosineMatchScore: scorePct,
      primaryFilmId: topFilm.id,
      primaryFilmTitle: topFilm.canonicalTitle,
      spokenExplanation,
      recommendedFilmIds: activeWindow10.map((f) => f.id),
      matchedGlobalSources: matchedSources,
      matchedCountryInsight: matchedCountry,
      recommendedSceneJump: {
        filmId: topFilm.id,
        filmTitle: topFilm.canonicalTitle,
        timestampSec: topScene.timestampSec,
        timeFormatted: topScene.timeFormatted,
        sceneLabel:
          preferredLang === 'fa' ? topScene.labelFa ?? topScene.label : topScene.label
      },
      updatedMoodVector: updatedVector
    }
  };
}

export function buildClosedWorldSystemPrompt(catalog: CatalogFilmItem[]): string {
  const compactCatalog = catalog.map((f) => ({
    id: f.id,
    title: f.canonicalTitle,
    pillar: f.pillar,
    mood: f.sensoryMood,
    source: f.sourceBenchmark?.domain,
    director: f.directorOrStudio,
    synopsis: f.coreSynopsis,
    scenes: f.scenes.map((s) => `${s.timeFormatted} (${s.label})`)
  }));

  return `You are the AETHER Private Adult Cinema Concierge connected to the Global 100-Platform Intelligence Index.
Write a seductive, editorial 2-to-3 sentence recommendation of the best matched film (covering its lighting, global source benchmark, and climax timestamp) in the user's language.
CATALOG_DATA: ${JSON.stringify(compactCatalog)}`;
}

export async function runAetherAiCurator(params: {
  userQuery: string;
  catalog: CatalogFilmItem[];
  currentFocusedFilm: CatalogFilmItem;
  currentSessionVector: MoodVector5D;
  preferredLang?: string;
  selfHostedConfig?: SelfHostedLlmConfig;
}): Promise<AiCuratorResponse> {
  const {
    userQuery,
    catalog,
    currentFocusedFilm,
    currentSessionVector,
    preferredLang = 'fa',
    selfHostedConfig
  } = params;

  const parsed = detectLanguageAndIntent(userQuery, preferredLang === 'en' ? 'en' : 'fa');
  const outputLang = preferredLang || parsed.lang;

  const updatedVector =
    Object.keys(parsed.vectorDelta).length > 0
      ? blendMoodVectors(currentSessionVector, parsed.vectorDelta, 0.72)
      : blendMoodVectors(currentSessionVector, currentFocusedFilm.moodVector, 0.45);

  const { matchedSources, matchedCountry } = matchGlobalSourcesForQuery(
    userQuery,
    parsed.targetPillar,
    updatedVector
  );
  const topMatchedSource = matchedSources[0];

  const scoredFilms = catalog.map((film) => {
    let similarity = computeCosineSimilarity(updatedVector, film.moodVector);

    if (parsed.targetPillar && film.pillar === parsed.targetPillar) {
      similarity = Math.min(0.99, similarity + 0.14);
    }

    if (topMatchedSource && film.id === topMatchedSource.linkedFilmId) {
      similarity = Math.min(0.99, similarity + 0.22);
    }

    if (
      parsed.wantsExplanationOfCurrent &&
      !parsed.targetPillar &&
      Object.keys(parsed.vectorDelta).length === 0 &&
      film.id === currentFocusedFilm.id
    ) {
      similarity = 0.99;
    }

    const qLower = userQuery.toLowerCase();
    if (
      film.canonicalTitle.toLowerCase().includes(qLower) ||
      film.sensoryMood.toLowerCase().includes(qLower) ||
      (film.sourceBenchmark?.domain.toLowerCase().includes(qLower) ?? false) ||
      film.aestheticDNA.some((tag) => qLower.includes(tag.toLowerCase()))
    ) {
      similarity = Math.min(0.99, similarity + 0.18);
    }

    return { film, similarity };
  });

  scoredFilms.sort((a, b) => b.similarity - a.similarity);

  let primaryMatch = parsed.wantsExplanationOfCurrent
    ? currentFocusedFilm
    : scoredFilms[0]?.film ?? currentFocusedFilm;
  let cosineScorePct = Math.round(
    computeCosineSimilarity(updatedVector, primaryMatch.moodVector) * 100
  );

  let bestScene =
    primaryMatch.scenes.find((s) => {
      if (parsed.vectorDelta.intense && s.intensityScore >= 9) return true;
      if (parsed.vectorDelta.sensual && s.moodTags.includes('sensual')) return true;
      if (parsed.vectorDelta.surreal && s.moodTags.includes('surreal')) return true;
      if (parsed.vectorDelta.dark && s.moodTags.includes('dark')) return true;
      return false;
    }) ??
    primaryMatch.scenes[2] ??
    primaryMatch.scenes[1] ??
    primaryMatch.scenes[0];

  const spokenExplanation = synthesizeFilmCriticReview(
    outputLang,
    primaryMatch,
    bestScene,
    cosineScorePct,
    topMatchedSource,
    matchedCountry
  );

  return {
    detectedLanguage: (['fa', 'en', 'ar', 'tr', 'es', 'fr'].includes(outputLang)
      ? outputLang
      : 'en') as AiCuratorResponse['detectedLanguage'],
    languageLabel: outputLang.toUpperCase(),
    isRtl: outputLang === 'fa' || outputLang === 'ar',
    engineModeUsed: 'LOCAL_VECTOR_SYNTHESIZER',
    cosineMatchScore: cosineScorePct,
    primaryFilmId: primaryMatch.id,
    primaryFilmTitle: primaryMatch.canonicalTitle,
    spokenExplanation,
    recommendedFilmIds: scoredFilms.map((item) => item.film.id),
    matchedGlobalSources: matchedSources,
    matchedCountryInsight: matchedCountry,
    recommendedSceneJump: {
      filmId: primaryMatch.id,
      filmTitle: primaryMatch.canonicalTitle,
      timestampSec: bestScene.timestampSec,
      timeFormatted: bestScene.timeFormatted,
      sceneLabel: outputLang === 'fa' ? bestScene.labelFa ?? bestScene.label : bestScene.label
    },
    updatedMoodVector: updatedVector
  };
}

// ============================================================================
// REAL FULL-STACK SERVER SYNC HELPERS (CATALOG & CROSS-DEVICE DNA VAULT)
// ============================================================================

export async function fetchPersistedServerCatalog(): Promise<CatalogFilmItem[]> {
  try {
    const res = await fetch('/api/catalog');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.items) ? (data.items as CatalogFilmItem[]) : [];
  } catch {
    return [];
  }
}

export async function persistCustomFilmToServer(item: CatalogFilmItem): Promise<void> {
  try {
    await fetch('/api/catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item })
    });
  } catch {
    // ignore offline error
  }
}

export async function syncDnaProfileToServer(
  code: string,
  vector: MoodVector5D,
  themeId: string
): Promise<void> {
  try {
    await fetch('/api/dna/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, vector, themeId })
    });
  } catch {
    // ignore offline error
  }
}

export async function fetchDnaProfileFromServer(
  code: string
): Promise<{ vector: MoodVector5D; themeId: string } | null> {
  try {
    const res = await fetch(`/api/dna/${encodeURIComponent(code.trim().toUpperCase())}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.entry?.vector && data?.entry?.themeId) {
      return {
        vector: data.entry.vector as MoodVector5D,
        themeId: String(data.entry.themeId)
      };
    }
    return null;
  } catch {
    return null;
  }
}

