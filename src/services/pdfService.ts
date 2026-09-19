import { jsPDF } from 'jspdf';
import { ConnectionCheckResult, PesertaBPJS } from '../types/bpjs';
import { getLatencyClassification } from './bpjsService';

export function generateBPJSReportPDF(
  latestCheck: ConnectionCheckResult | null,
  history: ConnectionCheckResult[],
  activePeserta: PesertaBPJS | null,
  operatorName: string = 'dr. Widodo'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 16;

  // Header Banner
  doc.setFillColor(15, 76, 129); // BPJS Deep Navy
  doc.rect(14, y, pageWidth - 28, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('BPJS KESEHATAN - LAPORAN DIAGNOSTIK KONEKSI & AKSES JKN', 18, y + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Sistem Pemantauan Pakdhe | Bridging API & Real-time Status Verification', 18, y + 15);

  y += 28;

  // Metadata Row
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' });
  const docNo = `DOC-JKN/${new Date().getFullYear()}/${(Date.now() % 100000).toString().padStart(6, '0')}`;

  doc.text(`Nomor Laporan : ${docNo}`, 14, y);
  doc.text(`Waktu Cetak   : ${nowStr} WIB`, 14, y + 5);
  doc.text(`Operator / PIC : ${operatorName}`, pageWidth - 14, y, { align: 'right' });
  doc.text(`Status Jaringan: ${latestCheck?.isHealthy ? 'NORMAL / TERHUBUNG' : 'PERIKSA JALUR'}`, pageWidth - 14, y + 5, { align: 'right' });

  y += 12;
  doc.setDrawColor(220, 220, 220);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  // Section 1: Ringkasan Hasil Cek Terkini
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 76, 129);
  doc.text('1. HASIL DIAGNOSTIK KONEKTIVITAS TERAKHIR', 14, y);
  y += 6;

  if (latestCheck) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, pageWidth - 28, 48, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, y, pageWidth - 28, 48, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    const leftColX = 18;
    const valColX = 55;

    doc.text('Host Target:', leftColX, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(latestCheck.host, valColX, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.text('Endpoint API:', leftColX, y + 13);
    doc.setFont('helvetica', 'normal');
    doc.text(latestCheck.endpoint, valColX, y + 13);

    doc.setFont('helvetica', 'bold');
    doc.text('DNS Resolusi:', leftColX, y + 19);
    doc.setFont('helvetica', 'normal');
    doc.text(latestCheck.dns.display, valColX, y + 19);

    doc.setFont('helvetica', 'bold');
    doc.text('TCP Port 443:', leftColX, y + 25);
    doc.setFont('helvetica', 'normal');
    doc.text(latestCheck.tcp.display, valColX, y + 25);

    doc.setFont('helvetica', 'bold');
    doc.text('Protokol TLS:', leftColX, y + 31);
    doc.setFont('helvetica', 'normal');
    doc.text(latestCheck.tls.display, valColX, y + 31);

    doc.setFont('helvetica', 'bold');
    doc.text('HTTP Status:', leftColX, y + 37);
    doc.setFont('helvetica', 'normal');
    doc.text(`${latestCheck.http.display} (${latestCheck.http.statusText})`, valColX, y + 37);

    doc.setFont('helvetica', 'bold');
    doc.text('Waktu Respons/Letensi:', leftColX, y + 43);
    doc.setFont('helvetica', 'normal');
    const latInfo = getLatencyClassification(latestCheck.responseTimeMs);
    doc.text(`${latestCheck.responseTimeMs} ms (${latInfo.tanda} ${latInfo.kelompok})`, valColX, y + 43);

    y += 52;

    // Kesimpulan Box
    doc.setFillColor(236, 253, 245); // Emerald light
    doc.roundedRect(14, y, pageWidth - 28, 14, 2, 2, 'F');
    doc.setDrawColor(52, 211, 153);
    doc.roundedRect(14, y, pageWidth - 28, 14, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(6, 95, 70);
    doc.text('Kesimpulan:', 18, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(latestCheck.kesimpulan, 36, y + 5);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Catatan: ' + latestCheck.catatan, 18, y + 10);

    y += 18;
  }

  // Section 2: Detail Status Peserta (jika ada)
  if (activePeserta) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 76, 129);
    doc.text('2. STATUS KEPESERTAAN REAL-TIME TERVERIFIKASI', 14, y);
    y += 6;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, pageWidth - 28, 38, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, y, pageWidth - 28, 38, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    doc.text('Nama Peserta:', 18, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(activePeserta.nama, 52, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.text('No. Kartu BPJS:', 18, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.text(activePeserta.noKartu, 52, y + 12);

    doc.setFont('helvetica', 'bold');
    doc.text('NIK KTP:', 18, y + 18);
    doc.setFont('helvetica', 'normal');
    doc.text(activePeserta.nik, 52, y + 18);

    doc.setFont('helvetica', 'bold');
    doc.text('Status Peserta:', 18, y + 24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(activePeserta.statusPeserta.keterangan === 'AKTIF' ? 22 : 185, activePeserta.statusPeserta.keterangan === 'AKTIF' ? 101 : 28, 28);
    doc.text(activePeserta.statusPeserta.keterangan, 52, y + 24);

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('Jenis Peserta:', 18, y + 30);
    doc.setFont('helvetica', 'normal');
    doc.text(activePeserta.jenisPeserta.keterangan, 52, y + 30);

    // Right Column
    const rightColLabel = 110;
    const rightColVal = 145;

    doc.setFont('helvetica', 'bold');
    doc.text('Hak Rawat:', rightColLabel, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(activePeserta.hakKelas.keterangan, rightColVal, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.text('Faskes Tingkat 1:', rightColLabel, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${activePeserta.faskes1.nama} (${activePeserta.faskes1.kode})`, rightColVal, y + 12);

    doc.setFont('helvetica', 'bold');
    doc.text('Masa Berlaku:', rightColLabel, y + 18);
    doc.setFont('helvetica', 'normal');
    doc.text(activePeserta.tglAkhirBerlaku, rightColVal, y + 18);

    doc.setFont('helvetica', 'bold');
    doc.text('Tunggakan Iuran:', rightColLabel, y + 24);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rp ${activePeserta.tunggakan.toLocaleString('id-ID')}`, rightColVal, y + 24);

    doc.setFont('helvetica', 'bold');
    doc.text('Pelayanan Terakhir:', rightColLabel, y + 30);
    doc.setFont('helvetica', 'normal');
    doc.text(activePeserta.riwayatPelayananTerakhir ? `${activePeserta.riwayatPelayananTerakhir.poli} (${activePeserta.riwayatPelayananTerakhir.tglPelayanan})` : '-', rightColVal, y + 30);

    y += 44;
  }

  // Section 3: Riwayat Log Akses Terakhir
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 76, 129);
  doc.text('3. RIWAYAT LOG AKSES & KONEKSI TERBARU', 14, y);
  y += 6;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 6, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, pageWidth - 28, 6, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  doc.text('WAKTU (WIB)', 17, y + 4.2);
  doc.text('ENDPOINT API', 45, y + 4.2);
  doc.text('DNS / IP', 95, y + 4.2);
  doc.text('TCP/TLS', 135, y + 4.2);
  doc.text('HTTP', 158, y + 4.2);
  doc.text('LATENSI', 175, y + 4.2);

  y += 6;

  // Render Table Rows (up to 8 rows to stay on one elegant page)
  const rows = history.slice(0, 8);
  rows.forEach((log) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);

    const timeShort = new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    doc.text(timeShort, 17, y + 4.2);

    const endpointShort = log.endpoint.replace('https://apijkn.bpjs-kesehatan.go.id/', '/');
    doc.text(endpointShort.length > 28 ? endpointShort.slice(0, 27) + '...' : endpointShort, 45, y + 4.2);

    const ipShort = log.dns.ips.length > 0 ? log.dns.ips[0] : 'N/A';
    doc.text(ipShort, 95, y + 4.2);

    doc.text(`443 / ${log.tls.protocol || 'TLSv1.2'}`, 135, y + 4.2);
    doc.text(`${log.http.status}`, 158, y + 4.2);
    doc.text(`${log.responseTimeMs} ms`, 175, y + 4.2);

    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 6, pageWidth - 14, y + 6);
    y += 5.5;
  });

  y += 6;

  // Footer & Digital Verification Sign
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('Dokumen ini di-generate secara otomatis oleh Sistem Pemantauan BPJS Kesehatan (Pemantauan Pakdhe).', 14, y);
  doc.text('Kerahasiaan data peserta dilindungi sesuai regulasi keamanan informasi BPJS Kesehatan.', 14, y + 4);

  // Save / trigger download
  const filename = `Laporan_Koneksi_BPJS_${new Date().toISOString().split('T')[0]}_${Date.now().toString().slice(-4)}.pdf`;
  doc.save(filename);
}

export function exportHistoryToCSV(history: ConnectionCheckResult[]) {
  const headers = [
    'ID',
    'Timestamp',
    'Host',
    'Endpoint',
    'DNS_Status',
    'IP_Addresses',
    'TCP_443_Status',
    'TLS_Protocol',
    'TLS_Cipher',
    'HTTP_Status',
    'Waktu_Respons_ms',
    'Klasifikasi_Letensi',
    'Kelompok_Letensi',
    'Kesimpulan',
    'Catatan'
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = history.map(item => {
    const lat = getLatencyClassification(item.responseTimeMs);
    return [
      item.id,
      item.timestamp,
      item.host,
      item.endpoint,
      item.dns.display,
      item.dns.ips.join('; '),
      item.tcp.display,
      item.tls.protocol,
      item.tls.cipher || '',
      item.http.status,
      item.responseTimeMs,
      lat.kategori,
      lat.kelompok,
      item.kesimpulan,
      item.catatan
    ].map(escapeCSV).join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Riwayat_Koneksi_BPJS_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
