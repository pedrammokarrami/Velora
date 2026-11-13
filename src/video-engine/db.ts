import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { VideoCatalogDatabase, VideoRecord, SourceRecord, CategoryRecord } from './types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data/video');
const DB_FILE = path.join(DATA_DIR, 'catalog-db.json');

const DEFAULT_CATEGORIES: CategoryRecord[] = [
  { id: 'cat-featured', name: 'Featured & Editorial', name_fa: 'منتخب سردبیری' },
  { id: 'cat-studio-4k', name: 'Studio 4K Cinema', name_fa: 'سینمای استودیویی ۴K' },
  { id: 'cat-sensual', name: 'Sensual & Romance', name_fa: 'شهوانی و رمانتیک' },
  { id: 'cat-pov', name: 'Intimate POV', name_fa: 'دید اول‌شخص POV' },
  { id: 'cat-asian', name: 'Asian & JAV Cinema', name_fa: 'سینمای آسیا و ژاپن' },
  { id: 'cat-animation', name: 'Adult Animation & Hentai', name_fa: 'انیمیشن بزرگسال و هنتای' },
  { id: 'cat-ai-fantasy', name: 'AI Generated Fantasy', name_fa: 'فانتزی هوش مصنوعی' }
];

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readDatabase(): VideoCatalogDatabase {
  ensureDir();
  if (!fs.existsSync(DB_FILE)) {
    const initial: VideoCatalogDatabase = {
      version: 1,
      sources: [
        {
          id: 'src-default',
          source_name: 'Official Partner Archive',
          homepage_url: 'https://velora.local',
          source_status: 'active',
          administrative_notes: 'Primary approved source registry',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      videos: [],
      categories: DEFAULT_CATEGORIES,
      adminSessionTokens: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.categories || parsed.categories.length === 0) {
      parsed.categories = DEFAULT_CATEGORIES;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to read catalog database:', err);
    return {
      version: 1,
      sources: [],
      videos: [],
      categories: DEFAULT_CATEGORIES,
      adminSessionTokens: []
    };
  }
}

export function writeDatabase(db: VideoCatalogDatabase): void {
  ensureDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

/**
 * Owner-only authentication helper
 * Password stored securely or verified via SHA256 hashed secret
 */
const OWNER_PASSWORD_HASH = process.env.VELORA_OWNER_HASH || 
  // Default master salt/hash for initial deployment; owner can override with VELORA_OWNER_PASSWORD
  crypto.createHash('sha256').update(process.env.VELORA_OWNER_PASSWORD || 'velora-owner-master-2026').digest('hex');

export function verifyOwnerPassword(passwordAttempt: string): boolean {
  if (!passwordAttempt) return false;
  const hash = crypto.createHash('sha256').update(passwordAttempt).digest('hex');
  return hash === OWNER_PASSWORD_HASH;
}

export function createOwnerSession(): string {
  const token = 'velora_sess_' + crypto.randomBytes(32).toString('hex');
  const db = readDatabase();
  db.adminSessionTokens = db.adminSessionTokens || [];
  db.adminSessionTokens.push(token);
  // Keep last 10 sessions max
  if (db.adminSessionTokens.length > 10) {
    db.adminSessionTokens = db.adminSessionTokens.slice(-10);
  }
  writeDatabase(db);
  return token;
}

export function validateOwnerSession(token: string | undefined): boolean {
  if (!token) return false;
  const db = readDatabase();
  return Array.isArray(db.adminSessionTokens) && db.adminSessionTokens.includes(token);
}

export function revokeOwnerSession(token: string | undefined): void {
  if (!token) return;
  const db = readDatabase();
  db.adminSessionTokens = (db.adminSessionTokens || []).filter(t => t !== token);
  writeDatabase(db);
}
