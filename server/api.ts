import express, { Request, Response } from 'express';
import {
  readDatabase,
  writeDatabase,
  Participant,
  EventSchedule,
  EventResult,
  BezzaAchievement,
  GalleryItem
} from './db';
import {
  hashPassword,
  createSessionToken,
  verifySessionToken,
  revokeSessionToken,
  requireAdminAuth,
  authenticateAdminCredentials,
  AdminUser
} from './auth';

export const apiRouter = express.Router();
apiRouter.use(express.json());

// Helper: Calculate official medal standings
export function calculateMedalStandings(results: EventResult[]) {
  const mainHouses: Array<'WIRA' | 'WAJA' | 'JUARA' | 'JAGUH'> = ['WIRA', 'WAJA', 'JUARA', 'JAGUH'];
  
  const houseData: Record<'WIRA' | 'WAJA' | 'JUARA' | 'JAGUH', {
    house: 'WIRA' | 'WAJA' | 'JUARA' | 'JAGUH';
    name: string;
    color: string;
    gold: number;
    silver: number;
    bronze: number;
    fourth: number;
    points: number;
    totalMedals: number;
  }> = {
    WIRA: { house: 'WIRA', name: 'Rumah Wira', color: '#ef4444', gold: 0, silver: 0, bronze: 0, fourth: 0, points: 0, totalMedals: 0 },
    WAJA: { house: 'WAJA', name: 'Rumah Waja', color: '#22c55e', gold: 0, silver: 0, bronze: 0, fourth: 0, points: 0, totalMedals: 0 },
    JUARA: { house: 'JUARA', name: 'Rumah Juara', color: '#3b82f6', gold: 0, silver: 0, bronze: 0, fourth: 0, points: 0, totalMedals: 0 },
    JAGUH: { house: 'JAGUH', name: 'Rumah Jaguh', color: '#eab308', gold: 0, silver: 0, bronze: 0, fourth: 0, points: 0, totalMedals: 0 }
  };

  // Only count non-BEZZA events towards the 4 houses
  results.filter(r => !r.isBezzaEvent && !r.isArchived).forEach(res => {
    res.entries.forEach(entry => {
      const h = entry.house as 'WIRA' | 'WAJA' | 'JUARA' | 'JAGUH';
      if (houseData[h]) {
        if (entry.rank === 1) {
          houseData[h].gold += 1;
          houseData[h].points += 7; // Emas = 7 mata MSSM
        } else if (entry.rank === 2) {
          houseData[h].silver += 1;
          houseData[h].points += 5; // Perak = 5 mata MSSM
        } else if (entry.rank === 3) {
          houseData[h].bronze += 1;
          houseData[h].points += 3; // Gangsa = 3 mata MSSM
        } else if (entry.rank === 4) {
          houseData[h].fourth += 1;
          houseData[h].points += 1; // Keempat = 1 mata MSSM
        }
      }
    });
  });

  // Calculate total medals
  mainHouses.forEach(h => {
    houseData[h].totalMedals = houseData[h].gold + houseData[h].silver + houseData[h].bronze;
  });

  // Sort by Gold DESC, Silver DESC, Bronze DESC
  const sorted = Object.values(houseData).sort((a, b) => {
    if (b.gold !== a.gold) return b.gold - a.gold;
    if (b.silver !== a.silver) return b.silver - a.silver;
    if (b.bronze !== a.bronze) return b.bronze - a.bronze;
    if (b.points !== a.points) return b.points - a.points;
    return a.name.localeCompare(b.name);
  });

  // Determine ranks and check for genuine ties (SERI)
  const rankedList = sorted.map((item, index) => {
    // Check if tied with previous or next
    let isTie = false;
    let tieRank = index + 1;

    // Check with others
    const tiedItems = sorted.filter(
      other => other.gold === item.gold && other.silver === item.silver && other.bronze === item.bronze
    );

    if (tiedItems.length > 1) {
      isTie = true;
      // The tie rank is the index of the first item in the tied group + 1
      const firstTiedIndex = sorted.findIndex(
        x => x.gold === item.gold && x.silver === item.silver && x.bronze === item.bronze
      );
      tieRank = firstTiedIndex + 1;
    }

    return {
      ...item,
      rank: isTie ? `SERI ${tieRank}` : `${index + 1}`,
      rawRank: index + 1,
      isTie
    };
  });

  return rankedList;
}

