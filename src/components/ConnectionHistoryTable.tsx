import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  FileDown, 
  Table, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  ExternalLink,
  Trash2,
  Eye
} from 'lucide-react';
import { ConnectionCheckResult, SupportedLanguage } from '../types/bpjs';
import { TRANSLATIONS } from '../services/i18n';
import { getLatencyClassification } from '../services/bpjsService';

interface ConnectionHistoryTableProps {
  history: ConnectionCheckResult[];
  onSelectLog: (log: ConnectionCheckResult) => void;
  onClearHistory: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  seniorMode: boolean;
  lang: SupportedLanguage;
}

export const ConnectionHistoryTable: React.FC<ConnectionHistoryTableProps> = ({
  history,
  onSelectLog,
  onClearHistory,
  onExportPDF,
  onExportCSV,
  seniorMode,
  lang
}) => {
  const t = TRANSLATIONS[lang];
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDetail, setSelectedDetail] = useState<ConnectionCheckResult | null>(null);

  const filtered = history.filter(item => {
    const matchesSearch = 
      item.endpoint.toLowerCase().includes(search.toLowerCase()) ||
      item.host.toLowerCase().includes(search.toLowerCase()) ||
      item.dns.ips.some(ip => ip.includes(search));

    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;
    if (filterStatus === '200') return item.http.status === 200;
    if (filterStatus === 'auth') return item.http.status === 401 || item.http.status === 403;
    if (filterStatus === 'error') return !item.isHealthy || item.http.status >= 500;
    return true;
  });

  return (
    <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${
      seniorMode
        ? 'border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md'
        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs'
    }`}>
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Riwayat Log Koneksi & Akses JKN ({history.length} Catatan)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log riwayat tersimpan lokal dengan waktu respons, handshake TLS, dan kesimpulan diagnostik
          </p>
        </div>

        {/* Filter & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter endpoint/IP..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-40 sm:w-48"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="all">Semua Status</option>
            <option value="200">HTTP 200 OK</option>
            <option value="auth">401/403 Auth</option>
            <option value="error">Kendala/Timeout</option>
          </select>

          <button
            type="button"
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Table className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              title="Bersihkan riwayat"
              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
              <th className="py-2.5 px-3">Waktu (WIB)</th>
              <th className="py-2.5 px-3">Endpoint API</th>
              <th className="py-2.5 px-3">DNS IP</th>
              <th className="py-2.5 px-3">TCP / TLS</th>
              <th className="py-2.5 px-3">HTTP Status</th>
              <th className="py-2.5 px-3">Latensi</th>
              <th className="py-2.5 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  Belum ada catatan riwayat koneksi yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr 
                  key={log.id} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  onClick={() => onSelectLog(log)}
                >
                  <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-800 dark:text-slate-200 font-medium max-w-[200px] truncate" title={log.endpoint}>
                    {log.endpoint.replace('https://apijkn.bpjs-kesehatan.go.id', '')}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {log.dns.ips[0] || '160.25.178.69'}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      443 / {log.tls.protocol}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      log.http.status === 200
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : log.http.status === 401 || log.http.status === 403
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {log.http.status} {log.http.statusText}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold whitespace-nowrap">
                    {(() => {
                      const lat = getLatencyClassification(log.responseTimeMs);
                      return (
                        <div className="flex items-center gap-2">
                          <span className={lat.textClass}>
                            {log.responseTimeMs} ms
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 shadow-2xs ${lat.badgeClass}`}>
                            <span>{lat.tanda}</span>
                            <span>{lat.kategori}</span>
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDetail(log);
                      }}
                      className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                      title="Lihat Detail Log"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Raw Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                Rincian Log Diagnostik #{selectedDetail.id.slice(-6)}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl text-emerald-400 font-mono text-xs space-y-1 overflow-x-auto">
              <p>DNS: {selectedDetail.dns.display}</p>
              <p>TCP 443: {selectedDetail.tcp.display}</p>
              <p>TLS: {selectedDetail.tls.display}</p>
              <p className="text-cyan-400">HTTP status: {selectedDetail.http.status}</p>
              {(() => {
                const lat = getLatencyClassification(selectedDetail.responseTimeMs);
                return (
                  <div className="text-amber-300 flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400 font-bold">Waktu respons/Letensi:</span>
                    <span>{lat.tanda} {selectedDetail.responseTimeMs} ms</span>
                    <span className={`font-sans text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${lat.badgeClass}`}>
                      {lat.kategori}
                    </span>
                  </div>
                );
              })()}
              <p className="text-emerald-300">Kesimpulan: {selectedDetail.kesimpulan}</p>
              <p className="text-slate-400 italic">Catatan: {selectedDetail.catatan}</p>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              <p>Host: {selectedDetail.host}</p>
              <p className="truncate">Endpoint: {selectedDetail.endpoint}</p>
              <p>Waktu Catat: {new Date(selectedDetail.timestamp).toLocaleString('id-ID')}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
