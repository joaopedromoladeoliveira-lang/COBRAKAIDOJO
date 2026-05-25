import fs from 'fs';
import path from 'path';
import { User, Lesson, Tournament, ForumPost, StoreItem } from './src/types';

const DB_FILE = path.join(process.cwd(), 'database.json');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

interface DatabaseSchema {
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
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}
