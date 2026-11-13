import type {
  ExplainedRecommendation,
  FeedbackRecord,
  GroupedSearchResults,
  LanguageCode,
  PrototypeMediaItem,
  SearchFilterState,
  TasteVector6D,
  WatchProgressEntry
} from './types';

/**
 * 100% INTERNAL, SELF-CONTAINED TASTE & SEARCH ENGINE (Zero External LLM Dependency)
 * Combines 6D Cosine Similarity, Bilingual Token Matching, Feedback Weighting,
 * Cold-Start Calibration, MMR Diversity Control, and Human-Readable Explanations.
 */

const SYNONYM_MAP: Record<string, string[]> = {
  باران: ['rain', 'بارانی', 'باران', 'wet', 'rainy'],
  rain: ['rain', 'بارانی', 'باران', 'wet'],
  نوار: ['noir', 'shadow', 'سایه', 'detective', 'پاریس'],
  noir: ['noir', 'نوار', 'detective', 'shadow'],
  توکیو: ['tokyo', 'توکیو', 'neon', 'نئون', 'urban'],
  tokyo: ['tokyo', 'توکیو', 'neon'],
  نئون: ['neon', 'نئون', 'cyber', 'سایبری', 'tokyo'],
  neon: ['neon', 'نئون', 'cyber'],
  انیمیشن: ['animation', 'انیمیشن', 'anime', 'انیمه'],
  animation: ['animation', 'انیمیشن', 'anime'],
  آرام: ['slow-burn', 'calm', 'آرام', 'آهسته', 'ambient', 'ملایم', 'asmr'],
  slow: ['slow-burn', 'آهسته', 'آرام', 'calm'],
  سورئال: ['surreal', 'سورئال', 'dream', 'رؤیا', 'ai-art'],
  surreal: ['surreal', 'سورئال', 'dream', 'abstract'],
  موسیقی: ['music', 'موسیقی', 'sonata', 'سونات', 'binaural', 'asmr', 'صدا'],
  music: ['music', 'موسیقی', 'sonata', 'binaural'],
  تنش: ['tension', 'تنش', 'paranoia', 'mystery', 'معمایی'],
  tension: ['tension', 'تنش', 'mystery', 'paranoia'],
  صمیمی: ['intimate', 'صمیمی', 'hotel', 'velvet', 'مخملی', 'حسی'],
  intimate: ['intimate', 'صمیمی', 'velvet', 'hotel']
};

export const DEFAULT_TASTE_VECTOR: TasteVector6D = {
  tension: 0.65,
  pace: 0.42,
  surrealism: 0.58,
  nocturnal: 0.82,
  intimacy: 0.66,
  depth: 0.78
};

export function cosineSimilarity6D(a: TasteVector6D, b: TasteVector6D): number {
  const keys: (keyof TasteVector6D)[] = [
    'tension',
    'pace',
    'surrealism',
    'nocturnal',
    'intimacy',
    'depth'
  ];
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const k of keys) {
    dot += a[k] * b[k];
    normA += a[k] * a[k];
    normB += b[k] * b[k];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0.5 : Math.max(0, Math.min(1, dot / denom));
}

export function blendVector(
  current: TasteVector6D,
  target: TasteVector6D,
  alpha: number
): TasteVector6D {
  const clamp = (v: number) => Number(Math.max(0.05, Math.min(0.99, v)).toFixed(2));
  const step = (c: number, t: number) => clamp(c + (t - c) * alpha);
  return {
    tension: step(current.tension, target.tension),
    pace: step(current.pace, target.pace),
    surrealism: step(current.surrealism, target.surrealism),
    nocturnal: step(current.nocturnal, target.nocturnal),
    intimacy: step(current.intimacy, target.intimacy),
    depth: step(current.depth, target.depth)
  };
}

