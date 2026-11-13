import type {
  PrototypeMediaItem,
  UserAccountState
} from './types';

import posterRainDetective from '../assets/images/poster_rain_detective_1794572116567.jpg';
import posterNeonTokyo from '../assets/images/poster_neon_tokyo_1794572116252.jpg';
import posterSurrealLabyrinth from '../assets/images/poster_surreal_labyrinth_1794572117376.jpg';
import posterParisianShadow from '../assets/images/poster_parisian_shadow_1794572118475.jpg';
import posterAlpineMystery from '../assets/images/poster_alpine_mystery_1794572117720.jpg';
import posterCyberMemory from '../assets/images/poster_cyber_memory_1794572117940.jpg';
import posterCrimsonMotel from '../assets/images/poster_crimson_motel_1794572119002.jpg';
import imgAmberHotel from '../assets/images/editorial_amber_hotel_noir_1794443435341.jpg';
import imgCrimsonSuite from '../assets/images/boudoir_crimson_silk_suite_1794443433215.jpg';
import imgMidnightParis from '../assets/images/cinema_midnight_express_paris_1794408998635.jpg';
import imgVelvetRain from '../assets/images/cinema_noir_velvet_rain_1794398988857.jpg';
import imgObsidianSonata from '../assets/images/cinema_obsidian_sonata_1794398992852.jpg';
import imgQuantumOasis from '../assets/images/ai_cinema_quantum_oasis_1794408994686.jpg';
import imgSolarisMirage from '../assets/images/ai_cinema_solaris_mirage_1794398990412.jpg';
import imgCyberRequiem from '../assets/images/animation_cyber_requiem_1794398991552.jpg';
import imgVelvetSamurai from '../assets/images/animation_velvet_samurai_1794408997353.jpg';
import imgAstralSiren from '../assets/images/animation_astral_siren_1794408998072.jpg';
import imgEclipseBloom from '../assets/images/ai_animation_eclipse_bloom_1794398992909.jpg';

