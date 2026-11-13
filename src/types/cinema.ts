export type PosterKey =
  | 'rain_detective'
  | 'neon_tokyo'
  | 'surreal_labyrinth'
  | 'parisian_shadow'
  | 'alpine_mystery'
  | 'cyber_memory'
  | 'crimson_motel'
  | 'amber_hotel'
  | 'quantum_oasis'
  | 'solaris_mirage'
  | 'obsidian_sonata'
  | 'midnight_paris'
  | 'velvet_rain'
  | 'crimson_penthouse';

export type SortStrategy =
  | 'ai_taste'
  | 'world_tour'
  | 'hidden_gems'
  | 'escalating_tension';

export type AppLang = 'fa' | 'en';

export interface MoodVector {
  tension: number; // 0 to 100
  pace: number; // 0 (hypnotic/slow) to 100 (kinetic/relentless)
  atmosphere: number; // 0 (cold/minimalist) to 100 (warm/surreal amber)
}

export interface AutocompleteSuggestion {
  text: string;
  category: 'Mood' | 'Director' | 'Title' | 'Twist' | 'World';
  hint: string;
  queryValue?: string;
}

export interface FilmRecommendation {
  id: string;
  title: string;
  year: number;
  director: string;
  country: string;
  language: string;
  runtimeMin: number;
  vibeTag: string;
  matchScore: number; // 82 - 99
  synopsis: string;
  aiReasoning: string;
  aiOrderReason: string;
  streamingOn: string[];
  similarFilms: string[];
  posterKey: PosterKey;
  ambientTone: 'amber' | 'cyan' | 'crimson' | 'slate';
  waveNumber?: number;
}

export interface DiscoveryResponse {
  query: string;
  interpretedVibe: string;
  aiOrderSummary: string;
  sortStrategy: SortStrategy;
  waveNumber: number;
  hasMore: boolean;
  lightingMood: 'amber' | 'cyan' | 'crimson' | 'slate';
  subRefinements: string[];
  suggestedPrompts: AutocompleteSuggestion[];
  films: FilmRecommendation[];
  aiPowered: boolean;
}

export interface TasteInteraction {
  id: string;
  title: string;
  director: string;
  year: number;
  runtimeMin: number;
  vibeTag: string;
  ambientTone: 'amber' | 'cyan' | 'crimson' | 'slate';
  posterKey: PosterKey;
  action: 'viewed' | 'saved' | 'refined';
  timestamp: number;
}

export interface CinemaDnaProfile {
  archetypeTitle: string;
  signatureVibe: string;
  tagline: string;
  topTraits: string[];
  directorAffinity: string;
  avgRuntimeMin: number;
  filmsAnalyzed: number;
  accentHex: string;
  secondaryHex: string;
}
