import fs from 'fs';
import path from 'path';
import { User, Lesson, Tournament, ForumPost, StoreItem } from './src/types';
import { fetchSupabaseDb, saveSupabaseDb, isSupabaseConfigured } from './supabase-server';

const DB_FILE = path.join(process.cwd(), 'database.json');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

export interface DatabaseSchema {
  users: User[];
  lessons: Lesson[];
  storeItems: StoreItem[];
  tournaments: Tournament[];
  posts: ForumPost[];
  broadcastMessages: string[];
}

// Initial DB template
const initialDb: DatabaseSchema = {
  users: [
    {
      id: 'student-1',
      name: 'João Pedro M. Oliveira',
      email: 'joaopedromoladeoliveira@gmail.com',
      role: 'admin',
      belt: 'preta',
      xp: 850,
      level: 15,
      enrolledDate: '2025-01-20',
      completedLessons: [],
      certificates: ['cert-1'],
      followersCount: 228,
      followingCount: 42,
      country: 'Brasil',
      wins: 14,
      losses: 2,
      trophies: 3,
      streak: 5
    }
  ],
  lessons: [],
  storeItems: [],
  tournaments: [],
  posts: [],
  broadcastMessages: [
    "📢 ATENÇÃO ATLETAS: Exame de Graduado dojo habilitado no painel 'Formar Faixa Preta'!",
    "🥋 EVENTO: Treino especial com Prof Paulo Souza nesta Quarta-feira!"
  ]
};

// Ensure folders and file exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
}

/**
 * Sync server's local file with Supabase on startup.
 */
export async function initializeDbConnection() {
  if (isSupabaseConfigured) {
    console.log('[Supabase] Initializing cloud database connection...');
    try {
      const cloudDb = await fetchSupabaseDb();
      if (cloudDb) {
        console.log('[Supabase] Loaded latest cloud state. Synchronizing to local cache...');
        fs.writeFileSync(DB_FILE, JSON.stringify(cloudDb, null, 2), 'utf-8');
      } else {
        console.log('[Supabase] No existing cloud record. Upserting current local database to Cloud...');
        const localData = readDb();
        await saveSupabaseDb(localData);
      }
    } catch (err) {
      console.error('[Supabase] Error during initial connection sync:', err);
    }
  } else {
    console.log('[Supabase] No Supabase credentials found. Running in Local-Only JSON file mode.');
  }
}

// Perform boot initialization
initializeDbConnection();

export function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return initialDb;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file:', err);
    return initialDb;
  }
}

export function writeDb(data: DatabaseSchema): void {
  try {
    // 1. Instantly write to local file so fast reads aren't blocked
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');

    // 2. Perform non-blocking write-through to Supabase in background
    if (isSupabaseConfigured) {
      saveSupabaseDb(data).then(success => {
        if (success) {
          // Sync successful
        } else {
          console.warn('[Supabase] Background write-through failed, will retry on next write.');
        }
      }).catch(err => {
        console.error('[Supabase] Background write-through uncaught error:', err);
      });
    }
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}
