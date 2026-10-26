import React, { useState } from 'react';
import { Users, Search, Plus, Filter, UserCheck, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import { ScoreboardState, Participant, HOUSES, HouseType } from '../../types/scoreboard';

interface ParticipantsViewProps {
  data: ScoreboardState;
  isAdmin: boolean;
  onOpenAddModal: () => void;
  onOpenEditModal: (p: Participant) => void;
  onConfirmDelete: (id: string, name: string) => void;
}

export const ParticipantsView: React.FC<ParticipantsViewProps> = ({
  data,
  isAdmin,
  onOpenAddModal,
  onOpenEditModal,
  onConfirmDelete
}) => {
  const { participants } = data;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<string>('Semua');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Filtering
  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.bibNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.classYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.eventsRegistered && p.eventsRegistered.some(e => e.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesHouse = selectedHouse === 'Semua' || p.house === selectedHouse;
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;

    return matchesSearch && matchesHouse && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Senarai Pendaftaran Peserta
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pendaftaran rasmi atlet mengikut rumah sukan, nombor bib, dan kategori umur.
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Daftar Peserta Baharu</span>
          </button>
        ) : (
          <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Paparan Awam ({participants.length} Peserta Berdaftar)</span>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama peserta, no. bib, kelas, atau acara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-auto bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="L12">L12 (Lelaki Bawah 12)</option>
              <option value="P12">P12 (Perempuan Bawah 12)</option>
              <option value="L10">L10 (Lelaki Bawah 10)</option>
              <option value="P10">P10 (Perempuan Bawah 10)</option>
              <option value="L8">L8 (Lelaki Bawah 8)</option>
              <option value="P8">P8 (Perempuan Bawah 8)</option>
              <option value="BEZZA">BEZZA (PPKI)</option>
              <option value="Terbuka">Terbuka</option>
            </select>
          </div>
        </div>

        {/* House Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none">
          <button
            onClick={() => setSelectedHouse('Semua')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex-shrink-0 ${
              selectedHouse === 'Semua'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Semua Rumah ({participants.length})
          </button>

          {(['WIRA', 'WAJA', 'JUARA', 'JAGUH', 'BEZZA'] as HouseType[]).map((h) => {
            const count = participants.filter(p => p.house === h).length;
            const houseCfg = HOUSES[h];
            const isSelected = selectedHouse === h;
            return (
              <button
                key={h}
                onClick={() => setSelectedHouse(h)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
                  isSelected
                    ? `${houseCfg.bgGradient} bg-gradient-to-r text-white shadow`
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: houseCfg.hex }}></span>
                <span>{h}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Participants Table / List */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {filteredParticipants.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-300">
              Tiada Rekod Peserta Dijumpai
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {participants.length === 0
                ? 'Pangkalan data peserta masih bersih tanpa rekod. Pentadbir boleh mendaftarkan peserta rasmi menggunakan menu pendaftaran.'
                : 'Tiada peserta bertepatan dengan kriteria carian atau tapisan yang dipilih.'}
            </p>
            {isAdmin && participants.length === 0 && (
              <button
                onClick={onOpenAddModal}
                className="mt-4 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Daftar Peserta Pertama</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6 w-24">No. Bib</th>
                  <th className="py-3.5 px-4 sm:px-6">Nama Peserta</th>
                  <th className="py-3.5 px-3 sm:px-4 text-center">Rumah</th>
                  <th className="py-3.5 px-3 sm:px-4 text-center">Jantina</th>
                  <th className="py-3.5 px-3 sm:px-4 text-center">Kategori</th>
                  <th className="py-3.5 px-3 sm:px-4">Kelas</th>
                  <th className="py-3.5 px-4 sm:px-6">Acara Berdaftar</th>
                  {isAdmin && <th className="py-3.5 px-4 sm:px-6 text-right">Tindakan</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs sm:text-sm">
                {filteredParticipants.map((p) => {
                  const houseCfg = HOUSES[p.house];
                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition">
                      {/* Bib */}
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-black text-amber-300">
                        {p.bibNumber || '-'}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-white">
                        {p.name}
                      </td>

                      {/* House badge */}
                      <td className="py-3.5 px-3 sm:px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black border ${houseCfg.badgeClass}`}>
                          {p.house}
                        </span>
                      </td>

                      {/* Gender */}
                      <td className="py-3.5 px-3 sm:px-4 text-center font-bold text-slate-300">
                        {p.gender === 'L' ? 'Lelaki' : 'Perempuan'}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 sm:px-4 text-center">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs font-semibold">
                          {p.category}
                        </span>
                      </td>

                      {/* Class */}
                      <td className="py-3.5 px-3 sm:px-4 text-slate-300">
                        {p.classYear || '-'}
                      </td>

                      {/* Registered events */}
                      <td className="py-3.5 px-4 sm:px-6">
                        {p.eventsRegistered && p.eventsRegistered.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {p.eventsRegistered.map((ev, i) => (
                              <span key={i} className="bg-slate-800/90 text-cyan-300 border border-cyan-900/50 text-[10px] px-2 py-0.5 rounded-md font-medium">
                                {ev}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-xs">Belum didaftarkan acara</span>
                        )}
                      </td>

                      {/* Admin Actions */}
                      {isAdmin && (
                        <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                          <button
                            onClick={() => onOpenEditModal(p)}
                            className="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-800/60 transition mr-1.5"
                            title="Kemaskini Peserta"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onConfirmDelete(p.id, p.name)}
                            className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/60 transition"
                            title="Padam Peserta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