export const PROTOTYPE_MEDIA_CATALOG: PrototypeMediaItem[] = [
  {
    id: 'proto-01',
    titleFa: 'بارانِ نیمه‌شب در ایستگاهِ ۴',
    titleEn: 'Midnight Rain at Platform 4',
    creatorFa: 'استودیو آتلیه نوار',
    creatorEn: 'Atelier Noir Collective',
    categoryFa: 'سینمای معمایی و نوار',
    categoryEn: 'Neo-Noir Cinema',
    clusterId: 'noir-shadows',
    clusterLabelFa: 'سایه‌های نوار',
    clusterLabelEn: 'Noir Shadows',
    durationSec: 540,
    quality: '4K HDR',
    releaseYear: 2026,
    addedDaysAgo: 2,
    posterUrl: posterRainDetective,
    accentHex: '#38BDF8',
    synopsisFa:
      'در یک ایستگاه قطار خلوت زیر باران شدید، کارآگاهی بازنشسته با نوارهای صوتی گم‌شده‌ای روبه‌رو می‌شود که زمان را به عقب برمی‌گردانند.',
    synopsisEn:
      'In a rain-drenched terminal after last departure, a retired archivist uncovers magnetic tape reels that rewrite the night.',
    tags: ['noir', 'rain', 'mystery', 'slow-burn', 'detective'],
    tagsFa: ['نوار', 'بارانی', 'معمایی', 'آهسته', 'کارآگاهی'],
    vector: { tension: 0.88, pace: 0.34, surrealism: 0.42, nocturnal: 0.96, intimacy: 0.55, depth: 0.92 },
    availabilityStatus: 'available',
    licenseVerified: true,
    consentVerified: true,
    sourceName: 'Atelier Official Vault',
    subtitles: [
      { startSec: 0, endSec: 6, fa: 'صدای باران روی سقف شیشه‌ای متوقف نمی‌شود...', en: 'The rain over the glass canopy never truly stops...' },
      { startSec: 6, endSec: 14, fa: 'هر نوار صوتی، ساعت متفاوتی از همان شب را روایت می‌کند.', en: 'Each reel recalls a different hour from the very same night.' },
      { startSec: 14, endSec: 25, fa: 'نور کهربایی در مهِ ایستگاه محو می‌شود.', en: 'Amber platform lights dissolve into the mist.' }
    ],
    chapters: [
      { id: 'c1', timeSec: 0, labelFa: 'ورود به ایستگاه', labelEn: 'Arrival at Platform' },
      { id: 'c2', timeSec: 165, labelFa: 'نوار اول', labelEn: 'First Reel' },
      { id: 'c3', timeSec: 390, labelFa: 'پرده پایانی', labelEn: 'Final Sequence' }
    ],
    spatialPos: { x: 24, y: 34, z: 0.9 }
  },
  {
    id: 'proto-02',
    titleFa: 'خاطره نئونی توکیو',
    titleEn: 'Neon Tokyo Reverie',
    creatorFa: 'کنجی تاکاهاشی',
    creatorEn: 'Kenji Takahashi',
    categoryFa: 'سینمای شهری شبانه',
    categoryEn: 'Urban Nocturne',
    clusterId: 'neon-futures',
    clusterLabelFa: 'آینده نئونی',
    clusterLabelEn: 'Neon Futures',
    durationSec: 420,
    quality: '4K 60FPS',
    releaseYear: 2026,
    addedDaysAgo: 1,
    posterUrl: posterNeonTokyo,
    accentHex: '#FB7185',
    synopsisFa:
      'پرسه‌زنی بی‌دیالوگ در کوچه‌های بارانی توکیو با صداگذاری باینورال و ریتم تند تصویربرداری ۶۰ فریم.',
    synopsisEn:
      'A dialogue-sparse drift through wet Tokyo backstreets captured with binaural night acoustics and kinetic 60fps framing.',
    tags: ['tokyo', 'neon', 'minimal-dialogue', 'cyber', 'fast-paced'],
    tagsFa: ['توکیو', 'نئون', 'کم‌دیالوگ', 'سایبری', 'پرتحرک'],
    vector: { tension: 0.72, pace: 0.76, surrealism: 0.58, nocturnal: 0.94, intimacy: 0.48, depth: 0.78 },
    availabilityStatus: 'available',
    licenseVerified: true,
    consentVerified: true,
    sourceName: 'Kansai Indie Feed',
    subtitles: [
      { startSec: 0, endSec: 7, fa: 'نورهای نئون روی آسفالت خیس می‌رقصند.', en: 'Neon signage ripples across wet asphalt.' },
      { startSec: 7, endSec: 16, fa: 'تنها صدای قدم‌ها و قطار عبوری باقی مانده است.', en: 'Only footsteps and distant commuter rails remain.' }
    ],
    chapters: [
      { id: 'c1', timeSec: 0, labelFa: 'کوچه بارانی', labelEn: 'Rain Alley' },
      { id: 'c2', timeSec: 210, labelFa: 'تقاطع شینجوکو', labelEn: 'Shinjuku Crossing' }
    ],
    spatialPos: { x: 72, y: 26, z: 0.82 }
  },
  {
    id: 'proto-03',
    titleFa: 'سوئیتِ کهربایی نیمه‌شب',
    titleEn: 'The Amber Midnight Suite',
    creatorFa: 'کلارا مونترو',
    creatorEn: 'Clara Montero',
    categoryFa: 'سینمای صمیمی و درام',
    categoryEn: 'Intimate Editorial',
    clusterId: 'velvet-cinema',
    clusterLabelFa: 'سینمای مخملی',
    clusterLabelEn: 'Velvet Cinema',
    durationSec: 615,
    quality: '4K HDR',
    releaseYear: 2026,
    addedDaysAgo: 4,
    posterUrl: imgAmberHotel,
    accentHex: '#F5B942',
    synopsisFa:
      'داستان کوتاه یک ملاقات ناخواسته در هتلی قدیمی با نورپردازی گرم شمع و ریتمی آرام و متمرکز بر جزئیات حسی.',
    synopsisEn:
      'An unhurried chamber piece inside an old-world hotel illuminated solely by warm tungsten and late-hour silence.',
    tags: ['hotel', 'amber', 'intimate', 'slow-burn', 'sensory'],
    tagsFa: ['هتل', 'کهربایی', 'صمیمی', 'آرام', 'حسی'],
    vector: { tension: 0.54, pace: 0.25, surrealism: 0.38, nocturnal: 0.85, intimacy: 0.96, depth: 0.84 },
    availabilityStatus: 'available',
    licenseVerified: true,
    consentVerified: true,
    sourceName: 'Lumiere Chamber Studio',
    subtitles: [
      { startSec: 0, endSec: 8, fa: 'ساعت لابی از نیمه‌شب گذشته و راهرو کاملاً ساکت است.', en: 'The lobby clock passes midnight as the corridor settles.' },
      { startSec: 8, endSec: 18, fa: 'پنجره رو به شهر تنها منبع صدای دوردست است.', en: 'A cracked window lets in only the hum of the distant avenue.' }
    ],
    chapters: [
      { id: 'c1', timeSec: 0, labelFa: 'راهروی طبقه چهارم', labelEn: 'Fourth Floor Hall' },
      { id: 'c2', timeSec: 260, labelFa: 'گفت‌وگوی آرام', labelEn: 'Quiet Exchange' }
    ],
    spatialPos: { x: 46, y: 66, z: 0.94 }
  },
  {
    id: 'proto-04',
    titleFa: 'هزارتوی آینه‌های سورئال',
    titleEn: 'Labyrinth of Surreal Mirrors',
    // Intentionally omits creatorFa/creatorEn to demonstrate graceful hiding of absent metadata
    categoryFa: 'هنر تجربی و سورئال',
    categoryEn: 'Surrealist Art Film',
    clusterId: 'surreal-art',
    clusterLabelFa: 'هنر سورئال',
    clusterLabelEn: 'Surreal Art',
    durationSec: 360,
    quality: '4K HDR',
    releaseYear: 2025,
    addedDaysAgo: 9,
    posterUrl: posterSurrealLabyrinth,
    accentHex: '#A78BFA',
    synopsisFa:
      'کاوشی انتزاعی در معماری رؤیاها، جایی که راهروهای مرمرین بر اساس حافظه بیننده تغییر شکل می‌دهند.',
    synopsisEn:
      'An architectural dream study where marble corridors bend and reorganize around fragments of memory.',
    tags: ['surreal', 'dream', 'architecture', 'art-house'],
    tagsFa: ['سورئال', 'رؤیا', 'معماری', 'هنری'],
    vector: { tension: 0.62, pace: 0.30, surrealism: 0.98, nocturnal: 0.72, intimacy: 0.44, depth: 0.95 },
    availabilityStatus: 'available',
    licenseVerified: true,
    consentVerified: true,
    sourceName: 'Archive Experimental',
    subtitles: [
      { startSec: 0, endSec: 9, fa: 'هر آینه تصویری از چند دقیقه قبل را نشان می‌دهد.', en: 'Every mirror reflects a moment several minutes behind.' }
    ],
    chapters: [{ id: 'c1', timeSec: 0, labelFa: 'آستانه آینه', labelEn: 'Mirror Threshold' }],
    spatialPos: { x: 80, y: 74, z: 0.68 }
  },
  {
    id: 'proto-05',
    titleFa: 'سایه‌های پاریس در باران',
    titleEn: 'Parisian Shadow Study',
    creatorFa: 'لوران دوبوا',
    creatorEn: 'Laurent Dubois',
    categoryFa: 'سینمای نوار کلاسیک',
    categoryEn: 'European Noir',
    clusterId: 'noir-shadows',
    clusterLabelFa: 'سایه‌های نوار',
    clusterLabelEn: 'Noir Shadows',
    durationSec: 495,
    quality: '1080p',
    releaseYear: 2025,
    addedDaysAgo: 14,
    posterUrl: posterParisianShadow,
    accentHex: '#60A5FA',
    synopsisFa:
      'روایت کلاسیک یک تعقیب آرام در سنگ‌فرش‌های پاریس با کنتراست بالا و موسیقی جاز مینیمال.',
    synopsisEn:
      'A high-contrast nocturnal pursuit across Parisian cobblestones scored by sparse solo contrabass.',
    tags: ['paris', 'noir', 'jazz', 'classic', 'rain'],
    tagsFa: ['پاریس', 'نوار', 'جاز', 'کلاسیک', 'بارانی'],
    vector: { tension: 0.81, pace: 0.41, surrealism: 0.35, nocturnal: 0.92, intimacy: 0.62, depth: 0.88 },
    availabilityStatus: 'available',
    licenseVerified: true,
    consentVerified: true,
    sourceName: 'Seine Independent Vault',
    subtitles: [
      { startSec: 0, endSec: 8, fa: 'سایه پل روی رودخانه سن کشیده شده است.', en: 'The bridge casts a long shadow over the Seine.' }
    ],
    chapters: [
      { id: 'c1', timeSec: 0, labelFa: 'پل سن', labelEn: 'Pont Neuf' },
      { id: 'c2', timeSec: 240, labelFa: 'کافه متروکه', labelEn: 'Empty Bistro' }
    ],
    spatialPos: { x: 18, y: 52, z: 0.78 }
  },
  {
    id: 'proto-06',
    titleFa: 'سکوتِ برفی در آلپ',
    titleEn: 'Whiteout: Alpine Cabin',
    creatorFa: 'النا برگمان',
    creatorEn: 'Elena Bergman',
    categoryFa: 'تریلر روان‌شناختی',
    categoryEn: 'Psychological Thriller',
    clusterId: 'noir-shadows',
    clusterLabelFa: 'سایه‌های نوار',
    clusterLabelEn: 'Noir Shadows',
    durationSec: 690,
    quality: '4K HDR',
    releaseYear: 2026,
    addedDaysAgo: 6,
    posterUrl: posterAlpineMystery,
    accentHex: '#93C5FD',
    synopsisFa:
      'در یک کلبه بتنی محصور در بوران آلپ، دو غریبه متوجه می‌شوند فرستنده رادیویی پیام‌های خودشان را پخش می‌کند.',
    synopsisEn:
      'Isolated inside a brutalist alpine shelter during a whiteout, two strangers hear their own voices on the emergency band.',
    tags: ['snow', 'cabin', 'paranoia', 'tension', 'slow-burn'],
    tagsFa: ['برف', 'کلبه', 'تنش', 'روانشناختی', 'آهسته'],
    vector: { tension: 0.95, pace: 0.28, surrealism: 0.56, nocturnal: 0.68, intimacy: 0.52, depth: 0.94 },
    availabilityStatus: 'available',
    licenseVerified: true,
    consentVerified: true,
    sourceName: 'Nordic Cinema Archive',
    subtitles: [
      { startSec: 0, endSec: 7, fa: 'بوران تمام جاده پایین کوه را بسته است.', en: 'The blizzard has sealed every pass down the ridge.' }
    ],
    chapters: [{ id: 'c1', timeSec: 0, labelFa: 'کابین بتنی', labelEn: 'Concrete Cabin' }],
    spatialPos: { x: 30, y: 20, z: 0.85 }
  },
  {
    id: 'proto-07',
    titleFa: 'حافظه سایبری ۲۰۰۹',
    titleEn: 'Cyber Memory Fragments',
    creatorFa: 'استودیو ساین‌ویو',
    creatorEn: 'Sinewave Works',
    categoryFa: 'علمی‌تخیلی مینیمال',
    categoryEn: 'Sci-Fi Essay',
    clusterId: 'neon-futures',
    clusterLabelFa: 'آینده نئونی',
    clusterLabelEn: 'Neon Futures',
    durationSec: 390,
    quality: '4K 60FPS',
    releaseYear: 2026,
    addedDaysAgo: 0,
    posterUrl: posterCyberMemory,
    accentHex: '#22D3EE',
    synopsisFa:
      'بازسازی شاعرانه خاطره‌های دیجیتال از سرورهای متروکه، با طراحی صدای آنالوگ و افق‌های آبی سرد.',
    synopsisEn:
      'A poetic reconstruction of abandoned digital archives paired with warm analog synthesizer swells.',
    tags: ['cyber', 'memory', 'scifi', 'synth', 'futuristic'],
    tagsFa: ['سایبری', 'حافظه', 'علمی‌تخیلی', 'سینت‌ویو'],
    vector: { tension: 0.64, pace: 0.58, surrealism: 0.82, nocturnal: 0.89, intimacy: 0.39, depth: 0.86 },
    availabilityStatus: 'available',
    licenseVerified: true,
    consentVerified: true,
    sourceName: 'Atelier Official Vault',
    subtitles: [
      { startSec: 0, endSec: 8, fa: 'سکتورهای قدیمی حافظه هنوز گرم هستند.', en: 'Old archive sectors still hold residual warmth.' }
    ],
    chapters: [{ id: 'c1', timeSec: 0, labelFa: 'بازخوانی', labelEn: 'Memory Readout' }],
    spatialPos: { x: 76, y: 42, z: 0.89 }
  },
  {
    id: 'proto-08',
    titleFa: 'متل مخملی در حاشیه جاده',
    titleEn: 'Velvet Horizon Motel',
    creatorFa: 'مارکوس رید',
    creatorEn: 'Marcus Reed',
    categoryFa: 'نوار جاده‌ای و حسی',
    categoryEn: 'Sensual Road Noir',
    clusterId: 'velvet-cinema',
    clusterLabelFa: 'سینمای مخملی',
    clusterLabelEn: 'Velvet Cinema',
    durationSec: 510,
    quality: '4K HDR',
    releaseYear: 2026,
    addedDaysAgo: 3,
    posterUrl: posterCrimsonMotel,
    accentHex: '#F43F5E',
    synopsisFa:
      'نور تابلوهای نئون جاده‌ای از پشت پرده‌های مخملی عبور می‌کند و فضای اتاق شماره ۷ را به رنگ یاقوت درمی‌آورد.',
    synopsisEn:
      'Highway neon filters through heavy velvet drapes in Room 7 during a desert heatwave night.',
    tags: ['motel', 'crimson', 'velvet', 'desert', 'intimate'],
    tagsFa: ['متل', 'یاقوتی', 'مخملی', 'شبانه', 'صمیمی'],
    vector: { tension: 0.78, pace: 0.44, surrealism: 0.49, nocturnal: 0.91, intimacy: 0.92, depth: 0.80 },
    availabilityStatus: 'available',
    licenseVerified: true,
    consentVerified: true,
    sourceName: 'Lumiere Chamber Studio',
    subtitles: [
      { startSec: 0, endSec: 7, fa: 'باد گرم بیابان پشت شیشه می‌وزد.', en: 'A warm desert wind brushes against the motel glass.' }
    ],
    chapters: [{ id: 'c1', timeSec: 0, labelFa: 'اتاق شماره ۷', labelEn: 'Room 7' }],
    spatialPos: { x: 52, y: 78, z: 0.91 }
  },
  {
    id: 'proto-09',
    titleFa: 'تالار ابریشم سرخ',
    titleEn: 'Crimson Silk Chamber',
    creatorFa: 'استودیو لومیر',
    creatorEn: 'Lumiere Collective',
    categoryFa: 'سینمای صمیمی ۴K',
    categoryEn: 'Luxury Chamber 4K',
    clusterId: 'velvet-cinema',
    clusterLabelFa: 'سینمای مخملی',
    clusterLabelEn: 'Velvet Cinema',
    durationSec: 480,
    quality: '4K 60FPS',
    releaseYear: 2026,
    addedDaysAgo: 5,
    posterUrl: imgCrimsonSuite,
    accentHex: '#E11D48',
    synopsisFa:
      'فیلم‌برداری لنز آنامورفیک با تمرکز بر بافت نور و سکوت در یک پنت‌هاوس شبانه.',
    synopsisEn:
      'Anamorphic lens study balancing deep velvet shadows with warm candlelit highlights.',
    tags: ['silk', 'boudoir', 'anamorphic', 'intimate', '4k'],
    tagsFa: ['ابریشم', 'صمیمی', 'آنامورفیک', '۴K'],
    vector: { tension: 0.58, pace: 0.30, surrealism: 0.44, nocturnal: 0.88, intimacy: 0.98, depth: 0.79 },
    availabilityStatus: 'available',
    licenseVerified: true,
    consentVerified: true,
    sourceName: 'Lumiere Chamber Studio',
    subtitles: [],
    chapters: [{ id: 'c1', timeSec: 0, labelFa: 'پرده اول', labelEn: 'Opening Frame' }],
    spatialPos: { x: 41, y: 82, z: 0.87 }
  },
  {
    id: 'proto-10',
    titleFa: 'قطار شبانه‌ی پاریس',
    titleEn: 'Midnight Express Paris',
    creatorFa: 'ژولیت مورنو',
    creatorEn: 'Juliette Moreau',
    categoryFa: 'درام سینمایی',
    categoryEn: 'Cinematic Drama',
    clusterId: 'velvet-cinema',
    clusterLabelFa: 'سینمای مخملی',
    clusterLabelEn: 'Velvet Cinema',
    durationSec: 575,
    quality: '4K HDR',
    releaseYear: 2025,
    addedDaysAgo: 11,
    posterUrl: imgMidnightParis,
    accentHex: '#FB923C',
    synopsisFa:
      'گفت‌وگوی دو هم‌سفر در واگن کوپه‌ای در حال عبور از دشت‌های مه‌آلود فرانسه.',
    synopsisEn:
      'Two travelers share quiet confessions inside a sleeper compartment crossing foggy French plains.',
    tags: ['train', 'paris', 'dialogue', 'warm', 'night'],
    tagsFa: ['قطار', 'پاریس', 'دیالوگ', 'شب'],
    vector: { tension: 0.49, pace: 0.38, surrealism: 0.31, nocturnal: 0.82, intimacy: 0.86, depth: 0.87 },
    availabilityStatus: 'available',
    licenseVerified: true,
    consentVerified: true,
    sourceName: 'Seine Independent Vault',
    subtitles: [],
    chapters: [{ id: 'c1', timeSec: 0, labelFa: 'واگن ۴', labelEn: 'Carriage 4' }],
    spatialPos: { x: 38, y: 60, z: 0.73 }
  },
  {
    id: 'proto-11',
    titleFa: 'باران مخملی بر شهر خاموش',
    titleEn: 'Velvet Rain Over Silent Streets',
    creatorFa: 'آکیرا ساتو',
    creatorEn: 'Akira Sato',
    categoryFa: 'پوئم صوتی‌تصویری ASMR',
    categoryEn: 'Ambient Soundscape',
    clusterId: 'midnight-sound',
    clusterLabelFa: 'صدا و ریتم شب',
    clusterLabelEn: 'Midnight Sound',
    durationSec: 720,
    quality: '4K HDR',
    releaseYear: 2026,
    addedDaysAgo: 1,
    posterUrl: imgVelvetRain,
    accentHex: '#34D399',
    synopsisFa:
      'تجربه‌ای خالص از صدای باران باینورال و پلان‌های طولانی و بدون کات برای آرامش عمیق شبانه.',
    synopsisEn:
      'Pure binaural rainfall and unbroken long takes crafted for deep late-night decompression.',
    tags: ['asmr', 'ambient', 'rain', 'binaural', 'calm'],
    tagsFa: ['صدا', 'آرامش', 'باران', 'باینورال', 'ملایم'],
    vector: { tension: 0.22, pace: 0.14, surrealism: 0.46, nocturnal: 0.90, intimacy: 0.74, depth: 0.70 },
    availabilityStatus: 'available',
    licenseVerified: true,
    consentVerified: true,
    sourceName: 'Kansai Indie Feed',
    subtitles: [],
    chapters: [{ id: 'c1', timeSec: 0, labelFa: 'جریان اول', labelEn: 'Movement I' }],
    spatialPos: { x: 60, y: 54, z: 0.76 }
  },
  {
    id: 'proto-12',
    titleFa: 'سوناتِ ابسیدین',
    titleEn: 'Obsidian Sonata',
    creatorFa: 'ویکتور کلاین',
    creatorEn: 'Viktor Klein',
    categoryFa: 'موسیقی و تصویر زنده',
    categoryEn: 'Live Audiovisual',
    clusterId: 'midnight-sound',
    clusterLabelFa: 'صدا و ریتم شب',
    clusterLabelEn: 'Midnight Sound',
    durationSec: 445,
    quality: '4K 60FPS',
    releaseYear: 2026,
    addedDaysAgo: 2,
    posterUrl: imgObsidianSonata,
    accentHex: '#FBBF24',
    synopsisFa:
      'اجرای تک‌نوازی پیانو و ویولن‌سل در تالاری تاریک با نورپردازی تک‌نقطه‌ای.',
    synopsisEn:
      'A nocturnal cello and grand piano performance staged inside an unlit concrete hall.',
    tags: ['music', 'sonata', 'live', 'minimal', 'acoustic'],
    tagsFa: ['موسیقی', 'سونات', 'زنده', 'آکوستیک'],
    vector: { tension: 0.45, pace: 0.32, surrealism: 0.29, nocturnal: 0.86, intimacy: 0.71, depth: 0.91 },
    availabilityStatus: 'available',
    licenseVerified: true,
    consentVerified: true,
    sourceName: 'Nordic Cinema Archive',
    subtitles: [],
    chapters: [{ id: 'c1', timeSec: 0, labelFa: 'آداجیو', labelEn: 'Adagio' }],
    spatialPos: { x: 65, y: 68, z: 0.71 }
  },
  {
    id: 'proto-13',
    titleFa: 'واحه‌ی کوانتومی',
    titleEn: 'Quantum Oasis',
    creatorFa: 'مرکز هنر ژنراتیو آیون',
    creatorEn: 'Aeon Generative Lab',
    categoryFa: 'سینمای هوش مصنوعی',
    categoryEn: 'Generative Cinema',
    clusterId: 'surreal-art',
    clusterLabelFa: 'هنر سورئال',
    clusterLabelEn: 'Surreal Art',
    durationSec: 315,
    quality: '4K 60FPS',
    releaseYear: 2026,
    addedDaysAgo: 0,
    posterUrl: imgQuantumOasis,
    accentHex: '#2DD4BF',
    synopsisFa:
      'سفری خیال‌انگیز در واحه‌ای بیابانی که با الگوریتم‌های هندسی و نورهای متحرک طراحی شده است.',
    synopsisEn:
      'A meditative drift through a luminous desert oasis sculpted with procedural geometry.',
    tags: ['ai-art', 'oasis', 'surreal', 'desert', 'visual-essay'],
    tagsFa: ['هنر', 'واحه', 'سورئال', 'بیابان'],
    vector: { tension: 0.31, pace: 0.48, surrealism: 0.94, nocturnal: 0.58, intimacy: 0.45, depth: 0.85 },
    availabilityStatus: 'available',
    licenseVerified: true,
    consentVerified: true,
    sourceName: 'Aeon Verified Originals',
    subtitles: [],
    chapters: [{ id: 'c1', timeSec: 0, labelFa: 'سراب اول', labelEn: 'First Mirage' }],
    spatialPos: { x: 84, y: 60, z: 0.80 }
  },
  {
    id: 'proto-14',
    titleFa: 'سراب سولاریس',
    titleEn: 'Solaris Mirage',
    creatorFa: 'مرکز هنر ژنراتیو آیون',
    creatorEn: 'Aeon Generative Lab',
    categoryFa: 'فانتزی بصری',
    categoryEn: 'Visual Fantasy',
    clusterId: 'surreal-art',
    clusterLabelFa: 'هنر سورئال',
    clusterLabelEn: 'Surreal Art',
    durationSec: 385,
    quality: '4K HDR',
    releaseYear: 2026,
    addedDaysAgo: 7,
    posterUrl: imgSolarisMirage,
    accentHex: '#F59E0B',
    synopsisFa:
      'اقیانوسی معلق در مدار سیاره‌ای دوخورشیدی که امواجش با ضربان صدا تغییر رنگ می‌دهند.',
    synopsisEn:
      'An orbital ocean around twin suns whose bioluminescent tides pulse with acoustic resonance.',
    tags: ['solaris', 'space', 'surreal', 'scifi', 'ambient'],
    tagsFa: ['فضا', 'سولاریس', 'سورئال', 'علمی‌تخیلی'],
    vector: { tension: 0.36, pace: 0.27, surrealism: 0.96, nocturnal: 0.64, intimacy: 0.50, depth: 0.93 },
    availabilityStatus: 'available',
    licenseVerified: true,
    consentVerified: true,
    sourceName: 'Aeon Verified Originals',
    subtitles: [],
    chapters: [{ id: 'c1', timeSec: 0, labelFa: 'مدار اقیانوس', labelEn: 'Ocean Orbit' }],
    spatialPos: { x: 88, y: 46, z: 0.77 }
  },
  {
    id: 'proto-15',
    titleFa: 'مرثیه سایبری (انیمیشن)',
    titleEn: 'Cyber Requiem',
    creatorFa: 'استودیو کوراما',
    creatorEn: 'Kurama Animation',
    categoryFa: 'انیمیشن بزرگسال و سایبرپانک',
    categoryEn: 'Adult Animation',
    clusterId: 'neon-futures',
    clusterLabelFa: 'آینده نئونی',
    clusterLabelEn: 'Neon Futures',
    durationSec: 460,
    quality: '4K 60FPS',
    releaseYear: 2026,
    addedDaysAgo: 3,
    posterUrl: imgCyberRequiem,
    accentHex: '#EC4899',
    synopsisFa:
      'انیمیشن فریم‌به‌فریم با ریتم تند در ابرشهری آینده‌نگر که مرز میان حافظه و ماشین از میان رفته است.',
    synopsisEn:
      'Frame-by-frame animated noir set inside an elevated megacity where memory implants expire at dawn.',
    tags: ['animation', 'anime', 'cyberpunk', 'fast-paced', 'action'],
    tagsFa: ['انیمیشن', 'انیمه', 'سایبرپانک', 'سریع', 'اکشن'],
    vector: { tension: 0.89, pace: 0.91, surrealism: 0.74, nocturnal: 0.95, intimacy: 0.42, depth: 0.81 },
    availabilityStatus: 'available',
    licenseVerified: true,
    consentVerified: true,
    sourceName: 'Kurama Studio Licensed',
    subtitles: [],
    chapters: [{ id: 'c1', timeSec: 0, labelFa: 'بیدارشدن', labelEn: 'Awakening' }],
    spatialPos: { x: 78, y: 16, z: 0.84 }
  },
  {
    id: 'proto-16',
    titleFa: 'سامورایی مخملی',
    titleEn: 'Velvet Samurai',
    creatorFa: 'استودیو کوراما',
    creatorEn: 'Kurama Animation',
    categoryFa: 'انیمیشن هنری',
    categoryEn: 'Art Animation',
    clusterId: 'neon-futures',
    clusterLabelFa: 'آینده نئونی',
    clusterLabelEn: 'Neon Futures',
    durationSec: 530,
    quality: '4K HDR',
    releaseYear: 2025,
    addedDaysAgo: 12,
    posterUrl: imgVelvetSamurai,
    accentHex: '#F43F5E',
    synopsisFa:
      'ترکیب نقاشی مرکب سنتی با نورپردازی معاصر در داستان دوئلی خاموش زیر شکوفه‌های شبانه.',
    synopsisEn:
      'Traditional sumi-e ink animation fused with crimson moonlight in a silent duel beneath night blossoms.',
    tags: ['animation', 'samurai', 'ink', 'art', 'duel'],
    tagsFa: ['انیمیشن', 'سامورایی', 'مرکب', 'هنری'],
    vector: { tension: 0.84, pace: 0.68, surrealism: 0.65, nocturnal: 0.86, intimacy: 0.47, depth: 0.89 },
    availabilityStatus: 'available',
    licenseVerified: true,
    consentVerified: true,
    sourceName: 'Kurama Studio Licensed',
    subtitles: [],
    chapters: [{ id: 'c1', timeSec: 0, labelFa: 'شب شکوفه‌ها', labelEn: 'Night Blossoms' }],
    spatialPos: { x: 64, y: 22, z: 0.72 }
  },
  {
    id: 'proto-17',
    titleFa: 'سایرن اخترشناسان',
    titleEn: 'Astral Siren',
    creatorFa: 'سوفیا لیند',
    creatorEn: 'Sofia Lind',
    categoryFa: 'انیمیشن صوتی‌تصویری',
    categoryEn: 'Audio-Visual Myth',
    clusterId: 'midnight-sound',
    clusterLabelFa: 'صدا و ریتم شب',
    clusterLabelEn: 'Midnight Sound',
    durationSec: 405,
    quality: '1080p',
    releaseYear: 2025,
    addedDaysAgo: 18,
    posterUrl: imgAstralSiren,
    accentHex: '#818CF8',
    synopsisFa:
      'سفر آوایی میان سحابی‌های دوردست با ریتم ملایم الکترونیک و طراحی انیمیشن سیال.',
    synopsisEn:
      'A drifting vocal and electronic odyssey through deep-space nebulae with fluid cel animation.',
    tags: ['animation', 'astral', 'ambient', 'music', 'calm'],
    tagsFa: ['انیمیشن', 'موسیقی', 'آرام', 'فضایی'],
    vector: { tension: 0.28, pace: 0.35, surrealism: 0.87, nocturnal: 0.79, intimacy: 0.66, depth: 0.76 },
    availabilityStatus: 'available',
    licenseVerified: true,
    consentVerified: true,
    sourceName: 'Nordic Cinema Archive',
    subtitles: [],
    chapters: [{ id: 'c1', timeSec: 0, labelFa: 'ندای سحابی', labelEn: 'Nebula Call' }],
    spatialPos: { x: 58, y: 40, z: 0.69 }
  },
  {
    id: 'proto-18',
    titleFa: 'شکوفه کسوف',
    titleEn: 'Eclipse Bloom',
    // Also omits optional creator to verify missing-field handling
    categoryFa: 'تجربی و مدیتیشن بصری',
    categoryEn: 'Experimental Bloom',
    clusterId: 'surreal-art',
    clusterLabelFa: 'هنر سورئال',
    clusterLabelEn: 'Surreal Art',
    durationSec: 295,
    quality: '4K HDR',
    releaseYear: 2026,
    addedDaysAgo: 2,
    posterUrl: imgEclipseBloom,
    accentHex: '#FB7185',
    synopsisFa:
      'گیاهان بیولومینسنت در لحظه خورشیدگرفتگی کامل باز می‌شوند؛ مطالعه زمان‌گریز بر نور و رنگ.',
    synopsisEn:
      'Bioluminescent flora opening during a total solar eclipse in macro slow-motion clarity.',
    tags: ['eclipse', 'nature', 'macro', 'surreal', 'slow-burn'],
    tagsFa: ['کسوف', 'ماکرو', 'سورئال', 'آهسته'],
    vector: { tension: 0.25, pace: 0.18, surrealism: 0.90, nocturnal: 0.74, intimacy: 0.61, depth: 0.82 },
    availabilityStatus: 'available',
    licenseVerified: true,
    consentVerified: true,
    sourceName: 'Aeon Verified Originals',
    subtitles: [],
    chapters: [{ id: 'c1', timeSec: 0, labelFa: 'لحظه کسوف', labelEn: 'Totality' }],
    spatialPos: { x: 82, y: 84, z: 0.75 }
  }
];

export const INITIAL_USER_STATE: UserAccountState = {
  profileId: 'local-device-vault',
  displayName: 'فضای شخصی شما',
  ageVerified: false,
  jurisdiction: 'global-standard',
  consentEssential: true,
  consentPersonalization: true,
  personalizationEnabled: true,
  blockedTopics: [],
  preferredQuality: 'auto',
  defaultSubtitleLang: 'fa',
  defaultSpeed: 1,
  reducedMotion: false,
  highContrast: false,
  liteUniverseMode: false,
  notificationsEnabled: true,
  digestAlertsEnabled: false,
  sessions: [
    {
      id: 'sess-current',
      deviceLabel: 'حافظه محلی همین دستگاه (In-App Vault)',
      locationLabel: 'Local Device Storage',
      lastActive: 'هم‌اکنون · ذخیره خودکار',
      isCurrent: true
    }
  ]
};
