import React, { useState, useEffect } from 'react';
import { X, Trophy, Save, Flame, Medal } from 'lucide-react';
import { EventResult, HouseType, ResultEntry } from '../../types/scoreboard';

interface ResultModalProps {
  isOpen: boolean;
  result?: EventResult | null;
  onClose: () => void;
  onSave: (data: Partial<EventResult>) => Promise<void>;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  result,
  onClose,
  onSave
}) => {
  const [eventName, setEventName] = useState('');
  const [category, setCategory] = useState('L12');
  const [gender, setGender] = useState<'L' | 'P' | 'Campuran'>('L');
  const [round, setRound] = useState('Akhir');
  const [dateCompleted, setDateCompleted] = useState(new Date().toISOString().split('T')[0]);

  // Entries for 1st, 2nd, 3rd, 4th
  const [firstPlace, setFirstPlace] = useState<{ name: string; house: HouseType; score: string; isNewRecord: boolean }>({
    name: '',
    house: 'WIRA',
    score: '',
    isNewRecord: false
  });

  const [secondPlace, setSecondPlace] = useState<{ name: string; house: HouseType; score: string }>({
    name: '',
    house: 'WAJA',
    score: '',
  });

  const [thirdPlace, setThirdPlace] = useState<{ name: string; house: HouseType; score: string }>({
    name: '',
    house: 'JUARA',
    score: '',
  });

  const [fourthPlace, setFourthPlace] = useState<{ name: string; house: HouseType; score: string }>({
    name: '',
    house: 'JAGUH',
    score: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (result) {
      setEventName(result.eventName || '');
      setCategory(result.category || 'L12');
      setGender(result.gender || 'L');
      setRound(result.round || 'Akhir');
      setDateCompleted(result.dateCompleted || new Date().toISOString().split('T')[0]);

      const e1 = result.entries.find(e => e.rank === 1);
      const e2 = result.entries.find(e => e.rank === 2);
      const e3 = result.entries.find(e => e.rank === 3);
      const e4 = result.entries.find(e => e.rank === 4);

      setFirstPlace({
        name: e1?.participantName || '',
        house: e1?.house || 'WIRA',
        score: e1?.recordTimeOrDistance || '',
        isNewRecord: Boolean(e1?.isNewRecord)
      });

      setSecondPlace({
        name: e2?.participantName || '',
        house: e2?.house || 'WAJA',
        score: e2?.recordTimeOrDistance || '',
      });

      setThirdPlace({
        name: e3?.participantName || '',
        house: e3?.house || 'JUARA',
        score: e3?.recordTimeOrDistance || '',
      });

      setFourthPlace({
        name: e4?.participantName || '',
        house: e4?.house || 'JAGUH',
        score: e4?.recordTimeOrDistance || '',
      });
    } else {
      setEventName('');
      setCategory('L12');
      setGender('L');
      setRound('Akhir');
      setDateCompleted(new Date().toISOString().split('T')[0]);
      setFirstPlace({ name: '', house: 'WIRA', score: '', isNewRecord: false });
      setSecondPlace({ name: '', house: 'WAJA', score: '' });
      setThirdPlace({ name: '', house: 'JUARA', score: '' });
      setFourthPlace({ name: '', house: 'JAGUH', score: '' });
    }
    setError('');
  }, [result, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) {
      setError('Sila masukkan nama acara.');
      return;
    }
    if (!firstPlace.name.trim()) {
      setError('Sila masukkan sekurang-kurangnya nama pemenang tempat pertama (Emas).');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      const entries: ResultEntry[] = [];

      // 1st Place (Emas)
      if (firstPlace.name.trim()) {
        entries.push({
          rank: 1,
          participantName: firstPlace.name.trim(),
          house: firstPlace.house,
          recordTimeOrDistance: firstPlace.score.trim(),
          isNewRecord: firstPlace.isNewRecord
        });
      }

      // 2nd Place (Perak)
      if (secondPlace.name.trim()) {
        entries.push({
          rank: 2,
          participantName: secondPlace.name.trim(),
          house: secondPlace.house,
          recordTimeOrDistance: secondPlace.score.trim()
        });
      }

      // 3rd Place (Gangsa)
      if (thirdPlace.name.trim()) {
        entries.push({
          rank: 3,
          participantName: thirdPlace.name.trim(),
          house: thirdPlace.house,
          recordTimeOrDistance: thirdPlace.score.trim()
        });
      }

      // 4th Place
      if (fourthPlace.name.trim()) {
        entries.push({
          rank: 4,
          participantName: fourthPlace.name.trim(),
          house: fourthPlace.house,
          recordTimeOrDistance: fourthPlace.score.trim()
        });
      }

      await onSave({
        eventName: eventName.trim(),
        category,
        gender,
        round,
        dateCompleted,
        entries,
        isBezzaEvent: false,
        isArchived: false
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan keputusan acara.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-[#0b1329] border border-amber-500/50 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">
              {result ? 'Kemaskini Keputusan Acara' : 'Rekod Keputusan Acara Baharu'}
            </h3>
            <p className="text-xs text-slate-400">
              Kedudukan pingat 4 rumah sukan akan dikira secara automatik.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-800 p-2.5 rounded-xl text-xs text-red-300 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Event Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Nama Acara: *
              </label>
              <input
                type="text"
                placeholder="Contoh: 100m Lelaki 12 TKB"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Kategori:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
              >
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Jantina:
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'L' | 'P' | 'Campuran')}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="L">Lelaki</option>
                <option value="P">Perempuan</option>
                <option value="Campuran">Campuran</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Pusingan:
              </label>
              <select
                value={round}
                onChange={(e) => setRound(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="Akhir">Akhir</option>
                <option value="Separuh Akhir">Separuh Akhir</option>
                <option value="Saringan">Saringan</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Tarikh Selesai:
              </label>
              <input
                type="date"
                value={dateCompleted}
                onChange={(e) => setDateCompleted(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Podiums Input Section */}
          <div className="space-y-3 pt-2">
            <h4 className="font-black text-amber-400 uppercase text-[11px] tracking-wider">
              Pemenang Tempat 1 Hingga 4:
            </h4>

            {/* 1st Place (Emas) */}
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">1</span>
                  Tempat Pertama (Pingat Emas) *
                </span>

                <label className="flex items-center gap-1 text-[11px] text-amber-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={firstPlace.isNewRecord}
                    onChange={(e) => setFirstPlace({ ...firstPlace, isNewRecord: e.target.checked })}
                    className="accent-amber-500"
                  />
                  <span className="font-bold">Rekod Baharu?</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Nama Peserta / Pasukan..."
                  value={firstPlace.name}
                  onChange={(e) => setFirstPlace({ ...firstPlace, name: e.target.value })}
                  className="w-full sm:col-span-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  required
                />
                <select
                  value={firstPlace.house}
                  onChange={(e) => setFirstPlace({ ...firstPlace, house: e.target.value as HouseType })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-bold"
                >
                  <option value="WIRA">WIRA (Merah)</option>
                  <option value="WAJA">WAJA (Hijau)</option>
                  <option value="JUARA">JUARA (Biru)</option>
                  <option value="JAGUH">JAGUH (Kuning)</option>
                </select>
                <input
                  type="text"
                  placeholder="Masa / Jarak (cth: 12.4s, 5.2m)"
                  value={firstPlace.score}
                  onChange={(e) => setFirstPlace({ ...firstPlace, score: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            {/* 2nd Place (Perak) */}
            <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-3 space-y-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-950 text-[10px] font-black flex items-center justify-center">2</span>
                Tempat Kedua (Pingat Perak)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Nama Peserta..."
                  value={secondPlace.name}
                  onChange={(e) => setSecondPlace({ ...secondPlace, name: e.target.value })}
                  className="w-full sm:col-span-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
                <select
                  value={secondPlace.house}
                  onChange={(e) => setSecondPlace({ ...secondPlace, house: e.target.value as HouseType })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-bold"
                >
                  <option value="WIRA">WIRA (Merah)</option>
                  <option value="WAJA">WAJA (Hijau)</option>
                  <option value="JUARA">JUARA (Biru)</option>
                  <option value="JAGUH">JAGUH (Kuning)</option>
                </select>
                <input
                  type="text"
                  placeholder="Masa / Jarak"
                  value={secondPlace.score}
                  onChange={(e) => setSecondPlace({ ...secondPlace, score: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            {/* 3rd Place (Gangsa) */}
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3 space-y-2">
              <span className="font-bold text-amber-500 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-black flex items-center justify-center">3</span>
                Tempat Ketiga (Pingat Gangsa)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Nama Peserta..."
                  value={thirdPlace.name}
                  onChange={(e) => setThirdPlace({ ...thirdPlace, name: e.target.value })}
                  className="w-full sm:col-span-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
                <select
                  value={thirdPlace.house}
                  onChange={(e) => setThirdPlace({ ...thirdPlace, house: e.target.value as HouseType })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-bold"
                >
                  <option value="WIRA">WIRA (Merah)</option>
                  <option value="WAJA">WAJA (Hijau)</option>
                  <option value="JUARA">JUARA (Biru)</option>
                  <option value="JAGUH">JAGUH (Kuning)</option>
                </select>
                <input
                  type="text"
                  placeholder="Masa / Jarak"
                  value={thirdPlace.score}
                  onChange={(e) => setThirdPlace({ ...thirdPlace, score: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            {/* 4th Place */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 space-y-2">
              <span className="font-bold text-slate-400 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 text-[10px] font-black flex items-center justify-center">4</span>
                Tempat Keempat
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Nama Peserta..."
                  value={fourthPlace.name}
                  onChange={(e) => setFourthPlace({ ...fourthPlace, name: e.target.value })}
                  className="w-full sm:col-span-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
                <select
                  value={fourthPlace.house}
                  onChange={(e) => setFourthPlace({ ...fourthPlace, house: e.target.value as HouseType })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-bold"
                >
                  <option value="WIRA">WIRA (Merah)</option>
                  <option value="WAJA">WAJA (Hijau)</option>
                  <option value="JUARA">JUARA (Biru)</option>
                  <option value="JAGUH">JAGUH (Kuning)</option>
                </select>
                <input
                  type="text"
                  placeholder="Masa / Jarak"
                  value={fourthPlace.score}
                  onChange={(e) => setFourthPlace({ ...fourthPlace, score: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition shadow-lg shadow-amber-950/40"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan & Kira Skor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