// -------------------------------------------------------------
// PUBLIC ENDPOINTS (No login needed)
// -------------------------------------------------------------

apiRouter.get('/public/scoreboard', (req: Request, res: Response) => {
  const data = readDatabase();
  const standings = calculateMedalStandings(data.results);

  // Return public view data with safe settings (strip password hash)
  const safeSettings = {
    schoolName: data.settings.schoolName,
    eventTitle: data.settings.eventTitle,
    motto: data.settings.motto,
    year: data.settings.year,
    location: data.settings.location,
    dates: data.settings.dates,
    logoUrl: data.settings.logoUrl || ''
  };

  res.json({
    success: true,
    data: {
      participants: data.participants,
      schedules: data.schedules,
      results: data.results,
      bezzaAchievements: data.bezzaAchievements,
      liveStatus: data.liveStatus,
      gallery: data.gallery,
      settings: safeSettings,
      standings
    }
  });
});

// CSV Export for public & reporters
apiRouter.get('/public/export-standings.csv', (req: Request, res: Response) => {
  const data = readDatabase();
  const standings = calculateMedalStandings(data.results);

  let csv = 'Kedudukan,Rumah Sukan,Emas,Perak,Gangsa,Jumlah Pingat,Mata Keseluruhan\n';
  standings.forEach(s => {
    csv += `"${s.rank}","${s.name}",${s.gold},${s.silver},${s.bronze},${s.totalMedals},${s.points}\n`;
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="Kedudukan_Pingat_SK_Pekan_Tenom_2026.csv"');
  res.send(csv);
});

// -------------------------------------------------------------
// AUTHENTICATION ENDPOINTS (FIREBASE & SERVER GUARDED)
// -------------------------------------------------------------

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Sila masukkan kedua-dua medan e-mel pentadbir dan kata laluan.'
    });
  }

  const authResult = authenticateAdminCredentials(email, password);
  if (!authResult.success || !authResult.user) {
    return res.status(401).json({
      success: false,
      error: authResult.error || 'Log masuk gagal. Sila semak semula e-mel dan kata laluan anda.'
    });
  }

  const token = createSessionToken(authResult.user);
  res.json({
    success: true,
    token,
    user: authResult.user,
    message: `Selamat kembali, ${authResult.user.name || authResult.user.email}! Log masuk pentadbir berjaya.`
  });
});

apiRouter.get('/auth/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ authenticated: false });
  }
  const token = authHeader.split(' ')[1];
  const { valid, user } = verifySessionToken(token);
  res.json({ authenticated: valid, user: valid ? user : undefined });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    revokeSessionToken(token);
  }
  res.json({ success: true, message: 'Log keluar berjaya. Sesi anda telah ditamatkan dengan selamat.' });
});

apiRouter.get('/auth/security-status', (req: Request, res: Response) => {
  const data = readDatabase();
  const authorizedCount = (data.settings.authorizedAdmins || []).filter(a => a.isAuthorized).length;
  res.json({
    success: true,
    data: {
      serverRbacActive: true,
      authMethod: 'Firebase Auth & Token Sesi Berterusan (SHA-256)',
      authorizedAdminsCount: authorizedCount,
      publicRegistrationAllowed: false,
      isPersistenceActive: true
    }
  });
});

apiRouter.get('/admin/accounts', requireAdminAuth, (req: Request, res: Response) => {
  const data = readDatabase();
  // Safe representation (never return passwordHash)
  const safeAccounts = (data.settings.authorizedAdmins || []).map(a => ({
    email: a.email,
    name: a.name,
    role: a.role,
    isAuthorized: a.isAuthorized,
    createdAt: a.createdAt
  }));
  res.json({ success: true, data: safeAccounts });
});

