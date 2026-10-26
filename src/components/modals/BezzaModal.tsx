import React, { useState, useEffect } from 'react';
import { X, HeartHandshake, Save, Award } from 'lucide-react';
import { BezzaAchievement } from '../../types/scoreboard';

interface BezzaModalProps {
  isOpen: boolean;
  achievement?: BezzaAchievement | null;
  onClose: () => void;
  onSave: (data: Partial<BezzaAchievement>) => Promise<void>;
}

export const BezzaModal: React.FC<BezzaModalProps> = ({
  isOpen,
  achievement,
  onClose,
  onSave
}) => {
  const [studentName, setStudentName] = useState('');
  const [category, setCategory] = useState('PPKI Masalah Pembelajaran');
  const [event, setEvent] = useState('');
  const [achievementType, setAchievementType] = useState<BezzaAchievement['achievement']>('Pingat Emas');
  const [recordScore, setRecordScore] = useState('');
  const [remarks, setRemarks] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (achievement) {
      setStudentName(achievement.studentName || '');
      setCategory(achievement.category || 'PPKI Masalah Pembelajaran');
      setEvent(achievement.event || '');
      setAchievementType(achievement.achievement || 'Pingat Emas');
      setRecordScore(achievement.recordScore || '');
      setRemarks(achievement.remarks || '');
      setDate(achievement.date || new Date().toISOString().split('T')[0]);
    } else {
      setStudentName('');
      setCategory('PPKI Masalah Pembelajaran');
      setEvent('');
      setAchievementType('Pingat Emas');
      setRecordScore('');
      setRemarks('');
      setDate(new Date().toISOString().split('T')[0]);
    }
    setError('');
  }, [achievement, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !event.trim()) {
      setError('Sila masukkan nama murid dan nama acara.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await onSave({
        studentName: studentName.trim(),
        category: category.trim(),
        event: event.trim(),
        achievement: achievementType,
        recordScore: recordScore.trim(),
        remarks: remarks.trim(),
        date
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan pencapaian BEZZA.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-[#0b1329] border border-purple-500/60 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">
              {achievement ? 'Kemaskini Pencapaian BEZZA' : 'Rekod Pencapaian Murid BEZZA'}
            </h3>
            <p className="text-xs text-purple-300">
              Pengiktirafan istimewa untuk anak-anak Program Pendidikan Khas Integrasi.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-800 p-2.5 rounded-xl text-xs text-red-300 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Nama Murid BEZZA: *
            </label>
            <input
              type="text"
              placeholder="Contoh: Mohd Hafizuddin bin Razak"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-slate-900 border border-purple-900/60 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-purple-500 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Kategori PPKI:
              </label>
              <input
                type="text"
                placeholder="Cth: Masalah Pembelajaran / Pendengaran"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Nama Acara / Disiplin: *
              </label>
              <input
                type="text"
                placeholder="Cth: Lari 50m Khas, Lompat Jauh"
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Pengiktirafan / Pencapaian: *
              </label>
              <select
                value={achievementType}
                onChange={(e) => setAchievementType(e.target.value as BezzaAchievement['achievement'])}
                className="w-full bg-slate-900 border border-purple-900/60 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-500"
              >
                <option value="Pingat Emas">Pingat Emas</option>
                <option value="Pingat Perak">Pingat Perak</option>
                <option value="Pingat Gangsa">Pingat Gangsa</option>
                <option value="Tempat Ke-4">Tempat Ke-4</option>
                <option value="Pingat Penyertaan">Pingat Penyertaan</option>
                <option value="Anugerah Khas Semangat">Anugerah Khas Semangat Waja</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Catatan Masa / Skor (Pilihan):
              </label>
              <input
                type="text"
                placeholder="Cth: 8.12s atau 1.65m"
                value={recordScore}
                onChange={(e) => setRecordScore(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Kata Pujian / Ulasan Guru:
            </label>
            <input
              type="text"
              placeholder="Contoh: Semangat juang luar biasa yang membanggakan seluruh warga SKPT"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Tarikh:
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-lg shadow-purple-950/40"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Pencapaian'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
