import React, { useState } from 'react';
import { Archive, Search, Download, Printer, Medal, RefreshCw, Trophy } from 'lucide-react';
import { ScoreboardState, EventResult, HOUSES } from '../../types/scoreboard';

interface ArchiveViewProps {
  data: ScoreboardState;
  isAdmin: boolean;
  onToggleArchive: (id: string) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  data,
  isAdmin,
  onToggleArchive
}) => {
  const { results, settings } = data;
  const [searchTerm, setSearchTerm] = useState('');

  // Archived results
  const archivedResults = results.filter(r => r.isArchived);

  const filtered = archivedResults.filter(r =>
    r.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.entries.some(e => e.participantName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Archive className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Arkib Rekod & Keputusan Lalu
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simpanan arkib rasmi rekod kejohanan, pusingan terdahulu dan keputusan tersimpan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Cetak Arkib</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari keputusan dalam arkib..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-16 text-center shadow-xl">
          <Archive className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">
            Tiada Rekod Di Dalam Arkib
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {archivedResults.length === 0
              ? 'Semua keputusan semasa masih aktif dalam menu KEPUTUSAN ACARA. Pentadbir boleh mengarkibkan acara dari menu keputusan apabila selesai.'
              : 'Tiada rekod arkib bertepatan dengan kata carian anda.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-[#0b1329] border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                  {r.category} • {r.round}
                </span>
                <span className="text-xs text-slate-500">Tarikh: {r.dateCompleted}</span>
              </div>

              <h4 className="text-base font-black text-white mb-3">{r.eventName}</h4>

              <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 text-xs">
                {r.entries.map((e, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-[10px] font-bold text-amber-400">#{e.rank}</span>
                      <span className="font-semibold text-slate-200 truncate">{e.participantName}</span>
                      <span className="text-[10px] text-slate-400 font-bold">({e.house})</span>
                    </div>
                    <span className="font-mono text-amber-300 text-[11px] ml-2">{e.recordTimeOrDistance}</span>
                  </div>
                ))}
              </div>

              {isAdmin && (
                <div className="mt-3 pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => onToggleArchive(r.id)}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Keluarkan Dari Arkib</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
