import React, { useState } from 'react';
import { 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Activity, 
  UserCheck, 
  BarChart3, 
  FileDown, 
  Eye, 
  X 
} from 'lucide-react';
import { SupportedLanguage } from '../types/bpjs';

interface InteractiveTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: SupportedLanguage;
}

export const InteractiveTourModal: React.FC<InteractiveTourModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: '1. Pemantauan & Uji Koneksi BPJS Real-Time',
      icon: Activity,
      color: 'text-emerald-600',
      description: 'Pemeriksaan status konektivitas jaringan ke server resmi BPJS Kesehatan VClaim REST (apijkn.bpjs-kesehatan.go.id/vclaim-rest/). Sistem memeriksa 4 parameter inti: DNS Resolver, TCP Port 443, Handshake TLSv1.2, serta status HTTP dan waktu respons (ms).',
      tip: 'Status HTTP 401 atau 403 tetap menandakan koneksi server berhasil; hanya membutuhkan otorisasi kredensial faskes.'
    },
    {
      title: '2. Output Diagnostik Baku & Salin Teks',
      icon: FileDown,
      color: 'text-sky-600',
      description: 'Hasil pengujian disajikan dalam format teks baku resmi BPJS Kesehatan yang siap Anda salin dengan satu klik untuk dikirimkan ke Tim IT BPJS atau Helpdesk saat pelaporan kendala jaringan.',
      tip: 'Gunakan tombol "Salin Hasil" atau "Dengarkan" untuk narasi suara hasil pemeriksaan.'
    },
    {
      title: '3. Riwayat Log Akses & Ekspor Laporan',
      icon: Activity,
      color: 'text-amber-600',
      description: 'Seluruh riwayat pengujian tersimpan rapi dalam tabel log klasik dengan fitur pencarian dan penyaringan instan. Anda dapat mencetak laporan resmi dalam format PDF berlogo BPJS atau mengekspor seluruh data ke CSV.',
      tip: 'Klik tombol "PDF" pada bilah atas atau tabel riwayat untuk langsung mengunduh berkas laporan.'
    },
    {
      title: '4. Tampilan Klasik Cepat & Ramah Lansia',
      icon: Eye,
      color: 'text-rose-600',
      description: 'Aplikasi didesain dalam Mode Klasik yang tertata, bersih, dan memuat seketika tanpa lag. Tersedia dukungan Mode Gelap serta Mode Ramah Lansia dengan teks besar dan kontras tinggi.',
      tip: 'Gunakan tombol A/A+ di bilah navigasi untuk mengatur ukuran font yang paling nyaman.'
    }
  ];

  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Panduan Penggunaan Interaktif
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Visual Card */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-white dark:bg-slate-700 shadow-xs flex items-center justify-center ${current.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Langkah {step + 1} dari {steps.length}
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                {current.title}
              </h4>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {current.description}
          </p>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-[11px] text-emerald-800 dark:text-emerald-300">
            <span className="font-bold">Tips Cepat: </span>
            {current.tip}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-2">
          {/* Step indicators */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  step === i ? 'w-6 bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Sebelumnya
              </button>
            )}

            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Selesai</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
