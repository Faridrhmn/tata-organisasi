import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Filter,
  Download,
  Building2,
  FileText,
  X,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Check,
} from 'lucide-react';

interface Transaction {
  id: string;
  account_name: string;
  category_name: string;
  category_color?: string;
  type: 'income' | 'expense';
  amount: number;
  transaction_date: string;
  description: string;
  receipt_url?: string;
  status: 'completed' | 'void';
}

export const FinancePage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Initial demonstration cashflow data
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-1',
      account_name: 'Kas Tunai Utama',
      category_name: 'Infaq & Sedekah Jumat',
      category_color: '#16a34a',
      type: 'income',
      amount: 3250000,
      transaction_date: '2026-11-06',
      description: 'Kotak Infaq Jumat Pekan Pertama November',
      status: 'completed',
    },
    {
      id: 'tx-2',
      account_name: 'BSI Operasional',
      category_name: 'Donasi Khusus Dakwah',
      category_color: '#10b981',
      type: 'income',
      amount: 1500000,
      transaction_date: '2026-11-04',
      description: 'Transfer Donasi Hamba Allah via QRIS BSI',
      status: 'completed',
    },
    {
      id: 'tx-3',
      account_name: 'Kas Tunai Utama',
      category_name: 'Honor & Akomodasi Pemateri',
      category_color: '#d97706',
      type: 'expense',
      amount: 500000,
      transaction_date: '2026-11-01',
      description: 'Bisyarah Kajian Shubuh Ahad Ustadz Abdullah',
      status: 'completed',
    },
    {
      id: 'tx-4',
      account_name: 'BSI Operasional',
      category_name: 'Operasional & Tagihan Listrik/Air',
      category_color: '#dc2626',
      type: 'expense',
      amount: 820000,
      transaction_date: '2026-10-28',
      description: 'Pembayaran Tagihan Listrik PLN Pascabayar',
      status: 'completed',
    },
    {
      id: 'tx-5',
      account_name: 'Kas Tunai Utama',
      category_name: 'Konsumsi Acara Kajian',
      category_color: '#ea580c',
      type: 'expense',
      amount: 350000,
      transaction_date: '2026-10-25',
      description: 'Snack dan Air Mineral Kajian Muslimah',
      status: 'completed',
    },
  ]);

  // Form states
  const [formType, setFormType] = useState<'income' | 'expense'>('income');
  const [formAccount, setFormAccount] = useState('Kas Tunai Utama');
  const [formCategory, setFormCategory] = useState('Infaq & Sedekah Jumat');
  const [formAmount, setFormAmount] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  // Computations
  const totalBalance = 14850000;
  const totalIncome = transactions
    .filter((t) => t.type === 'income' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  // Export States & Handlers
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [exportPeriod, setExportPeriod] = useState<string>('current_month');
  const [exportAccount, setExportAccount] = useState<string>('all');
  const [exportSuccessNotice, setExportSuccessNotice] = useState<string | null>(null);

  const getFilteredExportData = () => {
    return transactions.filter((t) => {
      if (exportAccount !== 'all' && t.account_name !== exportAccount) {
        return false;
      }
      if (exportPeriod === 'current_month') {
        return t.transaction_date.startsWith('2026-11');
      }
      if (exportPeriod === 'last_month') {
        return t.transaction_date.startsWith('2026-10');
      }
      return true;
    });
  };

  const handleExportCSV = () => {
    const data = getFilteredExportData();
    const periodLabel =
      exportPeriod === 'current_month'
        ? 'November 2026'
        : exportPeriod === 'last_month'
        ? 'Oktober 2026'
        : 'Semua Periode';

    const headers = ['ID Transaksi', 'Tanggal', 'Tipe', 'Kategori', 'Rekening', 'Keterangan', 'Nominal (Rp)', 'Status'];
    const rows = data.map((t) => [
      t.id,
      t.transaction_date,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      `"${t.category_name.replace(/"/g, '""')}"`,
      `"${t.account_name.replace(/"/g, '""')}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.type === 'income' ? t.amount : -t.amount,
      'Tercatat',
    ]);

    const totalIn = data.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalOut = data.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const net = totalIn - totalOut;

    const csvLines = [
      `"LAPORAN KAS & KEUANGAN - MASJID AL-IKHLAS"`,
      `"Periode: ${periodLabel}"`,
      `"Rekening: ${exportAccount === 'all' ? 'Semua Rekening' : exportAccount}"`,
      `"Waktu Ekspor: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}"`,
      '',
      headers.join(','),
      ...rows.map((r) => r.join(',')),
      '',
      `"Ringkasan Rekapitulasi"`,
      `"Total Kas Masuk (Rp)",${totalIn}`,
      `"Total Kas Keluar (Rp)",${totalOut}`,
      `"Saldo Arus Kas Bersih (Rp)",${net}`,
    ];

    const blob = new Blob(['\uFEFF' + csvLines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `Laporan_Kas_Masjid_Al_Ikhlas_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowExportModal(false);
    setExportSuccessNotice(`Laporan kas (${data.length} transaksi) berhasil diunduh dalam format CSV!`);
    setTimeout(() => setExportSuccessNotice(null), 5000);
  };

  const handleExportPDF = () => {
    const data = getFilteredExportData();
    const periodLabel =
      exportPeriod === 'current_month'
        ? 'November 2026'
        : exportPeriod === 'last_month'
        ? 'Oktober 2026'
        : 'Semua Periode';

    const totalIn = data.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalOut = data.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const net = totalIn - totalOut;

    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Harap izinkan popup browser untuk membuka pratinjau cetak laporan.');
      return;
    }

    printWin.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Laporan Keuangan - Masjid Al-Ikhlas</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; font-size: 12px; }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
    .header h1 { font-size: 20px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; color: #0f172a; }
    .header h2 { font-size: 13px; margin: 4px 0 0; color: #475569; font-weight: 500; }
    .meta { margin-bottom: 20px; display: flex; justify-content: space-between; font-size: 11px; color: #475569; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .summary-card { border: 1px solid #e2e8f0; background: #f8fafc; padding: 10px 14px; border-radius: 6px; }
    .summary-card span { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
    .summary-card div { font-size: 15px; font-weight: 800; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 11px; }
    th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; font-weight: 700; color: #334155; }
    td { border: 1px solid #cbd5e1; padding: 8px 10px; }
    .income { color: #16a34a; font-weight: 700; }
    .expense { color: #dc2626; font-weight: 700; }
    .signatures { display: flex; justify-content: space-between; margin-top: 50px; padding: 0 40px; page-break-inside: avoid; }
    .sig-col { text-align: center; }
    .sig-space { height: 60px; }
    .sig-name { font-weight: 800; border-top: 1px solid #0f172a; padding-top: 4px; width: 180px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Masjid Al-Ikhlas</h1>
    <h2>Laporan Rekapitulasi Kas & Keuangan Organisasi (TARI System)</h2>
  </div>
  <div class="meta">
    <div><strong>Periode:</strong> ${periodLabel} &nbsp;|&nbsp; <strong>Rekening:</strong> ${exportAccount === 'all' ? 'Semua Rekening' : exportAccount}</div>
    <div><strong>Tanggal Cetak:</strong> ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
  </div>
  <div class="summary-grid">
    <div class="summary-card">
      <span>Total Kas Masuk</span>
      <div style="color: #16a34a;">Rp ${totalIn.toLocaleString('id-ID')}</div>
    </div>
    <div class="summary-card">
      <span>Total Kas Keluar</span>
      <div style="color: #dc2626;">Rp ${totalOut.toLocaleString('id-ID')}</div>
    </div>
    <div class="summary-card">
      <span>Saldo Bersih Periode</span>
      <div style="color: #0f172a;">Rp ${net.toLocaleString('id-ID')}</div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 15%;">Tanggal</th>
        <th style="width: 35%;">Keterangan</th>
        <th style="width: 20%;">Kategori</th>
        <th style="width: 15%;">Rekening Kas</th>
        <th style="width: 15%; text-align: right;">Nominal</th>
      </tr>
    </thead>
    <tbody>
      ${data.map(t => `
        <tr>
          <td>${t.transaction_date}</td>
          <td><strong>${t.description}</strong></td>
          <td>${t.category_name}</td>
          <td>${t.account_name}</td>
          <td style="text-align: right;" class="${t.type === 'income' ? 'income' : 'expense'}">
            ${t.type === 'income' ? '+' : '-'} Rp ${t.amount.toLocaleString('id-ID')}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="signatures">
    <div class="sig-col">
      <div>Mengetahui,</div>
      <div>Ketua DKM Masjid Al-Ikhlas</div>
      <div class="sig-space"></div>
      <div class="sig-name">( Ust. H. Ahmad Fauzi )</div>
    </div>
    <div class="sig-col">
      <div>Disusun Oleh,</div>
      <div>Bendahara Kas Organisasi</div>
      <div class="sig-space"></div>
      <div class="sig-name">( Patrick Maulana )</div>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(() => {
        window.print();
      }, 200);
    };
  </script>
</body>
</html>`);
    printWin.document.close();
    setShowExportModal(false);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || !formDesc) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      account_name: formAccount,
      category_name: formCategory,
      type: formType,
      amount: parseInt(formAmount.replace(/\D/g, '')),
      transaction_date: formDate,
      description: formDesc,
      status: 'completed',
    };

    setTransactions([newTx, ...transactions]);
    setShowAddModal(false);
    setFormAmount('');
    setFormDesc('');
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="text-emerald-600" size={24} />
            Buku Kas & Manajemen Keuangan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan kas terpusat, transparan, dan terverifikasi secara multi-tenant.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download size={14} />
            Ekspor Laporan
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus size={15} />
            Catat Transaksi
          </button>
        </div>
      </div>

      {/* Export Success Notification Banner */}
      {exportSuccessNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{exportSuccessNotice}</span>
          </div>
          <button
            onClick={() => setExportSuccessNotice(null)}
            className="text-emerald-600 hover:text-emerald-800 p-1 rounded"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Summary Cards (GitLab Metric Panels) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gitlab-panelBorder shadow-gitlab">
          <span className="text-[11px] font-bold text-gitlab-secondary uppercase tracking-wider">
            Total Saldo Kas
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {formatRupiah(totalBalance)}
          </div>
          <div className="text-[11px] text-gitlab-secondary mt-1 flex items-center gap-1">
            <Building2 size={13} className="text-emerald-600" />
            <span>2 Rekening Kas Aktif</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gitlab-panelBorder shadow-gitlab">
          <span className="text-[11px] font-bold text-gitlab-secondary uppercase tracking-wider">
            Total Pemasukan (Bulan Ini)
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {formatRupiah(totalIncome)}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
            <ArrowUpRight size={13} />
            <span>Arus Kas Masuk</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gitlab-panelBorder shadow-gitlab">
          <span className="text-[11px] font-bold text-gitlab-secondary uppercase tracking-wider">
            Total Pengeluaran (Bulan Ini)
          </span>
          <div className="text-xl font-bold text-rose-600 mt-1">
            {formatRupiah(totalExpense)}
          </div>
          <div className="text-[11px] text-rose-700 mt-1 flex items-center gap-1">
            <ArrowDownRight size={13} />
            <span>Operasional & Acara</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gitlab-panelBorder shadow-gitlab">
          <span className="text-[11px] font-bold text-gitlab-secondary uppercase tracking-wider">
            Selisih Arus Kas Bersih
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {formatRupiah(totalIncome - totalExpense)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 size={13} />
            <span>Surplus Kas</span>
          </div>
        </div>
      </div>

      {/* Main Table: Buku Kas */}
      <div className="bg-white rounded-lg border border-gitlab-panelBorder shadow-gitlab overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-3.5 sm:px-4 border-b border-gitlab-panelBorder flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gitlab-muted" />
            <span className="text-xs font-semibold text-slate-700">Filter:</span>
            <div className="flex bg-slate-200/80 p-0.5 rounded-md text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${
                  filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${
                  filterType === 'income' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pemasukan
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${
                  filterType === 'expense' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pengeluaran
              </button>
            </div>
          </div>

          <div className="text-xs text-gitlab-muted">
            Menampilkan <span className="font-semibold text-slate-700">{filteredTransactions.length}</span> transaksi
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-gitlab-panelBorder text-[11px] font-semibold text-gitlab-secondary uppercase tracking-wider">
                <th className="py-2.5 px-4">Tanggal</th>
                <th className="py-2.5 px-4">Keterangan</th>
                <th className="py-2.5 px-4">Kategori</th>
                <th className="py-2.5 px-4">Kas / Rekening</th>
                <th className="py-2.5 px-4 text-right">Nominal</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                    {tx.transaction_date}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 max-w-xs truncate">
                    {tx.description}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {tx.category_name}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {tx.account_name}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-bold whitespace-nowrap ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Tercatat
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Transaksi Kas */}
      {showAddModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileText size={16} className="text-emerald-600" />
                  Catat Transaksi Kas Baru
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="p-5 space-y-4 text-xs">
                {/* Type Switcher */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Tipe Transaksi
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormType('income');
                        setFormCategory('Infaq & Sedekah Jumat');
                      }}
                      className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 border transition-all ${
                        formType === 'income'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <ArrowUpRight size={14} /> Pemasukan (Kas Masuk)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormType('expense');
                        setFormCategory('Operasional & Tagihan Listrik/Air');
                      }}
                      className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 border transition-all ${
                        formType === 'expense'
                          ? 'bg-rose-50 border-rose-500 text-rose-700'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <ArrowDownRight size={14} /> Pengeluaran (Kas Keluar)
                    </button>
                  </div>
                </div>

                {/* Nominal */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Nominal (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={500}
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="Contoh: 500000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Rekening Kas */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Rekening / Buku Kas
                  </label>
                  <select
                    value={formAccount}
                    onChange={(e) => setFormAccount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Kas Tunai Utama">Kas Tunai Utama</option>
                    <option value="BSI Operasional">BSI Operasional (7123456789)</option>
                    <option value="Kas Remaja Masjid">Kas Remaja Masjid</option>
                  </select>
                </div>

                {/* Kategori */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {formType === 'income' ? (
                      <>
                        <option value="Infaq & Sedekah Jumat">Infaq & Sedekah Jumat</option>
                        <option value="Donasi Khusus Dakwah">Donasi Khusus Dakwah</option>
                        <option value="Zakat Maal / Fitrah">Zakat Maal / Fitrah</option>
                      </>
                    ) : (
                      <>
                        <option value="Operasional & Tagihan Listrik/Air">Operasional & Tagihan Listrik/Air</option>
                        <option value="Honor & Akomodasi Pemateri">Honor & Akomodasi Pemateri</option>
                        <option value="Konsumsi Acara Kajian">Konsumsi Acara Kajian</option>
                        <option value="Pemeliharaan & Kebersihan">Pemeliharaan & Kebersihan</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Tanggal & Deskripsi */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Keterangan Transaksi
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Contoh: Pembelian sound system atau konsumsi kajian shubuh"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  ></textarea>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                  >
                    Simpan Transaksi
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Ekspor Laporan Keuangan */}
      {showExportModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Download size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Ekspor Laporan Buku Kas & Keuangan
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Unduh rekapitulasi transaksi kas dalam format CSV atau cetak PDF resmi.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* Format Selection Cards */}
                <div>
                  <label className="block font-bold text-slate-700 mb-2">
                    Pilih Format Berkas
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setExportFormat('csv')}
                      className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1.5 ${
                        exportFormat === 'csv'
                          ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <FileSpreadsheet
                          size={20}
                          className={exportFormat === 'csv' ? 'text-emerald-600' : 'text-slate-400'}
                        />
                        {exportFormat === 'csv' && (
                          <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-slate-900">Spreadsheet (.CSV)</span>
                      <span className="text-[11px] text-slate-500 leading-tight">
                        Kompatibel dengan Microsoft Excel, Google Sheets, & LibreOffice.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExportFormat('pdf')}
                      className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1.5 ${
                        exportFormat === 'pdf'
                          ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Printer
                          size={20}
                          className={exportFormat === 'pdf' ? 'text-emerald-600' : 'text-slate-400'}
                        />
                        {exportFormat === 'pdf' && (
                          <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-slate-900">Dokumen Cetak / PDF</span>
                      <span className="text-[11px] text-slate-500 leading-tight">
                        Dilengkapi kop resmi, rincian tabel, dan kolom tanda tangan pengurus.
                      </span>
                    </button>
                  </div>
                </div>

                {/* Filter Options */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Rentang Periode
                    </label>
                    <select
                      value={exportPeriod}
                      onChange={(e) => setExportPeriod(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="current_month">Bulan Ini (November 2026)</option>
                      <option value="last_month">Bulan Lalu (Oktober 2026)</option>
                      <option value="all">Semua Periode Transaksi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Rekening Kas
                    </label>
                    <select
                      value={exportAccount}
                      onChange={(e) => setExportAccount(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="all">Semua Rekening Kas</option>
                      <option value="Kas Tunai Utama">Kas Tunai Utama</option>
                      <option value="BSI Operasional">BSI Operasional (7123456789)</option>
                      <option value="Kas Remaja Masjid">Kas Remaja Masjid</option>
                    </select>
                  </div>
                </div>

                {/* Live Data Summary Card */}
                {(() => {
                  const filtered = getFilteredExportData();
                  const totalIn = filtered
                    .filter((t) => t.type === 'income')
                    .reduce((acc, t) => acc + t.amount, 0);
                  const totalOut = filtered
                    .filter((t) => t.type === 'expense')
                    .reduce((acc, t) => acc + t.amount, 0);
                  const net = totalIn - totalOut;

                  return (
                    <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 font-semibold">
                        <span>Ringkasan Data yang Akan Diekspor:</span>
                        <span className="text-slate-800 font-bold">{filtered.length} Transaksi</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Penerimaan</span>
                          <span className="font-bold text-xs text-emerald-600">
                            {formatRupiah(totalIn)}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Pengeluaran</span>
                          <span className="font-bold text-xs text-rose-600">
                            {formatRupiah(totalOut)}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Saldo Bersih</span>
                          <span className="font-bold text-xs text-slate-800">
                            {formatRupiah(net)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                  >
                    Batal
                  </button>
                  {exportFormat === 'csv' ? (
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Download size={14} />
                      Unduh Berkas CSV
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleExportPDF}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Printer size={14} />
                      Cetak / Simpan PDF
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
