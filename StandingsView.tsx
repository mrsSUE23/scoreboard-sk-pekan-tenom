import React, { useState } from 'react';
import { Trophy, Medal, Download, Printer, Info, Sparkles, Award } from 'lucide-react';
import { ScoreboardState, HOUSES, HouseStanding } from '../../types/scoreboard';

interface StandingsViewProps {
  data: ScoreboardState;
}

export const StandingsView: React.FC<StandingsViewProps> = ({ data }) => {
  const { standings, settings } = data;
  const [viewMode, setViewMode] = useState<'medals' | 'points'>('medals');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const link = document.createElement('a');
    link.href = '/api/public/export-standings.csv';
    link.download = 'Kedudukan_Pingat_SK_Pekan_Tenom_2026.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Top 3 for podium (if medals exist)
  const first = standings[0];
  const second = standings[1];
  const third = standings[2];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Papan Kedudukan Pingat Rasmi
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Penentuan kedudukan rasmi mengikut susunan: <span className="text-amber-400 font-bold">Emas</span>, kemudian <span className="text-slate-300 font-bold">Perak</span>, dan <span className="text-amber-600 font-bold">Gangsa</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle (Medals / Points) */}
          <div className="bg-slate-900 border border-slate-700/80 p-0.5 rounded-xl flex text-xs font-semibold">
            <button
              onClick={() => setViewMode('medals')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'medals' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Susunan Pingat
            </button>
            <button
              onClick={() => setViewMode('points')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'points' ? 'bg-blue-600 text-white font-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mata MSSM
            </button>
          </div>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition"
            title="Muat Turun Fail CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition"
            title="Cetak Papan Kedudukan"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* Podium Visualization */}
      <div className="bg-gradient-to-b from-[#0b1428] via-[#09101f] to-[#070b14] border border-blue-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h3 className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Podium Kejuaraan 4 Rumah Sukan</span>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </h3>

        <div className="flex items-end justify-center gap-3 sm:gap-6 max-w-xl mx-auto pt-6">
          {/* 2nd Place */}
          {second && (
            <div className="flex-1 flex flex-col items-center">
              <div className="text-center mb-2">
                <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-300/20 text-slate-200 border border-slate-300/50 flex items-center justify-center text-xs sm:text-sm font-black mx-auto mb-1">
                  2
                </span>
                <div className="text-xs sm:text-sm font-black text-white uppercase">{second.name}</div>
                <div className="text-[11px] text-slate-400 font-bold">{second.gold} Emas • {second.silver} Perak</div>
              </div>
              <div
                className="w-full h-24 sm:h-32 rounded-t-2xl border-t-2 border-x-2 border-slate-400/50 flex items-center justify-center font-black text-slate-300 text-base sm:text-xl shadow-lg"
                style={{ backgroundColor: `${second.color}25` }}
              >
                {second.rank}
              </div>
            </div>
          )}

          {/* 1st Place (Champion) */}
          {first && (
            <div className="flex-1 flex flex-col items-center -mt-6">
              <div className="text-center mb-2">
                <div className="relative inline-block">
                  <Trophy className="w-7 h-7 sm:w-9 sm:h-9 text-amber-400 mx-auto animate-bounce" />
                </div>
                <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-amber-400/20 text-amber-300 border-2 border-amber-400 flex items-center justify-center text-xs sm:text-sm font-black mx-auto mb-1 shadow-lg shadow-amber-500/30">
                  1
                </span>
                <div className="text-xs sm:text-base font-black text-amber-300 uppercase tracking-wide">{first.name}</div>
                <div className="text-[11px] text-amber-200/90 font-bold">{first.gold} Emas • {first.points} Mata</div>
              </div>
              <div
                className="w-full h-32 sm:h-44 rounded-t-2xl border-t-4 border-x-2 border-amber-400/80 flex items-center justify-center font-black text-amber-300 text-lg sm:text-2xl shadow-xl shadow-amber-950/40"
                style={{ backgroundColor: `${first.color}35` }}
              >
                {first.rank}
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {third && (
            <div className="flex-1 flex flex-col items-center">
              <div className="text-center mb-2">
                <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-700/20 text-amber-500 border border-amber-600/50 flex items-center justify-center text-xs sm:text-sm font-black mx-auto mb-1">
                  3
                </span>
                <div className="text-xs sm:text-sm font-black text-white uppercase">{third.name}</div>
                <div className="text-[11px] text-slate-400 font-bold">{third.gold} Emas • {third.bronze} Gangsa</div>
              </div>
              <div
                className="w-full h-20 sm:h-24 rounded-t-2xl border-t-2 border-x-2 border-amber-700/50 flex items-center justify-center font-black text-amber-600 text-base sm:text-xl shadow-lg"
                style={{ backgroundColor: `${third.color}20` }}
              >
                {third.rank}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Official Table */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-4 px-4 sm:px-6 text-center w-24">Kedudukan</th>
                <th className="py-4 px-4 sm:px-6">Rumah Sukan</th>
                <th className="py-4 px-3 sm:px-4 text-center text-amber-400">
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                    <span>Emas</span>
                  </div>
                </th>
                <th className="py-4 px-3 sm:px-4 text-center text-slate-300">
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
                    <span>Perak</span>
                  </div>
                </th>
                <th className="py-4 px-3 sm:px-4 text-center text-amber-600">
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
                    <span>Gangsa</span>
                  </div>
                </th>
                <th className="py-4 px-3 sm:px-4 text-center text-slate-400">Ke-4</th>
                <th className="py-4 px-3 sm:px-4 text-center text-white">Jumlah Pingat</th>
                <th className="py-4 px-4 sm:px-6 text-center text-cyan-400">Jumlah Mata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-sm">
              {standings.map((row) => {
                const isTie = row.isTie;
                return (
                  <tr
                    key={row.house}
                    className="hover:bg-slate-900/50 transition duration-150"
                  >
                    {/* Rank with SERI indication */}
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-black tracking-wider ${
                          row.rawRank === 1
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                            : row.rawRank === 2
                            ? 'bg-slate-400/20 text-slate-300 border border-slate-400/40'
                            : row.rawRank === 3
                            ? 'bg-amber-700/20 text-amber-500 border border-amber-600/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {row.rank}
                      </span>
                    </td>

                    {/* House Name & Color indicator */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-white/20 shadow"
                          style={{ backgroundColor: row.color }}
                        />
                        <div>
                          <div className="font-black text-white tracking-wide text-base">
                            {row.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {HOUSES[row.house].colorName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Gold */}
                    <td className="py-4 px-3 sm:px-4 text-center font-black text-amber-300 text-base">
                      {row.gold}
                    </td>

                    {/* Silver */}
                    <td className="py-4 px-3 sm:px-4 text-center font-black text-slate-200 text-base">
                      {row.silver}
                    </td>

                    {/* Bronze */}
                    <td className="py-4 px-3 sm:px-4 text-center font-black text-amber-500 text-base">
                      {row.bronze}
                    </td>

                    {/* 4th */}
                    <td className="py-4 px-3 sm:px-4 text-center font-semibold text-slate-400">
                      {row.fourth}
                    </td>

                    {/* Total Medals */}
                    <td className="py-4 px-3 sm:px-4 text-center font-black text-white text-base">
                      {row.totalMedals}
                    </td>

                    {/* Points */}
                    <td className="py-4 px-4 sm:px-6 text-center font-black text-cyan-300 text-lg">
                      {row.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rules and Explanation Notice */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-200">
            Ketetapan Pengiraan Kedudukan & Formula Mata:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-400">
            <li>Susunan rasmi adalah secara automatik berasaskan kutipan pingat: <strong>Emas</strong> terlebih dahulu, disusuli <strong>Perak</strong> dan <strong>Gangsa</strong>.</li>
            <li>Jika terdapat persamaan penuh pingat (Emas, Perak, Gangsa sama), sistem memaparkan label <strong>SERI</strong> secara automatik.</li>
            <li>Formula Mata Keseluruhan MSSM: Emas = 7 mata, Perak = 5 mata, Gangsa = 3 mata, Tempat Ke-4 = 1 mata.</li>
            <li><strong>Catatan Kontinjen BEZZA:</strong> Pencapaian murid BEZZA (PPKI) diraikan dan dipaparkan dalam seksyen khas berasingan (PENCAPAIAN MURID BEZZA) dan tidak dimasukkan ke dalam kutipan 4 rumah sukan ini mengikut ketetapan penganjuran kejohanan.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
