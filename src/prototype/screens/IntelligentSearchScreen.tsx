import React, { useMemo, useState } from 'react';
import {
  Check,
  Compass,
  RotateCcw,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Wand2,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type {
  ExplainedRecommendation,
  FeedbackRecord,
  LanguageCode,
  OfflineDownloadRecord,
  PrototypeMediaItem,
  SearchFilterState,
  TasteVector6D,
  WatchProgressEntry
} from '../types';
import { blendVector, cosineSimilarity6D, runIntelligentSearch } from '../tasteEngine';
import { useT } from '../i18n';
import { Button, MediaCard } from '../components/UiPrimitives';

interface IntelligentSearchScreenProps {
  catalog: PrototypeMediaItem[];
  lang: LanguageCode;
  userVector: TasteVector6D;
  personalizationEnabled: boolean;
  progressMap: Record<string, WatchProgressEntry>;
  favoriteIds: Set<string>;
  downloadsMap: Record<string, OfflineDownloadRecord>;
  hiddenIds: Set<string>;
  blockedTopics: string[];
  feedbackMap: Record<string, FeedbackRecord>;
  filters: SearchFilterState;
  onChangeFilters: (next: SearchFilterState) => void;
  onPersonalizeTaste?: (targetVector: TasteVector6D, alpha?: number, note?: string) => void;
  onOpenDetail: (item: PrototypeMediaItem) => void;
  onPlay: (item: PrototypeMediaItem) => void;
  onDownload: (item: PrototypeMediaItem) => void;
  onToggleFavorite: (item: PrototypeMediaItem) => void;
  onFeedback: (item: PrototypeMediaItem, sentiment: 'like' | 'dislike' | 'less_like_this') => void;
  onHide: (item: PrototypeMediaItem) => void;
}

interface AiQuestionOption {
  id: string;
  labelEn: string;
  labelFa: string;
  subEn: string;
  subFa: string;
  targetVector: TasteVector6D;
  mode?: SearchFilterState['mode'];
  maxDurationMin?: number | null;
  minQuality?: SearchFilterState['minQuality'];
  sortBy?: SearchFilterState['sortBy'];
  queryAppend?: string;
}

interface AiAppliedSignal {
  id: string;
  labelEn: string;
  labelFa: string;
  targetVector: TasteVector6D;
}

const QUICK_SPARKS = [
  { q: 'باران', en: 'Rainy Noir', fa: 'نوار بارانی' },
  { q: 'tokyo', en: 'Neon Tokyo', fa: 'توکیو نئونی' },
  { q: 'آرام', en: 'Quiet Sanctuary', fa: 'آرامش و خلوت' },
  { q: 'سورئال', en: 'Surreal Dream', fa: 'رؤیای سورئال' },
  { q: 'انیمیشن', en: 'Adult Animation', fa: 'انیمیشن بزرگسال' },
  { q: 'صدا', en: 'Binaural Audio', fa: 'صدا و اتمسفر' }
];

const EXCLUDABLE_TAGS = [
  { tag: 'animation', fa: 'بدون انیمیشن', en: 'No Animation' },
  { tag: 'fast-paced', fa: 'بدون ریتم تند', en: 'No Fast-Paced' },
  { tag: 'surreal', fa: 'بدون سورئال', en: 'No Surreal' },
  { tag: 'cyber', fa: 'بدون سایبرپانک', en: 'No Cyber' }
];

function detectTopicContext(query: string): {
  key: 'rain' | 'neon' | 'calm' | 'surreal' | 'noir' | 'animation' | 'general';
  echoLabel: string;
} {
  const q = query.trim().toLowerCase();
  if (/rain|باران|wet|storm|نوار بارانی/.test(q)) return { key: 'rain', echoLabel: query.trim() };
  if (/tokyo|neon|cyber|نئون|توکیو|سایبر/.test(q)) return { key: 'neon', echoLabel: query.trim() };
  if (/calm|slow|asmr|binaural|sound|whisper|آرام|صدا|ملایم/.test(q)) return { key: 'calm', echoLabel: query.trim() };
  if (/surreal|dream|abstract|سورئال|رؤیا/.test(q)) return { key: 'surreal', echoLabel: query.trim() };
  if (/anim|انیمیشن|انیمه/.test(q)) return { key: 'animation', echoLabel: query.trim() };
  if (/noir|tension|shadow|mystery|نوار|تنش|معما/.test(q)) return { key: 'noir', echoLabel: query.trim() };
  return { key: 'general', echoLabel: query.trim() };
}

function parseFreeformReplyToSignal(text: string): {
  vector: TasteVector6D;
  patch: Partial<SearchFilterState>;
} {
  const lower = text.toLowerCase();
  const vector: TasteVector6D = {
    tension: 0.6,
    pace: 0.45,
    surrealism: 0.55,
    nocturnal: 0.8,
    intimacy: 0.65,
    depth: 0.78
  };
  const patch: Partial<SearchFilterState> = {};

  if (/آرام|ملایم|خلوت|calm|slow|quiet|soft|gentle|ambient|chill/.test(lower)) {
    vector.pace = 0.22;
    vector.tension = 0.35;
    vector.intimacy = 0.85;
  }
  if (/تند|هیجان|پرانرژی|fast|intense|kinetic|action|energy/.test(lower)) {
    vector.pace = 0.88;
    vector.tension = 0.85;
  }
  if (/شب|تاریک|باران|سایه|night|dark|noir|rain|midnight/.test(lower)) {
    vector.nocturnal = 0.96;
    vector.tension = Math.max(vector.tension, 0.76);
  }
  if (/صمیمی|رمانتیک|نزدیک|intimate|velvet|warm|close/.test(lower)) {
    vector.intimacy = 0.95;
    vector.depth = 0.82;
  }
  if (/سورئال|خیالی|عجیب|surreal|dream|art|abstract/.test(lower)) {
    vector.surrealism = 0.94;
    vector.depth = 0.9;
  }
  if (/کوتاه|سریع|short|quick|brief/.test(lower)) {
    patch.maxDurationMin = 8;
    patch.sortBy = 'duration_asc';
  }
  if (/4k|کیفیت|واضح|hdr/.test(lower)) {
    patch.minQuality = '4K';
  }
  if (/جدید|متفاوت|تازه|new|different|fresh|surprise/.test(lower)) {
    patch.mode = 'different';
  }

  return { vector, patch };
}

export function IntelligentSearchScreen({
  catalog,
  lang,
  userVector,
  personalizationEnabled,
  progressMap,
  favoriteIds,
  downloadsMap,
  hiddenIds,
  blockedTopics,
  feedbackMap,
  filters,
  onChangeFilters,
  onPersonalizeTaste,
  onOpenDetail,
  onPlay,
  onDownload,
  onToggleFavorite,
  onFeedback,
  onHide
}: IntelligentSearchScreenProps) {
  const { t } = useT();
  const [aiReplyInput, setAiReplyInput] = useState('');
  const [aiSignals, setAiSignals] = useState<AiAppliedSignal[]>([]);
  const [aiStep, setAiStep] = useState<number>(0);
  const [aiDismissed, setAiDismissed] = useState(false);
  const [aiManualOpen, setAiManualOpen] = useState(false);
  const [showTechSpecs, setShowTechSpecs] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(4);

  // Live effective taste vector blended with everything user clicked/typed right here
  const liveVector = useMemo(() => {
    return aiSignals.reduce((acc, sig) => blendVector(acc, sig.targetVector, 0.42), userVector);
  }, [userVector, aiSignals]);

  const queryActive = filters.query.trim().length > 0;
  const isAiCardOpen = !aiDismissed && (queryActive || aiSignals.length > 0 || aiManualOpen);

  const topicCtx = useMemo(() => detectTopicContext(filters.query), [filters.query]);

  // Build real-time AI clarifying question + dynamically personalized options
  const aiPromptData = useMemo(() => {
    const qText = topicCtx.echoLabel || t('your mood', 'حال‌وهوای موردنظرت');
    const replyHint = aiReplyInput.trim();

    let questionEn = '';
    let questionFa = '';
    let baseOptions: AiQuestionOption[] = [];

    if (aiStep % 3 === 0) {
      if (topicCtx.key === 'rain') {
        questionEn = `For "${qText}", which nocturnal atmosphere feels closest right now?`;
        questionFa = `برای حال‌وهوای «${qText}»، الان کدام فضا بیشتر با مود تو می‌خواند؟`;
      } else if (topicCtx.key === 'neon') {
        questionEn = `Inside "${qText}", should we lean toward kinetic energy or misty solitude?`;
        questionFa = `در دنیای «${qText}»، ریتم پرانرژی می‌خواهی یا خلوت نئونی و آرام؟`;
      } else if (topicCtx.key === 'calm') {
        questionEn = `For "${qText}", what sensory texture calms your focus most?`;
        questionFa = `برای حس «${qText}»، چه نوع فضا و صدایی بیشتر آرامت می‌کند؟`;
      } else if (queryActive) {
        questionEn = `What exact vibe are you hoping to feel inside "${qText}"?`;
        questionFa = `از جست‌وجوی «${qText}» دنبال چه حس‌وحال دقیق‌تری هستی؟`;
      } else {
        questionEn = 'Tell me how your night feels — every choice personalizes your stream live:';
        questionFa = 'الان چه حال‌وهوایی می‌خواهی؟ هر انتخاب، نتایج را در لحظه برای تو می‌چیند:';
      }

      baseOptions = [
        {
          id: 'opt-hypnotic',
          labelEn: 'Rain-soaked Noir & Deep Mystery',
          labelFa: 'نوار بارانی و رمزآلود',
          subEn: 'Slow shadows, high tension',
          subFa: 'سایه‌های عمیق و ریتم مرموز',
          targetVector: { tension: 0.9, pace: 0.3, surrealism: 0.48, nocturnal: 0.96, intimacy: 0.58, depth: 0.92 },
          mode: 'similar'
        },
        {
          id: 'opt-velvet',
          labelEn: 'Warm Velvet & Intimate Quiet',
          labelFa: 'صمیمی، گرم و مخملی',
          subEn: 'Close framing, unhurried',
          subFa: 'قاب‌بندی نزدیک و اتمسفر نرم',
          targetVector: { tension: 0.42, pace: 0.25, surrealism: 0.45, nocturnal: 0.88, intimacy: 0.96, depth: 0.84 },
          mode: 'similar'
        },
        {
          id: 'opt-electric',
          labelEn: 'Kinetic Neon & Bold Rhythm',
          labelFa: 'نئون پرانرژی و ریتم تند',
          subEn: 'City lights, crisp motion',
          subFa: 'نورهای شهری و حرکت سریع',
          targetVector: { tension: 0.82, pace: 0.88, surrealism: 0.72, nocturnal: 0.94, intimacy: 0.48, depth: 0.78 }
        },
        {
          id: 'opt-surreal',
          labelEn: 'Dreamlike Surreal Cinema',
          labelFa: 'سینمای رؤیایی و سورئال',
          subEn: 'Abstract poetry, fresh angles',
          subFa: 'تصویرسازی شاعرانه و متفاوت',
          targetVector: { tension: 0.38, pace: 0.34, surrealism: 0.96, nocturnal: 0.74, intimacy: 0.62, depth: 0.94 },
          mode: 'different'
        }
      ];
    } else if (aiStep % 3 === 1) {
      questionEn = queryActive
        ? `How long and intense should "${qText}" be tonight?`
        : 'How should the pace, duration, and clarity feel right now?';
      questionFa = queryActive
        ? `مدت‌زمان و شدت ریتم برای «${qText}» چطور باشد بهتر است؟`
        : 'مدت‌زمان و کیفیت تصویر موردنظرت را انتخاب کن:';

      baseOptions = [
        {
          id: 'opt-short-dive',
          labelEn: 'Short & Immersive (Under 10m)',
          labelFa: 'کوتاه و متمرکز (زیر ۱۰ دقیقه)',
          subEn: 'Quick escape right now',
          subFa: 'شروع سریع و بی‌مقدمه',
          targetVector: { ...liveVector, pace: 0.62 },
          maxDurationMin: 10,
          sortBy: 'duration_asc'
        },
        {
          id: 'opt-4k-cinema',
          labelEn: 'Pure 4K HDR Reference Visuals',
          labelFa: 'فقط کیفیت مرجع 4K HDR',
          subEn: 'Ultra-crisp master clarity',
          subFa: 'بالاترین وضوح تصویر و نور',
          targetVector: { ...liveVector, depth: 0.92 },
          minQuality: '4K'
        },
        {
          id: 'opt-slow-drift',
          labelEn: 'Unhurried Slow-Burn Flow',
          labelFa: 'ریتم آهسته و عمیق',
          subEn: 'Zero rush, hypnotic audio',
          subFa: 'بدون شتاب، غوطه‌ور در فضا',
          targetVector: { ...liveVector, pace: 0.22, intimacy: 0.82 },
          maxDurationMin: null
        },
        {
          id: 'opt-fresh-unwatched',
          labelEn: 'Surprise Me (Unwatched Only)',
          labelFa: 'کشف تازه (فقط دیده‌نشده‌ها)',
          subEn: 'Fresh angles outside habit',
          subFa: 'پیشنهادهای تازه و متفاوت',
          targetVector: { ...liveVector, surrealism: Math.min(0.95, liveVector.surrealism + 0.18) },
          mode: 'different'
        }
      ];
    } else {
      questionEn = 'Want to refine even further, or lock in this personalized mix?';
      questionFa = 'می‌خواهی ترکیب شخصی‌سازی‌شده‌ات را دقیق‌تر کنم؟';

      baseOptions = [
        {
          id: 'opt-deeper-match',
          labelEn: 'Lock Tightest Taste Match',
          labelFa: 'قفل روی دقیق‌ترین تطابق سلیقه',
          subEn: 'Prioritize strongest similarity',
          subFa: 'بالاترین درصد شباهت به تو',
          targetVector: liveVector,
          mode: 'similar',
          sortBy: 'relevance'
        },
        {
          id: 'opt-newest',
          labelEn: 'Fresh Arrivals Matching This',
          labelFa: 'تازه‌ترین آثار منطبق با این حس',
          subEn: 'Newest uploads first',
          subFa: 'جدیدترین‌ها در صدر لیست',
          targetVector: liveVector,
          sortBy: 'recent'
        },
        {
          id: 'opt-wild-card',
          labelEn: 'Contrast Twist (Unexpected)',
          labelFa: 'چرخش غیرمنتظره و متفاوت',
          subEn: 'Break the usual pattern',
          subFa: 'پیشنهاد غافلگیرکننده خارج از عادت',
          targetVector: {
            tension: 1 - liveVector.tension * 0.5,
            pace: 1 - liveVector.pace * 0.5,
            surrealism: 0.9,
            nocturnal: liveVector.nocturnal,
            intimacy: 0.72,
            depth: 0.88
          },
          mode: 'different'
        }
      ];
    }

    // Dynamically personalize options IN REAL TIME while the user is typing in the inline reply box too!
    if (replyHint.length >= 2) {
      const parsedHint = parseFreeformReplyToSignal(replyHint);
      const customLiveOption: AiQuestionOption = {
        id: `live-typed-${replyHint}`,
        labelEn: `Personalize for "${replyHint}"`,
        labelFa: `شخصی‌سازی لحظه‌ای برای «${replyHint}»`,
        subEn: 'Generated live from your typed answer',
        subFa: 'ساخته‌شده در لحظه از پاسخ تایپ‌شده تو',
        targetVector: parsedHint.vector,
        ...parsedHint.patch
      };
      baseOptions = [customLiveOption, ...baseOptions.slice(0, 3)];
    }

    // Score & re-order options dynamically against the user's live taste vector
    const rankedOptions = baseOptions
      .map((opt, idx) => {
        const sim = cosineSimilarity6D(liveVector, opt.targetVector);
        const affinityPct = Math.max(68, Math.min(99, Math.round(sim * 100)));
        return { opt, affinityPct, isTypedCustom: idx === 0 && replyHint.length >= 2 };
      })
      .sort((a, b) => {
        if (a.isTypedCustom !== b.isTypedCustom) return a.isTypedCustom ? -1 : 1;
        return b.affinityPct - a.affinityPct;
      });

    return { questionEn, questionFa, rankedOptions };
  }, [topicCtx, queryActive, aiStep, aiReplyInput, liveVector, t]);

  const grouped = useMemo(
    () =>
      runIntelligentSearch({
        catalog,
        filters,
        userVector: liveVector,
        personalizationEnabled,
        progressMap,
        hiddenIds,
        blockedTopics,
        feedbackMap,
        lang
      }),
    [
      catalog,
      filters,
      liveVector,
      personalizationEnabled,
      progressMap,
      hiddenIds,
      blockedTopics,
      feedbackMap,
      lang
    ]
  );

  const handleSelectAiOption = (opt: AiQuestionOption) => {
    setAiSignals((prev) => [
      ...prev.filter((s) => s.id !== opt.id),
      { id: opt.id, labelEn: opt.labelEn, labelFa: opt.labelFa, targetVector: opt.targetVector }
    ]);
    setAiStep((s) => s + 1);
    setAiDismissed(false);

    const nextFilters: SearchFilterState = { ...filters };
    if (opt.mode) nextFilters.mode = opt.mode;
    if (opt.maxDurationMin !== undefined) nextFilters.maxDurationMin = opt.maxDurationMin;
    if (opt.minQuality) nextFilters.minQuality = opt.minQuality;
    if (opt.sortBy) nextFilters.sortBy = opt.sortBy;
    onChangeFilters(nextFilters);

    onPersonalizeTaste?.(opt.targetVector, 0.34, opt.labelEn);
  };

  const handleSubmitAiReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = aiReplyInput.trim();
    if (!text) return;

    const { vector, patch } = parseFreeformReplyToSignal(text);
    const sigId = `reply-${Date.now()}`;
    setAiSignals((prev) => [
      ...prev,
      {
        id: sigId,
        labelEn: text,
        labelFa: text,
        targetVector: vector
      }
    ]);
    onChangeFilters({
      ...filters,
      ...patch
    });
    onPersonalizeTaste?.(vector, 0.4, text);
    setAiReplyInput('');
    setAiStep((s) => s + 1);
  };

  const handleRemoveSignal = (sigId: string) => {
    setAiSignals((prev) => prev.filter((s) => s.id !== sigId));
  };

  const resetAllFilters = () => {
    onChangeFilters({
      query: '',
      mode: 'all',
      excludeTags: [],
      maxDurationMin: null,
      minQuality: 'all',
      unwatchedOnly: false,
      sortBy: 'relevance'
    });
    setAiSignals([]);
    setAiReplyInput('');
    setAiStep(0);
    setAiDismissed(false);
    setAiManualOpen(false);
    setVisibleLimit(4);
  };

  const renderBucket = (
    titleEn: string,
    titleFa: string,
    list: ExplainedRecommendation[],
    maxItems?: number
  ) => {
    if (list.length === 0) return null;
    const shown = maxItems ? list.slice(0, maxItems) : list;
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-[#F5F7FA]">
            {t(titleEn, titleFa)}{' '}
            <span dir="ltr" className="text-xs font-mono-tabular text-[#A3AEC2]">
              ({list.length})
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
          {shown.map((rec) => (
            <MediaCard
              key={`${titleEn}-${rec.item.id}`}
              recommendation={rec}
              lang={lang}
              isFavorite={favoriteIds.has(rec.item.id)}
              downloadRecord={downloadsMap[rec.item.id]}
              progress={progressMap[rec.item.id]}
              feedback={feedbackMap[rec.item.id]}
              onOpenDetail={onOpenDetail}
              onPlay={onPlay}
              onDownload={onDownload}
              onToggleFavorite={onToggleFavorite}
              onFeedback={onFeedback}
              onHide={onHide}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-7 pb-10">
      {/* Redesigned AI Discovery Search Console */}
      <div className="relative overflow-hidden rounded-[26px] sm:rounded-[30px] border border-white/12 bg-gradient-to-b from-[#111626] via-[#0B0E18] to-[#080A12] p-4 sm:p-6 shadow-[0_26px_70px_-24px_rgba(0,0,0,0.9)] space-y-4">
        {/* Ambient radial highlight */}
        <div
          className="pointer-events-none absolute -top-24 start-1/2 -translate-x-1/2 h-48 w-96 rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #F5B942 0%, transparent 70%)' }}
        />

        {/* Header Row */}
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#F5B942]">
              <Wand2 className="h-3.5 w-3.5" />
              <span>{t('Live AI Discovery Companion', 'دستیار هوشمند کاوش زنده')}</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-[#F5F7FA]">
              {t('Describe a Mood, Scene, or Feeling', 'هر حال‌وهوا، صحنه یا حسی را بنویس')}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isAiCardOpen ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                if (isAiCardOpen) {
                  setAiDismissed(true);
                  setAiManualOpen(false);
                } else {
                  setAiDismissed(false);
                  setAiManualOpen(true);
                }
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isAiCardOpen ? t('Hide AI Guide', 'بستن گفت‌وگو') : t('Ask AI Guide', 'پرسش هوشمند')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowTechSpecs((v) => !v)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('Specs', 'دقیق‌تر')}</span>
            </Button>
          </div>
        </div>

        {/* Main Search Input */}
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute start-4 h-4.5 w-4.5 text-[#F5B942]" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => {
              setAiDismissed(false);
              onChangeFilters({ ...filters, query: e.target.value });
            }}
            placeholder={t(
              'Type anything (e.g. rainy midnight, tokyo neon, quiet calm, surreal)...',
              'شروع به تایپ کن (مثلاً: باران، توکیو، آرام، نوار، سورئال)...'
            )}
            className="w-full min-h-[52px] rounded-full border border-white/15 bg-[#06070C]/90 ps-12 pe-14 text-base sm:text-sm text-[#F5F7FA] placeholder:text-[#7A869F] shadow-[inset_0_2px_10px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942]"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => {
                onChangeFilters({ ...filters, query: '' });
              }}
              aria-label="Clear search"
              className="absolute end-3 min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-full text-[#A3AEC2] hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Quick Inspiration Sparks */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap">
          <span className="text-[11px] text-[#A3AEC2] inline-flex items-center gap-1 shrink-0">
            <Compass className="h-3.5 w-3.5 text-[#F5B942]" />
            {t('Try sparking:', 'جرقه سریع:')}
          </span>
          {QUICK_SPARKS.map((sp) => (
            <button
              key={sp.q}
              type="button"
              onClick={() => {
                setAiDismissed(false);
                onChangeFilters({ ...filters, query: sp.q });
              }}
              className={`min-h-[34px] shrink-0 rounded-full border px-3.5 text-xs transition-colors cursor-pointer ${
                filters.query.toLowerCase() === sp.q.toLowerCase()
                  ? 'border-[#F5B942] bg-[#F5B942]/15 text-[#F5B942]'
                  : 'border-white/12 bg-white/[0.04] text-[#D2DAE8] hover:border-[#F5B942]/55 hover:text-[#F5B942]'
              }`}
            >
              {t(sp.en, sp.fa)}
            </button>
          ))}
        </div>

        {/* LIVE ANIMATED AI CLARIFYING PANEL (Opens Smoothly Underneath While Typing!) */}
        <AnimatePresence initial={false}>
          {isAiCardOpen && (
            <motion.div
              key="ai-companion-box"
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-1 rounded-[22px] border border-[#F5B942]/35 bg-[#06070C]/85 p-4 sm:p-5 space-y-4 backdrop-blur-xl shadow-[0_18px_40px_-18px_rgba(245,185,66,0.22)]">
                {/* AI Prompt Header */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5B942]/15 text-[#F5B942] border border-[#F5B942]/40">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-[#38BDF8]">
                        {t(
                          'AI Taste Dialogue · Options personalize live as you interact',
                          'گفت‌وگوی هوشمند سلیقه · گزینه‌ها در لحظه بر اساس انتخاب تو شخصی‌سازی می‌شوند'
                        )}
                      </p>
                      <AnimatePresence mode="wait">
                        <motion.h2
                          key={`${aiStep}-${topicCtx.key}-${filters.query}`}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.16 }}
                          className="text-sm sm:text-base font-semibold text-[#F5F7FA]"
                        >
                          {t(aiPromptData.questionEn, aiPromptData.questionFa)}
                        </motion.h2>
                      </AnimatePresence>
                    </div>
                  </div>

                  {aiSignals.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={resetAllFilters}>
                      <RotateCcw className="h-3.5 w-3.5" />
                      {t('Reset', 'شروع مجدد')}
                    </Button>
                  )}
                </div>

                {/* Selected / Applied Live Personalization Trail */}
                {aiSignals.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-[#34D399]">
                      {t('Active tuning:', 'تنظیمات اعمال‌شده:')}
                    </span>
                    {aiSignals.map((sig) => (
                      <button
                        key={sig.id}
                        type="button"
                        onClick={() => handleRemoveSignal(sig.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#34D399]/35 bg-[#34D399]/10 px-2.5 py-1 text-[11px] text-[#34D399] hover:bg-[#34D399]/20 cursor-pointer"
                      >
                        <Check className="h-3 w-3" />
                        <span>{t(sig.labelEn, sig.labelFa)}</span>
                        <X className="h-3 w-3 opacity-75" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Dynamic Personalized Clickable Option Cards (Re-ranked in Real Time!) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {aiPromptData.rankedOptions.map(({ opt, affinityPct, isTypedCustom }) => (
                    <motion.button
                      key={opt.id}
                      layout
                      type="button"
                      onClick={() => handleSelectAiOption(opt)}
                      whileHover={{ y: -1 }}
                      whileTap={{ y: 1 }}
                      transition={{ duration: 0.16 }}
                      className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 text-start transition-colors cursor-pointer ${
                        isTypedCustom
                          ? 'border-[#F5B942] bg-[#F5B942]/12 text-[#F5F7FA]'
                          : 'border-white/12 bg-[#0D101A]/90 text-[#F5F7FA] hover:border-[#F5B942]/60 hover:bg-[#131828]'
                      }`}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs sm:text-sm font-semibold truncate">
                          {t(opt.labelEn, opt.labelFa)}
                        </p>
                        <p className="text-[11px] text-[#A3AEC2] truncate">
                          {t(opt.subEn, opt.subFa)}
                        </p>
                      </div>
                      <span
                        dir="ltr"
                        className="shrink-0 rounded-full border border-[#F5B942]/35 bg-[#F5B942]/10 px-2.5 py-1 text-[11px] font-mono-tabular text-[#F5B942]"
                      >
                        {affinityPct}%
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Inline Answer / Custom Mood Typing Bar inside AI Box */}
                <form onSubmit={handleSubmitAiReply} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={aiReplyInput}
                    onChange={(e) => setAiReplyInput(e.target.value)}
                    placeholder={t(
                      'Or type your answer / mood here to personalize options live...',
                      'یا خودت جواب بده و بنویس چه سبکی می‌خواهی تا گزینه‌ها در لحظه شخصی‌سازی شوند...'
                    )}
                    className="flex-1 min-h-[44px] rounded-full border border-white/15 bg-[#0D101A] px-4 text-base sm:text-xs text-[#F5F7FA] placeholder:text-[#7A869F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942]"
                  />
                  <Button type="submit" size="sm" disabled={!aiReplyInput.trim()}>
                    <Send className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t('Personalize', 'شخصی‌سازی')}</span>
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Optional Collapsible Precision Specs Drawer */}
        <AnimatePresence initial={false}>
          {showTechSpecs && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <select
                  value={filters.maxDurationMin ?? ''}
                  onChange={(e) =>
                    onChangeFilters({
                      ...filters,
                      maxDurationMin: e.target.value ? Number(e.target.value) : null
                    })
                  }
                  className="min-h-[42px] rounded-2xl border border-white/12 bg-[#06070C] px-3 text-base sm:text-xs text-[#F5F7FA]"
                >
                  <option value="">{t('Any Duration', 'همه مدت‌ها')}</option>
                  <option value="7">{t('Under 7 min', 'زیر ۷ دقیقه')}</option>
                  <option value="10">{t('Under 10 min', 'زیر ۱۰ دقیقه')}</option>
                  <option value="15">{t('Under 15 min', 'زیر ۱۵ دقیقه')}</option>
                </select>

                <select
                  value={filters.minQuality}
                  onChange={(e) =>
                    onChangeFilters({
                      ...filters,
                      minQuality: e.target.value as SearchFilterState['minQuality']
                    })
                  }
                  className="min-h-[42px] rounded-2xl border border-white/12 bg-[#06070C] px-3 text-base sm:text-xs text-[#F5F7FA]"
                >
                  <option value="all">{t('All Resolutions', 'همه کیفیت‌ها')}</option>
                  <option value="4K">4K HDR / 60FPS</option>
                  <option value="1080p">1080p+</option>
                </select>

                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    onChangeFilters({
                      ...filters,
                      sortBy: e.target.value as SearchFilterState['sortBy']
                    })
                  }
                  className="min-h-[42px] rounded-2xl border border-white/12 bg-[#06070C] px-3 text-base sm:text-xs text-[#F5F7FA]"
                >
                  <option value="relevance">{t('Best Match', 'بیشترین تطابق')}</option>
                  <option value="recent">{t('Most Recent', 'جدیدترین')}</option>
                  <option value="duration_asc">{t('Shortest First', 'کوتاه‌ترین')}</option>
                </select>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onChangeFilters({ ...filters, unwatchedOnly: !filters.unwatchedOnly })
                    }
                    className={`flex-1 min-h-[42px] rounded-2xl border px-3 text-xs cursor-pointer transition-colors ${
                      filters.unwatchedOnly
                        ? 'border-[#F5B942] bg-[#F5B942]/15 text-[#F5B942]'
                        : 'border-white/12 bg-[#06070C] text-[#A3AEC2]'
                    }`}
                  >
                    {t('Unwatched Only', 'فقط دیده‌نشده‌ها')}
                  </button>
                  <Button variant="ghost" size="sm" onClick={resetAllFilters}>
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-[#A3AEC2]">{t('Exclude:', 'حذف از نتایج:')}</span>
                  {EXCLUDABLE_TAGS.map((tagItem) => {
                    const active = filters.excludeTags.includes(tagItem.tag);
                    return (
                      <button
                        key={tagItem.tag}
                        type="button"
                        onClick={() =>
                          onChangeFilters({
                            ...filters,
                            excludeTags: active
                              ? filters.excludeTags.filter((x) => x !== tagItem.tag)
                              : [...filters.excludeTags, tagItem.tag]
                          })
                        }
                        className={`min-h-[34px] rounded-full px-3 text-xs cursor-pointer border transition-colors ${
                          active
                            ? 'border-[#EF4444]/50 bg-[#EF4444]/15 text-[#FCA5A5]'
                            : 'border-white/12 bg-[#06070C] text-[#A3AEC2]'
                        }`}
                      >
                        {t(tagItem.en, tagItem.fa)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live Results Showcase */}
      {grouped.totalCount === 0 ? (
        <div className="rounded-[28px] border border-white/12 bg-[#0D101A] p-8 text-center space-y-4">
          <h2 className="text-lg font-semibold text-[#F5F7FA]">
            {t('No exact match for these strict constraints', 'موردی دقیقاً با این ترکیب پیدا نشد')}
          </h2>
          <p className="text-sm text-[#A3AEC2]">
            {t('Suggested filter relaxations:', 'پیشنهادهای اصلاح جست‌وجو:')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {grouped.suggestedRelaxationsEn.map((sugEn, idx) => (
              <span
                key={idx}
                className="rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1.5 text-xs text-[#D2DAE8]"
              >
                {t(sugEn, grouped.suggestedRelaxationsFa[idx])}
              </span>
            ))}
          </div>
          <Button onClick={resetAllFilters}>
            <RotateCcw className="h-4 w-4" />
            {t('Reset Search & Personalization', 'پاک‌کردن محدودیت‌ها و شروع مجدد')}
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {renderBucket('Best Matches', 'بهترین نتایج', grouped.bestMatches, visibleLimit)}

          {grouped.bestMatches.length > visibleLimit && (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={() => setVisibleLimit((v) => v + 6)}>
                {t('Load More Results', 'نمایش نتایج بیشتر')}
              </Button>
            </div>
          )}

          {renderBucket(
            'Most Relevant to Your Taste',
            'مرتبط با سلیقه لحظه‌ای شما',
            grouped.preferenceRelevant
          )}
          {renderBucket('Recently Added', 'تازه اضافه‌شده', grouped.recentlyAdded)}
          {renderBucket('Similar Content', 'محتوای مشابه', grouped.similarContent)}
          {renderBucket('New Discoveries', 'کشف‌های تازه', grouped.newDiscoveries)}
        </div>
      )}
    </div>
  );
}