export function calibrateColdStartVector(selectedPresets: string[]): TasteVector6D {
  let vec = { ...DEFAULT_TASTE_VECTOR };
  if (selectedPresets.includes('noir')) {
    vec = blendVector(vec, { tension: 0.88, pace: 0.35, surrealism: 0.42, nocturnal: 0.95, intimacy: 0.55, depth: 0.92 }, 0.6);
  }
  if (selectedPresets.includes('velvet')) {
    vec = blendVector(vec, { tension: 0.55, pace: 0.28, surrealism: 0.45, nocturnal: 0.88, intimacy: 0.95, depth: 0.82 }, 0.6);
  }
  if (selectedPresets.includes('neon')) {
    vec = blendVector(vec, { tension: 0.8, pace: 0.85, surrealism: 0.72, nocturnal: 0.92, intimacy: 0.45, depth: 0.79 }, 0.6);
  }
  if (selectedPresets.includes('surreal')) {
    vec = blendVector(vec, { tension: 0.36, pace: 0.32, surrealism: 0.96, nocturnal: 0.68, intimacy: 0.52, depth: 0.91 }, 0.6);
  }
  if (selectedPresets.includes('sound')) {
    vec = blendVector(vec, { tension: 0.28, pace: 0.2, surrealism: 0.55, nocturnal: 0.86, intimacy: 0.74, depth: 0.82 }, 0.6);
  }
  return vec;
}

function expandTokens(rawQuery: string): string[] {
  const words = rawQuery
    .toLowerCase()
    .trim()
    .split(/[\s,،.؛]+/)
    .filter((w) => w.length >= 2);
  const expanded = new Set<string>(words);
  for (const w of words) {
    const mapped = SYNONYM_MAP[w];
    if (mapped) {
      mapped.forEach((m) => expanded.add(m));
    }
  }
  return Array.from(expanded);
}

function buildMatchExplanation(
  item: PrototypeMediaItem,
  userVector: TasteVector6D,
  personalizationEnabled: boolean,
  matchedTokens: string[],
  lang: LanguageCode
): { fa: string; en: string } {
  if (matchedTokens.length > 0) {
    return {
      fa: `تطابق مستقیم با «${matchedTokens.slice(0, 2).join('، ')}» در فراداده و ساختار ${item.categoryFa}`,
      en: `Direct metadata match on "${matchedTokens.slice(0, 2).join(', ')}" within ${item.categoryEn}`
    };
  }
  if (!personalizationEnabled) {
    return {
      fa: `پیشنهاد عمومی بر اساس کیفیت ${item.quality} و خوشه ${item.clusterLabelFa} (شخصی‌سازی خاموش است)`,
      en: `Non-personalized editorial selection in ${item.clusterLabelEn} (${item.quality})`
    };
  }

  const traitsFa: string[] = [];
  const traitsEn: string[] = [];
  if (item.vector.nocturnal >= 0.82 && userVector.nocturnal >= 0.7) {
    traitsFa.push('فضای شبانه');
    traitsEn.push('nocturnal tone');
  }
  if (item.vector.pace <= 0.4 && userVector.pace <= 0.48) {
    traitsFa.push('ریتم آرام');
    traitsEn.push('unhurried pace');
  } else if (item.vector.pace >= 0.7 && userVector.pace >= 0.6) {
    traitsFa.push('ریتم پرانرژی');
    traitsEn.push('kinetic pace');
  }
  if (item.vector.surrealism >= 0.75 && userVector.surrealism >= 0.6) {
    traitsFa.push('معماری سورئال');
    traitsEn.push('surreal visual language');
  }
  if (item.vector.intimacy >= 0.78 && userVector.intimacy >= 0.65) {
    traitsFa.push('حس صمیمی');
    traitsEn.push('intimate framing');
  }
  if (item.vector.tension >= 0.78 && userVector.tension >= 0.65) {
    traitsFa.push('تنش معمایی');
    traitsEn.push('mystery tension');
  }

  if (traitsFa.length === 0) {
    return {
      fa: `هم‌راستا با خوشه ${item.clusterLabelFa} و عمق روایی مورد علاقه شما`,
      en: `Aligned with your ${item.clusterLabelEn} cluster affinity`
    };
  }

  return {
    fa: `پیشنهادشده به دلیل علاقه شما به ${traitsFa.slice(0, 2).join(' و ')}`,
    en: `Recommended for your affinity toward ${traitsEn.slice(0, 2).join(' and ')}`
  };
}

