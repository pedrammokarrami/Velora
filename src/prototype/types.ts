export type LanguageCode = string;

export type PrototypeRoute =
  | 'splash'
  | 'welcome'
  | 'age-gate'
  | 'onboarding'
  | 'universe'
  | 'discover'
  | 'search'
  | 'library'
  | 'settings'
  | 'watch';

export type LibraryTab =
  | 'continue'
  | 'downloads'
  | 'history'
  | 'favorites'
  | 'collections'
  | 'recent'
  | 'hidden'
  | 'lists';

export interface OfflineDownloadRecord {
  contentId: string;
  titleFa: string;
  titleEn: string;
  quality: string;
  fileSizeBytes: number;
  mimeType: string;
  downloadedAt: string;
  status: 'downloading' | 'completed';
  progressPct: number;
}

export type SettingsTab =
  | 'account'
  | 'preferences'
  | 'privacy'
  | 'playback'
  | 'notifications'
  | 'accessibility';

export type UiSimulationState =
  | 'normal'
  | 'loading'
  | 'empty'
  | 'error'
  | 'offline'
  | 'partial_failure'
  | 'no_results'
  | 'slow_network';

export interface TasteVector6D {
  tension: number; // 0..1
  pace: number; // 0..1 (slow hypnotic -> fast kinetic)
  surrealism: number; // 0..1
  nocturnal: number; // 0..1
  intimacy: number; // 0..1
  depth: number; // 0..1
}

export interface SubtitleLine {
  startSec: number;
  endSec: number;
  fa: string;
  en: string;
}

export interface ChapterMarker {
  id: string;
  timeSec: number;
  labelFa: string;
  labelEn: string;
}

export interface PrototypeMediaItem {
  id: string;
  titleFa: string;
  titleEn: string;
  creatorFa?: string;
  creatorEn?: string;
  categoryFa: string;
  categoryEn: string;
  clusterId: 'noir-shadows' | 'velvet-cinema' | 'neon-futures' | 'surreal-art' | 'midnight-sound';
  clusterLabelFa: string;
  clusterLabelEn: string;
  durationSec: number;
  quality: '4K HDR' | '4K 60FPS' | '1080p';
  releaseYear: number;
  addedDaysAgo: number;
  posterUrl: string;
  accentHex: string;
  synopsisFa: string;
  synopsisEn: string;
  tags: string[];
  tagsFa: string[];
  vector: TasteVector6D;
  availabilityStatus: 'available' | 'restricted_region' | 'removed';
  licenseVerified: boolean;
  consentVerified: boolean;
  sourceName: string;
  subtitles: SubtitleLine[];
  chapters: ChapterMarker[];
  spatialPos: { x: number; y: number; z: number };
}

export interface WatchProgressEntry {
  contentId: string;
  positionSec: number;
  durationSec: number;
  completed: boolean;
  lastWatchedAt: string;
}

export interface UserCollection {
  id: string;
  name: string;
  itemIds: string[];
  createdAt: string;
}

export interface FeedbackRecord {
  contentId: string;
  sentiment: 'like' | 'dislike' | 'less_like_this';
  reason?: string;
  updatedAt: string;
}

export interface UserSessionInfo {
  id: string;
  deviceLabel: string;
  locationLabel: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface UserAccountState {
  profileId: string;
  displayName: string;
  ageVerified: boolean;
  jurisdiction: 'global-standard' | 'eu-strict' | 'us-2257' | 'ca-uk-strict';
  consentEssential: boolean;
  consentPersonalization: boolean;
  personalizationEnabled: boolean;
  blockedTopics: string[];
  preferredQuality: 'auto' | '4k' | '1080p' | '720p';
  defaultSubtitleLang: 'fa' | 'en' | 'off';
  defaultSpeed: number;
  reducedMotion: boolean;
  highContrast: boolean;
  liteUniverseMode: boolean;
  notificationsEnabled: boolean;
  digestAlertsEnabled: boolean;
  sessions: UserSessionInfo[];
}

export interface SearchFilterState {
  query: string;
  mode: 'all' | 'similar' | 'different';
  excludeTags: string[];
  maxDurationMin: number | null;
  minQuality: 'all' | '4K' | '1080p';
  unwatchedOnly: boolean;
  sortBy: 'relevance' | 'recent' | 'duration_asc';
}

export interface ExplainedRecommendation {
  item: PrototypeMediaItem;
  score: number; // 0..99
  reasonFa: string;
  reasonEn: string;
}

export interface GroupedSearchResults {
  bestMatches: ExplainedRecommendation[];
  preferenceRelevant: ExplainedRecommendation[];
  recentlyAdded: ExplainedRecommendation[];
  similarContent: ExplainedRecommendation[];
  newDiscoveries: ExplainedRecommendation[];
  totalCount: number;
  suggestedRelaxationsFa: string[];
  suggestedRelaxationsEn: string[];
}
