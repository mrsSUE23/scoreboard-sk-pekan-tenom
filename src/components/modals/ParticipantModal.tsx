import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save } from 'lucide-react';
import { Participant, HouseType, HOUSES } from '../../types/scoreboard';

interface ParticipantModalProps {
  isOpen: boolean;
  participant?: Participant | null;
  onClose: () => void;
  onSave: (data: Partial<Participant>) => Promise<void>;
}

export const ParticipantModal: React.FC<ParticipantModalProps> = ({
  isOpen,
  participant,
  onClose,
  onSave
}) => {
  const [bibNumber, setBibNumber] = useState('');
  const [name, setName] = useState('');
  const [house, setHouse] = useState<HouseType>('WIRA');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [category, setCategory] = useState<Participant['category']>('L12');
  const [eventsStr, setEventsStr] = useState('');
  const [classYear, setClassYear] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (participant) {
      setBibNumber(participant.bibNumber || '');
      setName(participant.name || '');
      setHouse(participant.house || 'WIRA');
      setGender(participant.gender || 'L');
      setCategory(participant.category || 'L12');
      setEventsStr((participant.eventsRegistered || []).join(', '));
      setClassYear(participant.classYear || '');
    } else {
      setBibNumber('');
      setName('');
      setHouse('WIRA');
      setGender('L');
      setCategory('L12');
      setEventsStr('');
      setClassYear('');
    }
    setError('');
  }, [participant, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Sila masukkan nama peserta.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      const events = eventsStr
        .split(',')
        .map(e => e.trim())
        .filter(Boolean);

      await onSave({
        bibNumber: bibNumber.trim(),
        name: name.trim(),
        house,
        gender,
        category,
        eventsRegistered: events,
        classYear: classYear.trim()
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan rekod peserta.');
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
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">
              {participant ? 'Kemaskini Maklumat Peserta' : 'Daftar Peserta Baharu'}
            </h3>
            <p className="text-xs text-slate-400">
              Isikan maklumat atlet mengikut rumah sukan dan acara.
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
                No. Bib Peserta:
              </label>
              <input
                type="text"
                placeholder="Contoh: W101, J205"
                value={bibNumber}
                onChange={(e) => setBibNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 uppercase font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Kelas / Tahun:
              </label>
              <input
                type="text"
                placeholder="Contoh: 6 Cemerlang, PPKI"
                value={classYear}
                onChange={(e) => setClassYear(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Nama Penuh Peserta: *
            </label>
            <input
              type="text"
              placeholder="Contoh: Muhammad Farhan bin Abdullah"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm font-semibold"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* House */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Rumah Sukan: *
              </label>
              <select
                value={house}
                onChange={(e) => setHouse(e.target.value as HouseType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-bold"
              >
                <option value="WIRA">WIRA (Merah)</option>
                <option value="WAJA">WAJA (Hijau)</option>
                <option value="JUARA">JUARA (Biru)</option>
                <option value="JAGUH">JAGUH (Kuning)</option>
                <option value="BEZZA">BEZZA (Ungu/PPKI)</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Jantina:
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="L">Lelaki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Kategori: *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Participant['category'])}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-semibold"
              >
                <option value="L12">L12 (Lelaki 12)</option>
                <option value="P12">P12 (Perempuan 12)</option>
                <option value="L10">L10 (Lelaki 10)</option>
                <option value="P10">P10 (Perempuan 10)</option>
                <option value="L8">L8 (Lelaki 8)</option>
                <option value="P8">P8 (Perempuan 8)</option>
                <option value="BEZZA">BEZZA (PPKI)</option>
                <option value="Terbuka">Terbuka</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Acara Berdaftar (asingkan dengan koma):
            </label>
            <input
              type="text"
              placeholder="Contoh: 100m L12, 200m L12, 4x100m"
              value={eventsStr}
              onChange={(e) => setEventsStr(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg shadow-emerald-950/40"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Peserta'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
