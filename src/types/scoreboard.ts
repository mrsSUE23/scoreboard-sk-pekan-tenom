export type HouseType = 'WIRA' | 'WAJA' | 'JUARA' | 'JAGUH' | 'BEZZA';

export interface HouseInfo {
  id: HouseType;
  name: string;
  colorName: string;
  badgeClass: string;
  bgGradient: string;
  hex: string;
  textClass: string;
  borderClass: string;
}

export const HOUSES: Record<HouseType, HouseInfo> = {
  WIRA: {
    id: 'WIRA',
    name: 'Wira',
    colorName: 'Merah (Red)',
    badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40',
    bgGradient: 'from-red-600 to-rose-700',
    hex: '#ef4444',
    textClass: 'text-red-400',
    borderClass: 'border-red-500'
  },
  WAJA: {
    id: 'WAJA',
    name: 'Waja',
    colorName: 'Hijau (Green)',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    bgGradient: 'from-emerald-600 to-teal-700',
    hex: '#22c55e',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500'
  },
  JUARA: {
    id: 'JUARA',
    name: 'Juara',
    colorName: 'Biru (Blue)',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    bgGradient: 'from-blue-600 to-indigo-700',
    hex: '#3b82f6',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500'
  },
  JAGUH: {
    id: 'JAGUH',
    name: 'Jaguh',
    colorName: 'Kuning / Emas (Gold)',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    bgGradient: 'from-amber-500 to-yellow-600',
    hex: '#eab308',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500'
  },
  BEZZA: {
    id: 'BEZZA',
    name: 'Bezza',
    colorName: 'Ungu (Purple)',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    bgGradient: 'from-purple-600 to-fuchsia-700',
    hex: '#a855f7',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500'
  }
};

export interface Participant {
  id: string;
  bibNumber: string;
  name: string;
  house: HouseType;
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
  rank: number;
  participantName: string;
  house: HouseType;
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
  category: string;
  event: string;
  achievement: 'Pingat Emas' | 'Pingat Perak' | 'Pingat Gangsa' | 'Tempat Ke-4' | 'Pingat Penyertaan' | 'Anugerah Khas Semangat';
  recordScore?: string;
  remarks?: string;
  date: string;
  createdAt: string;
}

export interface LaneStatus {
  laneNumber: number;
  participantName: string;
  house: HouseType;
  status: 'Sedia' | 'Berlepas' | 'Semakan' | 'Selesai';
  interimResult?: string;
}

export interface Announcement {
  id: string;
  time: string;
  message: string;
  type: 'info' | 'urgent' | 'result';
}

export interface LiveStatus {
  activeEventId: string | null;
  activeEventName: string;
  category: string;
  round: string;
  venue: string;
  lanes: LaneStatus[];
  announcements: Announcement[];
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  houseTag: 'Semua' | HouseType;
  category: 'Balapan' | 'Padang' | 'Sorakan' | 'Perbarisan' | 'Penyampaian';
  imageUrl: string;
  createdAt: string;
}

export interface HouseStanding {
  house: 'WIRA' | 'WAJA' | 'JUARA' | 'JAGUH';
  name: string;
  color: string;
  gold: number;
  silver: number;
  bronze: number;
  fourth: number;
  points: number;
  totalMedals: number;
  rank: string;
  rawRank: number;
  isTie: boolean;
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'superadmin' | 'admin';
}

export interface AdminAccount {
  email: string;
  name: string;
  role: 'superadmin' | 'admin';
  isAuthorized: boolean;
  createdAt: string;
}

export interface ScoreboardSettings {
  schoolName: string;
  eventTitle: string;
  motto: string;
  year: number;
  location: string;
  dates: string;
  logoUrl?: string;
  authorizedAdmins?: AdminAccount[];
}

export interface ScoreboardState {
  participants: Participant[];
  schedules: EventSchedule[];
  results: EventResult[];
  bezzaAchievements: BezzaAchievement[];
  liveStatus: LiveStatus;
  gallery: GalleryItem[];
  settings: ScoreboardSettings;
  standings: HouseStanding[];
}
