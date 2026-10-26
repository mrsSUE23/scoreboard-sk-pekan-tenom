import React, { useState } from 'react';
import { Volume2, VolumeX, RefreshCw, Shield, ShieldCheck, Radio, Menu, LogOut, Lock } from 'lucide-react';
import { toggleThemeMusic, setVolume, isThemePlaying } from '../utils/audioTheme';
import { ScoreboardSettings, AdminUser } from '../types/scoreboard';

interface HeaderProps {
  settings: ScoreboardSettings;
  isAdmin: boolean;
  adminUser?: AdminUser | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  onGoToTab: (tab: string) => void;
  onOpenMenu?: () => void;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
  liveEventName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  isAdmin,
  adminUser,
  onRefresh,
  isRefreshing,
  onGoToTab,
  onOpenMenu,
  onOpenLoginModal,
  onLogout,
  liveEventName
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(isThemePlaying());
  const [showVolume, setShowVolume] = useState<boolean>(false);
  const [volumeLevel, setVolumeLevel] = useState<number>(0.15);

  const handleToggleMusic = () => {
    const running = toggleThemeMusic((state) => setIsPlaying(state));
    setIsPlaying(running);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolumeLevel(val);
    setVolume(val);
  };

  return (
    <header className="relative bg-gradient-to-b from-[#090d16] via-[#0d1527] to-[#0f172a] border-b border-blue-900/40 text-white shadow-2xl overflow-hidden">
      {/* Decorative stadium light rays / backdrop glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[700px] h-32 bg-gradient-to-r from-red-500/15 via-yellow-500/20 to-purple-500/15 blur-2xl pointer-events-none" />

      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-wide uppercase font-semibold text-emerald-400">Papan Skor Rasmi Langsung</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 hidden sm:inline">{settings.location || 'Padang SK Pekan Tenom, Sabah'}</span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Background Music Stadium Sound Control */}
          <div className="relative flex items-center bg-slate-900/90 border border-slate-700/60 rounded-full px-2.5 py-1 text-slate-200 shadow-inner">
            <button
              onClick={handleToggleMusic}
              className={`flex items-center gap-1.5 font-medium transition-colors ${
                isPlaying ? 'text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
              title={isPlaying ? 'Hentikan Muzik Stadium' : 'Mainkan Muzik Semangat Stadium'}
            >
              {isPlaying ? <Volume2 className="w-3.5 h-3.5 animate-pulse text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              <span className="text-[11px] font-semibold">{isPlaying ? 'Muzik Sukan: HIDUP' : 'Muzik Sukan'}</span>
            </button>

            <button
              onClick={() => setShowVolume(!showVolume)}
              className="ml-1 text-slate-400 hover:text-white"
              title="Kawal Kelantangan"
            >
              ⚙
            </button>

            {showVolume && (
              <div className="absolute top-8 right-0 z-50 bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl flex items-center gap-2 w-44 backdrop-blur">
                <span className="text-[10px] text-slate-400">Vol:</span>
                <input
                  type="range"
                  min="0"
                  max="0.3"
                  step="0.02"
                  value={volumeLevel}
                  onChange={handleVolumeChange}
                  className="w-full accent-amber-500 h-1.5 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Refresh Data button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-full transition disabled:opacity-50"
            title="Muat Semula Papan Skor"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline text-[11px]">Segar Semula</span>
          </button>

          {/* Admin Authentication & Status Buttons */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onGoToTab('PENGURUSAN')}
                className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 px-2.5 py-1 rounded-full font-bold text-[11px] transition cursor-pointer"
                title={`Pentadbir Sah: ${adminUser?.name || adminUser?.email || 'Aktif'}`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Pentadbir Sah</span>
                <span className="sm:hidden">Admin</span>
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 bg-red-950/70 hover:bg-red-900 border border-red-700/60 text-red-200 hover:text-white px-2 py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition cursor-pointer"
                  title="Log Keluar Pentadbir"
                >
                  <LogOut className="w-3 h-3 text-red-400" />
                  <span className="hidden md:inline">Log Keluar</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                if (onOpenLoginModal) {
                  onOpenLoginModal();
                } else {
                  onGoToTab('PENGURUSAN');
                }
              }}
              className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-400/50 px-2.5 py-1 rounded-full font-bold text-[11px] transition shadow-sm cursor-pointer"
              title="Buka Borang Log Masuk Pentadbir"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Log Masuk Pentadbir</span>
            </button>
          )}

          {/* Clear & Beautiful "☰ MENU" button in Top Right Corner */}
          {onOpenMenu && (
            <button
              onClick={onOpenMenu}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black px-3.5 py-1 rounded-full text-xs shadow-md shadow-amber-500/25 transition transform hover:scale-105 active:scale-95 cursor-pointer"
              title="Buka Menu Kejohanan"
            >
              <Menu className="w-3.5 h-3.5 text-slate-950" />
              <span className="tracking-wide uppercase font-black">☰ MENU</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Hero Header */}
      <div className="max-w-7xl mx-auto px-4 py-5 sm:py-7 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: School Official Logo Area */}
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl bg-[#080d1a]/95 border border-slate-700/80 p-1.5 shadow-2xl flex items-center justify-center overflow-hidden ring-1 ring-amber-400/20">
              <img
                src={settings.logoUrl || '/logo.png'}
                alt="Lencana Rasmi SK Pekan Tenom"
                className="w-full h-full object-contain filter drop-shadow-md"
              />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-blue-500/20 text-cyan-300 border border-cyan-500/30">
                {settings.schoolName || 'SK PEKAN TENOM'}
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-slate-300 text-xs font-medium tracking-wide">
                {settings.dates || '27–28 Oktober 2026'}
              </span>
            </div>

            {/* Colourful Animated Title */}
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight uppercase leading-tight">
              <span className="bg-gradient-to-r from-red-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent drop-shadow-sm">
                Kejohanan Olahraga
              </span>{' '}
              <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                SK Pekan Tenom
              </span>{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                2026
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 mt-1 italic font-serif">
              "{settings.motto || 'Kecergasan Minda, Ketangkasan Jasmani'}"
            </p>
          </div>
        </div>

        {/* Right: Quick Sports Houses Badge Strip & Action Button */}
        <div className="flex flex-col items-center md:items-end gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1 bg-red-600/20 border border-red-500/40 text-red-300 px-2 py-1 rounded-md text-[11px] font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
              WIRA
            </div>
            <div className="flex items-center gap-1 bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 px-2 py-1 rounded-md text-[11px] font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              WAJA
            </div>
            <div className="flex items-center gap-1 bg-blue-600/20 border border-blue-500/40 text-blue-300 px-2 py-1 rounded-md text-[11px] font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              JUARA
            </div>
            <div className="flex items-center gap-1 bg-amber-600/20 border border-amber-500/40 text-amber-300 px-2 py-1 rounded-md text-[11px] font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
              JAGUH
            </div>
            <div className="flex items-center gap-1 bg-purple-600/20 border border-purple-500/40 text-purple-300 px-2 py-1 rounded-md text-[11px] font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span>
              BEZZA
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
            {/* Ongoing live event badge */}
            <button
              onClick={() => onGoToTab('ACARA LIVE')}
              className="flex items-center gap-2 bg-gradient-to-r from-red-950/80 via-slate-900 to-blue-950/80 border border-red-500/50 hover:border-red-400 px-3 py-1.5 rounded-lg text-xs transition group text-left"
            >
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse flex-shrink-0" />
              <div className="overflow-hidden">
                <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span>Acara Langsung:</span>
                  <span className="animate-ping inline-block w-1.5 h-1.5 rounded-full bg-red-400"></span>
                </div>
                <div className="text-white font-medium truncate text-[11px] group-hover:text-amber-300 transition">
                  {liveEventName || 'Semak Trek & Padang'}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
