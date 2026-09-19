import React, { useState } from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  Smartphone, 
  Monitor, 
  Server, 
  HardDrive, 
  ArrowRightLeft, 
  Wifi, 
  Check,
  AlertCircle,
  X
} from 'lucide-react';
import { SyncLog } from '../types/bpjs';

interface SyncCentralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerInstantSync: () => Promise<void>;
  syncLogs: SyncLog[];
}

export const SyncCentralModal: React.FC<SyncCentralModalProps> = ({
  isOpen,
  onClose,
  onTriggerInstantSync,
  syncLogs
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  if (!isOpen) return null;

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncDone(false);
    await onTriggerInstantSync();
    setIsSyncing(false);
    setSyncDone(true);
    setTimeout(() => setSyncDone(false), 3000);
  };

  const devices = [
    { name: 'Server SIMRS Rumah Sakit', type: 'Server DB', icon: Server, status: 'Tersambung', ip: '192.168.10.4', ping: '12 ms' },
    { name: 'PC Pendaftaran Poli Eksekutif', type: 'Desktop Workstation', icon: Monitor, status: 'Tersambung', ip: '192.168.10.22', ping: '18 ms' },
    { name: 'Aplikasi Mobile JKN Pasien', type: 'Mobile App Gateway', icon: Smartphone, status: 'Aktif Sinkron', ip: '103.247.12.8', ping: '45 ms' },
    { name: 'Pemantauan Pakdhe (Web Cloud)', type: 'Master Sync Node', icon: HardDrive, status: 'Tersambung', ip: '160.25.178.69', ping: '31 ms' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Sinkronisasi Data Real-Time Antar Perangkat & Sistem Pusat</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Integrasi API Pusat BPJS Kesehatan (JKN Gateway) & Sinkronisasi Perangkat Faskes
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Trigger Card */}
        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
              Status Sinkronisasi Sistem Pusat
            </span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
              Server Cluster: JKN-DC-CIBUBUR-01 | Paket Terakhir: 28 Rekord (SEP, Rujukan, Antrean)
            </span>
          </div>
          
          <button
            id="btn-trigger-central-sync"
            type="button"
            disabled={isSyncing}
            onClick={handleSync}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : syncDone ? 'Berhasil Disinkron!' : 'Sinkronkan Sekarang'}</span>
          </button>
        </div>

        {/* Connected Devices Grid */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
            Perangkat Terhubung dalam Jaringan Bridging Faskes
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {devices.map((d, i) => {
              const Icon = d.icon;
              return (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                      {d.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{d.ip}</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">{d.ping}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    {d.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sync Logs Table */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Riwayat Log Sinkronisasi
          </h4>
          <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {syncLogs.length === 0 ? (
              <p className="p-4 text-center text-slate-400 text-xs">Belum ada paket sinkronisasi baru.</p>
            ) : (
              syncLogs.map((log) => (
                <div key={log.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{log.message}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
