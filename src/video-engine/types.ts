/**
 * VELORA OWNER-CONTROLLED VIDEO CATALOG ENGINE
 * Data Model Types & Schemas
 *
 * Strict Architectural Rule:
 * ZERO external discovery, ZERO autonomous scraping, ZERO external URL inspection.
 * Every record is manually curated, reviewed, and published by the owner.
 */

export type ContentStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published' | 'archived';
export type PlaybackType = 'direct_video' | 'authorized_embed' | 'source_link_only';
export type SourceStatus = 'active' | 'disabled';

export interface SourceRecord {
  id: string;
  source_name: string;
  homepage_url: string;
  source_status: SourceStatus;
  administrative_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VideoRecord {
  id: string;
  source_id?: string;
  source_name?: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  original_video_url: string;
  authorized_embed_url?: string;
  playback_type: PlaybackType;
  category_id: string;
  tags: string[];
  duration?: string;
  language?: string;
  content_status: ContentStatus;
  approval_status: 'pending' | 'approved' | 'rejected';
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  name_fa?: string;
  description?: string;
}

export interface VideoCatalogDatabase {
  version: number;
  sources: SourceRecord[];
  videos: VideoRecord[];
  categories: CategoryRecord[];
  adminSessionTokens: string[];
}
