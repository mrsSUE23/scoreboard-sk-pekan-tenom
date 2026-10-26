import React, { useState } from 'react';
import { Radio, Send, Plus, Users, Clock, AlertTriangle, CheckCircle, RefreshCw, Trophy, Sparkles } from 'lucide-react';
import { ScoreboardState, LiveStatus, HOUSES, LaneStatus } from '../../types/scoreboard';

interface LiveViewProps {
  data: ScoreboardState;
  isAdmin: boolean;
  onUpdateLiveStatus: (newStatus: Partial<LiveStatus>) => Promise<void>;
  onPostAnnouncement: (msg: string, type: 'info' | 'urgent' | 'result') => Promise<void>;
}

export const LiveView: React.FC<LiveViewProps> = ({
  data,
  isAdmin,
  onUpdateLiveStatus,
  onPostAnnouncement
}) => {
  const { liveStatus, schedules } = data;
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementType, setAnnouncementType] = useState<'info' | 'urgent' | 'result'>('info');
  const [isSubmittingAnnouncement, setIsSubmittingAnnouncement] = useState(false);
  const [isUpdatingEvent, setIsUpdatingEvent] = useState(false);

  // Quick announcement submission
  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    setIsSubmittingAnnouncement(true);
    try {
      await onPostAnnouncement(announcementText.trim(), announcementType);
      setAnnouncementText('');
    } finally {
      setIsSubmittingAnnouncement(false);
    }
  };

  // Change live active event from schedule
  const handleSelectActiveEvent = async (scheduleId: string) => {
    const selected = schedules.find(s => s.id === scheduleId);
    if (!selected) return;

    setIsUpdatingEvent(true);
    try {
      await onUpdateLiveStatus({
        activeEventId: selected.id,
        activeEventName: selected.name,
        category: selected.category,
        round: selected.round,
        venue: selected.venue
      });
    } finally {
      setIsUpdatingEvent(false);
    }
  };

  // Quick lane update (admin)
  const handleUpdateLaneStatus = async (laneIdx: number, newLaneStatus: 'Sedia' | 'Berlepas' | 'Semakan' | 'Selesai') => {
    const updatedLanes = [...liveStatus.lanes];
    if (updatedLanes[laneIdx]) {
      updatedLanes[laneIdx] = {
        ...updatedLanes[laneIdx],
        status: newLaneStatus
      };
      await onUpdateLiveStatus({ lanes: updatedLanes });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Live Stadium Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-red-950 via-[#160c1d] to-slate-900 border-2 border-red-500/70 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-xs font-black tracking-widest uppercase text-red-400 bg-red-500/20 px-2.5 py-0.5 rounded-full border border-red-500/30">
                Pusat Kawalan & Acara Langsung
              </span>
              <span className="text-slate-400 text-xs">• {liveStatus.venue || 'Padang SK Pekan Tenom'}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              {liveStatus.activeEventName || 'Belum Ada Acara Aktif'}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 mt-2">
              <span>Kategori: <strong className="text-amber-300">{liveStatus.category || '-'}</strong></span>
              <span>•</span>
              <span>Pusingan: <strong className="text-white">{liveStatus.round || '-'}</strong></span>
              <span>•</span>
              <span className="text-slate-400">Kemaskini: {new Date(liveStatus.updatedAt).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Admin Live Selector */}
          {isAdmin && (
            <div className="bg-slate-900/90 border border-slate-700 p-3.5 rounded-2xl flex flex-col gap-2 min-w-[260px] shadow-lg">
              <label className="text-[11px] font-black uppercase text-amber-400 tracking-wider">
                Pilih Acara Semasa:
              </label>
              <select
                onChange={(e) => handleSelectActiveEvent(e.target.value)}
                value={liveStatus.activeEventId || ''}
                className="bg-slate-950 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-red-500"
              >
                <option value="">-- Pilih Dari Jadual --</option>
                {schedules.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.eventCode}: {s.name} ({s.round})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Live Lanes & Live Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lanes Tracker (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0b1329] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-500 animate-pulse" />
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                Susunan Lorong / Peserta Semasa
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {liveStatus.lanes.length} Lorong Berdaftar
            </span>
          </div>

          {liveStatus.lanes.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p>Belum ada susunan lorong aktif.</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {isAdmin ? 'Pentadbir boleh menjana lorong untuk acara ini melalui panel kawalan.' : 'Pegawai trek akan memasukkan susunan lorong sebelum acara dilepaskan.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {liveStatus.lanes.map((lane, idx) => {
                const houseCfg = HOUSES[lane.house];
                return (
                  <div
                    key={idx}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 hover:border-slate-700 transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {/* Lane Number Pill */}
                      <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-700 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[8px] font-bold text-slate-400 leading-none">LORONG</span>
                        <span className="text-base font-black text-white leading-none mt-0.5">{lane.laneNumber}</span>
                      </div>

                      <div className="truncate">
                        <div className="font-bold text-white text-xs sm:text-sm truncate">
                          {lane.participantName}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: houseCfg?.hex }}
                          />
                          <span className="font-bold text-slate-300">{lane.house}</span>
                          {lane.interimResult && (
                            <span className="text-amber-400 font-mono font-bold">• {lane.interimResult}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status badge & Admin control */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          lane.status === 'Berlepas'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            : lane.status === 'Selesai'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : lane.status === 'Semakan'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {lane.status}
                      </span>

                      {isAdmin && (
                        <select
                          value={lane.status}
                          onChange={(e) =>
                            handleUpdateLaneStatus(
                              idx,
                              e.target.value as 'Sedia' | 'Berlepas' | 'Semakan' | 'Selesai'
                            )
                          }
                          className="bg-slate-950 text-[10px] text-slate-300 border border-slate-700 rounded px-1.5 py-0.5 focus:outline-none"
                        >
                          <option value="Sedia">Sedia</option>
                          <option value="Berlepas">Berlepas</option>
                          <option value="Semakan">Semakan</option>
                          <option value="Selesai">Selesai</option>
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Announcements Column (1 Col) */}
        <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Hebahan Semasa Juruhebah</span>
              </h3>
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {liveStatus.announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    ann.type === 'result'
                      ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                      : ann.type === 'urgent'
                      ? 'bg-red-950/20 border-red-500/30 text-red-200'
                      : 'bg-slate-900/90 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-bold">
                    <span>Masa: {ann.time}</span>
                    <span className="uppercase text-[9px] px-1.5 py-0.2 rounded bg-slate-800">
                      {ann.type}
                    </span>
                  </div>
                  <p>{ann.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Publish Box */}
          {isAdmin && (
            <form onSubmit={handleSendAnnouncement} className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-bold">Jenis:</span>
                <select
                  value={announcementType}
                  onChange={(e) => setAnnouncementType(e.target.value as 'info' | 'urgent' | 'result')}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1"
                >
                  <option value="info">Hebahan Biasa</option>
                  <option value="result">Keputusan Acara</option>
                  <option value="urgent">Panggilan Kecemasan / Segera</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Taip hebahan juruhebah padang..."
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  disabled={isSubmittingAnnouncement || !announcementText.trim()}
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Siarkan</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
