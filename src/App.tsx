import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Navigation, TabKey } from './components/Navigation';
import { HomeView } from './components/views/HomeView';
import { StandingsView } from './components/views/StandingsView';
import { ParticipantsView } from './components/views/ParticipantsView';
import { ResultsView } from './components/views/ResultsView';
import { BezzaView } from './components/views/BezzaView';
import { ScheduleView } from './components/views/ScheduleView';
import { LiveView } from './components/views/LiveView';
import { ArchiveView } from './components/views/ArchiveView';
import { GalleryView } from './components/views/GalleryView';
import { AdminView } from './components/views/AdminView';

// Modals
import { ConfirmDeleteModal } from './components/modals/ConfirmDeleteModal';
import { ParticipantModal } from './components/modals/ParticipantModal';
import { ScheduleModal } from './components/modals/ScheduleModal';
import { ResultModal } from './components/modals/ResultModal';
import { BezzaModal } from './components/modals/BezzaModal';
import { GalleryModal } from './components/modals/GalleryModal';
import { AdminLoginModal } from './components/modals/AdminLoginModal';

// API Client
import {
  fetchScoreboardData,
  verifyAdminSession,
  logoutAdmin,
  apiAddParticipant,
  apiUpdateParticipant,
  apiDeleteParticipant,
  apiAddSchedule,
  apiUpdateSchedule,
  apiDeleteSchedule,
  apiAddResult,
  apiUpdateResult,
  apiDeleteResult,
  apiToggleArchiveResult,
  apiAddBezza,
  apiUpdateBezza,
  apiDeleteBezza,
  apiUpdateLiveStatus,
  apiPostAnnouncement,
  apiAddGallery,
  apiDeleteGallery
} from './utils/api';