apiRouter.post('/admin/accounts/authorize', requireAdminAuth, (req: Request, res: Response) => {
  const { email, name, role, initialPassword } = req.body;
  if (!email || !name) {
    return res.status(400).json({ success: false, error: 'E-mel dan nama pentadbir diperlukan.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const data = readDatabase();
  data.settings.authorizedAdmins = data.settings.authorizedAdmins || [];

  const existing = data.settings.authorizedAdmins.find(
    a => a.email.trim().toLowerCase() === cleanEmail
  );

  if (existing) {
    return res.status(400).json({ success: false, error: 'E-mel ini telah didaftarkan dalam senarai pentadbir.' });
  }

  const newAdmin = {
    email: cleanEmail,
    name: String(name).trim(),
    role: (role === 'superadmin' ? 'superadmin' : 'admin') as 'superadmin' | 'admin',
    passwordHash: hashPassword(initialPassword || 'admin2026'),
    isAuthorized: true,
    createdAt: new Date().toISOString()
  };

  data.settings.authorizedAdmins.push(newAdmin);
  writeDatabase(data);

  res.json({
    success: true,
    message: `Akaun pentadbir ${cleanEmail} telah berjaya dibenarkan.`,
    data: { email: newAdmin.email, name: newAdmin.name, role: newAdmin.role }
  });
});

apiRouter.post('/auth/change-password', requireAdminAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'Kata laluan baharu mesti sekurang-kurangnya 6 aksara.' });
  }

  const user = (req as any).adminUser as AdminUser | undefined;
  const data = readDatabase();
  const currentHash = hashPassword(currentPassword || '');

  // Check if current password is valid
  const adminAccount = data.settings.authorizedAdmins?.find(
    a => a.email.toLowerCase() === (user?.email || '').toLowerCase()
  );

  const isCurrentValid = adminAccount 
    ? (adminAccount.passwordHash === currentHash || data.settings.adminPasswordHash === currentHash)
    : (data.settings.adminPasswordHash === currentHash);

  if (!isCurrentValid) {
    return res.status(401).json({ success: false, error: 'Kata laluan semasa tidak tepat.' });
  }

  const newHash = hashPassword(newPassword);
  data.settings.adminPasswordHash = newHash;

  if (adminAccount) {
    adminAccount.passwordHash = newHash;
  }
  if (data.settings.authorizedAdmins) {
    data.settings.authorizedAdmins.forEach(a => {
      if (a.email.toLowerCase() === (user?.email || '').toLowerCase()) {
        a.passwordHash = newHash;
      }
    });
  }

  writeDatabase(data);

  res.json({ success: true, message: 'Kata laluan pentadbir berjaya dikemas kini!' });
});

// -------------------------------------------------------------
// PROTECTED PARTICIPANTS CRUD
// -------------------------------------------------------------

