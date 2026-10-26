import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Mail,
  UserCheck,
  UserPlus,
  Eye,
  EyeOff,
  Database,
  RefreshCw,
  Plus,
  Users,
  Calendar,
  Trophy,
  HeartHandshake,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  FileText,
  LogOut,
  Server,
  CloudCheck,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { ScoreboardState, AdminUser, AdminAccount } from '../../types/scoreboard';
import {
  loginAdmin,
  logoutAdmin,
  changeAdminPassword,
  apiResetDatabase,
  apiLoadDemoData,
  apiUpdateSettings,
  apiGetAdminAccounts,
  apiAuthorizeAdminAccount,
  apiGetSecurityStatus
} from '../../utils/api';

interface AdminViewProps {
  data: ScoreboardState;
  isAdmin: boolean;
  adminUser?: AdminUser | null;
  onLoginSuccess: (user?: AdminUser) => void;
  onLogoutSuccess: () => void;
  onRefreshData: () => void;
  onOpenAddParticipant: () => void;
  onOpenAddSchedule: () => void;
  onOpenAddResult: () => void;
  onOpenAddBezza: () => void;
  onOpenAddGallery: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  data,
  isAdmin,
  adminUser,
  onLoginSuccess,
  onLogoutSuccess,
  onRefreshData,
  onOpenAddParticipant,
  onOpenAddSchedule,
  onOpenAddResult,
  onOpenAddBezza,
  onOpenAddGallery
}) => {
  const { participants, schedules, results, bezzaAchievements, gallery, settings } = data;

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Change password form state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Authorized Admin Management state
  const [authorizedAdmins, setAuthorizedAdmins] = useState<AdminAccount[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'superadmin'>('admin');
  const [newAdminInitialPassword, setNewAdminInitialPassword] = useState('admin2026');
  const [adminMgmtMsg, setAdminMgmtMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Logo upload state
  const [logoInputUrl, setLogoInputUrl] = useState(settings.logoUrl || '');
  const [isSavingLogo, setIsSavingLogo] = useState(false);
  const [logoNotice, setLogoNotice] = useState<string | null>(null);

  // Database action states
  const [isResetting, setIsResetting] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Load authorized admin accounts when authenticated
  useEffect(() => {
    if (isAdmin) {
      loadAdminAccounts();
    }
  }, [isAdmin]);

  const loadAdminAccounts = async () => {
    setIsLoadingAdmins(true);
    try {
      const res = await apiGetAdminAccounts();
      if (res.success && res.data) {
        setAuthorizedAdmins(res.data);
      }
    } catch {
      // fallback to settings.authorizedAdmins if available
      if (settings.authorizedAdmins) {
        setAuthorizedAdmins(settings.authorizedAdmins);
      }
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim()) {
      setLoginError('Sila masukkan alamat e-mel pentadbir rasmi anda.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Sila masukkan kata laluan pentadbir.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await loginAdmin(loginEmail.trim(), loginPassword);
      if (res.success) {
        setLoginEmail('');
        setLoginPassword('');
        onLoginSuccess(res.user);
      } else {
        setLoginError(res.error || 'Log masuk gagal. Sila semak semula e-mel dan kata laluan anda.');
      }
    } catch (err: unknown) {
      setLoginError(
        err instanceof Error
          ? err.message
          : 'Ralat menyambung ke pelayan pengesahan. Sila cuba lagi.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    onLogoutSuccess();
  };

  const fillPreauthorized = (email: string) => {
    setLoginEmail(email);
    setLoginPassword('admin2026');
    setLoginError('');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'Kata laluan baharu mesti sekurang-kurangnya 6 aksara.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'Kata laluan baharu dan pengesahan tidak sepadan.', type: 'error' });
      return;
    }
    try {
      const res = await changeAdminPassword(currentPassword, newPassword);
      if (res.success) {
        setPasswordMsg({ text: 'Kata laluan pentadbir berjaya dikemas kini!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ text: res.error || 'Gagal menukar kata laluan.', type: 'error' });
      }
    } catch {
      setPasswordMsg({ text: 'Ralat menyambung ke pelayan.', type: 'error' });
    }
  };

  const handleAuthorizeNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminMgmtMsg(null);
    if (!newAdminEmail.trim() || !newAdminName.trim()) {
      setAdminMgmtMsg({ text: 'Sila lengkapkan semua medan nama dan e-mel.', type: 'error' });
      return;
    }

    setIsAuthorizing(true);
    try {
      const res = await apiAuthorizeAdminAccount(
        newAdminEmail.trim(),
        newAdminName.trim(),
        newAdminRole,
        newAdminInitialPassword
      );
      if (res.success) {
        setAdminMgmtMsg({ text: `Pentadbir baharu ${newAdminEmail} telah berjaya dibenarkan!`, type: 'success' });
        setNewAdminEmail('');
        setNewAdminName('');
        setShowAddAdminModal(false);
        loadAdminAccounts();
      } else {
        setAdminMgmtMsg({ text: res.error || 'Gagal menambah pentadbir.', type: 'error' });
      }
    } catch (err: unknown) {
      setAdminMgmtMsg({ text: err instanceof Error ? err.message : 'Ralat menambah pentadbir.', type: 'error' });
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleResetData = async () => {
    const confirm1 = window.confirm(
      'AMARAN: Adakah anda pasti ingin mengosongkan semua data pertandingan?\n\nSemua peserta, jadual, dan keputusan akan diset semula ke rekod kosong yang bersih.'
    );
    if (!confirm1) return;

    setIsResetting(true);
    try {
      const res = await apiResetDatabase();
      if (res.success) {
        setActionNotice('Pangkalan data telah berjaya dikosongkan.');
        onRefreshData();
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleLoadDemo = async () => {
    const confirm = window.confirm(
      'Muat data contoh ujian sukan?\n\nIni akan mengisi data simulasi (peserta, jadual, keputusan 100m, dan pencapaian BEZZA) untuk menguji carta skor. Anda boleh mengosongkannya semula pada bila-bila masa.'
    );
    if (!confirm) return;

    setIsLoadingDemo(true);
    try {
      const res = await apiLoadDemoData();
      if (res.success) {
        setActionNotice('Data simulasi ujian berjaya dimuatkan!');
        onRefreshData();
      }
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const handleDownloadBackup = () => {
    const link = document.createElement('a');
    link.href = '/api/admin/export-backup';
    link.download = 'Sandaran_Pangkalan_Data_SK_Pekan_Tenom_2026.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoInputUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogo = async () => {
    setIsSavingLogo(true);
    setLogoNotice(null);
    try {
      const res = await apiUpdateSettings({ logoUrl: logoInputUrl });
      if (res.success) {
        setLogoNotice('Logo rasmi sekolah berjaya dikemas kini!');
        onRefreshData();
      }
    } finally {
      setIsSavingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    setIsSavingLogo(true);
    setLogoNotice(null);
    try {
      const res = await apiUpdateSettings({ logoUrl: '' });
      if (res.success) {
        setLogoInputUrl('');
        setLogoNotice('Logo rasmi sekolah telah dipadam.');
        onRefreshData();
      }
    } finally {
      setIsSavingLogo(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Portal Pengurusan & Pentadbir Kejohanan
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pengunjung awam boleh melihat papan skor secara bebas. Fungsi pengurusan dilindungi oleh pengesahan e-mel dan token sesi pelayan berterusan.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-red-950/90 hover:bg-red-900 border border-red-700 text-red-200 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-lg cursor-pointer flex-shrink-0"
            title="Log Keluar Sesi Pentadbir"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>LOG KELUAR PENTADBIR</span>
          </button>
        )}
      </div>

      {actionNotice && (
        <div className="bg-emerald-950/70 border border-emerald-500/50 p-3.5 rounded-2xl flex items-center justify-between text-xs text-emerald-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* LOGIN CARD IF NOT AUTHENTICATED */}
      {!isAdmin ? (
        <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-lg mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-3 text-amber-400 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight uppercase">
              Log Masuk Pentadbir
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Sila masukkan <strong className="text-slate-200">alamat e-mel rasmi pentadbir</strong> dan <strong className="text-slate-200">kata laluan</strong> anda untuk mengakses fungsi pengurusan rekod.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-xs text-slate-400 mb-5 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">Kawalan Keselamatan:</strong> Hanya akaun yang telah dibenarkan dalam sistem boleh log masuk. Pendaftaran awam ditutup untuk melindungi data rasmi kejohanan.
            </div>
          </div>

          {loginError && (
            <div className="bg-red-950/80 border border-red-500/60 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-red-200 mb-5 animate-shake">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{loginError}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Alamat E-mel Pentadbir:
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="cth: admin@skpekantenom.edu.my"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-[#080d1a] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Kata Laluan:
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan kata laluan pentadbir"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#080d1a] border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer"
                  title={showPassword ? 'Sembunyikan kata laluan' : 'Pamerkan kata laluan'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Demo Pre-authorized Buttons for Testing */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                Pilih Akaun Pentadbir Rasmi (Ujian / Sedia Dibenarkan):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fillPreauthorized('admin@skpekantenom.edu.my')}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-1 rounded-lg border border-slate-700 transition cursor-pointer"
                >
                  admin@skpekantenom.edu.my
                </button>
                <button
                  type="button"
                  onClick={() => fillPreauthorized('g-64271419@moe-dl.edu.my')}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2.5 py-1 rounded-lg border border-slate-700 transition cursor-pointer"
                >
                  g-64271419@moe-dl.edu.my
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Mengesahkan Identiti Pentadbir...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Log Masuk Sebagai Pentadbir</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">
              Perlindungan Pelayan: Operasi tambah, edit, padam dan simpan dikawal rapi pada paras API pelayan dengan Bearer Token SHA-256.
            </span>
          </div>
        </div>
      ) : (
        /* AUTHENTICATED MANAGEMENT DASHBOARD */
        <div className="space-y-6 sm:space-y-8">
          {/* Admin Status Card */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-[#0a1a24] to-[#0b1329] border border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-700">
                    Sesi Pentadbir Aktif & Sah
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    {adminUser?.email || 'admin@skpekantenom.edu.my'}
                  </span>
                  {adminUser?.role && (
                    <span className="text-[10px] font-bold uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      {adminUser.role === 'superadmin' ? 'Superadmin Kejohanan' : 'Pegawai Teknikal'}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-1">
                  Selamat Bertugas, {adminUser?.name || 'Pentadbir Kejohanan'}
                </h3>
                <p className="text-xs text-slate-400">
                  Anda mempunyai kuasa penuh untuk menambah, mengemaskini, dan memadam rekod kejohanan secara rasmi.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>{showPasswordChange ? 'Tutup Panel' : 'Tukar Kata Laluan'}</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow cursor-pointer"
                title="Tamatkan sesi pentadbir"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Keluar</span>
              </button>
            </div>
          </div>

          {/* Change Password Card */}
          {showPasswordChange && (
            <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-6 shadow-xl animate-fadeIn">
              <h4 className="text-sm font-black text-white uppercase mb-3 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Tukar Kata Laluan Pentadbir</span>
              </h4>

              <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Kata Laluan Semasa:
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#080d1a] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    placeholder="Semasa..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Kata Laluan Baharu:
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#080d1a] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    placeholder="Min 6 aksara..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Sahkan Kata Laluan Baharu:
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#080d1a] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    placeholder="Ulang semula..."
                    required
                  />
                </div>

                <div className="sm:col-span-3 flex items-center justify-between pt-2">
                  {passwordMsg && (
                    <span
                      className={`text-xs ${
                        passwordMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {passwordMsg.text}
                    </span>
                  )}
                  <button
                    type="submit"
                    className="ml-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    Simpan Kata Laluan Baharu
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Quick Registration & Record Entry Hub */}
          <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Tindakan Pantas Pendaftaran & Rekod Sukan</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <button
                onClick={onOpenAddParticipant}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#080d1a] border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition text-center group cursor-pointer"
              >
                <Users className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-white leading-tight">Daftar Peserta</span>
                <span className="text-[10px] text-slate-400 mt-0.5">({participants.length} rekod)</span>
              </button>

              <button
                onClick={onOpenAddSchedule}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#080d1a] border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition text-center group cursor-pointer"
              >
                <Calendar className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-white leading-tight">Jadual Acara</span>
                <span className="text-[10px] text-slate-400 mt-0.5">({schedules.length} acara)</span>
              </button>

              <button
                onClick={onOpenAddResult}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#080d1a] border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition text-center group cursor-pointer"
              >
                <Trophy className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-white leading-tight">Rekod Keputusan</span>
                <span className="text-[10px] text-slate-400 mt-0.5">({results.length} keputusan)</span>
              </button>

              <button
                onClick={onOpenAddBezza}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#080d1a] border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition text-center group cursor-pointer"
              >
                <HeartHandshake className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-white leading-tight">Pencapaian BEZZA</span>
                <span className="text-[10px] text-slate-400 mt-0.5">({bezzaAchievements.length} rekod)</span>
              </button>

              <button
                onClick={onOpenAddGallery}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#080d1a] border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition text-center group cursor-pointer"
              >
                <FileText className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-white leading-tight">Foto Galeri</span>
                <span className="text-[10px] text-slate-400 mt-0.5">({gallery.length} foto)</span>
              </button>
            </div>
          </div>

          {/* Authorized Admin Accounts Management Panel */}
          <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Senarai Akaun Pentadbir Dibenarkan (Access Control)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hanya e-mel yang tersenarai di bawah dibenarkan log masuk untuk mengurus rekod. Pendaftaran awam disekat.
                </p>
              </div>

              <button
                onClick={() => setShowAddAdminModal(!showAddAdminModal)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow cursor-pointer self-start sm:self-auto"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{showAddAdminModal ? 'Batal Tambah' : 'Benarkan Pentadbir Baharu'}</span>
              </button>
            </div>

            {adminMgmtMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  adminMgmtMsg.type === 'success'
                    ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-200'
                    : 'bg-red-950/70 border border-red-500/50 text-red-200'
                }`}
              >
                {adminMgmtMsg.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                )}
                <span>{adminMgmtMsg.text}</span>
              </div>
            )}

            {/* Add New Authorized Admin Form */}
            {showAddAdminModal && (
              <form onSubmit={handleAuthorizeNewAdmin} className="bg-[#080d1a] border border-slate-700/80 rounded-2xl p-4 space-y-3 animate-fadeIn">
                <span className="text-xs font-bold text-amber-300 uppercase block">
                  Daftarkan Akaun Guru / Pegawai Sukan Baharu:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Nama Pegawai:</label>
                    <input
                      type="text"
                      placeholder="cth: Cikgu Ahmad"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Alamat E-mel Rasmi:</label>
                    <input
                      type="email"
                      placeholder="cth: cikgu@moe-dl.edu.my"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Peranan:</label>
                    <select
                      value={newAdminRole}
                      onChange={(e) => setNewAdminRole(e.target.value as 'admin' | 'superadmin')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="admin">Pegawai Teknikal (Admin)</option>
                      <option value="superadmin">Superadmin Kejohanan</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Kata laluan awal lalai: <code className="text-amber-300 font-mono">admin2026</code> (boleh ditukar kemudian)
                  </span>
                  <button
                    type="submit"
                    disabled={isAuthorizing}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-1.5 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isAuthorizing ? 'Menyimpan...' : 'Sahkan & Benarkan'}
                  </button>
                </div>
              </form>
            )}

            {/* List of Authorized Admins */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">E-mel Pentadbir</th>
                    <th className="py-2.5 px-3">Nama Pegawai</th>
                    <th className="py-2.5 px-3">Peranan</th>
                    <th className="py-2.5 px-3">Status Akses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {authorizedAdmins.map((admin, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition">
                      <td className="py-2.5 px-3 font-mono text-slate-200 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{admin.email}</span>
                      </td>
                      <td className="py-2.5 px-3 text-white">{admin.name || '-'}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          admin.role === 'superadmin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {admin.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {admin.isAuthorized ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                            <CheckCircle className="w-3 h-3" />
                            <span>Dibenarkan</span>
                          </span>
                        ) : (
                          <span className="text-red-400 text-[11px] font-bold">Digantung</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Keselamatan & Panduan Konfigurasi Firebase Authentication */}
          <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Status Keselamatan & Integrasi Firebase Authentication</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-emerald-400 mb-1 text-xs font-bold uppercase">
                  <CheckCircle className="w-4 h-4" />
                  <span>Kawalan Akses Pelayan</span>
                </div>
                <div className="text-xs text-slate-300 font-bold">AKTIF & DILINDUNGI</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Semua operasi mutasi (POST, PUT, DELETE) dilindungi token kriptografik Bearer SHA-256. Pengguna luar disekat pada tahap pelayan.
                </p>
              </div>

              <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-emerald-400 mb-1 text-xs font-bold uppercase">
                  <CheckCircle className="w-4 h-4" />
                  <span>Pangkalan Data Berterusan</span>
                </div>
                <div className="text-xs text-slate-300 font-bold">BEROPERASI (Local Persistence)</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Rekod disimpan secara automatik dalam fail JSON pelayan tanpa memerlukan langganan awan berbayar.
                </p>
              </div>

              <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-amber-400 mb-1 text-xs font-bold uppercase">
                  <CloudCheck className="w-4 h-4" />
                  <span>Firebase Authentication</span>
                </div>
                <div className="text-xs text-amber-300 font-bold">MODUL SEDIA (Plug & Play)</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  SDK Firebase Authentication telah dipasang dan disepadukan dalam kod sumber aplikasi.
                </p>
              </div>
            </div>

            {/* Step by step Firebase setup guide for admin */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Panduan Langkah Pengaktifan Firebase Console (Jika Ingin Sambungan Awan Luaran):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                <li>Buka <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-amber-400 underline inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3" /></a> menggunakan akaun Google peribadi atau sekolah.</li>
                <li>Pilih <strong>Add project</strong> dan namakan projek (cth: <code>sk-pekan-tenom-2026</code>).</li>
                <li>Di menu kiri, klik <strong>Build &gt; Authentication &gt; Get started</strong>, kemudian aktifkan <strong>Email/Password</strong> sign-in provider.</li>
                <li>Di bahagian <strong>Users</strong>, klik <strong>Add user</strong> dan masukkan e-mel pentadbir (cth: <code>admin@skpekantenom.edu.my</code>) serta kata laluan.</li>
                <li>Di <strong>Project Settings</strong>, salin kunci konfigurasi web (API Key, Project ID, App ID) ke dalam fail persekitaran (environment variables) aplikasi.</li>
              </ol>
            </div>
          </div>

          {/* Official School Logo Management Card */}
          <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Pengurusan Logo Rasmi Sekolah SK Pekan Tenom</span>
              </h3>
              <span className="text-xs text-slate-400">Dipaparkan di Header & Menu</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Fail logo rasmi SK Pekan Tenom dipaparkan kemas dalam bingkai khusus di sebelah kiri tajuk kejohanan tanpa terpotong dengan nisbah asal terpelihara.
            </p>

            {logoNotice && (
              <div className="bg-emerald-950/70 border border-emerald-500/50 p-2.5 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{logoNotice}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
              <div className="flex-shrink-0">
                <div className="text-[11px] font-bold text-slate-400 mb-1.5 text-center">
                  Pratonton Bingkai:
                </div>
                {logoInputUrl ? (
                  <div className="w-20 h-20 rounded-2xl bg-[#080d1a] border border-slate-700/80 p-1.5 shadow-xl flex items-center justify-center overflow-hidden">
                    <img
                      src={logoInputUrl}
                      alt="Logo Rasmi SK Pekan Tenom"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-[#080d1a] border-2 border-dashed border-slate-700/80 p-2 shadow-xl flex flex-col items-center justify-center text-center overflow-hidden">
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 leading-tight uppercase tracking-wider">
                      RUANG LOGO RASMI
                    </span>
                    <span className="text-[7px] text-slate-500 mt-1 uppercase font-semibold">
                      SK PEKAN TENOM
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 w-full space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Pilih Fail Logo Dari Komputer / Telefon:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="w-full bg-[#080d1a] border border-slate-700 rounded-xl px-3 py-2 text-slate-300 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Atau Masukkan URL Imej Logo:
                  </label>
                  <input
                    type="url"
                    placeholder="https://.../logo.png"
                    value={logoInputUrl}
                    onChange={(e) => setLogoInputUrl(e.target.value)}
                    className="w-full bg-[#080d1a] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveLogo}
                    disabled={isSavingLogo || !logoInputUrl}
                    className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition shadow-md shadow-amber-950/40 cursor-pointer"
                  >
                    {isSavingLogo ? 'Menyimpan...' : 'Simpan & Paparkan Logo'}
                  </button>

                  {settings.logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      disabled={isSavingLogo}
                      className="bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 px-3.5 py-2 rounded-xl text-xs transition cursor-pointer"
                    >
                      Padam Logo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Database Diagnostics & Maintenance Hub */}
          <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Pengurusan Pangkalan Data & Sandaran Sistem</span>
            </h3>

            <p className="text-xs text-slate-400">
              Data disimpan secara berterusan pada storan pelayan tempatan (persistent local server database). Semua rekod kekal tersimpan rapi selepas laman disegarkan semula atau pelayan dimulakan semula.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Load Demo Simulation Data */}
              <button
                onClick={handleLoadDemo}
                disabled={isLoadingDemo}
                className="flex items-center justify-center gap-2 bg-blue-950/70 hover:bg-blue-900 border border-blue-700/60 text-blue-200 p-3 rounded-2xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingDemo ? 'animate-spin' : ''}`} />
                <span>{isLoadingDemo ? 'Memuatkan...' : 'Muat Contoh Data Ujian (Demo)'}</span>
              </button>

              {/* Reset to Clean Empty State */}
              <button
                onClick={handleResetData}
                disabled={isResetting}
                className="flex items-center justify-center gap-2 bg-red-950/70 hover:bg-red-900 border border-red-700/60 text-red-200 p-3 rounded-2xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{isResetting ? 'Mengosongkan...' : 'Set Semula Rekod Kosong'}</span>
              </button>

              {/* Download JSON Backup */}
              <button
                onClick={handleDownloadBackup}
                className="flex items-center justify-center gap-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 p-3 rounded-2xl text-xs font-bold transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Muat Turun Sandaran (JSON)</span>
              </button>
            </div>
          </div>

          {/* Bottom Logout Anchor */}
          <div className="flex justify-end pt-4 pb-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-950/90 hover:bg-red-900 border border-red-700 text-red-200 hover:text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>LOG KELUAR PENTADBIR</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