import {
  ScoreboardState,
  Participant,
  EventSchedule,
  EventResult,
  BezzaAchievement,
  GalleryItem,
  AdminUser
} from './types/scoreboard';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabKey>('UTAMA');
  const [scoreboardData, setScoreboardData] = useState<ScoreboardState | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Modal States
  const [participantModalOpen, setParticipantModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<EventSchedule | null>(null);

  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<EventResult | null>(null);

  const [bezzaModalOpen, setBezzaModalOpen] = useState(false);
  const [editingBezza, setEditingBezza] = useState<BezzaAchievement | null>(null);

  const [galleryModalOpen, setGalleryModalOpen] = useState(false);

  // Delete confirmation state
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    title: string;
    itemName: string;
    targetType: 'participant' | 'schedule' | 'result' | 'bezza' | 'gallery';
    targetId: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    title: '',
    itemName: '',
    targetType: 'participant',
    targetId: '',
    isDeleting: false
  });

  // Load initial data and verify admin session
  const loadData = useCallback(async () => {
    try {
      setErrorMessage(null);
      const data = await fetchScoreboardData();
      setScoreboardData(data);
    } catch (err: unknown) {
      console.error('Failed to load scoreboard data:', err);
      setErrorMessage('Gagal memuatkan data papan skor. Sila pastikan pelayan sedang berjalan.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    verifyAdminSession().then(res => {
      setIsAdmin(res.authenticated);
      if (res.authenticated && res.user) {
        setAdminUser(res.user);
      } else {
        setAdminUser(null);
      }
    });
  }, [loadData]);

  const handleLoginSuccess = (user?: AdminUser) => {
    setIsAdmin(true);
    if (user) setAdminUser(user);
    loadData();
    setCurrentTab('PENGURUSAN');
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAdmin(false);
    setAdminUser(null);
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
  };

  // Delete Action Trigger
  const triggerDeleteConfirm = (
    type: 'participant' | 'schedule' | 'result' | 'bezza' | 'gallery',
    id: string,
    name: string
  ) => {
    setDeleteModalState({
      isOpen: true,
      title: `Padam Rekod ${type.toUpperCase()}`,
      itemName: name,
      targetType: type,
      targetId: id,
      isDeleting: false
    });
  };

  // Perform confirmed deletion with server verification
  const handleExecuteDelete = async () => {
    setDeleteModalState(prev => ({ ...prev, isDeleting: true }));
    try {
      const { targetType, targetId } = deleteModalState;
      if (targetType === 'participant') await apiDeleteParticipant(targetId);
      if (targetType === 'schedule') await apiDeleteSchedule(targetId);
      if (targetType === 'result') await apiDeleteResult(targetId);
      if (targetType === 'bezza') await apiDeleteBezza(targetId);
      if (targetType === 'gallery') await apiDeleteGallery(targetId);

      setDeleteModalState(prev => ({ ...prev, isOpen: false, isDeleting: false }));
      await loadData();
    } catch (err) {
      setErrorMessage(`Ralat memadam rekod: ${err instanceof Error ? err.message : String(err)}`);
      setDeleteModalState(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Participant Save
  const handleSaveParticipant = async (data: Partial<Participant>) => {
    if (editingParticipant) {
      await apiUpdateParticipant(editingParticipant.id, data);
    } else {
      await apiAddParticipant(data);
    }
    await loadData();
  };

  // Schedule Save
  const handleSaveSchedule = async (data: Partial<EventSchedule>) => {
    if (editingSchedule) {
      await apiUpdateSchedule(editingSchedule.id, data);
    } else {
      await apiAddSchedule(data);
    }
    await loadData();
  };

  // Quick schedule status toggle
  const handleUpdateScheduleStatus = async (
    s: EventSchedule,
    newStatus: 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai'
  ) => {
    await apiUpdateSchedule(s.id, { status: newStatus });
    await loadData();
  };

  // Result Save
  const handleSaveResult = async (data: Partial<EventResult>) => {
    if (editingResult) {
      await apiUpdateResult(editingResult.id, data);
    } else {
      await apiAddResult(data);
    }
    await loadData();
  };

  // Toggle Archive
  const handleToggleArchive = async (id: string) => {
    await apiToggleArchiveResult(id);
    await loadData();
  };

  // BEZZA Save
  const handleSaveBezza = async (data: Partial<BezzaAchievement>) => {
    if (editingBezza) {
      await apiUpdateBezza(editingBezza.id, data);
    } else {
      await apiAddBezza(data);
    }
    await loadData();
  };

  // Live Update
  const handleUpdateLiveStatus = async (statusData: Parameters<typeof apiUpdateLiveStatus>[0]) => {
    await apiUpdateLiveStatus(statusData);
    await loadData();
  };

  // Announcement Post
  const handlePostAnnouncement = async (msg: string, type: 'info' | 'urgent' | 'result') => {
    await apiPostAnnouncement(msg, type);
    await loadData();
  };

  // Gallery Save
  const handleSaveGallery = async (data: Partial<GalleryItem>) => {
    await apiAddGallery(data);
    await loadData();
  };

  if (isLoading || !scoreboardData) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-white px-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-400 rounded-full animate-spin mb-4" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-wider text-amber-300">
          Memuatkan Papan Skor Kejohanan...
        </h2>
        <p className="text-xs text-slate-400 mt-1">SK Pekan Tenom 2026</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <Header
        settings={scoreboardData.settings}
        isAdmin={isAdmin}
        adminUser={adminUser}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onGoToTab={(tab) => setCurrentTab(tab as TabKey)}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        liveEventName={scoreboardData.liveStatus.activeEventName}
      />

      {/* Main Navigation Drawer */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        logoUrl={scoreboardData.settings.logoUrl}
        isLiveActive={Boolean(scoreboardData.liveStatus.activeEventName && scoreboardData.liveStatus.activeEventName !== 'Belum Ada Acara Aktif')}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8">
        {errorMessage && (
          <div className="bg-red-950/80 border border-red-500/50 p-4 rounded-2xl text-xs text-red-200 mb-6 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={handleRefresh}
              className="text-white bg-red-800 px-3 py-1 rounded-lg font-bold hover:bg-red-700"
            >
              Cuba Semula
            </button>
          </div>
        )}

        {/* 1. UTAMA */}
        {currentTab === 'UTAMA' && (
          <HomeView
            data={scoreboardData}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}

        {/* 2. KEDUDUKAN PINGAT */}
        {currentTab === 'KEDUDUKAN PINGAT' && (
          <StandingsView data={scoreboardData} />
        )}

        {/* 3. SENARAI PESERTA */}
        {currentTab === 'SENARAI PESERTA' && (
          <ParticipantsView
            data={scoreboardData}
            isAdmin={isAdmin}
            onOpenAddModal={() => {
              setEditingParticipant(null);
              setParticipantModalOpen(true);
            }}
            onOpenEditModal={(p) => {
              setEditingParticipant(p);
              setParticipantModalOpen(true);
            }}
            onConfirmDelete={(id, name) => triggerDeleteConfirm('participant', id, name)}
          />
        )}

        {/* 4. KEPUTUSAN ACARA */}
        {currentTab === 'KEPUTUSAN ACARA' && (
          <ResultsView
            data={scoreboardData}
            isAdmin={isAdmin}
            onOpenAddModal={() => {
              setEditingResult(null);
              setResultModalOpen(true);
            }}
            onOpenEditModal={(r) => {
              setEditingResult(r);
              setResultModalOpen(true);
            }}
            onConfirmDelete={(id, name) => triggerDeleteConfirm('result', id, name)}
            onToggleArchive={handleToggleArchive}
          />
        )}

        {/* 5. PENCAPAIAN MURID BEZZA */}
        {currentTab === 'PENCAPAIAN MURID BEZZA' && (
          <BezzaView
            data={scoreboardData}
            isAdmin={isAdmin}
            onOpenAddModal={() => {
              setEditingBezza(null);
              setBezzaModalOpen(true);
            }}
            onOpenEditModal={(b) => {
              setEditingBezza(b);
              setBezzaModalOpen(true);
            }}
            onConfirmDelete={(id, name) => triggerDeleteConfirm('bezza', id, name)}
          />
        )}

        {/* 6. JADUAL PERTANDINGAN */}
        {currentTab === 'JADUAL PERTANDINGAN' && (
          <ScheduleView
            data={scoreboardData}
            isAdmin={isAdmin}
            onOpenAddModal={() => {
              setEditingSchedule(null);
              setScheduleModalOpen(true);
            }}
            onOpenEditModal={(s) => {
              setEditingSchedule(s);
              setScheduleModalOpen(true);
            }}
            onConfirmDelete={(id, name) => triggerDeleteConfirm('schedule', id, name)}
            onUpdateStatus={handleUpdateScheduleStatus}
          />
        )}

        {/* 7. ACARA LIVE */}
        {currentTab === 'ACARA LIVE' && (
          <LiveView
            data={scoreboardData}
            isAdmin={isAdmin}
            onUpdateLiveStatus={handleUpdateLiveStatus}
            onPostAnnouncement={handlePostAnnouncement}
          />
        )}

        {/* 8. ARKIB KEPUTUSAN */}
        {currentTab === 'ARKIB KEPUTUSAN' && (
          <ArchiveView
            data={scoreboardData}
            isAdmin={isAdmin}
            onToggleArchive={handleToggleArchive}
          />
        )}

        {/* 9. GALERI */}
        {currentTab === 'GALERI' && (
          <GalleryView
            data={scoreboardData}
            isAdmin={isAdmin}
            onOpenAddModal={() => setGalleryModalOpen(true)}
            onConfirmDelete={(id, name) => triggerDeleteConfirm('gallery', id, name)}
          />
        )}

        {/* 10. PENGURUSAN (Admin Portal) */}
        {currentTab === 'PENGURUSAN' && (
          <AdminView
            data={scoreboardData}
            isAdmin={isAdmin}
            adminUser={adminUser}
            onLoginSuccess={handleLoginSuccess}
            onLogoutSuccess={handleLogout}
            onRefreshData={loadData}
            onOpenAddParticipant={() => {
              setEditingParticipant(null);
              setParticipantModalOpen(true);
            }}
            onOpenAddSchedule={() => {
              setEditingSchedule(null);
              setScheduleModalOpen(true);
            }}
            onOpenAddResult={() => {
              setEditingResult(null);
              setResultModalOpen(true);
            }}
            onOpenAddBezza={() => {
              setEditingBezza(null);
              setBezzaModalOpen(true);
            }}
            onOpenAddGallery={() => setGalleryModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-[#060911] py-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="font-bold text-slate-300 uppercase">
              {scoreboardData.settings.schoolName || 'SK PEKAN TENOM'}
            </span>
            <span className="mx-2">•</span>
            <span>{scoreboardData.settings.eventTitle || 'Kejohanan Olahraga Tahunan 2026'}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span>Rumah Sukan:</span>
            <span className="text-red-400 font-bold">WIRA</span>
            <span className="text-emerald-400 font-bold">WAJA</span>
            <span className="text-blue-400 font-bold">JUARA</span>
            <span className="text-amber-400 font-bold">JAGUH</span>
            <span className="text-purple-400 font-bold">BEZZA</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        title={deleteModalState.title}
        itemName={deleteModalState.itemName}
        onConfirm={handleExecuteDelete}
        onCancel={() => setDeleteModalState(prev => ({ ...prev, isOpen: false }))}
        isDeleting={deleteModalState.isDeleting}
      />

      <ParticipantModal
        isOpen={participantModalOpen}
        participant={editingParticipant}
        onClose={() => setParticipantModalOpen(false)}
        onSave={handleSaveParticipant}
      />

      <ScheduleModal
        isOpen={scheduleModalOpen}
        schedule={editingSchedule}
        onClose={() => setScheduleModalOpen(false)}
        onSave={handleSaveSchedule}
      />

      <ResultModal
        isOpen={resultModalOpen}
        result={editingResult}
        onClose={() => setResultModalOpen(false)}
        onSave={handleSaveResult}
      />

      <BezzaModal
        isOpen={bezzaModalOpen}
        achievement={editingBezza}
        onClose={() => setBezzaModalOpen(false)}
        onSave={handleSaveBezza}
      />

      <GalleryModal
        isOpen={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
        onSave={handleSaveGallery}
      />

      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