apiRouter.post('/participants', requireAdminAuth, (req: Request, res: Response) => {
  const { bibNumber, name, house, gender, category, eventsRegistered, classYear } = req.body;
  if (!name || !house || !category) {
    return res.status(400).json({ success: false, error: 'Nama, Rumah Sukan, dan Kategori adalah wajib.' });
  }

  const data = readDatabase();
  const newParticipant: Participant = {
    id: `part-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    bibNumber: bibNumber || '',
    name: name.trim(),
    house,
    gender: gender || 'L',
    category,
    eventsRegistered: Array.isArray(eventsRegistered) ? eventsRegistered : [],
    classYear: classYear || '',
    createdAt: new Date().toISOString()
  };

  data.participants.unshift(newParticipant);
  writeDatabase(data);

  res.status(201).json({ success: true, participant: newParticipant });
});

apiRouter.put('/participants/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { bibNumber, name, house, gender, category, eventsRegistered, classYear } = req.body;

  const data = readDatabase();
  const index = data.participants.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Peserta tidak dijumpai.' });
  }

  data.participants[index] = {
    ...data.participants[index],
    bibNumber: bibNumber !== undefined ? bibNumber : data.participants[index].bibNumber,
    name: name ? name.trim() : data.participants[index].name,
    house: house || data.participants[index].house,
    gender: gender || data.participants[index].gender,
    category: category || data.participants[index].category,
    eventsRegistered: Array.isArray(eventsRegistered) ? eventsRegistered : data.participants[index].eventsRegistered,
    classYear: classYear !== undefined ? classYear : data.participants[index].classYear
  };

  writeDatabase(data);
  res.json({ success: true, participant: data.participants[index] });
});

apiRouter.delete('/participants/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readDatabase();
  const initialLength = data.participants.length;
  data.participants = data.participants.filter(p => p.id !== id);

  if (data.participants.length === initialLength) {
    return res.status(404).json({ success: false, error: 'Peserta tidak dijumpai.' });
  }

  writeDatabase(data);
  res.json({ success: true, message: 'Peserta berjaya dipadam.' });
});

// -------------------------------------------------------------
// PROTECTED SCHEDULES CRUD
// -------------------------------------------------------------

apiRouter.post('/schedules', requireAdminAuth, (req: Request, res: Response) => {
  const { eventCode, name, category, day, time, venue, round, status, notes } = req.body;
  if (!name || !day || !time) {
    return res.status(400).json({ success: false, error: 'Nama Acara, Hari dan Masa adalah wajib.' });
  }

  const data = readDatabase();
  const newSchedule: EventSchedule = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    eventCode: eventCode || `AC-${data.schedules.length + 101}`,
    name: name.trim(),
    category: category || 'Terbuka',
    day,
    time,
    venue: venue || 'Padang SK Pekan Tenom',
    round: round || 'Akhir',
    status: status || 'Akan Datang',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  data.schedules.push(newSchedule);
  writeDatabase(data);

  res.status(201).json({ success: true, schedule: newSchedule });
});

apiRouter.put('/schedules/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readDatabase();
  const index = data.schedules.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Jadual acara tidak dijumpai.' });
  }

  data.schedules[index] = {
    ...data.schedules[index],
    ...req.body
  };

  writeDatabase(data);
  res.json({ success: true, schedule: data.schedules[index] });
});

apiRouter.delete('/schedules/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readDatabase();
  data.schedules = data.schedules.filter(s => s.id !== id);
  writeDatabase(data);
  res.json({ success: true, message: 'Acara berjaya dipadam dari jadual.' });
});

// -------------------------------------------------------------
// PROTECTED RESULTS CRUD
// -------------------------------------------------------------

apiRouter.post('/results', requireAdminAuth, (req: Request, res: Response) => {
  const { eventId, eventName, category, gender, round, isBezzaEvent, dateCompleted, entries } = req.body;
  if (!eventName || !entries || !Array.isArray(entries)) {
    return res.status(400).json({ success: false, error: 'Nama Acara dan Keputusan adalah wajib.' });
  }

  const data = readDatabase();
  const newResult: EventResult = {
    id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    eventId: eventId || '',
    eventName: eventName.trim(),
    category: category || 'Terbuka',
    gender: gender || 'L',
    round: round || 'Akhir',
    isBezzaEvent: Boolean(isBezzaEvent),
    dateCompleted: dateCompleted || new Date().toISOString().split('T')[0],
    entries,
    isArchived: false,
    createdAt: new Date().toISOString()
  };

  // If this event was in schedule, automatically update status to 'Selesai'
  if (eventId) {
    const sched = data.schedules.find(s => s.id === eventId);
    if (sched) sched.status = 'Selesai';
  }

  data.results.unshift(newResult);
  writeDatabase(data);

  res.status(201).json({ success: true, result: newResult });
});

apiRouter.put('/results/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readDatabase();
  const index = data.results.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Keputusan tidak dijumpai.' });
  }

  data.results[index] = {
    ...data.results[index],
    ...req.body
  };

  writeDatabase(data);
  res.json({ success: true, result: data.results[index] });
});

apiRouter.delete('/results/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readDatabase();
  data.results = data.results.filter(r => r.id !== id);
  writeDatabase(data);
  res.json({ success: true, message: 'Keputusan berjaya dipadam.' });
});

apiRouter.post('/results/:id/archive', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readDatabase();
  const resRecord = data.results.find(r => r.id === id);
  if (!resRecord) {
    return res.status(404).json({ success: false, error: 'Keputusan tidak dijumpai.' });
  }

  resRecord.isArchived = !resRecord.isArchived;
  writeDatabase(data);
  res.json({ success: true, isArchived: resRecord.isArchived });
});

// -------------------------------------------------------------
// PROTECTED BEZZA ACHIEVEMENTS CRUD
// -------------------------------------------------------------

apiRouter.post('/bezza', requireAdminAuth, (req: Request, res: Response) => {
  const { studentName, category, event, achievement, recordScore, remarks, date } = req.body;
  if (!studentName || !event || !achievement) {
    return res.status(400).json({ success: false, error: 'Nama Murid, Acara, dan Pencapaian adalah wajib.' });
  }

  const data = readDatabase();
  const newAchievement: BezzaAchievement = {
    id: `bz-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    studentName: studentName.trim(),
    category: category || 'PPKI SK Pekan Tenom',
    event: event.trim(),
    achievement,
    recordScore: recordScore || '',
    remarks: remarks || '',
    date: date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  data.bezzaAchievements.unshift(newAchievement);
  writeDatabase(data);

  res.status(201).json({ success: true, achievement: newAchievement });
});

apiRouter.put('/bezza/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readDatabase();
  const index = data.bezzaAchievements.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Rekod pencapaian BEZZA tidak dijumpai.' });
  }

  data.bezzaAchievements[index] = {
    ...data.bezzaAchievements[index],
    ...req.body
  };

  writeDatabase(data);
  res.json({ success: true, achievement: data.bezzaAchievements[index] });
});

