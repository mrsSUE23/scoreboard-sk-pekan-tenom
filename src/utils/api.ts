import {
  ScoreboardState,
  ScoreboardSettings,
  Participant,
  EventSchedule,
  EventResult,
  BezzaAchievement,
  LiveStatus,
  GalleryItem,
  AdminUser,
  AdminAccount
} from '../types/scoreboard';

const TOKEN_KEY = 'sk_pekan_tenom_admin_token';
const USER_KEY = 'sk_pekan_tenom_admin_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null, user?: AdminUser) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchScoreboardData(): Promise<ScoreboardState> {
  const res = await fetch('/api/public/scoreboard');
  if (!res.ok) {
    throw new Error(`Ralat mengambil data: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function loginAdmin(
  emailOrPassword: string,
  maybePassword?: string
): Promise<{ success: boolean; token?: string; user?: AdminUser; message?: string; error?: string }> {
  // Support both (email, password) and legacy (password)
  const email = maybePassword ? emailOrPassword : 'admin@skpekantenom.edu.my';
  const password = maybePassword || emailOrPassword;

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (data.success && data.token) {
    setStoredToken(data.token, data.user);
  }
  return data;
}

export async function verifyAdminSession(): Promise<{ authenticated: boolean; user?: AdminUser }> {
  const token = getStoredToken();
  if (!token) return { authenticated: false };
  try {
    const res = await fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!data.authenticated) {
      setStoredToken(null);
      return { authenticated: false };
    }
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    return { authenticated: true, user: data.user || getStoredUser() || undefined };
  } catch {
    return { authenticated: false };
  }
}

export async function logoutAdmin(): Promise<void> {
  const token = getStoredToken();
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {
      // ignore
    }
  }
  setStoredToken(null);
}

export async function apiGetSecurityStatus() {
  const res = await fetch('/api/auth/security-status');
  return res.json();
}

export async function apiGetAdminAccounts(): Promise<{ success: boolean; data: AdminAccount[]; error?: string }> {
  const res = await fetch('/api/admin/accounts', {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function apiAuthorizeAdminAccount(email: string, name: string, role: string, initialPassword?: string) {
  const res = await fetch('/api/admin/accounts/authorize', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, name, role, initialPassword })
  });
  return res.json();
}

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword })
  });
  return res.json();
}

// Mutate Participants
export async function apiAddParticipant(data: Partial<Participant>) {
  const res = await fetch('/api/participants', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function apiUpdateParticipant(id: string, data: Partial<Participant>) {
  const res = await fetch(`/api/participants/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function apiDeleteParticipant(id: string) {
  const res = await fetch(`/api/participants/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return res.json();
}

// Mutate Schedules
export async function apiAddSchedule(data: Partial<EventSchedule>) {
  const res = await fetch('/api/schedules', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function apiUpdateSchedule(id: string, data: Partial<EventSchedule>) {
  const res = await fetch(`/api/schedules/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function apiDeleteSchedule(id: string) {
  const res = await fetch(`/api/schedules/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return res.json();
}

// Mutate Results
export async function apiAddResult(data: Partial<EventResult>) {
  const res = await fetch('/api/results', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function apiUpdateResult(id: string, data: Partial<EventResult>) {
  const res = await fetch(`/api/results/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function apiDeleteResult(id: string) {
  const res = await fetch(`/api/results/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function apiToggleArchiveResult(id: string) {
  const res = await fetch(`/api/results/${id}/archive`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return res.json();
}

// Mutate BEZZA
export async function apiAddBezza(data: Partial<BezzaAchievement>) {
  const res = await fetch('/api/bezza', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function apiUpdateBezza(id: string, data: Partial<BezzaAchievement>) {
  const res = await fetch(`/api/bezza/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function apiDeleteBezza(id: string) {
  const res = await fetch(`/api/bezza/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return res.json();
}

// Live Status
export async function apiUpdateLiveStatus(data: Partial<LiveStatus>) {
  const res = await fetch('/api/live/status', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function apiPostAnnouncement(message: string, type: 'info' | 'urgent' | 'result') {
  const res = await fetch('/api/live/announcement', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message, type })
  });
  return res.json();
}

// Gallery
export async function apiAddGallery(data: Partial<GalleryItem>) {
  const res = await fetch('/api/gallery', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function apiDeleteGallery(id: string) {
  const res = await fetch(`/api/gallery/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return res.json();
}

// Admin Reset & Demo
export async function apiResetDatabase() {
  const res = await fetch('/api/admin/reset-data', {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function apiLoadDemoData() {
  const res = await fetch('/api/admin/load-demo-data', {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function apiUpdateSettings(settingsData: Partial<ScoreboardSettings>) {
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settingsData)
  });
  return res.json();
}
