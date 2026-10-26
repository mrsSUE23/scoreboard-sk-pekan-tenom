import React from 'react';
import { Trophy, Medal, Radio, Calendar, HeartHandshake, ArrowRight, Sparkles, Award } from 'lucide-react';
import { ScoreboardState, HOUSES } from '../../types/scoreboard';
import { TabKey } from '../Navigation';

interface HomeViewProps {
  data: ScoreboardState;
  onNavigate: (tab: TabKey) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ data, onNavigate }) => {
  const { standings, liveStatus, schedules, results, bezzaAchievements, settings } = data;
  const activeSchedules = schedules.filter(s => s.status === 'Sedang Berlangsung');
  const recentResults = results.filter(r => !r.isArchived).slice(0, 3);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Live Event Alert Banner */}
      {liveStatus.activeEventName && liveStatus.activeEventName !== 'Belum Ada Acara Aktif' ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-blue-950 border-2 border-red-500/60 p-4 sm:p-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <span className="relative flex h-4 w-4 mt-0.5 sm:mt-0 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-red-400 bg-red-500/20 px-2 py-0.5 rounded">
                    SEDANG BERLANGSUNG DI STADIUM
                  </span>
                  <span className="text-slate-400 text-xs hidden md:inline">• {liveStatus.venue}</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-white mt-0.5 tracking-tight">
                  {liveStatus.activeEventName}
                </h3>
                <p className="text-xs text-slate-300">
                  Kategori: <strong className="text-amber-300">{liveStatus.category}</strong> | Pusingan: <strong>{liveStatus.round}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('ACARA LIVE')}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition shadow-lg shadow-red-900/40 flex-shrink-0"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Buka Acara Live</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}

      {/* Hero Welcome & Overview */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0b1426] to-[#0c1833] border border-blue-900/50 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Papan Skor Digital Rasmi • Edisi 2026</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight leading-tight">
            Kejohanan Olahraga Tahunan <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-red-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
              {settings.schoolName || 'SK Pekan Tenom'}
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            Selamat datang warga sekolah, ibu bapa, dan peminat sukan! Saksikan saingan sengit empat rumah sukan utama{' '}
            <span className="text-red-400 font-bold">WIRA</span>,{' '}
            <span className="text-emerald-400 font-bold">WAJA</span>,{' '}
            <span className="text-blue-400 font-bold">JUARA</span>, dan{' '}
            <span className="text-amber-400 font-bold">JAGUH</span>, serta sorakan istimewa penuh kebanggaan untuk kontinjen{' '}
            <span className="text-purple-400 font-bold">BEZZA</span>!
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => onNavigate('KEDUDUKAN PINGAT')}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-amber-950/40"
            >
              <Medal className="w-4 h-4" />
              <span>Lihat Kedudukan Pingat</span>
            </button>

            <button
              onClick={() => onNavigate('JADUAL PERTANDINGAN')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold px-4 py-2.5 rounded-xl text-sm border border-slate-700 transition"
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Jadual Pertandingan</span>
            </button>

            <button
              onClick={() => onNavigate('PENCAPAIAN MURID BEZZA')}
              className="flex items-center gap-2 bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 border border-purple-500/40 font-semibold px-4 py-2.5 rounded-xl text-sm transition"
            >
              <HeartHandshake className="w-4 h-4 text-purple-400" />
              <span>Pencapaian Murid BEZZA</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Houses Quick Scoreboard Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
              Kedudukan Terkini 4 Rumah Sukan
            </h3>
          </div>
          <button
            onClick={() => onNavigate('KEDUDUKAN PINGAT')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            Papar Penuh <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {standings.map((h) => {
            const houseCfg = HOUSES[h.house];
            return (
              <div
                key={h.house}
                className="relative rounded-2xl bg-[#0b1329] border border-slate-800 p-5 shadow-xl hover:border-slate-700 transition duration-300 flex flex-col justify-between"
              >
                {/* Top: House Name & Rank Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20"
                      style={{ backgroundColor: h.color }}
                    />
                    <h4 className="text-base font-black text-white uppercase tracking-wider">
                      {h.name}
                    </h4>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide ${
                      h.rank.includes('1')
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : h.rank.includes('2')
                        ? 'bg-slate-400/20 text-slate-300 border border-slate-400/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {h.rank.startsWith('SERI') ? h.rank : `TEMPAT KE-${h.rank}`}
                  </span>
                </div>

                {/* Medals Counter */}
                <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 text-center my-3">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-400">Emas</div>
                    <div className="text-lg font-black text-white">{h.gold}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-300">Perak</div>
                    <div className="text-lg font-black text-white">{h.silver}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-600">Gangsa</div>
                    <div className="text-lg font-black text-white">{h.bronze}</div>
                  </div>
                </div>

                {/* Footer: Points and total */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-400 font-medium">
                  <span>Jumlah Pingat: <strong className="text-white">{h.totalMedals}</strong></span>
                  <span>Mata: <strong className="text-amber-400">{h.points}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BEZZA Special Feature Section Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-950/80 via-[#1e1035] to-slate-900 border-2 border-purple-500/40 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-purple-900/60 border border-purple-400/60 flex items-center justify-center flex-shrink-0 text-purple-300 shadow-lg shadow-purple-950/50">
              <HeartHandshake className="w-8 h-8 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                  RUMAH BEZZA • PPKI SK PEKAN TENOM
                </span>
                <span className="text-xs text-purple-400 font-medium">
                  ({bezzaAchievements.length} Rekod Pencapaian)
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                Pencapaian & Kebanggaan Murid Berkeperluan Khas BEZZA
              </h3>
              <p className="text-xs sm:text-sm text-purple-200/80 mt-0.5">
                Pencapaian anak-anak syurga diraikan khusus dalam seksyen khas berprestij berasingan demi memartabatkan keupayaan mereka.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('PENCAPAIAN MURID BEZZA')}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-purple-950/40 flex-shrink-0"
          >
            <span>Buka Laman BEZZA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Split Section: Recent Results & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Results */}
        <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Medal className="w-4 h-4 text-amber-400" />
              <h3 className="font-black text-white uppercase text-sm sm:text-base">
                Keputusan Acara Terkini
              </h3>
            </div>
            <button
              onClick={() => onNavigate('KEPUTUSAN ACARA')}
              className="text-xs text-cyan-400 hover:underline"
            >
              Semua Keputusan
            </button>
          </div>

          {recentResults.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <p>Belum ada keputusan rasmi yang direkodkan.</p>
              <p className="text-[11px] text-slate-600 mt-1">Keputusan yang disahkan akan dipaparkan secara langsung di sini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentResults.map((r) => (
                <div
                  key={r.id}
                  className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-white">{r.eventName}</span>
                    <span className="text-[11px] text-slate-400">{r.category} • {r.round}</span>
                  </div>

                  {/* Top entries */}
                  <div className="space-y-1">
                    {r.entries.slice(0, 3).map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                            entry.rank === 1 ? 'bg-amber-400 text-slate-950' :
                            entry.rank === 2 ? 'bg-slate-300 text-slate-950' :
                            'bg-amber-700 text-white'
                          }`}>
                            {entry.rank}
                          </span>
                          <span className="font-semibold text-slate-200 truncate">{entry.participantName}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${HOUSES[entry.house]?.badgeClass || 'bg-slate-800 text-slate-300'}`}>
                            {entry.house}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px] font-mono ml-2">
                          {entry.recordTimeOrDistance || '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stadium Announcements & Live Ticker Feed */}
        <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-400" />
              <h3 className="font-black text-white uppercase text-sm sm:text-base">
                Hebahan Jurucakap Padang
              </h3>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Langsung
            </span>
          </div>

          <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
            {liveStatus.announcements.length === 0 ? (
              <p className="text-center py-8 text-slate-500 text-xs">Tiada hebahan terkini.</p>
            ) : (
              liveStatus.announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-2.5 rounded-xl border text-xs leading-relaxed ${
                    ann.type === 'result'
                      ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                      : ann.type === 'urgent'
                      ? 'bg-red-950/30 border-red-500/30 text-red-200'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-0.5">
                    <span>Masa: {ann.time}</span>
                    <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-slate-800">
                      {ann.type === 'result' ? 'Keputusan' : ann.type === 'urgent' ? 'Penting' : 'Makluman'}
                    </span>
                  </div>
                  <p>{ann.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
