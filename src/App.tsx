import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  ArrowRightLeft, 
  Bell, 
  Cloud, 
  HelpCircle,
  ShieldCheck,
  Zap,
  Info,
  ExternalLink,
  Server
} from 'lucide-react';
import { 
  ConnectionCheckResult, 
  UrgentTask, 
  SyncLog, 
  NotificationItem, 
  SupportedLanguage, 
  UserSession 
} from './types/bpjs';
import { checkBPJSConnection } from './services/bpjsService';
import { generateBPJSReportPDF, exportHistoryToCSV } from './services/pdfService';
import { 
  playSuccessChime, 
  playAlertChime, 
  playUrgentPulse, 
  triggerPushNotification,
  requestPushPermission 
} from './services/audioNotification';
import { TRANSLATIONS } from './services/i18n';
import { Navbar } from './components/Navbar';
import { ConnectionTester } from './components/ConnectionTester';
import { ConnectionHistoryTable } from './components/ConnectionHistoryTable';
import { SyncCentralModal } from './components/SyncCentralModal';
import { UrgentTasksModal } from './components/UrgentTasksModal';
import { CloudBackupModal } from './components/CloudBackupModal';
import { InteractiveTourModal } from './components/InteractiveTourModal';
import { LoginModal } from './components/LoginModal';
import { NotificationToast } from './components/NotificationToast';

