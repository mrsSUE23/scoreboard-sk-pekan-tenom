import React, { useState } from 'react';
import { HeartHandshake, Plus, Award, Medal, Sparkles, Star, Search, Trash2, Edit2, Shield } from 'lucide-react';
import { ScoreboardState, BezzaAchievement } from '../../types/scoreboard';

interface BezzaViewProps {
  data: ScoreboardState;
  isAdmin: boolean;
  onOpenAddModal: () => void;
  onOpenEditModal: (b: BezzaAchievement) => void;
  onConfirmDelete: (id: string, name: string) => void;
}

export const BezzaView: React.FC<BezzaViewProps> = ({
  data,
  isAdmin,
  onOpenAddModal,
  onOpenEditModal,
  onConfirmDelete
}) => {
  const { bezzaAchievements } = data;
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = bezzaAchievements.filter(b =>
    b.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.achievement.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Showcase Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-purple-950 via-[#1e0f36] to-slate-900 border-2 border-purple-500/50 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Program Pendidikan Khas Integrasi (PPKI) • Rumah Bezza</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Pencapaian Murid Berkeperluan Khas BEZZA
            </h2>

            <p className="text-purple-200/90 text-sm sm:text-base mt-2 leading-relaxed">
              Ruang khas berprestij bagi meraikan ketabahan, semangat waja dan kegemilangan murid-murid PPKI SK Pekan Tenom. Sukan untuk semua tanpa ada yang tertinggal.
            </p>

            <div className="flex items-center gap-4 mt-4 text-xs font-semibold text-purple-300">
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Anugerah Semangat Waja</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Medal className="w-4 h-4 text-purple-400" />
                <span>{bezzaAchievements.length} Pengiktirafan Rasmi</span>
              </span>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={onOpenAddModal}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black px-5 py-3 rounded-2xl text-sm transition shadow-lg shadow-purple-950/60 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pencapaian Murid</span>
            </button>
          )}
        </div>
      </div>

      {/* Notice Banner */}
      <div className="bg-purple-950/40 border border-purple-800/60 rounded-2xl p-4 text-xs text-purple-200/90 flex items-start gap-3">
        <HeartHandshake className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Prinsip Inklusif & Khas:</span>{' '}
          Bagi menghargai keunikan dan potensi anak-anak BEZZA, semua pencapaian, medal, dan anugerah khas mereka dipaparkan eksklusif di sini dan tidak digabungkan dalam carta kedudukan 4 rumah sukan arus perdana.
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama murid, acara atau pencapaian BEZZA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-purple-900/60 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Achievement Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-16 text-center shadow-xl">
          <HeartHandshake className="w-14 h-14 text-purple-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">
            Belum Ada Rekod Pencapaian BEZZA
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {bezzaAchievements.length === 0
              ? 'Pangkalan data BEZZA masih bersih. Guru pembimbing atau pentadbir boleh merekodkan kejayaan murid-murid PPKI di sini.'
              : 'Tiada pencapaian bertepatan dengan kata kunci carian anda.'}
          </p>
          {isAdmin && bezzaAchievements.length === 0 && (
            <button
              onClick={onOpenAddModal}
              className="mt-4 inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Daftar Pencapaian BEZZA Pertama</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((b) => {
            const isGold = b.achievement === 'Pingat Emas';
            const isSilver = b.achievement === 'Pingat Perak';
            const isBronze = b.achievement === 'Pingat Gangsa';
            const isSpecial = b.achievement.includes('Anugerah');

            return (
              <div
                key={b.id}
                className="relative bg-gradient-to-b from-[#140e24] to-[#0c0918] border border-purple-800/50 rounded-2xl p-5 shadow-xl hover:border-purple-500/80 transition duration-300 flex flex-col justify-between group"
              >
                {/* Glow accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/20 transition" />

                <div>
                  {/* Top Badge: Category & Medal */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                      {b.category || 'PPKI Tenom'}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                        isGold
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                          : isSilver
                          ? 'bg-slate-300/20 text-slate-200 border-slate-300/50'
                          : isBronze
                          ? 'bg-amber-700/20 text-amber-500 border-amber-600/50'
                          : isSpecial
                          ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50 animate-pulse'
                          : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{b.achievement}</span>
                    </span>
                  </div>

                  {/* Student Name */}
                  <h3 className="text-lg font-black text-white group-hover:text-purple-300 transition">
                    {b.studentName}
                  </h3>

                  {/* Event Name */}
                  <div className="text-xs font-bold text-amber-400 mt-1">
                    Acara: {b.event}
                  </div>

                  {/* Score or Record */}
                  {b.recordScore && (
                    <div className="inline-block bg-purple-950/80 border border-purple-800/80 px-2.5 py-1 rounded-lg text-xs font-mono font-black text-white mt-2.5">
                      Catatan: <span className="text-amber-300">{b.recordScore}</span>
                    </div>
                  )}

                  {/* Remarks */}
                  {b.remarks && (
                    <p className="text-xs text-purple-200/80 italic mt-3 bg-purple-950/30 p-2.5 rounded-xl border border-purple-900/40 leading-relaxed">
                      "{b.remarks}"
                    </p>
                  )}
                </div>

                {/* Footer Date & Admin Controls */}
                <div className="pt-4 mt-4 border-t border-purple-900/50 flex items-center justify-between text-[11px] text-purple-400 font-medium">
                  <span>Tarikh: {b.date || '-'}</span>

                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenEditModal(b)}
                        className="p-1 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 transition"
                        title="Kemaskini Rekod"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onConfirmDelete(b.id, `${b.studentName} (${b.event})`)}
                        className="p-1 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 transition"
                        title="Padam Rekod"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
