import React, { useState, useEffect } from 'react';
import { X, CalendarPlus, Save } from 'lucide-react';
import { EventSchedule } from '../../types/scoreboard';

interface ScheduleModalProps {
  isOpen: boolean;
  schedule?: EventSchedule | null;
  onClose: () => void;
  onSave: (data: Partial<EventSchedule>) => Promise<void>;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  schedule,
  onClose,
  onSave
}) => {
  const [eventCode, setEventCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('L12');
  const [day, setDay] = useState('Hari 1 (Selasa)');
  const [time, setTime] = useState('08:00 AM');
  const [venue, setVenue] = useState('Balapan Utama');
  const [round, setRound] = useState('Akhir');
  const [status, setStatus] = useState<'Akan Datang' | 'Sedang Berlangsung' | 'Selesai'>('Akan Datang');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (schedule) {
      setEventCode(schedule.eventCode || '');
      setName(schedule.name || '');
      setCategory(schedule.category || 'L12');
      setDay(schedule.day || 'Hari 1 (Selasa)');
      setTime(schedule.time || '08:00 AM');
      setVenue(schedule.venue || 'Balapan Utama');
      setRound(schedule.round || 'Akhir');
      setStatus(schedule.status || 'Akan Datang');
      setNotes(schedule.notes || '');
    } else {
      setEventCode('');
      setName('');
      setCategory('L12');
      setDay('Hari 1 (Selasa)');
      setTime('08:00 AM');
      setVenue('Balapan Utama');
      setRound('Akhir');
      setStatus('Akan Datang');
      setNotes('');
    }
    setError('');
  }, [schedule, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Sila masukkan nama acara.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await onSave({
        eventCode: eventCode.trim(),
        name: name.trim(),
        category,
        day,
        time,
        venue,
        round,
        status,
        notes: notes.trim()
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan jadual acara.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-[#0b1329] border border-blue-900/60 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <CalendarPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">
              {schedule ? 'Kemaskini Acara Jadual' : 'Tambah Acara Baharu ke Jadual'}
            </h3>
            <p className="text-xs text-slate-400">
              Tetapkan kod acara, masa, venue, dan status pelaksanaan.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-800 p-2.5 rounded-xl text-xs text-red-300 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Kod Acara:
              </label>
              <input
                type="text"
                placeholder="Contoh: AC-101"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Kategori:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-semibold"
              >
                <option value="L12">L12</option>
                <option value="P12">P12</option>
                <option value="L10">L10</option>
                <option value="P10">P10</option>
                <option value="L8">L8</option>
                <option value="P8">P8</option>
                <option value="BEZZA">BEZZA (PPKI)</option>
                <option value="Terbuka">Terbuka</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Nama Acara: *
            </label>
            <input
              type="text"
              placeholder="Contoh: 100m Lelaki 12 TKB"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm font-semibold"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Hari:
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Hari 1 (Selasa)">Hari 1 (Selasa)</option>
                <option value="Hari 2 (Rabu)">Hari 2 (Rabu)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Masa:
              </label>
              <input
                type="text"
                placeholder="Contoh: 08:30 AM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Pusingan:
              </label>
              <select
                value={round}
                onChange={(e) => setRound(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Akhir">Akhir</option>
                <option value="Separuh Akhir">Separuh Akhir</option>
                <option value="Saringan 1">Saringan 1</option>
                <option value="Saringan 2">Saringan 2</option>
                <option value="Pusingan Awal">Pusingan Awal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Venue:
              </label>
              <input
                type="text"
                placeholder="Contoh: Balapan Utama / Padang B"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Status Acara:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai')}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-bold"
              >
                <option value="Akan Datang">Akan Datang</option>
                <option value="Sedang Berlangsung">Sedang Berlangsung</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Catatan Tambahan (Pilihan):
            </label>
            <input
              type="text"
              placeholder="Contoh: Acara pembukaan atau pendaftaran peserta di khemah urusetia"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-lg shadow-blue-950/40"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Acara Jadual'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
