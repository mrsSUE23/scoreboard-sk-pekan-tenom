import React, { useState } from 'react';
import { X, Images, Save } from 'lucide-react';
import { GalleryItem, HouseType } from '../../types/scoreboard';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<GalleryItem>) => Promise<void>;
}

const SAMPLE_PHOTO_PRESETS = [
  {
    title: 'Pecutan 100m Garisan Akhir',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    category: 'Balapan' as const
  },
  {
    title: 'Sorakan Bergema Rumah Sukan',
    url: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=800&q=80',
    category: 'Sorakan' as const
  },
  {
    title: 'Upacara Lintas Hormat Perbarisan',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    category: 'Perbarisan' as const
  },
  {
    title: 'Lontaran Padu Padang B',
    url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
    category: 'Padang' as const
  }
];

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [houseTag, setHouseTag] = useState<'Semua' | HouseType>('Semua');
  const [category, setCategory] = useState<GalleryItem['category']>('Balapan');
  const [imageUrl, setImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      setError('Sila masukkan tajuk foto dan URL gambar.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await onSave({
        title: title.trim(),
        caption: caption.trim(),
        houseTag,
        category,
        imageUrl: imageUrl.trim()
      });
      setTitle('');
      setCaption('');
      setImageUrl('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan foto ke galeri.');
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
            <Images className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">
              Tambah Foto ke Galeri Sukan
            </h3>
            <p className="text-xs text-slate-400">
              Muat naik sorotan gambar kejohanan olahraga 2026.
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
              Tajuk Gambar: *
            </label>
            <input
              type="text"
              placeholder="Contoh: Perbarisan Rumah Wira Penuh Semangat"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-cyan-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Keterangan / Kapsyen:
            </label>
            <input
              type="text"
              placeholder="Contoh: Detik manis sorakan padu kontinjen..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Kategori:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GalleryItem['category'])}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="Balapan">Balapan</option>
                <option value="Padang">Padang</option>
                <option value="Sorakan">Sorakan</option>
                <option value="Perbarisan">Perbarisan</option>
                <option value="Penyampaian">Penyampaian</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Label Rumah Sukan:
              </label>
              <select
                value={houseTag}
                onChange={(e) => setHouseTag(e.target.value as 'Semua' | HouseType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              >
                <option value="Semua">Semua Rumah</option>
                <option value="WIRA">WIRA (Merah)</option>
                <option value="WAJA">WAJA (Hijau)</option>
                <option value="JUARA">JUARA (Biru)</option>
                <option value="JAGUH">JAGUH (Kuning)</option>
                <option value="BEZZA">BEZZA (Ungu)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              URL Gambar: *
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-xs"
              required
            />
          </div>

          {/* Quick presets */}
          <div>
            <span className="block font-semibold text-slate-400 mb-1 text-[11px]">
              Atau pilih contoh gambar sukan:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_PHOTO_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setTitle(preset.title);
                    setImageUrl(preset.url);
                    setCategory(preset.category);
                  }}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-[11px] text-slate-300 hover:text-white transition"
                >
                  {preset.title}
                </button>
              ))}
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-lg shadow-cyan-950/40"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Foto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
