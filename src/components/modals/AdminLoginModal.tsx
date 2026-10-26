import React, { useState } from 'react';
import { Shield, Lock, Key, Mail, AlertTriangle, Eye, EyeOff, CheckCircle2, X } from 'lucide-react';
import { loginAdmin } from '../../utils/api';
import { AdminUser } from '../../types/scoreboard';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user?: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Sila masukkan alamat e-mel pentadbir rasmi anda.');
      return;
    }
    if (!password) {
      setErrorMsg('Sila masukkan kata laluan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginAdmin(email.trim(), password);
      if (res.success) {
        setEmail('');
        setPassword('');
        setErrorMsg('');
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.error || 'Log masuk gagal. Sila semak semula e-mel dan kata laluan anda.');
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Ralat menyambung ke pelayan pengesahan. Sila cuba sebentar lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickCredential = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('admin2026');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-[#0b1329] border border-slate-700/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Log Masuk Pentadbir
              </h3>
              <p className="text-[11px] text-amber-400/90 font-medium">
                SK Pekan Tenom 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-xs text-slate-400 leading-relaxed">
            <span className="text-slate-200 font-semibold">Akses Terkawal:</span> Pengunjung awam boleh melihat papan skor secara bebas. Log masuk dengan e-mel & kata laluan hanya untuk pegawai sukan yang dibenarkan bagi mengurus data kejohanan.
          </div>

          {errorMsg && (
            <div className="bg-red-950/80 border border-red-500/60 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-red-200 animate-shake">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Alamat E-mel Pentadbir:
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cth: admin@skpekantenom.edu.my"
                  autoFocus
                  required
                  className="w-full bg-[#080d1a] border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Kata Laluan Pentadbir:
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata laluan"
                  required
                  className="w-full bg-[#080d1a] border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none"
                  title={showPassword ? 'Sembunyikan kata laluan' : 'Pamerkan kata laluan'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Demo/Pre-authorized credentials shortcut for school tester */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Akaun Pentadbir Dibenarkan:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => fillQuickCredential('admin@skpekantenom.edu.my')}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 px-2 py-0.5 rounded-md border border-slate-700 transition"
                >
                  admin@skpekantenom.edu.my
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickCredential('g-64271419@moe-dl.edu.my')}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2 py-0.5 rounded-md border border-slate-700 transition"
                >
                  g-64271419@moe-dl.edu.my
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-bold transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Mengesahkan...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Log Masuk Pentadbir</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
