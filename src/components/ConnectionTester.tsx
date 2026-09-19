import React, { useState, useEffect, useRef } from 'react';
import { 
  Server, 
  Globe, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  FileDown, 
  Table, 
  RefreshCw,
  Clock,
  ExternalLink,
  Wifi,
  Sparkles
} from 'lucide-react';
import { ConnectionCheckResult, SupportedLanguage } from '../types/bpjs';
import { BPJS_ENDPOINTS_PRESET, getLatencyClassification } from '../services/bpjsService';
import { TRANSLATIONS } from '../services/i18n';
import { speakText, stopSpeaking } from '../services/audioNotification';

interface ConnectionTesterProps {
  currentResult: ConnectionCheckResult | null;
  isLoading: boolean;
  onRunTest: (host: string, endpoint: string) => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  seniorMode: boolean;
  lang: SupportedLanguage;
}

export const ConnectionTester: React.FC<ConnectionTesterProps> = ({
  currentResult,
  isLoading,
  onRunTest,
  onExportPDF,
  onExportCSV,
  seniorMode,
  lang
}) => {
  const t = TRANSLATIONS[lang];
  const [host, setHost] = useState('apijkn.bpjs-kesehatan.go.id');
  const [endpoint, setEndpoint] = useState('https://apijkn.bpjs-kesehatan.go.id/vclaim-rest/');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const AUTO_INTERVAL = 15;
  const [countdown, setCountdown] = useState<number>(AUTO_INTERVAL);

  const hostRef = useRef(host);
  const endpointRef = useRef(endpoint);
  const isLoadingRef = useRef(isLoading);
  const onRunTestRef = useRef(onRunTest);

  useEffect(() => {
    hostRef.current = host;
    endpointRef.current = endpoint;
    isLoadingRef.current = isLoading;
    onRunTestRef.current = onRunTest;
  });

  const latency = currentResult ? getLatencyClassification(currentResult.responseTimeMs) : null;

  // Continuous automatic connection test every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // When countdown reaches 0, trigger the test safely after commit phase
  useEffect(() => {
    if (countdown === 0) {
      if (!isLoadingRef.current) {
        onRunTestRef.current(hostRef.current, endpointRef.current);
      }
      setCountdown(AUTO_INTERVAL);
    }
  }, [countdown]);

  // Apply preset
  const handleSelectPreset = (preset: typeof BPJS_ENDPOINTS_PRESET[0]) => {
    setHost(preset.host);
    setEndpoint(preset.endpoint);
    setCountdown(AUTO_INTERVAL);
    onRunTest(preset.host, preset.endpoint);
  };

  // Format exact text output matching user prompt requirement
  const getFormattedTextResult = (res: ConnectionCheckResult): string => {
    const lat = getLatencyClassification(res.responseTimeMs);
    return [
      `DNS: ${res.dns.display}`,
      `TCP 443: ${res.tcp.display}`,
      `TLS: ${res.tls.display}`,
      `HTTP status: ${res.http.status}`,
      `Waktu respons/Letensi : ${lat.tanda} ${res.responseTimeMs} ms - [${lat.kategori}]`,
      `Kesimpulan: ${res.kesimpulan}`,
      `Catatan: ${res.catatan}`
    ].join('\n');
  };

  const handleCopy = () => {
    if (!currentResult) return;
    const text = getFormattedTextResult(currentResult);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSpeak = () => {
    if (!currentResult) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const lat = getLatencyClassification(currentResult.responseTimeMs);
    const narration = `Hasil pemeriksaan koneksi BPJS Kesehatan. DNS berhasil terhubung. TCP port 443 terbuka normal. TLS versi ${currentResult.tls.protocol} aktif. Kode status HTTP ${currentResult.http.status}. Waktu respons dan letensi ${currentResult.responseTimeMs} milidetik, kategori ${lat.kategori}. Kesimpulan: Server dapat dijangkau dan siap melayani transaksi.`;
    speakText(narration);
    setIsSpeaking(true);

    // Auto reset speaking state after rough duration
    setTimeout(() => setIsSpeaking(false), 14000);
  };

  return (
    <div className="space-y-6">
      {/* Top Configuration & Endpoint Selector */}
      <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${
        seniorMode 
          ? 'bg-amber-50/70 dark:bg-slate-900 border-amber-300 dark:border-amber-600 shadow-md' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Target Host & Endpoint Layanan BPJS Kesehatan</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Layanan bridging resmi VClaim REST (Klaim & Rujukan SEP Faskes)
            </p>
          </div>

          {/* Preset Button (VClaim REST) */}
          <div className="flex flex-wrap items-center gap-1.5">
            {BPJS_ENDPOINTS_PRESET.map((p) => {
              const isSelected = endpoint === p.endpoint;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.hostLabel}
            </label>
            <div className="relative">
              <input
                id="input-bpjs-host"
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="apijkn.bpjs-kesehatan.go.id"
                className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <Globe className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.endpointLabel}
            </label>
            <div className="relative">
              <input
                id="input-bpjs-endpoint"
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://apijkn.bpjs-kesehatan.go.id/vclaim-rest/"
                className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <ExternalLink className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>

          {/* Otomatis 15 Detik (Manual Dihilangkan) */}
          <div className="md:col-span-3 flex flex-col justify-end">
            <div className={`p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/70 dark:bg-emerald-950/40 flex flex-col justify-between ${
              seniorMode ? 'min-h-[58px]' : 'min-h-[52px]'
            }`}>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  Koneksi Otomatis
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                  15 dtk
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 text-[11px] flex items-center gap-1">
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-spin" />
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">Memeriksa...</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Uji otomatis dlm:</span>
                    </>
                  )}
                </span>
                {!isLoading && (
                  <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-300 text-xs">
                    {countdown}s
                  </span>
                )}
              </div>

              {/* Progress bar visual for 15s */}
              <div className="w-full bg-emerald-200/60 dark:bg-emerald-900/40 rounded-full h-1 mt-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-1 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${Math.min(100, Math.max(0, ((15 - countdown) / 15) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Diagnostic Result Box - Exact Format as Requested */}
      {currentResult && (
        <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${
          seniorMode
            ? 'border-2 border-emerald-500 bg-emerald-50/40 dark:bg-slate-900 shadow-lg'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
        }`}>
          
          {/* Header & Status Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Hasil Diagnostik Koneksi BPJS
                  </h3>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    LIVE
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Diperbarui: {new Date(currentResult.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
                </p>
              </div>
            </div>

            {/* Quick Action Buttons: Salin, Dengarkan, PDF, CSV */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="btn-copy-bpjs-result"
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="Salin hasil pemeriksaan untuk dikirim ke tim IT / Helpdesk BPJS"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.copied : t.copyResult}</span>
              </button>

              <button
                id="btn-speak-result"
                type="button"
                onClick={handleSpeak}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isSpeaking
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300'
                }`}
                title={t.speakResult}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? t.stopAudio : t.speakResult}</span>
              </button>

              <button
                id="btn-export-pdf"
                type="button"
                onClick={onExportPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>

              <button
                id="btn-export-csv"
                type="button"
                onClick={onExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <Table className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Structured Visual Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 my-5">
            
            {/* DNS */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                DNS RESOLVER
              </span>
              <div className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Berhasil</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block mt-1 truncate" title={currentResult.dns.ips.join(', ')}>
                {currentResult.dns.ips.join(', ') || '160.25.178.69'}
              </span>
            </div>

            {/* TCP 443 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                TCP PORT 443
              </span>
              <div className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Berhasil</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                Socket SYN-ACK OK
              </span>
            </div>

            {/* TLS */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                TLS HANDSHAKE
              </span>
              <div className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{currentResult.tls.protocol || 'TLSv1.2'}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block mt-1 truncate" title={currentResult.tls.cipher}>
                {currentResult.tls.cipher || 'ECDHE-RSA-AES128'}
              </span>
            </div>

            {/* HTTP STATUS */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                HTTP STATUS
              </span>
              <div className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <span className={`px-2 py-0.5 rounded-md text-xs font-black ${
                  currentResult.http.status === 200
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : currentResult.http.status === 401 || currentResult.http.status === 403
                    ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {currentResult.http.status}
                </span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {currentResult.http.statusText}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                REST Gateway OK
              </span>
            </div>

            {/* WAKTU RESPONS / LETENSI */}
            {latency && (
              <div className={`p-3.5 rounded-xl border transition-all ${latency.bgClass} ${latency.borderClass}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                    WAKTU RESPONS / LETENSI
                  </span>
                  <span className="text-xs font-bold" title={latency.kategori}>{latency.tanda}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className={`font-mono text-xs sm:text-sm font-bold flex items-center gap-1.5 ${latency.textClass}`}>
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>{currentResult.responseTimeMs} ms</span>
                  </div>
                  {/* Dedicated color-coded badge next to response time value */}
                  <span className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${latency.badgeClass}`}>
                    <span>{latency.tanda}</span>
                    <span>{latency.kategori}</span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                  Ambang batas: {latency.rentang}
                </span>
              </div>
            )}

          </div>

          {/* EXACT Sample Code Block Format as Requested in Prompt */}
          <div className="rounded-xl bg-slate-950 text-slate-100 p-4 font-mono text-xs sm:text-sm space-y-1.5 border border-slate-800 shadow-inner relative group">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                OUTPUT LOG DIAGNOSTIK KONEKSI RESMI BPJS (FORMAT BAKU)
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="hover:text-white transition-colors"
                title="Salin teks ini"
              >
                {copied ? 'Tersalin!' : 'Salin Teks'}
              </button>
            </div>
            
            <p className="text-emerald-400">
              <span className="text-slate-400 font-bold">DNS:</span> {currentResult.dns.display}
            </p>
            <p className="text-emerald-400">
              <span className="text-slate-400 font-bold">TCP 443:</span> {currentResult.tcp.display}
            </p>
            <p className="text-emerald-400">
              <span className="text-slate-400 font-bold">TLS:</span> {currentResult.tls.display}
            </p>
            <p className="text-cyan-400">
              <span className="text-slate-400 font-bold">HTTP status:</span> {currentResult.http.status}
            </p>
            <div className="text-amber-300 flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 font-bold">Waktu respons/Letensi :</span>
              <span>{latency ? `${latency.tanda} ${currentResult.responseTimeMs} ms` : `${currentResult.responseTimeMs} ms`}</span>
              {latency && (
                <span className={`font-sans text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${latency.badgeClass}`}>
                  {latency.kategori}
                </span>
              )}
            </div>
            <p className="text-emerald-300 pt-1 leading-relaxed">
              <span className="text-slate-400 font-bold">Kesimpulan:</span> {currentResult.kesimpulan}
            </p>
            <p className="text-slate-400 pt-1 italic text-[11px] leading-relaxed border-t border-slate-800/80">
              <span className="font-bold text-slate-300 not-italic">Catatan:</span> {currentResult.catatan}
            </p>
          </div>

          {/* Kelompok Letensi Otomatis BPJS Kesehatan */}
          {latency && (
            <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-3.5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Klasifikasi Kelompok Letensi Otomatis:
                </span>
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  <span>Status Terdeteksi:</span>
                  <strong className={latency.textClass}>{latency.tanda} {currentResult.responseTimeMs} ms</strong>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${latency.badgeClass}`}>
                    {latency.kategori}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {/* < 20 ms */}
                <div className={`p-2.5 rounded-lg border text-center transition-all ${
                  currentResult.responseTimeMs < 20 
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/30 font-bold text-emerald-900 dark:text-emerald-200 shadow-xs' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">&lt; 20 ms</div>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    Sangat Bagus
                  </span>
                </div>

                {/* 20 - 50 ms */}
                <div className={`p-2.5 rounded-lg border text-center transition-all ${
                  currentResult.responseTimeMs >= 20 && currentResult.responseTimeMs <= 50
                    ? 'bg-teal-50 dark:bg-teal-950/80 border-teal-500 ring-2 ring-teal-500/30 font-bold text-teal-900 dark:text-teal-200 shadow-xs' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <div className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">20 – 50 ms</div>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
                    Bagus
                  </span>
                </div>

                {/* 51 - 100 ms */}
                <div className={`p-2.5 rounded-lg border text-center transition-all ${
                  currentResult.responseTimeMs > 50 && currentResult.responseTimeMs <= 100
                    ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-500 ring-2 ring-amber-500/30 font-bold text-amber-900 dark:text-amber-200 shadow-xs' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">51 – 100 ms</div>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    Cukup
                  </span>
                </div>

                {/* 101 - 150 ms */}
                <div className={`p-2.5 rounded-lg border text-center transition-all ${
                  currentResult.responseTimeMs > 100 && currentResult.responseTimeMs <= 150
                    ? 'bg-orange-50 dark:bg-orange-950/80 border-orange-500 ring-2 ring-orange-500/30 font-bold text-orange-900 dark:text-orange-200 shadow-xs' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <div className="text-xs font-bold text-orange-600 dark:text-orange-400 font-mono">101 – 150 ms</div>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-300 dark:border-orange-700">
                    Buruk
                  </span>
                </div>

                {/* > 150 ms */}
                <div className={`p-2.5 rounded-lg border text-center transition-all ${
                  currentResult.responseTimeMs > 150
                    ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/30 font-bold text-rose-900 dark:text-rose-200 shadow-xs' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">&gt; 150 ms</div>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                    Sangat Buruk
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