export function isItemAllowed(
  item: PrototypeMediaItem,
  hiddenIds: Set<string>,
  blockedTopics: string[]
): boolean {
  if (item.availabilityStatus !== 'available') return false;
  if (hiddenIds.has(item.id)) return false;
  if (blockedTopics.length > 0) {
    const allItemTags = [
      ...item.tags,
      ...item.tagsFa,
      item.categoryFa,
      item.categoryEn,
      item.clusterLabelFa,
      item.clusterLabelEn
    ]
      .join(' ')
      .toLowerCase();
    for (const blocked of blockedTopics) {
      if (blocked.trim() && allItemTags.includes(blocked.trim().toLowerCase())) {
        return false;
      }
    }
  }
  return true;
}

export function computeLivingHomepage(params: {
  catalog: PrototypeMediaItem[];
  userVector: TasteVector6D;
  personalizationEnabled: boolean;
  progressMap: Record<string, WatchProgressEntry>;
  favoriteIds: Set<string>;
  hiddenIds: Set<string>;
  blockedTopics: string[];
  feedbackMap: Record<string, FeedbackRecord>;
  lang: LanguageCode;
}): {
  heroPick: ExplainedRecommendation | null;
  continueWatching: Array<{ item: PrototypeMediaItem; progress: WatchProgressEntry }>;
  recommendedForYou: ExplainedRecommendation[];
  newDiscoveries: ExplainedRecommendation[];
  hiddenGems: ExplainedRecommendation[];
  recentlyAdded: ExplainedRecommendation[];
  exploreDifferent: ExplainedRecommendation[];
} {
  const {
    catalog,
    userVector,
    personalizationEnabled,
    progressMap,
    hiddenIds,
    blockedTopics,
    feedbackMap,
    lang
  } = params;

  const eligible = catalog.filter((item) => isItemAllowed(item, hiddenIds, blockedTopics));

  const continueWatching = Object.values(progressMap)
    .filter((p) => !p.completed && p.positionSec > 5)
    .sort((a, b) => b.lastWatchedAt.localeCompare(a.lastWatchedAt))
    .map((p) => {
      const item = eligible.find((c) => c.id === p.contentId);
      return item ? { item, progress: p } : null;
    })
    .filter((x): x is { item: PrototypeMediaItem; progress: WatchProgressEntry } => x !== null);

  // Score every eligible item with internal hybrid rules + diversity damping
  const clusterSeenCount: Record<string, number> = {};
  const scored = eligible.map((item) => {
    let baseSim = personalizationEnabled ? cosineSimilarity6D(userVector, item.vector) : 0.74;
    const fb = feedbackMap[item.id];
    if (fb?.sentiment === 'like') baseSim += 0.12;
    if (fb?.sentiment === 'dislike' || fb?.sentiment === 'less_like_this') baseSim -= 0.45;
    if (progressMap[item.id]?.completed) baseSim -= 0.14; // reduce repetition of completed items

    const scorePct = Math.max(55, Math.min(99, Math.round(baseSim * 100)));
    const exp = buildMatchExplanation(item, userVector, personalizationEnabled, [], lang);
    return {
      item,
      score: scorePct,
      reasonFa: exp.fa,
      reasonEn: exp.en
    };
  });

  scored.sort((a, b) => b.score - a.score);

  // Apply gentle cluster diversity for main recommendations so homepage doesn't clone one cluster
  const diversified: ExplainedRecommendation[] = [];
  for (const rec of scored) {
    const count = clusterSeenCount[rec.item.clusterId] || 0;
    if (count < 2 || diversified.length >= 6) {
      diversified.push(rec);
      clusterSeenCount[rec.item.clusterId] = count + 1;
    }
  }

  const heroPick = diversified[0] ?? null;
  const recommendedForYou = diversified.slice(1, 7);

  const recentlyAdded = [...eligible]
    .sort((a, b) => a.addedDaysAgo - b.addedDaysAgo)
    .slice(0, 4)
    .map((item) => ({
      item,
      score: scored.find((s) => s.item.id === item.id)?.score ?? 82,
      reasonFa: item.addedDaysAgo === 0 ? 'اضافه‌شده در ۲۴ ساعت اخیر' : `${item.addedDaysAgo} روز پیش اضافه شده`,
      reasonEn: item.addedDaysAgo === 0 ? 'Added within the last 24h' : `Added ${item.addedDaysAgo}d ago`
    }));

  const newDiscoveries = scored
    .filter((s) => !progressMap[s.item.id] && s.item.id !== heroPick?.item.id)
    .slice(0, 4);

  const hiddenGems = [...eligible]
    .filter((item) => item.vector.depth >= 0.82 && item.id !== heroPick?.item.id)
    .sort((a, b) => b.vector.depth - a.vector.depth)
    .slice(0, 4)
    .map((item) => ({
      item,
      score: scored.find((s) => s.item.id === item.id)?.score ?? 88,
      reasonFa: 'انتخاب عمقی از آثار کمتر دیده‌شده با امتیاز ساختار بالا',
      reasonEn: 'High-depth selection outside mainstream feeds'
    }));

  // Explore something genuinely different (lowest cosine similarity while still high quality)
  const exploreDifferent = [...scored]
    .filter((s) => s.item.id !== heroPick?.item.id)
    .sort((a, b) => a.score - b.score)
    .slice(0, 4)
    .map((s) => ({
      ...s,
      reasonFa: 'پنجره کشف متفاوت: فضایی خارج از عادت معمول تماشای شما',
      reasonEn: 'Explore outside your usual cluster for fresh perspective'
    }));

  return {
    heroPick,
    continueWatching,
    recommendedForYou,
    newDiscoveries,
    hiddenGems,
    recentlyAdded,
    exploreDifferent
  };
}

