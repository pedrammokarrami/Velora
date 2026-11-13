import type {
  AppLang,
  AutocompleteSuggestion,
  CinemaDnaProfile,
  DiscoveryResponse,
  FilmRecommendation,
  MoodVector,
  SortStrategy,
  TasteInteraction
} from '../types/cinema';

const STORAGE_KEY = 'aether_noir_taste_profile_v1';

export function loadTasteInteractions(): TasteInteraction[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordTasteInteraction(
  film: FilmRecommendation,
  action: TasteInteraction['action']
): TasteInteraction[] {
  const existing = loadTasteInteractions();
  const filtered = existing.filter((item) => item.id !== film.id);
  const next: TasteInteraction[] = [
    {
      id: film.id,
      title: film.title,
      director: film.director,
      year: film.year,
      runtimeMin: film.runtimeMin,
      vibeTag: film.vibeTag,
      ambientTone: film.ambientTone,
      posterKey: film.posterKey,
      action,
      timestamp: Date.now()
    },
    ...filtered
  ].slice(0, 60);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage quota restrictions
  }
  return next;
}

export function clearTasteInteractions(): TasteInteraction[] {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return [];
}

export async function fetchAutocompleteSuggestions(
  params: {
    query: string;
    moodParams: MoodVector;
    interactions?: TasteInteraction[];
    wave?: number;
    lang?: AppLang;
  },
  signal?: AbortSignal
): Promise<{ suggestions: AutocompleteSuggestion[]; aiPowered: boolean }> {
  const res = await fetch('/api/ai/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    signal
  });
  if (!res.ok) {
    throw new Error('Autocomplete request failed');
  }
  return res.json();
}

export async function fetchSemanticDiscovery(
  params: {
    query: string;
    moodParams: MoodVector;
    refinement?: string;
    excludeTitles?: string[];
    interactions?: TasteInteraction[];
    sortStrategy?: SortStrategy;
    waveNumber?: number;
    lang?: AppLang;
  },
  signal?: AbortSignal
): Promise<DiscoveryResponse> {
  const res = await fetch('/api/ai/discover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    signal
  });
  if (!res.ok) {
    throw new Error('Semantic discovery request failed');
  }
  return res.json();
}

export async function fetchCinemaDna(
  interactions: TasteInteraction[]
): Promise<CinemaDnaProfile> {
  const res = await fetch('/api/ai/dna', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interactions })
  });
  if (!res.ok) {
    throw new Error('Cinema DNA generation failed');
  }
  return res.json();
}
