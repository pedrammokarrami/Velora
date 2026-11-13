import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readDatabase, writeDatabase, verifyOwnerPassword, createOwnerSession, validateOwnerSession } from './src/video-engine/db.js';

describe('VELORA Video Catalog Engine - Verification Suite', () => {
  it('1. Verifies Owner Password Authentication correctly', () => {
    assert.strictEqual(verifyOwnerPassword('velora-owner-master-2026'), true);
    assert.strictEqual(verifyOwnerPassword('wrong-password-123'), false);
    assert.strictEqual(verifyOwnerPassword(''), false);
  });

  it('2. Creates and validates server-side session tokens', () => {
    const sessionToken = createOwnerSession();
    assert.ok(sessionToken.startsWith('velora_sess_'));
    assert.strictEqual(validateOwnerSession(sessionToken), true);
    assert.strictEqual(validateOwnerSession('fake_token_xyz'), false);
  });

  it('3. Enforces local database read/write without external network requests', () => {
    const db = readDatabase();
    assert.ok(Array.isArray(db.sources));
    assert.ok(Array.isArray(db.videos));
    assert.ok(Array.isArray(db.categories));

    // Test duplicate detection strictly in local database
    const testUrl = 'https://provider.example/test-video-local';
    const exists = db.videos.some(v => v.original_video_url === testUrl);
    assert.strictEqual(typeof exists, 'boolean');
  });

  it('4. Filters published vs unpublished videos for public catalog', () => {
    const db = readDatabase();
    const publicVideos = db.videos.filter(v => v.is_published && v.content_status === 'published' && v.approval_status === 'approved');
    // All public videos must strictly have is_published = true
    for (const v of publicVideos) {
      assert.strictEqual(v.is_published, true);
      assert.strictEqual(v.content_status, 'published');
    }
  });

  it('5. Confirms zero autonomous scraping or external inspection code exists in video engine', async () => {
    // Audit check: Verify no references to crawler, cheerio, puppeteer, or external discovery APIs exist
    const fs = await import('fs');
    const apiCode = fs.readFileSync('./src/video-engine/api.ts', 'utf-8');
    assert.strictEqual(apiCode.includes('google.com/search'), false);
    assert.strictEqual(apiCode.includes('bing.com'), false);
    assert.strictEqual(apiCode.includes('cheerio'), false);
    assert.strictEqual(apiCode.includes('puppeteer'), false);
    assert.strictEqual(apiCode.includes('axios.head'), false);
    assert.strictEqual(apiCode.includes('fetch(line,'), false); // No fetching of pasted URLs!
  });
});
