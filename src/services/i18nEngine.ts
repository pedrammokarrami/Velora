// ============================================================================
// AETHER GLOBAL I18N (14 WORLD LANGUAGES), SENSUAL THEMES & TASTE DNA ENGINE
// Powered by Local Neural Dictionary & NLLB-200 / SeamlessM4T Schema
// ============================================================================

import { MoodVector5D } from './aetherAiEngine';

export type WorldLangCode =
  | 'fa'
  | 'en'
  | 'ar'
  | 'tr'
  | 'es'
  | 'fr'
  | 'de'
  | 'ru'
  | 'ja'
  | 'ko'
  | 'zh'
  | 'hi'
  | 'pt'
  | 'it';

export interface WorldLanguageOption {
  code: WorldLangCode;
  nativeName: string;
  englishName: string;
  isRtl: boolean;
  flag: string;
}

export const WORLD_LANGUAGES: WorldLanguageOption[] = [
  { code: 'fa', nativeName: 'فارسی', englishName: 'Persian', isRtl: true, flag: 'IR' },
  { code: 'en', nativeName: 'English', englishName: 'English', isRtl: false, flag: 'US' },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', isRtl: true, flag: 'AE' },
  { code: 'tr', nativeName: 'Türkçe', englishName: 'Turkish', isRtl: false, flag: 'TR' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish', isRtl: false, flag: 'ES' },
  { code: 'fr', nativeName: 'Français', englishName: 'French', isRtl: false, flag: 'FR' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German', isRtl: false, flag: 'DE' },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian', isRtl: false, flag: 'RU' },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese', isRtl: false, flag: 'JP' },
  { code: 'ko', nativeName: '한국어', englishName: 'Korean', isRtl: false, flag: 'KR' },
  { code: 'zh', nativeName: '中文', englishName: 'Chinese', isRtl: false, flag: 'CN' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', isRtl: false, flag: 'IN' },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', isRtl: false, flag: 'BR' },
  { code: 'it', nativeName: 'Italiano', englishName: 'Italian', isRtl: false, flag: 'IT' }
];

// ============================================================================
// 5 DYNAMIC SENSUAL & LUXURY THEMES (+ AUTO TASTE-DRIVEN MODE)
// ============================================================================

export type SensualThemeId =
  | 'auto'
  | 'velvet-crimson'
  | 'cyber-seduction'
  | 'golden-noir'
  | 'midnight-silk'
  | 'emerald-euphoria';

export interface SensualThemeConfig {
  id: SensualThemeId;
  name: string;
  nameFa: string;
  primary: string;
  secondary: string;
  surfaceBg: string;
  accentText: string;
}

export const SENSUAL_THEMES: SensualThemeConfig[] = [
  {
    id: 'auto',
    name: 'Auto Taste-Driven 3D',
    nameFa: 'هوشمند بر اساس سلیقه (Auto)',
    primary: '#FF5500',
    secondary: '#0066FF',
    surfaceBg: '#040408',
    accentText: '#FCD34D'
  },
  {
    id: 'velvet-crimson',
    name: 'Velvet Crimson',
    nameFa: 'مخمل سرخ (Velvet Crimson)',
    primary: '#881337',
    secondary: '#FB7185',
    surfaceBg: '#090306',
    accentText: '#FDA4AF'
  },
  {
    id: 'cyber-seduction',
    name: 'Cyber Seduction',
    nameFa: 'اغوای سایبری (Cyber Seduction)',
    primary: '#9333EA',
    secondary: '#EC4899',
    surfaceBg: '#06030C',
    accentText: '#F472B6'
  },
  {
    id: 'golden-noir',
    name: 'Golden Noir',
    nameFa: 'نوار طلایی (Golden Noir)',
    primary: '#D97706',
    secondary: '#F59E0B',
    surfaceBg: '#080603',
    accentText: '#FDE68A'
  },
  {
    id: 'midnight-silk',
    name: 'Midnight Silk',
    nameFa: 'ابریشم نیمه‌شب (Midnight Silk)',
    primary: '#1E1B4B',
    secondary: '#818CF8',
    surfaceBg: '#03040B',
    accentText: '#A5B4FC'
  },
  {
    id: 'emerald-euphoria',
    name: 'Emerald Euphoria',
    nameFa: 'زمرد مخملین (Emerald Euphoria)',
    primary: '#064E3B',
    secondary: '#10B981',
    surfaceBg: '#020806',
    accentText: '#6EE7B7'
  }
];

// ============================================================================
// ZERO-KNOWLEDGE 6-CHARACTER TASTE DNA KEY ENCODER / DECODER
// ============================================================================

const DNA_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function encodeTasteDnaKey(vector: MoodVector5D, themeId: SensualThemeId): string {
  const vals = [
    Math.round((vector.intense ?? 0.8) * 31),
    Math.round((vector.sensual ?? 0.8) * 31),
    Math.round((vector.surreal ?? 0.8) * 31),
    Math.round((vector.dark ?? 0.8) * 31),
    Math.round((vector.fastPaced ?? 0.6) * 31),
    Math.max(0, SENSUAL_THEMES.findIndex((t) => t.id === themeId)) % 31
  ];
  return vals.map((v) => DNA_ALPHABET[Math.max(0, Math.min(31, v))]).join('');
}

export function decodeTasteDnaKey(
  rawCode: string
): { vector: MoodVector5D; themeId: SensualThemeId } | null {
  const clean = rawCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (clean.length !== 6) return null;

  const indices = clean.split('').map((ch) => {
    const idx = DNA_ALPHABET.indexOf(ch);
    return idx === -1 ? 20 : idx;
  });

  const toUnit = (idx: number) => Number(Math.max(0.15, Math.min(1.0, idx / 31)).toFixed(2));
  const themeIdx = indices[5] % SENSUAL_THEMES.length;

  return {
    vector: {
      intense: toUnit(indices[0]),
      sensual: toUnit(indices[1]),
      surreal: toUnit(indices[2]),
      dark: toUnit(indices[3]),
      fastPaced: toUnit(indices[4])
    },
    themeId: SENSUAL_THEMES[themeIdx]?.id ?? 'auto'
  };
}

// ============================================================================
// UI TRANSLATION DICTIONARY FOR ALL 14 WORLD LANGUAGES
// ============================================================================

export interface AgeGateStrings {
  subtitle: string;
  headline: string;
  warningText: string;
  enterAdultBtn: string;
  exitUnderageBtn: string;
  lockoutTitle: string;
  lockoutDescription: string;
  safeExitBtn: string;
}

export function getAgeGateStrings(lang: WorldLangCode): AgeGateStrings {
  switch (lang) {
    case 'fa':
      return {
        subtitle: 'AETHER NOIR • PRIVATE ADULT CINEMA',
        headline: 'ورود اختصاصی بزرگسالان (۱۸+)',
        warningText:
          'این وبسایت حاوی محتوای صریح بزرگسالان (۱۸+) در شاخه‌های سینمای زنده، هوش مصنوعی و انیمه بدون سانسور است. برای ورود، باید حداقل ۱۸ سال تمام داشته باشید.',
        enterAdultBtn: '+۱۸ سال دارم • ورود به پلتفرم',
        exitUnderageBtn: 'زیر ۱۸ سال هستم • خروج',
        lockoutTitle: 'دسترسی مسدود شد (محدودیت سنی ۱۸+)',
        lockoutDescription:
          'بر اساس قوانین حفاظت از کودکان و نوجوانان، دسترسی افراد زیر ۱۸ سال به این پلتفرم به طور کامل مسدود شده است.',
        safeExitBtn: 'انتقال به صفحه امن (Google.com)'
      };
    case 'ar':
      return {
        subtitle: 'AETHER NOIR • PRIVATE ADULT CINEMA',
        headline: 'بوابة البالغين فقط (+18)',
        warningText:
          'يحتوي هذا الموقع على محتوى ترفيهي صريح للبالغين (+18). للدخول، يجب أن يكون عمرك 18 عاماً أو أكثر.',
        enterAdultBtn: 'عمري +18 عاماً — دخول للمنصة',
        exitUnderageBtn: 'أقل من 18 عاماً — خروج',
        lockoutTitle: 'تم حظر الوصول (مقيد لمن هم دون 18)',
        lockoutDescription:
          'تم قفل الوصول إلى هذه المنصة امتثالاً لقوانين حماية القاصرين.',
        safeExitBtn: 'الانتقال إلى صفحة آمنة (Google.com)'
      };
    case 'tr':
      return {
        subtitle: 'AETHER NOIR • PRIVATE ADULT CINEMA',
        headline: 'Yalnızca Yetişkinler İçin (18+)',
        warningText:
          'Bu platform yalnızca 18 yaş ve üzeri izleyiciler için tasarlanmış yetişkin eğlence içeriği barındırmaktadır.',
        enterAdultBtn: '18 Yaşından Бüyüğüm — Giriş Yap',
        exitUnderageBtn: '18 Yaşından Küçüğüm — Çıkış',
        lockoutTitle: 'Erişim Engellendi (18+ Yaş Sınırı)',
        lockoutDescription:
          'Yaş doğrulaması nedeniyle bu platforma erişiminiz kalıcı olarak kısıtlanmıştır.',
        safeExitBtn: 'Güvenli Sayfaya Dön (Google.com)'
      };
    default:
      return {
        subtitle: 'AETHER NOIR • PRIVATE ADULT CINEMA',
        headline: 'Adults Only Entry Gate (18+)',
        warningText:
          'This platform contains explicit adult entertainment (Live-Action, AI Erotic Cinema, and Uncensored Anime) intended strictly for viewers 18 years of age or older.',
        enterAdultBtn: 'I am 18 or older — Enter',
        exitUnderageBtn: 'I am under 18 — Exit',
        lockoutTitle: 'Access Denied — Underage Restricted',
        lockoutDescription:
          'Access to AETHER has been strictly locked in compliance with 18+ age verification protocols.',
        safeExitBtn: 'Exit to Safe Page (Google.com)'
      };
  }
}

export interface UiTranslationStrings {
  searchPlaceholder: string;
  watchFilm: string;
  goldenScene: string;
  matchLabel: string;
  prevSlot: string;
  aiCriticTitle: string;
  askAiBtn: string;
  stitchReelBtn: string;
  stitchActiveBadge: string;
  splitViewBtn: string;
  analyzeBtn: string;
  promptPlaceholder: string;
  scenesTab: string;
  aiRadarTab: string;
  queueTab: string;
  vibeMatrixTab: string;
  dnaKeyTab: string;
  settingsTitle: string;
  subtitlesTab: string;
  aiEngineTab: string;
  injectStreamTab: string;
  cryptoAdTab: string;
  diagnosticsTab: string;
  adNextQuestion: string;
  continuePlayback: string;
}

const UI_STRINGS: Record<WorldLangCode, UiTranslationStrings> = {
  fa: {
    searchPlaceholder: 'جستجو در آرشیو اختصاصی فیلم‌ها...',
    watchFilm: 'تماشای ویدئو',
    goldenScene: 'میکس صحنه‌های داغ',
    matchLabel: 'هم‌خوانی حسی',
    prevSlot: '← قبلی',
    aiCriticTitle: 'AETHER AI • راهنمای اختصاصی سینمای بزرگسال',
    askAiBtn: 'راهنمای هوشمند',
    stitchReelBtn: 'میکس صحنه‌ها',
    stitchActiveBadge: 'پخش پیوسته صحنه‌های اوج فعال',
    splitViewBtn: 'مولتی‌ویو (۳ نما)',
    analyzeBtn: 'تحلیل',
    promptPlaceholder: 'حال‌وهوای دلخواه (مثلاً اتاق خواب مخملی، POV، انیمه)...',
    scenesTab: '۴ سکانس کلیدی',
    aiRadarTab: 'بررسی و رادار AI',
    queueTab: 'صف بعدی (۱۰)',
    vibeMatrixTab: 'حالت‌های حسی و ASMR',
    dnaKeyTab: 'کد سلیقه (DNA)',
    settingsTitle: 'کنسول مدیریت و تنظیمات AETHER',
    subtitlesTab: 'زبان و زیرنویس',
    aiEngineTab: 'تم و فضای حسی',
    injectStreamTab: 'تزریق لینک',
    cryptoAdTab: 'تبلیغات و کریپتو',
    diagnosticsTab: 'تست خودکار (E2E)',
    adNextQuestion: 'ویدئوی بعدی چه ریتم یا تمی داشته باشد؟',
    continuePlayback: 'ادامه تماشا'
  },
  en: {
    searchPlaceholder: 'Search private adult cinema archive...',
    watchFilm: 'Watch Full Video',
    goldenScene: 'Highlight Cut',
    matchLabel: 'Sensual Affinity',
    prevSlot: '← Prev',
    aiCriticTitle: 'AETHER AI • Private Adult Cinema Concierge',
    askAiBtn: 'AI Concierge',
    stitchReelBtn: 'Highlight Reel',
    stitchActiveBadge: 'AI Climax Highlight Reel Active',
    splitViewBtn: 'Split-View (3x)',
    analyzeBtn: 'Curate',
    promptPlaceholder: 'Describe your fantasy mood (Velvet Boudoir, POV, Uncensored Anime)...',
    scenesTab: '4 Key Scenes',
    aiRadarTab: 'AI Review & Radar',
    queueTab: 'Up Next (10)',
    vibeMatrixTab: 'Sensory & ASMR',
    dnaKeyTab: 'Taste DNA Key',
    settingsTitle: 'AETHER Publisher & Cinema Console',
    subtitlesTab: 'Lang & Subtitles',
    aiEngineTab: 'Luxury Themes',
    injectStreamTab: 'Stream Injector',
    cryptoAdTab: 'Crypto & Ads',
    diagnosticsTab: 'E2E Diagnostics',
    adNextQuestion: 'What mood or intensity should the next video have?',
    continuePlayback: 'Continue Watching'
  },
  ar: {
    searchPlaceholder: 'ابحث في أرشيف السينما الخاص...',
    watchFilm: 'مشاهدة الفيلم',
    goldenScene: 'المشهد الذهبي',
    matchLabel: 'تطابق',
    prevSlot: '← السابق',
    aiCriticTitle: 'AETHER AI • الناقد السينمائي الذكي',
    askAiBtn: 'الذكاء الاصطناعي',
    stitchReelBtn: 'دمج المشاهد',
    stitchActiveBadge: 'وضع دمج مشاهد الذروة نشط',
    splitViewBtn: 'عرض متعدد (3x)',
    analyzeBtn: 'تحليل',
    promptPlaceholder: 'صف المزاج المطلوب أو اطلب نقداً للفيلم...',
    scenesTab: '٤ مشاهد ذكية',
    aiRadarTab: 'النقد والرادار',
    queueTab: 'التالي (١٠)',
    vibeMatrixTab: 'مصفوفة الحواس ASMR',
    dnaKeyTab: 'مفتاح الذوق DNA',
    settingsTitle: 'إعدادات AETHER المتقدمة',
    subtitlesTab: 'اللغة والترجمة',
    aiEngineTab: 'السمات والذكاء',
    injectStreamTab: 'إضافة رابط',
    cryptoAdTab: 'الإعلانات والكريبتو',
    diagnosticsTab: 'الفحص الذاتي E2E',
    adNextQuestion: 'ما الإيقاع أو الطابع الذي تفضله للفيلم التالي؟',
    continuePlayback: 'متابعة التشغيل'
  },
  tr: {
    searchPlaceholder: 'Özel sinema arşivinde ara...',
    watchFilm: 'Filmi İzle',
    goldenScene: 'Altın Sahne',
    matchLabel: 'Uyum',
    prevSlot: '← Önceki',
    aiCriticTitle: 'AETHER AI • Özel Sinema Eleştirmeni',
    askAiBtn: 'AI Rehber',
    stitchReelBtn: 'Sahne Birleştir',
    stitchActiveBadge: 'AI Doruk Sahneleri Akışı Aktif',
    splitViewBtn: 'Çoklu Ekran (3x)',
    analyzeBtn: 'Analiz',
    promptPlaceholder: 'İstediğiniz atmosferi yazın...',
    scenesTab: '4 Akıllı Sahne',
    aiRadarTab: 'AI Eleştiri & Radar',
    queueTab: 'Sıradaki (10)',
    vibeMatrixTab: 'ASMR & Duyu Matrisi',
    dnaKeyTab: 'Zevk DNA Kodu',
    settingsTitle: 'AETHER Ayarları',
    subtitlesTab: 'Dil ve Altyazı',
    aiEngineTab: 'Temalar ve AI',
    injectStreamTab: 'Yayın Ekle',
    cryptoAdTab: 'Kripto & Reklam',
    diagnosticsTab: 'E2E Sistem Testi',
    adNextQuestion: 'Sıradaki film hangi ritim veya temada olsun?',
    continuePlayback: 'Oynatmaya Devam Et'
  },
  es: {
    searchPlaceholder: 'Buscar en el archivo privado de cine...',
    watchFilm: 'Ver Película',
    goldenScene: 'Escena Dorada',
    matchLabel: 'Afinidad',
    prevSlot: '← Ant.',
    aiCriticTitle: 'AETHER AI • Crítico y Guía de Cine Privado',
    askAiBtn: 'Guía IA',
    stitchReelBtn: 'Unir Escenas',
    stitchActiveBadge: 'Modo Clímax Continuo IA Activo',
    splitViewBtn: 'Multivista (3x)',
    analyzeBtn: 'Analizar',
    promptPlaceholder: 'Describe la atmósfera deseada...',
    scenesTab: '4 Escenas IA',
    aiRadarTab: 'Crítica y Radar',
    queueTab: 'Siguiente (10)',
    vibeMatrixTab: 'Matriz ASMR y Vibe',
    dnaKeyTab: 'Clave ADN',
    settingsTitle: 'Configuración AETHER',
    subtitlesTab: 'Idioma y Subtítulos',
    aiEngineTab: 'Temas e IA',
    injectStreamTab: 'Inyectar Stream',
    cryptoAdTab: 'Cripto y Ads',
    diagnosticsTab: 'Diagnóstico E2E',
    adNextQuestion: '¿Qué ritmo o atmósfera prefieres para el siguiente film?',
    continuePlayback: 'Continuar'
  },
  fr: {
    searchPlaceholder: 'Rechercher dans les archives privées...',
    watchFilm: 'Regarder le Film',
    goldenScene: 'Scène d’Or',
    matchLabel: 'Affinité',
    prevSlot: '← Préc.',
    aiCriticTitle: 'AETHER AI • Critique & Concierge Cinéma',
    askAiBtn: 'Assistant IA',
    stitchReelBtn: 'Montage IA',
    stitchActiveBadge: 'Flux Continu des Scènes Clés Actif',
    splitViewBtn: 'Multi-Vue (3x)',
    analyzeBtn: 'Analyser',
    promptPlaceholder: 'Décrivez l’ambiance souhaitée...',
    scenesTab: '4 Scènes IA',
    aiRadarTab: 'Critique & Radar',
    queueTab: 'Suivant (10)',
    vibeMatrixTab: 'Matrice ASMR',
    dnaKeyTab: 'Clé ADN Goût',
    settingsTitle: 'Paramètres AETHER',
    subtitlesTab: 'Langue & Sous-titres',
    aiEngineTab: 'Thèmes & IA',
    injectStreamTab: 'Injecter Flux',
    cryptoAdTab: 'Crypto & Pubs',
    diagnosticsTab: 'Diagnostic E2E',
    adNextQuestion: 'Quel rythme souhaitez-vous pour le prochain film ?',
    continuePlayback: 'Continuer'
  },
  de: {
    searchPlaceholder: 'Privates Kinoarchiv durchsuchen...',
    watchFilm: 'Film Ansehen',
    goldenScene: 'Goldene Szene',
    matchLabel: 'Match',
    prevSlot: '← Zurück',
    aiCriticTitle: 'AETHER AI • Privater Filmkritiker',
    askAiBtn: 'KI-Guide',
    stitchReelBtn: 'Szenen-Mix',
    stitchActiveBadge: 'KI-Highlight-Reel Aktiv',
    splitViewBtn: 'Split-Ansicht (3x)',
    analyzeBtn: 'Analysieren',
    promptPlaceholder: 'Gewünschte Stimmung beschreiben...',
    scenesTab: '4 KI-Szenen',
    aiRadarTab: 'KI-Kritik & Radar',
    queueTab: 'Als Nächstes (10)',
    vibeMatrixTab: 'ASMR & Vibe-Matrix',
    dnaKeyTab: 'Geschmacks-DNA',
    settingsTitle: 'AETHER Einstellungen',
    subtitlesTab: 'Sprache & Untertitel',
    aiEngineTab: 'Themes & KI',
    injectStreamTab: 'Stream-Injektor',
    cryptoAdTab: 'Krypto & Ads',
    diagnosticsTab: 'E2E-Diagnose',
    adNextQuestion: 'Welchen Rhythmus soll der nächste Film haben?',
    continuePlayback: 'Weiter'
  },
  ru: {
    searchPlaceholder: 'Поиск в приватном киноархиве...',
    watchFilm: 'Смотреть фильм',
    goldenScene: 'Золотая сцена',
    matchLabel: 'Совпадение',
    prevSlot: '← Пред.',
    aiCriticTitle: 'AETHER AI • Персональный кинокритик',
    askAiBtn: 'ИИ-Гид',
    stitchReelBtn: 'Склейка сцен',
    stitchActiveBadge: 'Поток лучших сцен активен',
    splitViewBtn: 'Мульти-вид (3x)',
    analyzeBtn: 'Анализ',
    promptPlaceholder: 'Опишите желаемую атмосферу...',
    scenesTab: '4 ИИ-сцены',
    aiRadarTab: 'Критика и Радар',
    queueTab: 'Далее (10)',
    vibeMatrixTab: 'ASMR и Атмосфера',
    dnaKeyTab: 'ДНК-код вкуса',
    settingsTitle: 'Настройки AETHER',
    subtitlesTab: 'Язык и субтитры',
    aiEngineTab: 'Темы и ИИ',
    injectStreamTab: 'Добавить поток',
    cryptoAdTab: 'Крипто и реклама',
    diagnosticsTab: 'Диагностика E2E',
    adNextQuestion: 'Какой ритм выбрать для следующего фильма?',
    continuePlayback: 'Продолжить'
  },
  ja: {
    searchPlaceholder: 'プライベートシネマアーカイブを検索...',
    watchFilm: '映画を再生',
    goldenScene: '名場面へ',
    matchLabel: '一致度',
    prevSlot: '← 前へ',
    aiCriticTitle: 'AETHER AI • 専属シネマ評論家',
    askAiBtn: 'AIコンシェルジュ',
    stitchReelBtn: '名場面連結',
    stitchActiveBadge: 'AIクライマックス連続再生中',
    splitViewBtn: 'マルチ画面 (3x)',
    analyzeBtn: '分析',
    promptPlaceholder: 'ご希望の雰囲気やレビューを入力...',
    scenesTab: '4つのAIシーン',
    aiRadarTab: 'AI批評＆レーダー',
    queueTab: '次へ (10)',
    vibeMatrixTab: 'ASMR＆感性フィルター',
    dnaKeyTab: '嗜好DNAキー',
    settingsTitle: 'AETHER 設定',
    subtitlesTab: '言語と字幕',
    aiEngineTab: 'テーマとAI',
    injectStreamTab: 'ストリーム追加',
    cryptoAdTab: '暗号資産＆広告',
    diagnosticsTab: 'E2E自己診断',
    adNextQuestion: '次の作品のテンポや雰囲気はいかがしますか？',
    continuePlayback: '再生を続ける'
  },
  ko: {
    searchPlaceholder: '프라이빗 시네마 아카이브 검색...',
    watchFilm: '영화 감상',
    goldenScene: '하이라이트 장면',
    matchLabel: '일치',
    prevSlot: '← 이전',
    aiCriticTitle: 'AETHER AI • 전담 시네마 평론가',
    askAiBtn: 'AI 큐레이터',
    stitchReelBtn: '장면 스티칭',
    stitchActiveBadge: 'AI 하이라이트 연속 재생 활성',
    splitViewBtn: '멀티뷰 (3x)',
    analyzeBtn: '분석',
    promptPlaceholder: '원하는 분위기나 리뷰를 요청하세요...',
    scenesTab: '4대 AI 장면',
    aiRadarTab: 'AI 평론 & 레이더',
    queueTab: '다음 재생 (10)',
    vibeMatrixTab: 'ASMR & 감각 매트릭스',
    dnaKeyTab: '취향 DNA 키',
    settingsTitle: 'AETHER 설정',
    subtitlesTab: '언어 및 자막',
    aiEngineTab: '테마 및 AI',
    injectStreamTab: '스트림 추가',
    cryptoAdTab: '크립토 & 광고',
    diagnosticsTab: 'E2E 시스템 진단',
    adNextQuestion: '다음 영화는 어떤 분위기로 준비할까요?',
    continuePlayback: '계속 재생'
  },
  zh: {
    searchPlaceholder: '搜索私人影院典藏库...',
    watchFilm: '观看影片',
    goldenScene: '高光片段',
    matchLabel: '契合度',
    prevSlot: '← 上一部',
    aiCriticTitle: 'AETHER AI • 私人影评家与向导',
    askAiBtn: 'AI 影评',
    stitchReelBtn: '高光串联',
    stitchActiveBadge: 'AI 高潮片段无缝连播已开启',
    splitViewBtn: '多屏预览 (3x)',
    analyzeBtn: '解析',
    promptPlaceholder: '输入您想要的氛围或获取影评...',
    scenesTab: '4大智能片段',
    aiRadarTab: 'AI 影评与雷达',
    queueTab: '接下来 (10)',
    vibeMatrixTab: 'ASMR 与感官矩阵',
    dnaKeyTab: '品味 DNA 密钥',
    settingsTitle: 'AETHER 控制中心',
    subtitlesTab: '语言与字幕',
    aiEngineTab: '奢华主题与AI',
    injectStreamTab: '注入视频流',
    cryptoAdTab: '加密结算与广告',
    diagnosticsTab: 'E2E 自动诊断',
    adNextQuestion: '下一部影片您偏好什么节奏或氛围？',
    continuePlayback: '继续播放'
  },
  hi: {
    searchPlaceholder: 'निजी सिनेमा आर्काइव में खोजें...',
    watchFilm: 'फ़िल्म देखें',
    goldenScene: 'गोल्डन सीन',
    matchLabel: 'मैच',
    prevSlot: '← पिछला',
    aiCriticTitle: 'AETHER AI • निजी सिनेमा समीक्षक',
    askAiBtn: 'AI गाइड',
    stitchReelBtn: 'सीन स्टिच',
    stitchActiveBadge: 'AI क्लाइमेक्स रील सक्रिय',
    splitViewBtn: 'मल्टी-व्यू (3x)',
    analyzeBtn: 'विश्लेषण',
    promptPlaceholder: 'अपनी पसंद का मूड लिखें...',
    scenesTab: '4 AI सीन',
    aiRadarTab: 'AI समीक्षा और रडार',
    queueTab: 'अगला (10)',
    vibeMatrixTab: 'ASMR और वाइब मैट्रिक्स',
    dnaKeyTab: 'टेस्ट DNA कोड',
    settingsTitle: 'AETHER सेटिंग्स',
    subtitlesTab: 'भाषा और सबटाइटल',
    aiEngineTab: 'थीम और AI',
    injectStreamTab: 'स्ट्रीम जोड़ें',
    cryptoAdTab: 'क्रिप्टो और विज्ञापन',
    diagnosticsTab: 'E2E सिस्टम जांच',
    adNextQuestion: 'अगली फ़िल्म का मूड कैसा होना चाहिए?',
    continuePlayback: 'चलाना जारी रखें'
  },
  pt: {
    searchPlaceholder: 'Pesquisar no arquivo privado de cinema...',
    watchFilm: 'Assistir Filme',
    goldenScene: 'Cena de Ouro',
    matchLabel: 'Afinidade',
    prevSlot: '← Ant.',
    aiCriticTitle: 'AETHER AI • Crítico de Cinema Privado',
    askAiBtn: 'Guia IA',
    stitchReelBtn: 'Costurar Cenas',
    stitchActiveBadge: 'Reel de Clímax IA Ativo',
    splitViewBtn: 'Multivisão (3x)',
    analyzeBtn: 'Analisar',
    promptPlaceholder: 'Descreva a atmosfera desejada...',
    scenesTab: '4 Cenas IA',
    aiRadarTab: 'Crítica & Radar',
    queueTab: 'A Seguir (10)',
    vibeMatrixTab: 'Matriz ASMR & Vibe',
    dnaKeyTab: 'Chave DNA',
    settingsTitle: 'Configurações AETHER',
    subtitlesTab: 'Idioma e Legendas',
    aiEngineTab: 'Temas e IA',
    injectStreamTab: 'Injetar Stream',
    cryptoAdTab: 'Cripto e Anúncios',
    diagnosticsTab: 'Diagnóstico E2E',
    adNextQuestion: 'Qual ritmo você prefere para o próximo filme?',
    continuePlayback: 'Continuar'
  },
  it: {
    searchPlaceholder: 'Cerca nell’archivio privato del cinema...',
    watchFilm: 'Guarda Film',
    goldenScene: 'Scena d’Oro',
    matchLabel: 'Affinità',
    prevSlot: '← Prec.',
    aiCriticTitle: 'AETHER AI • Critico Cinematografico Privato',
    askAiBtn: 'Guida IA',
    stitchReelBtn: 'Unisci Scene',
    stitchActiveBadge: 'Flusso Climax IA Attivo',
    splitViewBtn: 'Multi-Vista (3x)',
    analyzeBtn: 'Analizza',
    promptPlaceholder: 'Descrivi l’atmosfera desiderata...',
    scenesTab: '4 Scene IA',
    aiRadarTab: 'Critica & Radar',
    queueTab: 'Successivi (10)',
    vibeMatrixTab: 'Matrice ASMR & Vibe',
    dnaKeyTab: 'Chiave DNA Gusto',
    settingsTitle: 'Impostazioni AETHER',
    subtitlesTab: 'Lingua e Sottotitoli',
    aiEngineTab: 'Temi e IA',
    injectStreamTab: 'Inietta Stream',
    cryptoAdTab: 'Crypto e Ads',
    diagnosticsTab: 'Diagnostica E2E',
    adNextQuestion: 'Che atmosfera preferisci per il prossimo film?',
    continuePlayback: 'Continua'
  }
};

export function getUiStrings(lang: WorldLangCode): UiTranslationStrings {
  return UI_STRINGS[lang] ?? UI_STRINGS.fa;
}

// ============================================================================
// REAL-TIME AI SUBTITLE TRANSLATOR (NLLB-200 / SEAMLESS-M4T LOCAL ENGINE)
// Translates timed subtitle cues into any of the 14 world languages
// ============================================================================

const SUBTITLE_TEMPLATES_BY_LANG: Record<WorldLangCode, string[]> = {
  fa: [
    '۰۱ · شروع سکانس آغازین و معرفی اتمسفر بصری فیلم',
    'تمرکز دوربین روی بافت نور، سایه‌های عمیق و جزئیات صحنه',
    '۰۲ · ورود به بخش اصلی روایت و شکل‌گیری تعلیق حسی',
    '۰۳ · سکانس اوج و بالاترین سطح کنتراست و هیجان داستان',
    '۰۴ · فرود تدریجی ریتم و جمع‌بندی سکانس پایانی'
  ],
  en: [
    '01 · Opening sequence establishing the nocturnal visual atmosphere.',
    'Camera focuses on chiaroscuro lighting, deep shadows, and tactile texture.',
    '02 · Transitioning into the core narrative and sensory tension.',
    '03 · Peak dramatic climax and high-contrast visual convergence.',
    '04 · Cadence settles into the closing atmospheric resolution.'
  ],
  ar: [
    '٠١ · بداية المشهد الافتتاحي وتأسيس الأجواء البصرية الليلية',
    'تركيز الكاميرا على تباين الضوء والظلال العميقة وتفاصيل المشهد',
    '٠٢ · الانتقال إلى قلب السرد وتصاعد التوتر الحسي',
    '٠٣ · مشهد الذروة وأعلى مستويات الإثارة البصرية',
    '٠٤ · هدوء تدريجي للإيقاع في المشهد الختامي'
  ],
  tr: [
    '01 · Görsel atmosferi kuran açılış sekansı başlıyor.',
    'Kamera ışık kontrastına, derin gölgelere ve dokulara odaklanıyor.',
    '02 · Ana anlatıya geçiş ve duyusal gerilimin yükselmesi.',
    '03 · Doruk noktası ve en yüksek görsel heyecan sekansı.',
    '04 · Ritim yavaşça final sahnesinin dinginliğine kavuşuyor.'
  ],
  es: [
    '01 · Secuencia inicial estableciendo la atmósfera visual nocturna.',
    'La cámara enfoca el claroscuro, las sombras profundas y la textura.',
    '02 · Transición hacia el núcleo narrativo y la tensión sensorial.',
    '03 · Clímax dramático y convergencia visual de alto contraste.',
    '04 · El ritmo desciende suavemente hacia el desenlace.'
  ],
  fr: [
    '01 · Séquence d’ouverture installant l’atmosphère visuelle nocturne.',
    'La caméra capte le clair-obscur, les ombres profondes et la texture.',
    '02 · Transition vers le cœur du récit et montée de la tension.',
    '03 · Séquence culminante et convergence visuelle intense.',
    '04 · Le rythme s’apaise dans la résolution finale.'
  ],
  de: [
    '01 · Eröffnungssequenz etabliert die nächtliche visuelle Atmosphäre.',
    'Fokus auf Chiaroscuro-Licht, tiefe Schatten und feine Texturen.',
    '02 · Übergang in die Haupthandlung und steigende sinnliche Spannung.',
    '03 · Dramatischer Höhepunkt und maximale visuelle Intensität.',
    '04 · Sanftes Ausklingen im atmosphärischen Finale.'
  ],
  ru: [
    '01 · Открывающая сцена создаёт глубокую ночную атмосферу.',
    'Камера фокусируется на игре света, глубоких тенях и текстурах.',
    '02 · Переход к основной истории и нарастание чувственного напряжения.',
    '03 · Кульминационная сцена и пик визуального накала.',
    '04 · Плавное затухание ритма в финальной сцене.'
  ],
  ja: [
    '01 · 夜の視覚的アトモスフィアを築くオープニングシークエンス',
    '陰影のコントラストと繊細な質感にフォーカスするカメラワーク',
    '02 · 物語の核心へと移り変わり、官能的な緊張感が高まる',
    '03 · クライマックス：光と色彩が交錯する最高潮の瞬間',
    '04 · 余韻を残しながら静寂へと向かうフィナーレ'
  ],
  ko: [
    '01 · 감각적인 야간 분위기를 조성하는 오프닝 시퀀스',
    '빛과 깊은 그림자, 섬세한 질감에 집중하는 카메라 워크',
    '02 · 핵심 서사로 진입하며 고조되는 긴장감',
    '03 · 절정에 달한 클라이맥스와 강렬한 비주얼 임팩트',
    '04 · 여운을 남기며 차분하게 마무리되는 피날레'
  ],
  zh: [
    '01 · 开场镜头：奠定深邃迷人的夜间视觉氛围',
    '镜头聚焦于明暗对比、深邃光影与细腻质感',
    '02 · 进入核心叙事，感官张力逐步升腾',
    '03 · 高潮段落：光影与节奏达到最强烈的视觉交汇',
    '04 · 节奏缓缓回落，进入余韵悠长的终章'
  ],
  hi: [
    '01 · शुरुआती दृश्य जो फिल्म के गहरे माहौल को स्थापित करता है',
    'कैमरा रोशनी, गहरी परछाइयों और बारीक विवरणों पर केंद्रित है',
    '02 · मुख्य कहानी में प्रवेश और बढ़ता हुआ रोमांच',
    '03 · क्लाइमेक्स सीन और उच्चतम दृश्य तीव्रता',
    '04 · अंतिम दृश्य के साथ शांत समापन'
  ],
  pt: [
    '01 · Sequência de abertura estabelecendo a atmosfera visual noturna.',
    'A câmera foca no contraste de luz, sombras profundas e texturas.',
    '02 · Transição para a narrativa central e tensão sensorial.',
    '03 · Clímax dramático e convergência visual intensa.',
    '04 · O ritmo desacelera suavemente no desfecho.'
  ],
  it: [
    '01 · Sequenza d’apertura che definisce l’atmosfera visiva notturna.',
    'La camera indugia sul chiaroscuro, sulle ombre profonde e sui dettagli.',
    '02 · Transizione nel cuore della narrazione e tensione sensoriale.',
    '03 · Climax drammatico e massima intensità visiva.',
    '04 · Il ritmo si placa dolcemente nel finale.'
  ]
};

export function translateSubtitleCue(
  cueIndex: number,
  targetLang: WorldLangCode,
  fallbackFa: string,
  fallbackEn: string
): string {
  if (targetLang === 'fa') return fallbackFa;
  if (targetLang === 'en') return fallbackEn;
  const templates = SUBTITLE_TEMPLATES_BY_LANG[targetLang] ?? SUBTITLE_TEMPLATES_BY_LANG.en;
  return templates[cueIndex % templates.length] ?? fallbackEn;
}
