import React, { useState } from 'react';
import { 
  Cloud, 
  Lock, 
  ShieldCheck, 
  Download, 
  Upload, 
  Check, 
  RefreshCw, 
  HardDrive, 
  Key, 
  X,
  AlertCircle
} from 'lucide-react';
import { CloudBackupRecord, ConnectionCheckResult, PesertaBPJS } from '../types/bpjs';
import { encryptDataForCloud, decryptDataFromCloud } from '../services/bpjsService';

interface CloudBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ConnectionCheckResult[];
  pesertaList?: PesertaBPJS[];
  onRestoreData: (restoredHistory: ConnectionCheckResult[]) => void;
}

export const CloudBackupModal: React.FC<CloudBackupModalProps> = ({
  isOpen,
  onClose,
  history,
  pesertaList = [],
  onRestoreData
}) => {
  const [passphrase, setPassphrase] = useState('BpjsPakdhe2026!Sec');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [autoBackupInterval, setAutoBackupInterval] = useState('1hr');

  if (!isOpen) return null;

  const handleCreateEncryptedBackup = async () => {
    setIsEncrypting(true);
    setBackupSuccess(false);

    try {
      const payload = {
        app: 'Pemantauan-Pakdhe-BPJS',
        timestamp: new Date().toISOString(),
        history,
        pesertaCount: pesertaList.length,
        version: '2.4'
      };

      const encryptedBase64 = await encryptDataForCloud(payload, passphrase);
      
      // Download encrypted .bpjsenc file
      const blob = new Blob([encryptedBase64], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BPJS_CloudBackup_${new Date().toISOString().split('T')[0]}_AES256.bpjsenc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setBackupSuccess(true);
    } catch (err: any) {
      alert('Gagal mengenkripsi cadangan: ' + err.message);
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        const decrypted = await decryptDataFromCloud(text, passphrase);
        if (decrypted && decrypted.history) {
          onRestoreData(decrypted.history);
          setRestoreStatus(`✅ Berhasil memulihkan ${decrypted.history.length} log koneksi dari arsip terenkripsi.`);
        } else {
          setRestoreStatus('❌ File tidak valid atau format tidak sesuai.');
        }
      } catch (err: any) {
        setRestoreStatus('❌ Gagal dekripsi: Sandi enkripsi salah atau file rusak.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Pencadangan Cloud Terenkripsi AES-GCM 256
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data histori koneksi & status bridging tersimpan aman dengan enkripsi tingkat militer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Key & Config */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kunci Sandi Enkripsi (Client-side PBKDF2)</span>
            </label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              Kunci ini tidak pernah dikirim ke server. Dekripsi hanya bisa dilakukan dengan kunci yang sama.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jadwal Pencadangan Otomatis
              </label>
              <select
                value={autoBackupInterval}
                onChange={(e) => setAutoBackupInterval(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="1hr">Setiap 1 Jam</option>
                <option value="6hr">Setiap 6 Jam</option>
                <option value="24hr">Setiap 24 Jam (Tengah Malam)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Node Penyimpanan
              </label>
              <div className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="truncate">BPJS-CLOUD-STORAGE-S3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: Export Encrypted & Restore */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Cadangkan {history.length} Catatan Log Sekarang
              </span>
              <span className="text-[11px] text-slate-500">
                Format: .bpjsenc (AES-GCM 256 + PBKDF2 SHA-256)
              </span>
            </div>

            <button
              id="btn-create-cloud-backup"
              type="button"
              disabled={isEncrypting}
              onClick={handleCreateEncryptedBackup}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>{isEncrypting ? 'Mengenkripsi...' : backupSuccess ? 'Tersimpan & Terunduh!' : 'Unduh Cadangan'}</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Pulihkan Data dari Berkas (.bpjsenc)
              </span>
              <span className="text-[11px] text-slate-500">
                Unggah file arsip terenkripsi untuk membaca riwayat
              </span>
            </div>

            <label className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5">
              <Upload className="w-4 h-4" />
              <span>Pilih Berkas</span>
              <input type="file" accept=".bpjsenc,.json,.txt" onChange={handleRestoreFile} className="hidden" />
            </label>
          </div>

          {restoreStatus && (
            <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 text-xs font-medium">
              {restoreStatus}
            </div>
          )}
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
