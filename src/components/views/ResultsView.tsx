import React, { useState } from 'react';
import { Trophy, Plus, Search, Filter, Medal, Award, Flame, Archive, Trash2, Edit2 } from 'lucide-react';
import { ScoreboardState, EventResult, HOUSES } from '../../types/scoreboard';

interface ResultsViewProps {
  data: ScoreboardState;
  isAdmin: boolean;
  onOpenAddModal: () => void;
  onOpenEditModal: (r: EventResult) => void;
  onConfirmDelete: (id: string, name: string) => void;
  onToggleArchive: (id: string) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  data,
  isAdmin,
  onOpenAddModal,
  onOpenEditModal,
  onConfirmDelete,
  onToggleArchive
}) => {
  const { results } = data;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Filter only active results (not archived in main results view)
  const activeResults = results.filter(r => !r.isArchived);

  const filteredResults = activeResults.filter(r => {
    const matchesSearch =
      r.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.entries.some(e => e.participantName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Semua' || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Keputusan Rasmi Acara
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Keputusan muktamad acara balapan dan padang yang telah disahkan oleh juri kejohanan.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Rekod Keputusan Acara</span>
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama acara atau pemenang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="L12">L12</option>
            <option value="P12">P12</option>
            <option value="L10">L10</option>
            <option value="P10">P10</option>
            <option value="L8">L8</option>
            <option value="P8">P8</option>
            <option value="Terbuka">Terbuka</option>
          </select>
        </div>
      </div>

      {/* Results Cards List */}
      {filteredResults.length === 0 ? (
        <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-16 text-center shadow-xl">
          <Medal className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">
            Belum Ada Keputusan Acara
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {results.length === 0
              ? 'Pangkalan data keputusan masih bersih tanpa rekod. Sebaik sahaja pegawai merekodkan pemenang, keputusan rasmi akan dipaparkan di sini.'
              : 'Tiada keputusan acara bertepatan dengan carian atau tapisan anda.'}
          </p>
          {isAdmin && results.length === 0 && (
            <button
              onClick={onOpenAddModal}
              className="mt-4 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Rekod Keputusan Pertama</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredResults.map((r) => {
            const hasNewRecord = r.entries.some(e => e.isNewRecord);

            return (
              <div
                key={r.id}
                className="bg-[#0b1329] border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
              >
                {/* Event Card Header */}
                <div className="bg-slate-900/90 border-b border-slate-800 p-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-blue-900/40 border border-blue-700/50 text-blue-300 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                        {r.category}
                      </span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-slate-300 text-xs font-semibold">{r.round}</span>
                      <span className="text-slate-500 text-xs hidden sm:inline">• Tarikh: {r.dateCompleted}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                      {r.eventName}
                    </h3>
                  </div>

                  {hasNewRecord && (
                    <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase px-2 py-1 rounded-full animate-pulse flex-shrink-0">
                      <Flame className="w-3 h-3 text-amber-400" />
                      Rekod Baharu
                    </span>
                  )}
                </div>

                {/* Winners Podium Table */}
                <div className="p-4 space-y-2.5">
                  {r.entries.map((entry, idx) => {
                    const houseCfg = HOUSES[entry.house];
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs sm:text-sm ${
                          entry.rank === 1
                            ? 'bg-amber-950/20 border-amber-500/30'
                            : entry.rank === 2
                            ? 'bg-slate-800/40 border-slate-700/60'
                            : entry.rank === 3
                            ? 'bg-amber-900/10 border-amber-700/30'
                            : 'bg-slate-900/40 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Rank Badge */}
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 ${
                              entry.rank === 1
                                ? 'bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-950 shadow-md'
                                : entry.rank === 2
                                ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 shadow-md'
                                : entry.rank === 3
                                ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-md'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {entry.rank}
                          </div>

                          <div className="truncate">
                            <div className="font-black text-white truncate flex items-center gap-1.5">
                              <span>{entry.participantName}</span>
                              {entry.isNewRecord && (
                                <span className="text-[9px] font-bold text-amber-400 bg-amber-400/20 px-1 rounded">
                                  REKOD
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                              <span
                                className="w-2 h-2 rounded-full inline-block"
                                style={{ backgroundColor: houseCfg?.hex }}
                              />
                              <span className="font-semibold">{entry.house}</span>
                              {entry.notes && (
                                <>
                                  <span>•</span>
                                  <span className="italic text-slate-400">{entry.notes}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Timing/Distance Score */}
                        <div className="text-right flex-shrink-0 ml-2">
                          <span className="font-mono font-black text-amber-300 text-sm">
                            {entry.recordTimeOrDistance || '-'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Admin Card Footer actions */}
                {isAdmin && (
                  <div className="bg-slate-900/70 border-t border-slate-800/80 px-4 py-2.5 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onToggleArchive(r.id)}
                      className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition"
                      title="Arkibkan Keputusan ini"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>{r.isArchived ? 'Batal Arkib' : 'Pindah ke Arkib'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenEditModal(r)}
                        className="p-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800/60 transition"
                        title="Kemaskini Keputusan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onConfirmDelete(r.id, r.eventName)}
                        className="p-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-800/60 transition"
                        title="Padam Keputusan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