export default function App() {
  // Theme & Accessibility States
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [seniorMode, setSeniorMode] = useState<boolean>(false);
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'extra'>('normal');
  const [lang, setLang] = useState<SupportedLanguage>('id');

  // User Session
  const [user, setUser] = useState<UserSession>({
    name: 'dr. Widodo',
    role: 'Dokter Penanggung Jawab Pelayanan (DPJP)',
    faskesName: 'Klinik Pratama Rawat Inap Sehat Bersama',
    faskesCode: '0112B001'
  });

  // Diagnostic Results & History
  const [currentResult, setCurrentResult] = useState<ConnectionCheckResult | null>(null);
  const [history, setHistory] = useState<ConnectionCheckResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Urgent Tasks
  const [urgentTasks, setUrgentTasks] = useState<UrgentTask[]>([
    {
      id: 'task-1',
      title: 'Verifikasi Berkas Klaim Susulan Bulan Berjalan',
      category: 'Klaim BPJS',
      deadline: 'Hari ini, 15:00 WIB',
      priority: 'Mendesak',
      isCompleted: false,
      notes: 'Batas akhir upload lampiran berkas rawat inap sebelum penutupan siklus.',
      assignee: 'dr. Widodo'
    },
    {
      id: 'task-2',
      title: 'Validasi Penerbitan SEP Rawat Jalan & IGD',
      category: 'VClaim REST',
      deadline: 'Besok, 08:30 WIB',
      priority: 'Tinggi',
      isCompleted: false,
      notes: 'Periksa integrasi bridging penerbitan SEP pasien rawat jalan faskes.',
      assignee: 'dr. Widodo'
    },
    {
      id: 'task-3',
      title: 'Pembaruan Sertifikat SSL Bridging Faskes',
      category: 'Sertifikat SSL',
      deadline: '18 September 2026',
      priority: 'Normal',
      isCompleted: true,
      notes: 'Sertifikat TLSv1.2 telah terverifikasi normal.',
      assignee: 'IT Support'
    }
  ]);

  // Sync Logs
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([
    {
      id: 'sync-1',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      deviceSource: 'SIMRS RSUD',
      endpoint: '/vclaim-rest/peserta',
      recordsSynced: 18,
      status: 'Berhasil',
      message: 'Sinkronisasi 18 eligibilitas peserta dari server pusat selesai.'
    },
    {
      id: 'sync-2',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      deviceSource: 'SIMRS Bridging',
      endpoint: '/vclaim-rest/sep/sync',
      recordsSynced: 12,
      status: 'Berhasil',
      message: 'Riwayat penerbitan SEP dan status klaim tersinkron ke SIMRS.'
    }
  ]);

  // Instant Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modal Visibility States
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const t = TRANSLATIONS[lang];

  // Apply dark mode class to html document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Push notification permission request
  useEffect(() => {
    requestPushPermission();
  }, []);

  // Run initial connection test on mount
  useEffect(() => {
    handleRunTest('apijkn.bpjs-kesehatan.go.id', 'https://apijkn.bpjs-kesehatan.go.id/vclaim-rest/');
  }, []);

  // Add Notification Helper
  const pushInstantNotification = useCallback((
    title: string, 
    message: string, 
    type: NotificationItem['type'] = 'status_change'
  ) => {
    const newItem: NotificationItem = {
      id: 'notif-' + Date.now(),
      title,
      message,
      timestamp: new Date().toISOString(),
      type,
      read: false
    };

    setNotifications(prev => [newItem, ...prev]);

    // Audio chime
    if (type === 'urgent_task') {
      playUrgentPulse();
    } else if (type === 'status_change') {
      playAlertChime();
    } else {
      playSuccessChime();
    }

    // Native browser push notification
    triggerPushNotification(title, message);

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newItem.id));
    }, 6000);
  }, []);

  // Handle BPJS Connection Check
  const handleRunTest = async (host: string, endpoint: string) => {
    setIsLoading(true);
    try {
      const res = await checkBPJSConnection(host, endpoint);
      setCurrentResult(res);
      setHistory(prev => [res, ...prev.slice(0, 49)]); // Keep last 50
      playSuccessChime();
    } catch (err: any) {
      console.error('Connection test error:', err);
      playAlertChime();
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Central Sync
  const handleTriggerCentralSync = async () => {
    await new Promise(resolve => setTimeout(resolve, 900));
    
    const newLog: SyncLog = {
      id: 'sync-' + Date.now(),
      timestamp: new Date().toISOString(),
      deviceSource: 'Pemantauan Pakdhe',
      endpoint: '/vclaim-rest/sync/all',
      recordsSynced: 28,
      status: 'Berhasil',
      message: 'Berhasil sinkronisasi 28 paket data bridging dengan sistem pusat JKN.'
    };

    setSyncLogs(prev => [newLog, ...prev]);
    pushInstantNotification(
      'Sinkronisasi Sistem Pusat Selesai',
      'Data bridging antrean, rujukan, dan eligibilitas telah diperbarui di seluruh perangkat terhubung.',
      'sync_event'
    );
  };

  // Urgent Task handlers
  const handleToggleTask = (id: string) => {
    setUrgentTasks(prev => prev.map(t => {
      if (t.id === id) {
        const next = !t.isCompleted;
        if (next) playSuccessChime();
        return { ...t, isCompleted: next };
      }
      return t;
    }));
  };

  const handleAddTask = (newTask: Omit<UrgentTask, 'id'>) => {
    const created: UrgentTask = {
      ...newTask,
      id: 'task-' + Date.now()
    };
    setUrgentTasks(prev => [created, ...prev]);
    pushInstantNotification(
      'Pengingat Tugas Mendesak Ditambahkan',
      `${created.title} - Tenggat: ${created.deadline}`,
      'urgent_task'
    );
  };

  // Export handlers
  const handleExportPDF = () => {
    generateBPJSReportPDF(currentResult, history, null, user.name);
    playSuccessChime();
  };

  const handleExportCSV = () => {
    exportHistoryToCSV(history);
    playSuccessChime();
  };

  const pendingUrgentCount = urgentTasks.filter(t => !t.isCompleted).length;

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    } ${
      fontScale === 'large' ? 'text-[17px]' : fontScale === 'extra' ? 'text-[19px]' : 'text-[15px]'
    }`}>
      
      {/* Top Navigation Bar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        seniorMode={seniorMode}
        setSeniorMode={setSeniorMode}
        fontScale={fontScale}
        setFontScale={setFontScale}
        lang={lang}
        setLang={setLang}
        user={user}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenTour={() => setIsTourModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onOpenTasks={() => setIsTasksModalOpen(true)}
        urgentTaskCount={pendingUrgentCount}
        unreadNotifs={notifications.length}
        onOpenNotifs={() => setIsTasksModalOpen(true)}
        isOnline={currentResult?.isHealthy ?? true}
      />

      {/* Main Container - Focused exclusively on Connection Test & History Log */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* Classic Header & Faskes Status Strip */}
        <div className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          seniorMode 
            ? 'bg-amber-100/80 dark:bg-slate-900 border-2 border-amber-400 text-amber-950 dark:text-amber-200' 
            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm sm:text-base">
                  Host Resmi: apijkn.bpjs-kesehatan.go.id
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Mode Klasik Ringan
                </span>
                {currentResult && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    HTTP {currentResult.http.status} • {currentResult.responseTimeMs} ms
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Faskes: {user.faskesName} ({user.faskesCode}) | Operator: {user.name}
              </p>
            </div>
          </div>

          {/* Quick Utility Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSyncModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sinkronisasi</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTasksModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-rose-600" />
              <span>Tugas ({pendingUrgentCount})</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors shadow-xs"
            >
              <span>{t.exportPdf}</span>
            </button>
          </div>
        </div>

        {/* Section 1: Connection Tester */}
        <ConnectionTester
          currentResult={currentResult}
          isLoading={isLoading}
          onRunTest={handleRunTest}
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
          seniorMode={seniorMode}
          lang={lang}
        />

        {/* Section 2: Connection History Table */}
        <ConnectionHistoryTable
          history={history}
          onSelectLog={(log) => setCurrentResult(log)}
          onClearHistory={() => setHistory([])}
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
          seniorMode={seniorMode}
          lang={lang}
        />

      </main>

      {/* Classic Footer */}
      <footer className="border-t border-slate-300 dark:border-slate-800 mt-10 py-5 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © 2026 Pemantauan Pakdhe - Uji Konektivitas & Log Diagnostik Jaringan BPJS Kesehatan.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsTourModalOpen(true)}
              className="hover:underline flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Panduan Penggunaan</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsBackupModalOpen(true)}
              className="hover:underline flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Cadangan Cloud</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Instant Notification Toasts */}
      <NotificationToast
        notifications={notifications}
        onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
      />

      {/* Modals */}
      <SyncCentralModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onTriggerInstantSync={handleTriggerCentralSync}
        syncLogs={syncLogs}
      />

      <UrgentTasksModal
        isOpen={isTasksModalOpen}
        onClose={() => setIsTasksModalOpen(false)}
        tasks={urgentTasks}
        onToggleTask={handleToggleTask}
        onAddTask={handleAddTask}
        onTestPushNotification={() => {
          pushInstantNotification(
            'Pengingat Tugas Mendesak Faskes!',
            'Terdapat 2 berkas klaim BPJS yang belum diverifikasi menjelang penutupan sistem hari ini.',
            'urgent_task'
          );
        }}
      />

      <CloudBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        history={history}
        onRestoreData={(restored) => {
          setHistory(restored);
          if (restored.length > 0) setCurrentResult(restored[0]);
        }}
      />

      <InteractiveTourModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
        lang={lang}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={user}
        onUpdateUser={(updated) => setUser(updated)}
      />

    </div>
  );
}
