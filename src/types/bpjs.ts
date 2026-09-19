export interface ConnectionCheckResult {
  id: string;
  timestamp: string;
  host: string;
  endpoint: string;
  dns: {
    success: boolean;
    ips: string[];
    display: string;
    durationMs?: number;
  };
  tcp: {
    success: boolean;
    port: number;
    display: string;
    durationMs: number;
  };
  tls: {
    success: boolean;
    protocol: string;
    cipher?: string;
    display: string;
    durationMs: number;
  };
  http: {
    status: number;
    statusText: string;
    display: string;
  };
  responseTimeMs: number;
  kesimpulan: string;
  catatan: string;
  isHealthy: boolean;
  serviceType: 'vclaim' | 'antrean' | 'aplicares' | 'pcare' | 'ihs' | 'custom';
}

export interface PesertaBPJS {
  noKartu: string;
  nik: string;
  nama: string;
  sex: 'L' | 'P';
  tglLahir: string;
  umur: number;
  statusPeserta: {
    kode: '0' | '1' | '2';
    keterangan: 'AKTIF' | 'TUNGGAKAN' | 'NON-AKTIF';
  };
  jenisPeserta: {
    kode: string;
    keterangan: string; // e.g. 'PEKERJA PENERIMA UPAH (PPU)', 'PBI APBN', 'PBPU MANDIRI'
  };
  hakKelas: {
    kode: string;
    keterangan: string; // 'Kelas 1', 'Kelas 2', 'Kelas 3'
  };
  faskes1: {
    kode: string;
    nama: string;
    telepon?: string;
  };
  tglAkhirBerlaku: string;
  tglCetakKartu: string;
  tunggakan: number;
  riwayatPelayananTerakhir?: {
    tglPelayanan: string;
    faskes: string;
    diagnosa: string;
    poli: string;
    noSep: string;
  };
}

export interface UrgentTask {
  id: string;
  title: string;
  category: 'Klaim BPJS' | 'Sertifikat SSL' | 'Antrean RS' | 'Iuran Peserta' | 'Sinkronisasi Data';
  deadline: string;
  priority: 'Tinggi' | 'Mendesak' | 'Normal';
  isCompleted: boolean;
  notes: string;
  assignee: string;
}

export interface CloudBackupRecord {
  id: string;
  timestamp: string;
  recordCount: number;
  fileSizeBytes: number;
  checksum: string;
  encryptedWith: 'AES-GCM-256';
  storageTarget: string;
  status: 'Tersimpan Terenkripsi' | 'Gagal' | 'Memverifikasi';
}

export interface SyncLog {
  id: string;
  timestamp: string;
  deviceSource: string;
  endpoint: string;
  recordsSynced: number;
  status: 'Berhasil' | 'Gagal' | 'Proses';
  message: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'status_change' | 'urgent_task' | 'latency_warning' | 'sync_event';
  read: boolean;
}

export type SupportedLanguage = 'id' | 'en' | 'jw';

export interface UserSession {
  name: string;
  role: string;
  faskesName: string;
  faskesCode: string;
  avatarUrl?: string;
}