export function runIntelligentSearch(params: {
  catalog: PrototypeMediaItem[];
  filters: SearchFilterState;
  userVector: TasteVector6D;
  personalizationEnabled: boolean;
  progressMap: Record<string, WatchProgressEntry>;
  hiddenIds: Set<string>;
  blockedTopics: string[];
  feedbackMap: Record<string, FeedbackRecord>;
  lang: LanguageCode;
}): GroupedSearchResults {
  const {
    catalog,
    filters,
    userVector,
    personalizationEnabled,
    progressMap,
    hiddenIds,
    blockedTopics,
    feedbackMap,
    lang
  } = params;

  const combinedBlocked = [...blockedTopics, ...filters.excludeTags];
  const tokens = expandTokens(filters.query);

  // Deduplicate by normalized title before ranking
  const seenTitles = new Set<string>();
  const uniqueCatalog = catalog.filter((item) => {
    const key = item.titleEn.trim().toLowerCase();
    if (seenTitles.has(key)) return false;
    seenTitles.add(key);
    return isItemAllowed(item, hiddenIds, combinedBlocked);
  });

  const filtered = uniqueCatalog.filter((item) => {
    if (filters.maxDurationMin !== null && item.durationSec > filters.maxDurationMin * 60) {
      return false;
    }
    if (filters.minQuality === '4K' && !item.quality.startsWith('4K')) {
      return false;
    }
    if (filters.unwatchedOnly && progressMap[item.id]?.completed) {
      return false;
    }
    return true;
  });

  const evaluated: ExplainedRecommendation[] = [];

  for (const item of filtered) {
    const searchable = [
      item.titleFa,
      item.titleEn,
      item.categoryFa,
      item.categoryEn,
      item.clusterLabelFa,
      item.clusterLabelEn,
      item.synopsisFa,
      item.synopsisEn,
      item.creatorFa || '',
      item.creatorEn || '',
      ...item.tags,
      ...item.tagsFa
    ]
      .join(' ')
      .toLowerCase();

    const matchedTokens = tokens.filter((t) => searchable.includes(t));

    // When a text query is present, require at least one matched token unless mode is 'different'
    if (tokens.length > 0 && matchedTokens.length === 0 && filters.mode !== 'different') {
      continue;
    }

    let vecScore = personalizationEnabled ? cosineSimilarity6D(userVector, item.vector) : 0.72;
    if (filters.mode === 'different') {
      vecScore = 1 - vecScore + 0.35; // Invert preference gravity for exploration
    } else if (filters.mode === 'similar') {
      vecScore = vecScore * 1.15;
    }

    const tokenBoost = tokens.length > 0 ? (matchedTokens.length / tokens.length) * 0.45 : 0.15;
    const fb = feedbackMap[item.id];
    const fbPenalty = fb?.sentiment === 'dislike' || fb?.sentiment === 'less_like_this' ? -0.35 : fb?.sentiment === 'like' ? 0.1 : 0;

    const finalScore = Math.max(52, Math.min(99, Math.round((vecScore * 0.62 + tokenBoost + fbPenalty) * 100)));
    const exp = buildMatchExplanation(item, userVector, personalizationEnabled, matchedTokens, lang);

    evaluated.push({
      item,
      score: finalScore,
      reasonFa: exp.fa,
      reasonEn: exp.en
    });
  }

  if (filters.sortBy === 'recent') {
    evaluated.sort((a, b) => a.item.addedDaysAgo - b.item.addedDaysAgo || b.score - a.score);
  } else if (filters.sortBy === 'duration_asc') {
    evaluated.sort((a, b) => a.item.durationSec - b.item.durationSec);
  } else {
    evaluated.sort((a, b) => b.score - a.score);
  }

  const bestMatches = evaluated.slice(0, 6);
  const preferenceRelevant = [...evaluated]
    .sort((a, b) => cosineSimilarity6D(userVector, b.item.vector) - cosineSimilarity6D(userVector, a.item.vector))
    .slice(0, 4);
  const recentlyAdded = [...evaluated]
    .sort((a, b) => a.item.addedDaysAgo - b.item.addedDaysAgo)
    .slice(0, 4);
  const anchorCluster = bestMatches[0]?.item.clusterId;
  const similarContent = evaluated
    .filter((e) => (anchorCluster ? e.item.clusterId === anchorCluster : true))
    .slice(0, 4);
  const newDiscoveries = evaluated
    .filter((e) => !progressMap[e.item.id])
    .slice(0, 4);

  const suggestedRelaxationsFa: string[] = [];
  const suggestedRelaxationsEn: string[] = [];
  if (evaluated.length === 0) {
    if (filters.maxDurationMin !== null) {
      suggestedRelaxationsFa.push('حذف محدودیت مدت زمان');
      suggestedRelaxationsEn.push('Remove duration limit');
    }
    if (filters.minQuality !== 'all') {
      suggestedRelaxationsFa.push('نمایش همه کیفیت‌ها (شامل 1080p)');
      suggestedRelaxationsEn.push('Allow all resolutions (incl. 1080p)');
    }
    if (filters.excludeTags.length > 0 || blockedTopics.length > 0) {
      suggestedRelaxationsFa.push('بازبینی موضوعات مسدودشده');
      suggestedRelaxationsEn.push('Review excluded topics');
    }
    if (filters.query.trim().length > 0) {
      suggestedRelaxationsFa.push('جست‌وجو با کلیدواژه کلی‌تر (مثل «باران»، «نوار»، «انیمیشن»)');
      suggestedRelaxationsEn.push('Try broader terms (e.g. "noir", "rain", "animation")');
    }
  }

  return {
    bestMatches,
    preferenceRelevant,
    recentlyAdded,
    similarContent,
    newDiscoveries,
    totalCount: evaluated.length,
    suggestedRelaxationsFa,
    suggestedRelaxationsEn
  };
}
