# VELORA Video Engine - Owner Administration Guide

## 1. Accessing the Owner Panel
1. In the top navigation bar of the application, locate the **Lock icon** (`Lock` symbol next to the Settings gear).
2. Click the icon to open the **VELORA Owner Control Center**.
3. Enter the master owner password (default: `velora-owner-master-2026` or configured via `process.env.VELORA_OWNER_PASSWORD`).
4. Upon successful server verification, an authorized bearer session token is issued and stored in browser memory.

## 2. Managing Source Websites
1. Navigate to the **Source Websites** tab.
2. Enter the source/studio name (e.g., *Official Studio 4K*), optional homepage URL, and administrative notes.
3. Click **Save Source Website**. Sources can be disabled or deleted at any time.

## 3. Bulk Ingesting Video URLs
1. Navigate to the **Bulk URL Input** tab.
2. Select the assigned source and category.
3. Paste video URLs into the large text area (one URL per line).
4. Select default playback type (*Authorized Iframe Embed* or *Direct Stream URL*).
5. Click **Process & Ingest URLs**. Duplicate detection runs against the local catalog only. No network calls are made during parsing.

## 4. Approving and Publishing Videos
1. Videos are ingested in `draft` or `pending_review` status.
2. Navigate to **Video Catalog** or **Approval Queue**.
3. Click the **Eye icon** or **Approve & Publish** button to make entries publicly visible.
4. Entries can be unpublished or permanently removed with zero public submission access.
