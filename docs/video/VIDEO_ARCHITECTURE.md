# VELORA Video Catalog Engine - Architecture Specification

## 1. System Overview
VELORA's Video Catalog Engine is an owner-controlled, manually curated video catalog and playback subsystem.
It operates under a strict air-gap design with respect to external discovery:
- ZERO autonomous web discovery or crawlers.
- ZERO server-side URL inspection or HEAD probing.
- ZERO automated metadata/thumbnail scrapers.
- 100% of source websites, video records, and classification are entered and authorized manually by the owner.

## 2. Component Architecture
```
[ Owner Client ] 
       │ (Protected Session Token / SHA-256 Auth)
       ▼
[ /api/velora/admin/* ] 
       │
       ├─► Sources Management (sources)
       ├─► Bulk Video Text Ingestion (videos)
       ├─► Metadata & Review Queue (draft / approved / published)
       └─► Local JSON/Relational Database (data/video/catalog-db.json)
       
[ Public Client ]
       │ (Read-Only)
       ▼
[ /api/velora/public/catalog ]
       │
       └─► Filter: (is_published == true && content_status == 'published')
       └─► Search & Related: LOCAL DATABASE ONLY
```

## 3. Playback Architecture
- **Direct Video Streams**: HTML5 player plays direct `.mp4`, `.webm`, or HLS streams from authorized CDNs.
- **Authorized Embeds**: Sandboxed iframes (`sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"`, `referrerpolicy="strict-origin-when-cross-origin"`).
- **Fallback Mode**: When embedding is prohibited by a provider, users are presented with a direct link to the provider's official authorized page. The backend never extracts private keys, bypasses DRM, or mirrors content.