apiRouter.delete('/bezza/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readDatabase();
  data.bezzaAchievements = data.bezzaAchievements.filter(b => b.id !== id);
  writeDatabase(data);
  res.json({ success: true, message: 'Rekod pencapaian BEZZA berjaya dipadam.' });
});

// -------------------------------------------------------------
// PROTECTED LIVE TRACKER STATUS
// -------------------------------------------------------------

apiRouter.put('/live/status', requireAdminAuth, (req: Request, res: Response) => {
  const data = readDatabase();
  data.liveStatus = {
    ...data.liveStatus,
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  writeDatabase(data);
  res.json({ success: true, liveStatus: data.liveStatus });
});

apiRouter.post('/live/announcement', requireAdminAuth, (req: Request, res: Response) => {
  const { message, type } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, error: 'Mesej pengumuman diperlukan.' });
  }

  const data = readDatabase();
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  data.liveStatus.announcements.unshift({
    id: `ann-${Date.now()}`,
    time: timeStr,
    message: message.trim(),
    type: type || 'info'
  });

  // Keep latest 25 announcements
  if (data.liveStatus.announcements.length > 25) {
    data.liveStatus.announcements = data.liveStatus.announcements.slice(0, 25);
  }

  writeDatabase(data);
  res.json({ success: true, announcements: data.liveStatus.announcements });
});

// -------------------------------------------------------------
// PROTECTED GALLERY CRUD
// -------------------------------------------------------------

apiRouter.post('/gallery', requireAdminAuth, (req: Request, res: Response) => {
  const { title, caption, houseTag, category, imageUrl } = req.body;
  if (!title || !imageUrl) {
    return res.status(400).json({ success: false, error: 'Tajuk dan URL Gambar adalah wajib.' });
  }

  const data = readDatabase();
  const item: GalleryItem = {
    id: `gal-${Date.now()}`,
    title: title.trim(),
    caption: caption || '',
    houseTag: houseTag || 'Semua',
    category: category || 'Balapan',
    imageUrl,
    createdAt: new Date().toISOString()
  };

  data.gallery.unshift(item);
  writeDatabase(data);
  res.status(201).json({ success: true, item });
});

