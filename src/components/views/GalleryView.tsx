import React, { useState } from 'react';
import { Images, Plus, Filter, Trash2, X, ExternalLink } from 'lucide-react';
import { ScoreboardState, GalleryItem, HOUSES, HouseType } from '../../types/scoreboard';

interface GalleryViewProps {
  data: ScoreboardState;
  isAdmin: boolean;
  onOpenAddModal: () => void;
  onConfirmDelete: (id: string, name: string) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  data,
  isAdmin,
  onOpenAddModal,
  onConfirmDelete
}) => {
  const { gallery } = data;
  const [selectedTag, setSelectedTag] = useState<string>('Semua');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

  const filtered = gallery.filter(item => {
    const matchesTag = selectedTag === 'Semua' || item.houseTag === selectedTag;
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    return matchesTag && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Images className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Galeri Lensa Sukan 2026
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Sorotan gambar menarik aksi balapan, sorakan rumah sukan, dan majlis penyampaian hadiah.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Foto Galeri</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* House Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          <button
            onClick={() => setSelectedTag('Semua')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex-shrink-0 ${
              selectedTag === 'Semua' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Semua Rumah
          </button>
          {(['WIRA', 'WAJA', 'JUARA', 'JAGUH', 'BEZZA'] as HouseType[]).map(h => (
            <button
              key={h}
              onClick={() => setSelectedTag(h)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex-shrink-0 ${
                selectedTag === h ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {h}
            </button>
          ))}
        </div>

        {/* Category */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Balapan">Balapan</option>
            <option value="Padang">Padang</option>
            <option value="Sorakan">Sorakan</option>
            <option value="Perbarisan">Perbarisan</option>
            <option value="Penyampaian">Penyampaian</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-16 text-center shadow-xl">
          <Images className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">
            Tiada Foto Dalam Galeri
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {gallery.length === 0
              ? 'Pangkalan data galeri masih bersih. Gambar kenangan sukan boleh dimuat naik oleh pentadbir semasa atau selepas kejohanan.'
              : 'Tiada foto bertepatan dengan tapisan yang dipilih.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(item => (
            <div
              key={item.id}
              className="bg-[#0b1329] border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition flex flex-col justify-between group"
            >
              <div
                className="relative h-48 bg-slate-900 cursor-pointer overflow-hidden"
                onClick={() => setPreviewItem(item)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    // Fallback placeholder image
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="bg-slate-950/80 backdrop-blur text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  {item.houseTag !== 'Semua' && (
                    <span className="bg-blue-600/90 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                      {item.houseTag}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-black text-white text-sm sm:text-base mb-1">
                    {item.title}
                  </h4>
                  {item.caption && (
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {item.caption}
                    </p>
                  )}
                </div>

                {isAdmin && (
                  <div className="mt-3 pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => onConfirmDelete(item.id, item.title)}
                      className="p-1 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 transition"
                      title="Padam Foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-3xl w-full bg-[#0b1329] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewItem.imageUrl}
              alt={previewItem.title}
              className="w-full max-h-[70vh] object-contain bg-black"
            />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-1 text-xs">
                <span className="text-cyan-400 font-bold uppercase">{previewItem.category}</span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-400 font-bold">{previewItem.houseTag}</span>
              </div>
              <h3 className="text-lg font-black text-white">{previewItem.title}</h3>
              {previewItem.caption && (
                <p className="text-sm text-slate-300 mt-1">{previewItem.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
