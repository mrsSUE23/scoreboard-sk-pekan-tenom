import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { readDatabase, AdminAccount } from './db';

export interface AdminUser {
  email: string;
  name: string;
  role: 'superadmin' | 'admin';
}

interface Session {
  token: string;
  user: AdminUser;
  createdAt: number;
  expiresAt: number;
}

// Active in-memory session tokens with timeout (24 hours)
const activeSessions: Map<string, Session> = new Map();
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function createSessionToken(user: AdminUser): string {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  activeSessions.set(token, {
    token,
    user,
    createdAt: now,
    expiresAt: now + SESSION_DURATION_MS
  });
  return token;
}

export function verifySessionToken(token: string | undefined): { valid: boolean; user?: AdminUser } {
  if (!token) return { valid: false };
  const session = activeSessions.get(token);
  if (!session) return { valid: false };
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return { valid: false };
  }
  return { valid: true, user: session.user };
}

export function revokeSessionToken(token: string): void {
  activeSessions.delete(token);
}

export function authenticateAdminCredentials(
  emailInput: string,
  passwordInput: string
): { success: boolean; user?: AdminUser; error?: string } {
  if (!emailInput || !passwordInput) {
    return { success: false, error: 'Sila lengkapkan kedua-dua medan e-mel dan kata laluan.' };
  }

  const cleanEmail = emailInput.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, error: 'Format e-mel tidak sah. Sila masukkan alamat e-mel yang betul.' };
  }

  const data = readDatabase();
  const inputHash = hashPassword(passwordInput);

  const authorizedAdmins = data.settings.authorizedAdmins || [];
  const foundAdmin = authorizedAdmins.find(
    a => a.email.trim().toLowerCase() === cleanEmail
  );

  if (!foundAdmin) {
    return {
      success: false,
      error: `Akses Ditolak: E-mel (${cleanEmail}) tidak dibenarkan atau belum didaftarkan sebagai pentadbir rasmi.`
    };
  }

  if (!foundAdmin.isAuthorized) {
    return {
      success: false,
      error: 'Akaun pentadbir ini telah digantung atau dinyahaktifkan.'
    };
  }

  // Check against individual passwordHash or fallback master passwordHash
  const isMatch = (foundAdmin.passwordHash === inputHash) || (data.settings.adminPasswordHash === inputHash);

  if (!isMatch) {
    return {
      success: false,
      error: 'Kata laluan tidak tepat. Sila semak semula kata laluan anda.'
    };
  }

  return {
    success: true,
    user: {
      email: foundAdmin.email,
      name: foundAdmin.name,
      role: foundAdmin.role
    }
  };
}

// Express authentication middleware
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Akses Ditolak: Anda perlu log masuk sebagai Pentadbir yang dibenarkan untuk menyimpan atau mengubah rekod.'
    });
  }

  const token = authHeader.split(' ')[1];
  const { valid, user } = verifySessionToken(token);
  if (!valid || !user) {
    return res.status(403).json({
      success: false,
      error: 'Sesi log masuk anda telah tamat tempoh atau tidak sah. Sila log masuk semula.'
    });
  }

  (req as any).adminUser = user;
  next();
}