apiRouter.delete('/gallery/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readDatabase();
  data.gallery = data.gallery.filter(g => g.id !== id);
  writeDatabase(data);
  res.json({ success: true, message: 'Foto galeri berjaya dipadam.' });
});

// -------------------------------------------------------------
// SETTINGS & SYSTEM UTILITIES
// -------------------------------------------------------------

apiRouter.put('/settings', requireAdminAuth, (req: Request, res: Response) => {
  const { schoolName, eventTitle, motto, year, location, dates, logoUrl } = req.body;
  const data = readDatabase();

  data.settings.schoolName = schoolName || data.settings.schoolName;
  data.settings.eventTitle = eventTitle || data.settings.eventTitle;
  data.settings.motto = motto || data.settings.motto;
  data.settings.year = year ? Number(year) : data.settings.year;
  data.settings.location = location || data.settings.location;
  data.settings.dates = dates || data.settings.dates;
  if (logoUrl !== undefined) data.settings.logoUrl = logoUrl;

  writeDatabase(data);
  res.json({ success: true, settings: data.settings });
});

// Admin Reset Data (To empty state with placeholders as requested)
apiRouter.post('/admin/reset-data', requireAdminAuth, (req: Request, res: Response) => {
  const data = readDatabase();
  data.participants = [];
  data.schedules = [];
  data.results = [];
  data.bezzaAchievements = [];
  data.gallery = [];
  data.liveStatus = {
    activeEventId: null,
    activeEventName: 'Belum Ada Acara Aktif',
    category: '-',
    round: '-',
    venue: 'Padang SK Pekan Tenom',
    lanes: [],
    announcements: [
      {
        id: `ann-${Date.now()}`,
        time: 'Pagi',
        message: 'Papan Skor Sukan Tahunan SK Pekan Tenom 2026 telah diset semula ke rekod kosong yang bersih.',
        type: 'info'
      }
    ],
    updatedAt: new Date().toISOString()
  };

  writeDatabase(data);
  res.json({ success: true, message: 'Pangkalan data berjaya diset semula kepada rekod kosong yang bersih.' });
});

