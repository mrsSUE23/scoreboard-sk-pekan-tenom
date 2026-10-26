import React, { useState } from 'react';
import { CalendarDays, Plus, Clock, MapPin, CheckCircle, Play, AlertCircle, Trash2, Edit2, Filter } from 'lucide-react';
import { ScoreboardState, EventSchedule } from '../../types/scoreboard';

interface ScheduleViewProps {
  data: ScoreboardState;
  isAdmin: boolean;
  onOpenAddModal: () => void;
  onOpenEditModal: (s: EventSchedule) => void;
  onConfirmDelete: (id: string, name: string) => void;
  onUpdateStatus?: (s: EventSchedule, newStatus: 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai') => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  data,
  isAdmin,
  onOpenAddModal,
  onOpenEditModal,
  onConfirmDelete,
  onUpdateStatus
}) => {
  const { schedules } = data;
  const [selectedDay, setSelectedDay] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');

  // Days list from schedules
  const availableDays = Array.from(new Set(schedules.map(s => s.day).filter(Boolean)));

  const filteredSchedules = schedules.filter(s => {
    const matchesDay = selectedDay === 'Semua' || s.day === selectedDay;
    const matchesStatus = selectedStatus === 'Semua' || s.status === selectedStatus;
    return matchesDay && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Jadual Pertandingan Acara
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Susunan masa, balapan, padang dan status pelaksanaan setiap acara kejohanan.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Acara Jadual</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Day Filter */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Hari:
          </span>
          <button
            onClick={() => setSelectedDay('Semua')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex-shrink-0 ${
              selectedDay === 'Semua' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Semua Hari
          </button>
          {availableDays.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex-shrink-0 ${
                selectedDay === d ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          <span className="text-xs font-bold text-slate-400">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="Semua">Semua Status</option>
            <option value="Akan Datang">Akan Datang</option>
            <option value="Sedang Berlangsung">Sedang Berlangsung</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Schedule Items List */}
      {filteredSchedules.length === 0 ? (
        <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-16 text-center shadow-xl">
          <CalendarDays className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">
            Tiada Jadual Acara
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {schedules.length === 0
              ? 'Pangkalan data jadual masih bersih tanpa rekod. Pentadbir kejohanan boleh memasukkan jadual acara di sini.'
              : 'Tiada acara bertepatan dengan tapisan yang dipilih.'}
          </p>
          {isAdmin && schedules.length === 0 && (
            <button
              onClick={onOpenAddModal}
              className="mt-4 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Daftar Acara Pertama</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSchedules.map((s) => {
            const isLive = s.status === 'Sedang Berlangsung';
            const isFinished = s.status === 'Selesai';

            return (
              <div
                key={s.id}
                className={`bg-[#0b1329] border rounded-2xl p-4 sm:p-5 transition shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isLive
                    ? 'border-red-500/80 bg-gradient-to-r from-red-950/30 to-[#0b1329] shadow-red-950/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Left info: Code, Time, Details */}
                <div className="flex items-start sm:items-center gap-4">
                  {/* Event Code & Time Box */}
                  <div className="flex-shrink-0 text-center bg-slate-900 border border-slate-800 p-2.5 rounded-xl min-w-[85px]">
                    <div className="font-mono text-xs font-black text-amber-300">
                      {s.eventCode}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-300 mt-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{s.time}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                        {s.category}
                      </span>
                      <span className="text-slate-500 text-xs">•</span>
                      <span className="text-xs font-bold text-slate-300">
                        {s.round}
                      </span>
                      <span className="text-slate-500 text-xs hidden sm:inline">•</span>
                      <span className="text-xs text-slate-400 hidden sm:inline">
                        {s.day}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white">
                      {s.name}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        <span>{s.venue}</span>
                      </span>
                      {s.notes && (
                        <span className="italic text-slate-400 hidden sm:inline">
                          — {s.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status badge & Admin controls */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide border ${
                      isLive
                        ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse'
                        : isFinished
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {isLive && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
                    {isFinished && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                    {!isLive && !isFinished && <Clock className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{s.status}</span>
                  </span>

                  {/* Admin Fast Actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      {/* Fast Toggle Status */}
                      {onUpdateStatus && (
                        <select
                          value={s.status}
                          onChange={(e) =>
                            onUpdateStatus(s, e.target.value as 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai')
                          }
                          className="bg-slate-900 border border-slate-700 text-[11px] font-bold text-slate-300 rounded-lg px-2 py-1 focus:outline-none"
                          title="Tukar Status Pantas"
                        >
                          <option value="Akan Datang">Akan Datang</option>
                          <option value="Sedang Berlangsung">Sedang Berlangsung</option>
                          <option value="Selesai">Selesai</option>
                        </select>
                      )}

                      <button
                        onClick={() => onOpenEditModal(s)}
                        className="p-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800/60 transition"
                        title="Kemaskini Acara"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onConfirmDelete(s.id, `${s.eventCode} - ${s.name}`)}
                        className="p-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-800/60 transition"
                        title="Padam dari Jadual"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
