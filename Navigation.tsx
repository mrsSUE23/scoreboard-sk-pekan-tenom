import React, { useEffect } from 'react';
import {
  X,
  Home,
  Medal,
  Users,
  Trophy,
  HeartHandshake,
  CalendarDays,
  Radio,
  Archive,
  Images,
  Settings,
  ChevronRight,
  Check
} from 'lucide-react';

export type TabKey =
  | 'UTAMA'
  | 'KEDUDUKAN PINGAT'
  | 'SENARAI PESERTA'
  | 'KEPUTUSAN ACARA'
  | 'PENCAPAIAN MURID BEZZA'
  | 'JADUAL PERTANDINGAN'
  | 'ACARA LIVE'
  | 'ARKIB KEPUTUSAN'
  | 'GALERI'
  | 'PENGURUSAN';

interface NavigationProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  isOpen: boolean;
  onClose: () => void;
  logoUrl?: string;
  isLiveActive?: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
}

interface MenuItem {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  isLive?: boolean;
  highlight?: boolean;
  bezza?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  {
    key: 'UTAMA',
    label: 'UTAMA',
    icon: Home,
    description: 'Ringkasan & sorotan kejohanan'
  },
  {
    key: 'KEDUDUKAN PINGAT',
    label: 'KEDUDUKAN PINGAT',
    icon: Medal,
    description: 'Carta kutipan pingat 4 rumah sukan'
  },
  {
    key: 'SENARAI PESERTA',
    label: 'SENARAI PESERTA',
    icon: Users,
    description: 'Pendaftaran atlet & kategori umur'
  },
  {
    key: 'KEPUTUSAN ACARA',
    label: 'KEPUTUSAN ACARA',
    icon: Trophy,
    description: 'Pemenang rasmi & rekod baharu'
  },
  {
    key: 'PENCAPAIAN MURID BEZZA',
    label: 'PENCAPAIAN MURID BEZZA',
    icon: HeartHandshake,
    description: 'Pengiktirafan murid PPKI',
    bezza: true
  },
  {
    key: 'JADUAL PERTANDINGAN',
    label: 'JADUAL PERTANDINGAN',
    icon: CalendarDays,
    description: 'Susunan masa, hari & balapan'
  },
  {
    key: 'ACARA LIVE',
    label: 'ACARA LIVE',
    icon: Radio,
    description: 'Status lorong & hebahan langsung',
    isLive: true
  },
  {
    key: 'ARKIB KEPUTUSAN',
    label: 'ARKIB KEPUTUSAN',
    icon: Archive,
    description: 'Rekod & keputusan tersimpan'
  },
  {
    key: 'GALERI',
    label: 'GALERI',
    icon: Images,
    description: 'Lensa foto aksi & sorakan'
  },
  {
    key: 'PENGURUSAN',
    label: 'PENGURUSAN',
    icon: Settings,
    description: 'Portal khas log masuk pentadbir',
    highlight: true
  }
];

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  logoUrl,
  isLiveActive = true,
  isAdmin = false,
  onLogout
}) => {
  // Close menu when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const activeItem = MENU_ITEMS.find((m) => m.key === currentTab) || MENU_ITEMS[0];
  const ActiveIcon = activeItem.icon;

  const handleSelectItem = (key: TabKey) => {
    onSelectTab(key);
    onClose(); // Automatically close menu drawer
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
      {/* Backdrop Blur Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <aside className="relative z-10 w-full max-w-md bg-[#0a0f1d] border-l border-blue-900/60 h-full flex flex-col shadow-2xl text-white">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#0b1329] to-[#0f1b38]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#070b14] border border-slate-700/80 flex items-center justify-center p-1 overflow-hidden flex-shrink-0 shadow-md">
              <img
                src={logoUrl || '/logo.png'}
                alt="Logo Rasmi SK Pekan Tenom"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wide uppercase">
                PILIHAN MENU
              </h3>
              <p className="text-[11px] text-amber-300 font-semibold">
                SK Pekan Tenom • Kejohanan 2026
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            aria-label="Tutup Menu"
            title="Tutup Menu (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Section Reminder */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Sedang dipaparkan:</span>
          <span className="font-bold text-amber-300 flex items-center gap-1.5">
            <ActiveIcon className="w-3.5 h-3.5" />
            <span>{activeItem.label}</span>
          </span>
        </div>

        {/* Menu Items List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5 scrollbar-thin">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.key;

            let borderStyle = 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80';
            let iconColor = 'text-slate-400';
            let textColor = 'text-slate-200';

            if (isActive) {
              if (item.bezza) {
                borderStyle = 'bg-gradient-to-r from-purple-950/80 to-purple-900/60 border-purple-500 shadow-md shadow-purple-950/50';
                iconColor = 'text-purple-300';
                textColor = 'text-white font-black';
              } else if (item.isLive) {
                borderStyle = 'bg-gradient-to-r from-red-950/80 to-rose-900/60 border-red-500 shadow-md shadow-red-950/50';
                iconColor = 'text-red-400';
                textColor = 'text-white font-black';
              } else if (item.highlight) {
                borderStyle = 'bg-gradient-to-r from-emerald-950/80 to-teal-900/60 border-emerald-500 shadow-md shadow-emerald-950/50';
                iconColor = 'text-emerald-300';
                textColor = 'text-white font-black';
              } else {
                borderStyle = 'bg-gradient-to-r from-blue-950/80 to-indigo-900/60 border-blue-500 shadow-md shadow-blue-950/50';
                iconColor = 'text-cyan-300';
                textColor = 'text-white font-black';
              }
            }

            return (
              <button
                key={item.key}
                onClick={() => handleSelectItem(item.key)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition duration-150 group cursor-pointer ${borderStyle}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'bg-slate-900 text-slate-400 group-hover:bg-slate-800 group-hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs sm:text-sm font-extrabold tracking-wide uppercase ${textColor}`}>
                        {item.label}
                      </span>

                      {/* Live pulse dot */}
                      {item.isLive && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      )}

                      {/* BEZZA highlight pill */}
                      {item.bezza && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          PPKI
                        </span>
                      )}

                      {/* Admin Lock Pill */}
                      {item.highlight && isAdmin && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Disahkan
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400/40">
                      <Check className="w-3 h-3 text-amber-400" />
                      <span>Aktif</span>
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#070b14] flex items-center justify-between gap-3 text-xs text-slate-400">
          {isAdmin && onLogout ? (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="text-red-400 hover:text-red-300 font-bold text-xs flex items-center gap-1.5 bg-red-950/60 px-2.5 py-1.5 rounded-lg border border-red-800/60 transition cursor-pointer"
            >
              <span>🚪 Log Keluar Pentadbir</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">Kejohanan Olahraga SK Pekan Tenom</span>
          )}
          <button
            onClick={onClose}
            className="text-amber-400 hover:text-white font-bold text-xs cursor-pointer ml-auto"
          >
            Tutup ✕
          </button>
        </div>
      </aside>
    </div>
  );
};
