import fs from 'fs';
import path from 'path';

export interface Participant {
  id: string;
  bibNumber: string;
  name: string;
  house: 'WIRA' | 'WAJA' | 'JUARA' | 'JAGUH' | 'BEZZA';
  gender: 'L' | 'P';
  category: 'L12' | 'P12' | 'L10' | 'P10' | 'L8' | 'P8' | 'Terbuka' | 'BEZZA';
  eventsRegistered: string[];
  classYear: string;
  createdAt: string;
}

export interface EventSchedule {
  id: string;
  eventCode: string;
  name: string;
  category: string;
  day: string;
  time: string;
  venue: string;
  round: string;
  status: 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai';
  notes?: string;
  createdAt: string;
}

export interface ResultEntry {
  rank: number; // 1 = Gold, 2 = Silver, 3 = Bronze, 4 = Keempat, etc.
  participantName: string;
  house: 'WIRA' | 'WAJA' | 'JUARA' | 'JAGUH' | 'BEZZA';
  recordTimeOrDistance: string;
  isNewRecord?: boolean;
  notes?: string;
}

export interface EventResult {
  id: string;
  eventId?: string;
  eventName: string;
  category: string;
  gender: 'L' | 'P' | 'Campuran';
  round: string;
  isBezzaEvent: boolean;
  dateCompleted: string;
  entries: ResultEntry[];
  isArchived: boolean;
  createdAt: string;
}

export interface BezzaAchievement {
  id: string;
  studentName: string;
  category: string; // e.g. Masalah Pembelajaran, Fizikal, Pendengaran, etc.
  event: string;
  achievement: 'Pingat Emas' | 'Pingat Perak' | 'Pingat Gangsa' | 'Tempat Ke-4' | 'Pingat Penyertaan' | 'Anugerah Khas Semangat';
  recordScore?: string;
  remarks?: string;
  date: string;
  createdAt: string;
}

export interface LiveStatus {
  activeEventId: string | null;
  activeEventName: string;
  category: string;
  round: string;
  venue: string;
  lanes: {
    laneNumber: number;
    participantName: string;
    house: 'WIRA' | 'WAJA' | 'JUARA' | 'JAGUH' | 'BEZZA';
    status: 'Sedia' | 'Berlepas' | 'Semakan' | 'Selesai';
    interimResult?: string;
  }[];
  announcements: {
    id: string;
    time: string;
    message: string;
    type: 'info' | 'urgent' | 'result';
  }[];
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  houseTag: 'Semua' | 'WIRA' | 'WAJA' | 'JUARA' | 'JAGUH' | 'BEZZA';
  category: 'Balapan' | 'Padang' | 'Sorakan' | 'Perbarisan' | 'Penyampaian';
  imageUrl: string;
  createdAt: string;
}

export interface AdminAccount {
  email: string;
  name: string;
  role: 'superadmin' | 'admin';
  passwordHash: string;
  isAuthorized: boolean;
  createdAt: string;
}

export interface ScoreboardData {
  participants: Participant[];
  schedules: EventSchedule[];
  results: EventResult[];
  bezzaAchievements: BezzaAchievement[];
  liveStatus: LiveStatus;
  gallery: GalleryItem[];
  settings: {
    schoolName: string;
    eventTitle: string;
    motto: string;
    year: number;
    location: string;
    dates: string;
    adminPasswordHash: string;
    logoUrl?: string;
    authorizedAdmins?: AdminAccount[];
  };
}

const DATA_DIR = path.resolve(process.env.DATA_DIR || path.resolve(process.cwd(), 'data'));
const DB_FILE = path.join(DATA_DIR, 'scoreboard_db.json');
const SEED_DB_FILE = path.resolve(process.cwd(), 'seed-data', 'scoreboard_db.json');

// Default initial state: Empty records with clean placeholders
const DEFAULT_DATA: ScoreboardData = {
  participants: [],
  schedules: [],
  results: [],
  bezzaAchievements: [],
  liveStatus: {
    activeEventId: null,
    activeEventName: 'Belum Ada Acara Aktif',
    category: '-',
    round: '-',
    venue: 'Padang SK Pekan Tenom',
    lanes: [],
    announcements: [
      {
        id: 'ann-init',
        time: 'Pagi',
        message: 'Selamat Datang ke Kejohanan Olahraga SK Pekan Tenom 2026! Keputusan langsung akan dipaparkan di sini.',
        type: 'info'
      }
    ],
    updatedAt: new Date().toISOString()
  },
  gallery: [],
  settings: {
    schoolName: 'SK Pekan Tenom',
    eventTitle: 'Kejohanan Olahraga Tahunan SK Pekan Tenom 2026',
    motto: 'Kecergasan Minda, Ketangkasan Jasmani',
    year: 2026,
    location: 'Padang SK Pekan Tenom, Sabah',
    dates: '27–28 Oktober 2026',
    logoUrl: '/logo.png',
    // Default admin password is 'admin2026'
    adminPasswordHash: '6051fc84a7a0d74c225fb18a496b09952da5642e60723ecae543298edd7d82d6',
    authorizedAdmins: [
      {
        email: 'admin@skpekantenom.edu.my',
        name: 'Pentadbir Utama SK Pekan Tenom',
        role: 'superadmin',
        passwordHash: '6051fc84a7a0d74c225fb18a496b09952da5642e60723ecae543298edd7d82d6', // 'admin2026'
        isAuthorized: true,
        createdAt: '2026-10-25T00:00:00.000Z'
      },
      {
        email: 'g-64271419@moe-dl.edu.my',
        name: 'Pegawai Teknikal MOE SK Pekan Tenom',
        role: 'superadmin',
        passwordHash: '6051fc84a7a0d74c225fb18a496b09952da5642e60723ecae543298edd7d82d6', // 'admin2026'
        isAuthorized: true,
        createdAt: '2026-10-25T00:00:00.000Z'
      }
    ]
  }
};

function ensureDirSync(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readDatabase(): ScoreboardData {
  try {
    ensureDirSync(DATA_DIR);
    if (!fs.existsSync(DB_FILE)) {
      // On first deploy, copy the exported database into persistent storage when available.
      if (fs.existsSync(SEED_DB_FILE)) {
        fs.copyFileSync(SEED_DB_FILE, DB_FILE);
      } else {
        fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
      }
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);

    // Ensure authorizedAdmins is always populated
    let authorizedAdmins = parsed.settings?.authorizedAdmins;
    if (!Array.isArray(authorizedAdmins) || authorizedAdmins.length === 0) {
      authorizedAdmins = DEFAULT_DATA.settings.authorizedAdmins;
    }

    return {
      ...DEFAULT_DATA,
      ...parsed,
      settings: {
        ...DEFAULT_DATA.settings,
        ...(parsed.settings || {}),
        authorizedAdmins
      },
      liveStatus: { ...DEFAULT_DATA.liveStatus, ...(parsed.liveStatus || {}) }
    };
  } catch (error) {
    console.error('Error reading database file:', error);
    return DEFAULT_DATA;
  }
}

export function writeDatabase(data: ScoreboardData): boolean {
  try {
    ensureDirSync(DATA_DIR);
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
}