// Admin Demo Data Loader (Optional 1-click test simulation for the administrator)
apiRouter.post('/admin/load-demo-data', requireAdminAuth, (req: Request, res: Response) => {
  const data = readDatabase();

  data.participants = [
    {
      id: 'demo-p1',
      bibNumber: 'W101',
      name: 'Muhammad Farhan bin Abdullah',
      house: 'WIRA',
      gender: 'L',
      category: 'L12',
      eventsRegistered: ['100m L12', '200m L12', '4x100m L12'],
      classYear: '6 Cemerlang',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-p2',
      bibNumber: 'J204',
      name: 'Bryan Chong Jin Wei',
      house: 'JAGUH',
      gender: 'L',
      category: 'L12',
      eventsRegistered: ['100m L12', 'Lompat Jauh L12'],
      classYear: '6 Gigih',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-p3',
      bibNumber: 'WJ305',
      name: 'Nur Aisyah Binti Roslan',
      house: 'WAJA',
      gender: 'P',
      category: 'P12',
      eventsRegistered: ['100m P12', 'Lompat Tinggi P12'],
      classYear: '6 Amanah',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-p4',
      bibNumber: 'JR402',
      name: 'Mohd Danial bin Zulkipli',
      house: 'JUARA',
      gender: 'L',
      category: 'L12',
      eventsRegistered: ['Lontar Peluru L12'],
      classYear: '5 Cemerlang',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-p5',
      bibNumber: 'BZ501',
      name: 'Mohd Hafizuddin bin Razak',
      house: 'BEZZA',
      gender: 'L',
      category: 'BEZZA',
      eventsRegistered: ['Lari 50m BEZZA', 'Lompat Jauh Berdiri'],
      classYear: 'PPKI Al-Biruni',
      createdAt: new Date().toISOString()
    }
  ];

  data.schedules = [
    {
      id: 'demo-sc1',
      eventCode: 'AC-101',
      name: '100m Lelaki 12 TKB',
      category: 'L12',
      day: 'Hari 1 (Selasa)',
      time: '08:30 AM',
      venue: 'Balapan Utama',
      round: 'Akhir',
      status: 'Selesai',
      notes: 'Acara tumpuan balapan',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-sc2',
      eventCode: 'AC-102',
      name: '100m Perempuan 12 TKB',
      category: 'P12',
      day: 'Hari 1 (Selasa)',
      time: '09:00 AM',
      venue: 'Balapan Utama',
      round: 'Akhir',
      status: 'Selesai',
      notes: '',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-sc3',
      eventCode: 'AC-103',
      name: 'Lontar Peluru Lelaki 12 TKB',
      category: 'L12',
      day: 'Hari 1 (Selasa)',
      time: '09:30 AM',
      venue: 'Padang Lontaran B',
      round: 'Akhir',
      status: 'Sedang Berlangsung',
      notes: 'Dalam pusingan ke-3',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-sc4',
      eventCode: 'AC-104',
      name: '4x100m Terbuka Lelaki & Perempuan',
      category: 'Terbuka',
      day: 'Hari 2 (Rabu)',
      time: '10:30 AM',
      venue: 'Balapan Utama',
      round: 'Akhir',
      status: 'Akan Datang',
      notes: 'Acara kemuncak hari sukan',
      createdAt: new Date().toISOString()
    }
  ];

  data.results = [
    {
      id: 'demo-res1',
      eventId: 'demo-sc1',
      eventName: '100m Lelaki 12 TKB',
      category: 'L12',
      gender: 'L',
      round: 'Akhir',
      isBezzaEvent: false,
      dateCompleted: '2026-10-24',
      isArchived: false,
      createdAt: new Date().toISOString(),
      entries: [
        { rank: 1, participantName: 'Muhammad Farhan bin Abdullah', house: 'WIRA', recordTimeOrDistance: '12.42s', isNewRecord: true, notes: 'Rekod Kejohanan Baharu' },
        { rank: 2, participantName: 'Bryan Chong Jin Wei', house: 'JAGUH', recordTimeOrDistance: '12.80s' },
        { rank: 3, participantName: 'Mohd Danial bin Zulkipli', house: 'JUARA', recordTimeOrDistance: '13.15s' },
        { rank: 4, participantName: 'Azlan bin Sabri', house: 'WAJA', recordTimeOrDistance: '13.40s' }
      ]
    },
    {
      id: 'demo-res2',
      eventId: 'demo-sc2',
      eventName: '100m Perempuan 12 TKB',
      category: 'P12',
      gender: 'P',
      round: 'Akhir',
      isBezzaEvent: false,
      dateCompleted: '2026-10-24',
      isArchived: false,
      createdAt: new Date().toISOString(),
      entries: [
        { rank: 1, participantName: 'Nur Aisyah Binti Roslan', house: 'WAJA', recordTimeOrDistance: '13.90s' },
        { rank: 2, participantName: 'Siti Sarah binti Karim', house: 'WIRA', recordTimeOrDistance: '14.12s' },
        { rank: 3, participantName: 'Jessica Wong', house: 'JAGUH', recordTimeOrDistance: '14.50s' },
        { rank: 4, participantName: 'Nurul Huda', house: 'JUARA', recordTimeOrDistance: '14.85s' }
      ]
    }
  ];

  data.bezzaAchievements = [
    {
      id: 'demo-bz1',
      studentName: 'Mohd Hafizuddin bin Razak',
      category: 'PPKI Pembelajaran',
      event: 'Lari 50m Khas BEZZA',
      achievement: 'Pingat Emas',
      recordScore: '8.12s',
      remarks: 'Sorakan gemuruh daripada seluruh warga SK Pekan Tenom!',
      date: '2026-10-24',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-bz2',
      studentName: 'Nur Ameera binti Syahril',
      category: 'PPKI Pembelajaran',
      event: 'Lompat Jauh Berdiri Khas',
      achievement: 'Pingat Perak',
      recordScore: '1.65m',
      remarks: 'Semangat juang yang sungguh membanggakan.',
      date: '2026-10-24',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-bz3',
      studentName: 'Kevin Ambrose',
      category: 'PPKI Pendengaran',
      event: 'Lontar Bola Sofbol BEZZA',
      achievement: 'Anugerah Khas Semangat',
      recordScore: '15.40m',
      remarks: 'Dianugerahkan Anugerah Khas Ikon Semangat Waja 2026.',
      date: '2026-10-24',
      createdAt: new Date().toISOString()
    }
  ];

  data.liveStatus = {
    activeEventId: 'demo-sc3',
    activeEventName: 'Lontar Peluru Lelaki 12 TKB (Akhir)',
    category: 'L12',
    round: 'Pusingan 3',
    venue: 'Padang Lontaran B',
    lanes: [
      { laneNumber: 1, participantName: 'Mohd Danial (JUARA)', house: 'JUARA', status: 'Selesai', interimResult: '9.85m' },
      { laneNumber: 2, participantName: 'Khairul Anwar (WIRA)', house: 'WIRA', status: 'Selesai', interimResult: '10.12m' },
      { laneNumber: 3, participantName: 'Darren Lee (JAGUH)', house: 'JAGUH', status: 'Semakan', interimResult: '10.45m' },
      { laneNumber: 4, participantName: 'Afif Danial (WAJA)', house: 'WAJA', status: 'Sedia', interimResult: '-' }
    ],
    announcements: [
      { id: 'a1', time: '09:45 AM', message: 'Lontaran pusingan ke-3 sedang berjalan sengit di Padang Lontaran B.', type: 'info' },
      { id: 'a2', time: '09:15 AM', message: 'Muhammad Farhan (WIRA) mencatat rekod kejohanan baharu 12.42s dalam 100m L12!', type: 'result' },
      { id: 'a3', time: '08:30 AM', message: 'Kejohanan dimulakan dengan penuh meriah disaksikan ibu bapa & guru.', type: 'info' }
    ],
    updatedAt: new Date().toISOString()
  };

  data.gallery = [
    {
      id: 'demo-gal1',
      title: 'Upacara Perbarisan Lintas Hormat',
      caption: 'Kontinjen WIRA, WAJA, JUARA, JAGUH dan BEZZA berarak gagah di hadapan pentas utama.',
      houseTag: 'Semua',
      category: 'Perbarisan',
      imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-gal2',
      title: 'Sorakan Padu Rumah Wira',
      caption: 'Maskot dan ahli Rumah Wira menyuntik semangat membara kepada para atlet balapan.',
      houseTag: 'WIRA',
      category: 'Sorakan',
      imageUrl: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-gal3',
      title: 'Pencapaian Bersejarah Atlet BEZZA',
      caption: 'Detik manis adik Mohd Hafizuddin menerima pingat emas diiringi tepukan gemuruh.',
      houseTag: 'BEZZA',
      category: 'Penyampaian',
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date().toISOString()
    }
  ];

  writeDatabase(data);
  res.json({ success: true, message: 'Data contoh ujian berjaya dimuatkan untuk demonstrasi pentadbir.' });
});

// Admin Raw Database Backup
apiRouter.get('/admin/export-backup', requireAdminAuth, (req: Request, res: Response) => {
  const data = readDatabase();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="backup_sk_pekan_tenom_2026.json"');
  res.json(data);
});

// Admin Database Restore
apiRouter.post('/admin/restore', requireAdminAuth, (req: Request, res: Response) => {
  const incomingData = req.body;
  if (!incomingData || !Array.isArray(incomingData.participants) || !Array.isArray(incomingData.results)) {
    return res.status(400).json({ success: false, error: 'Fail sandaran JSON tidak sah.' });
  }

  writeDatabase(incomingData);
  res.json({ success: true, message: 'Data berjaya dipulihkan daripada fail sandaran.' });
});
