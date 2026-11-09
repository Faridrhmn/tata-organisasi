import React, { useState, useEffect } from 'react';
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
  BarChart3,
  PieChart,
  Receipt,
  Trash2,
  Upload,
  Settings2,
  Tag,
  CreditCard,
  ExternalLink,
} from 'lucide-react';

export interface FinancialAccount {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'ewallet';
  account_number?: string;
  balance: number;
}

export interface FinancialCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface Transaction {
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

const DEFAULT_ACCOUNTS: FinancialAccount[] = [
  { id: 'acc-1', name: 'Kas Tunai Utama', type: 'cash', balance: 6250000 },
  { id: 'acc-2', name: 'BSI Operasional (7123456789)', type: 'bank', account_number: '7123456789', balance: 7400000 },
  { id: 'acc-3', name: 'Kas Remaja Masjid', type: 'cash', balance: 1200000 },
];

const DEFAULT_CATEGORIES: FinancialCategory[] = [
  { id: 'cat-in-1', name: 'Infaq & Sedekah Jumat', type: 'income', color: '#16a34a' },
  { id: 'cat-in-2', name: 'Donasi Khusus Dakwah', type: 'income', color: '#10b981' },
  { id: 'cat-in-3', name: 'Zakat Maal / Fitrah', type: 'income', color: '#059669' },
  { id: 'cat-in-4', name: 'Wakaf Sarana & Fasilitas', type: 'income', color: '#0d9488' },
  { id: 'cat-out-1', name: 'Operasional & Listrik/Air', type: 'expense', color: '#dc2626' },
  { id: 'cat-out-2', name: 'Honor & Akomodasi Pemateri', type: 'expense', color: '#d97706' },
  { id: 'cat-out-3', name: 'Konsumsi Acara Kajian', type: 'expense', color: '#ea580c' },
  { id: 'cat-out-4', name: 'Pemeliharaan & Kebersihan', type: 'expense', color: '#e11d48' },
  { id: 'cat-out-5', name: 'Santunan Dhuafa & Sosial', type: 'expense', color: '#b91c1c' },
];

// Sample receipt svg preview
const SAMPLE_RECEIPT_PLN =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="520" viewBox="0 0 400 520"><rect width="400" height="520" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2"/><rect x="20" y="20" width="360" height="480" rx="8" fill="%23ffffff" stroke="%23e2e8f0"/><text x="200" y="60" font-family="monospace" font-size="18" font-weight="bold" text-anchor="middle" fill="%230f172a">STRUK PEMBAYARAN PLN</text><text x="200" y="85" font-family="monospace" font-size="12" text-anchor="middle" fill="%2364748b">TRANSAKSI RESMI MULTI-BILLS</text><line x1="40" y1="105" x2="360" y2="105" stroke="%230f172a" stroke-dasharray="4 4"/><text x="50" y="140" font-family="monospace" font-size="12" fill="%23334155">ID PELANGGAN : 538192048123</text><text x="50" y="170" font-family="monospace" font-size="12" fill="%23334155">NAMA         : MASJID AL-IKHLAS</text><text x="50" y="200" font-family="monospace" font-size="12" fill="%23334155">TARIF/DAYA   : S2 / 6600 VA</text><text x="50" y="230" font-family="monospace" font-size="12" fill="%23334155">PERIODE      : OKTOBER 2026</text><line x1="40" y1="260" x2="360" y2="260" stroke="%23cbd5e1"/><text x="50" y="295" font-family="monospace" font-size="13" font-weight="bold" fill="%230f172a">TAGIHAN LISTRIK : Rp 820.000</text><text x="50" y="325" font-family="monospace" font-size="12" fill="%2316a34a">STATUS          : LUNAS BERHASIL</text><text x="50" y="355" font-family="monospace" font-size="11" fill="%2364748b">WAKTU BAYAR     : 28/10/2026 09:14</text><line x1="40" y1="385" x2="360" y2="385" stroke="%230f172a" stroke-dasharray="4 4"/><text x="200" y="425" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle" fill="%23047857">VERIFIKASI BENDAHARA TARI</text><text x="200" y="450" font-family="monospace" font-size="10" text-anchor="middle" fill="%2394a3b8">Simpan bukti ini sebagai arsip audit kas</text></svg>';

export const FinancePage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCharts, setShowCharts] = useState(true);
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterTab, setMasterTab] = useState<'accounts' | 'categories'>('accounts');

  // Master Data States with LocalStorage Persistence
  const [accounts, setAccounts] = useState<FinancialAccount[]>(() => {
    const saved = localStorage.getItem('tari_finance_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_ACCOUNTS;
  });

  const [categories, setCategories] = useState<FinancialCategory[]>(() => {
    const saved = localStorage.getItem('tari_finance_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_CATEGORIES;
  });

  useEffect(() => {
    localStorage.setItem('tari_finance_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('tari_finance_categories', JSON.stringify(categories));
  }, [categories]);

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
      account_name: 'BSI Operasional (7123456789)',
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
      account_name: 'BSI Operasional (7123456789)',
      category_name: 'Operasional & Listrik/Air',
      category_color: '#dc2626',
      type: 'expense',
      amount: 820000,
      transaction_date: '2026-10-28',
      description: 'Pembayaran Tagihan Listrik PLN Pascabayar',
      receipt_url: SAMPLE_RECEIPT_PLN,
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

  // Form states for New Transaction
  const [formType, setFormType] = useState<'income' | 'expense'>('income');
  const [formAccount, setFormAccount] = useState(() => accounts[0]?.name || 'Kas Tunai Utama');
  const [formCategory, setFormCategory] = useState(
    () => categories.find((c) => c.type === 'income')?.name || 'Infaq & Sedekah Jumat'
  );
  const [formAmount, setFormAmount] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formReceipt, setFormReceipt] = useState<string | null>(null);

  // Modal Kwitansi Preview State
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);

  // Master Data Creation Forms
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<'cash' | 'bank' | 'ewallet'>('bank');
  const [newAccNumber, setNewAccNumber] = useState('');

  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');
  const [newCatColor, setNewCatColor] = useState('#2563eb');

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

  // Available categories filtered by current form type
  const availableCategories = categories.filter((c) => c.type === formType);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran berkas gambar maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || !formDesc) return;

    const matchedCat = categories.find((c) => c.name === formCategory);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      account_name: formAccount,
      category_name: formCategory,
      category_color: matchedCat?.color || (formType === 'income' ? '#16a34a' : '#dc2626'),
      type: formType,
      amount: parseInt(formAmount.replace(/\D/g, '')),
      transaction_date: formDate,
      description: formDesc,
      receipt_url: formReceipt || undefined,
      status: 'completed',
    };

    setTransactions([newTx, ...transactions]);
    setShowAddModal(false);
    setFormAmount('');
    setFormDesc('');
    setFormReceipt(null);
  };

  // Master Data Add Handlers
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;

    const created: FinancialAccount = {
      id: `acc-${Date.now()}`,
      name: newAccName.trim(),
      type: newAccType,
      account_number: newAccNumber.trim() || undefined,
      balance: 0,
    };

    setAccounts([...accounts, created]);
    setNewAccName('');
    setNewAccNumber('');
  };

  const handleDeleteAccount = (id: string, name: string) => {
    if (accounts.length <= 1) {
      alert('Minimal harus ada satu rekening kas aktif.');
      return;
    }
    if (confirm(`Hapus rekening kas "${name}" dari master data?`)) {
      setAccounts(accounts.filter((a) => a.id !== id));
      if (formAccount === name) {
        setFormAccount(accounts[0]?.name || '');
      }
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const created: FinancialCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      type: newCatType,
      color: newCatColor,
    };

    setCategories([...categories, created]);
    setNewCatName('');
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (categories.filter((c) => c.type === newCatType).length <= 1) {
      alert('Minimal harus ada satu kategori dalam kelompok ini.');
      return;
    }
    if (confirm(`Hapus kategori "${name}" dari master data?`)) {
      setCategories(categories.filter((c) => c.id !== id));
      if (formCategory === name) {
        setFormCategory(categories[0]?.name || '');
      }
    }
  };

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

    const headers = [
      'ID Transaksi',
      'Tanggal',
      'Tipe',
      'Kategori',
      'Rekening',
      'Keterangan',
      'Nominal (Rp)',
      'Bukti Lampiran',
      'Status',
    ];
    const rows = data.map((t) => [
      t.id,
      t.transaction_date,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      `"${t.category_name.replace(/"/g, '""')}"`,
      `"${t.account_name.replace(/"/g, '""')}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.type === 'income' ? t.amount : -t.amount,
      t.receipt_url ? 'Ada Bukti' : 'Tidak Ada',
      'Tercatat',
    ]);

    const totalIn = data.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalOut = data.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const net = totalIn - totalOut;

    const csvLines = [
      `"LAPORAN KAS & KEUANGAN - MASJID AL-IKHLAS"`,
      `"Periode: ${periodLabel}"`,
      `"Rekening: ${exportAccount === 'all' ? 'Semua Rekening' : exportAccount}"`,
      `"Waktu Ekspor: ${new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}"`,
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
    <div><strong>Periode:</strong> ${periodLabel} &nbsp;|&nbsp; <strong>Rekening:</strong> ${
      exportAccount === 'all' ? 'Semua Rekening' : exportAccount
    }</div>
    <div><strong>Tanggal Cetak:</strong> ${new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}</div>
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
      ${data
        .map(
          (t) => `
        <tr>
          <td>${t.transaction_date}</td>
          <td><strong>${t.description}</strong></td>
          <td>${t.category_name}</td>
          <td>${t.account_name}</td>
          <td style="text-align: right;" class="${t.type === 'income' ? 'income' : 'expense'}">
            ${t.type === 'income' ? '+' : '-'} Rp ${t.amount.toLocaleString('id-ID')}
          </td>
        </tr>
      `
        )
        .join('')}
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

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  // Monthly data breakdown for diagram
  const monthlyData = [
    { month: 'Agustus', in: 7500000, out: 4200000 },
    { month: 'September', in: 8800000, out: 5100000 },
    { month: 'Oktober', in: 9200000, out: 5600000 },
    { month: 'November', in: totalIncome + 4750000, out: totalExpense + 3200000 },
  ];
  const maxMonthlyVal = Math.max(...monthlyData.flatMap((d) => [d.in, d.out]), 10000000);

  // Category expense breakdown
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const expenseByCategory = categories
    .filter((c) => c.type === 'expense')
    .map((c) => {
      const sum = expenseTransactions
        .filter((t) => t.category_name === c.name)
        .reduce((acc, t) => acc + t.amount, 0);
      return {
        name: c.name,
        color: c.color,
        amount: sum,
        pct: totalExpense > 0 ? Math.round((sum / totalExpense) * 100) : 0,
      };
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="text-emerald-600" size={24} />
            Buku Kas & Manajemen Keuangan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan kas terpusat, transparan, terverifikasi kwitansi digital secara multi-tenant.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCharts(!showCharts)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border shadow-xs ${
              showCharts
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
            title="Tampilkan / Sembunyikan Diagram Arus Kas"
          >
            <BarChart3 size={14} className="text-emerald-600" />
            {showCharts ? 'Tutup Diagram' : 'Lihat Diagram Kas'}
          </button>

          <button
            onClick={() => setShowMasterModal(true)}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Kelola Master Data Rekening Kas & Kategori Transaksi"
          >
            <Settings2 size={14} className="text-slate-600" />
            Master Rekening & Kategori
          </button>

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

      {/* Summary Metric Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gitlab-panelBorder shadow-gitlab">
          <span className="text-[11px] font-bold text-gitlab-secondary uppercase tracking-wider">
            Total Saldo Kas
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">{formatRupiah(totalBalance)}</div>
          <div className="text-[11px] text-gitlab-secondary mt-1 flex items-center gap-1">
            <Building2 size={13} className="text-emerald-600" />
            <span>{accounts.length} Rekening Kas Terdaftar</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gitlab-panelBorder shadow-gitlab">
          <span className="text-[11px] font-bold text-gitlab-secondary uppercase tracking-wider">
            Total Pemasukan (Bulan Ini)
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1">{formatRupiah(totalIncome)}</div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
            <ArrowUpRight size={13} />
            <span>Arus Kas Masuk</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gitlab-panelBorder shadow-gitlab">
          <span className="text-[11px] font-bold text-gitlab-secondary uppercase tracking-wider">
            Total Pengeluaran (Bulan Ini)
          </span>
          <div className="text-xl font-bold text-rose-600 mt-1">{formatRupiah(totalExpense)}</div>
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

      {/* Visual Cashflow Diagrams (Bar Chart & Category Distribution) */}
      {showCharts && (
        <div className="bg-white rounded-lg border border-gitlab-panelBorder p-4 sm:p-5 shadow-gitlab space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-emerald-600" />
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Visualisasi & Analisis Arus Kas Organisasi
                </h2>
                <p className="text-[11px] text-slate-500">
                  Perbandingan tren kas masuk vs kas keluar serta proporsi realisasi anggaran.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              Update Real-Time
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Monthly Trend Bar Chart (7 Cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <BarChart3 size={14} className="text-slate-500" />
                  Tren Kas Masuk vs Kas Keluar (4 Bulan Terakhir)
                </span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block"></span>
                    Pemasukan
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block"></span>
                    Pengeluaran
                  </span>
                </div>
              </div>

              {/* SVG Dynamic Bar Chart */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
                  {monthlyData.map((d, idx) => {
                    const inHeight = Math.max(12, Math.round((d.in / maxMonthlyVal) * 120));
                    const outHeight = Math.max(12, Math.round((d.out / maxMonthlyVal) * 120));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex items-end justify-center gap-1.5 h-32">
                          {/* In Bar */}
                          <div
                            style={{ height: `${inHeight}px` }}
                            className="w-4 sm:w-6 bg-emerald-600 hover:bg-emerald-700 rounded-t-sm transition-all group relative cursor-pointer"
                            title={`Pemasukan ${d.month}: ${formatRupiah(d.in)}`}
                          >
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-mono">
                              +{Math.round(d.in / 1000000)}jt
                            </span>
                          </div>

                          {/* Out Bar */}
                          <div
                            style={{ height: `${outHeight}px` }}
                            className="w-4 sm:w-6 bg-rose-500 hover:bg-rose-600 rounded-t-sm transition-all group relative cursor-pointer"
                            title={`Pengeluaran ${d.month}: ${formatRupiah(d.out)}`}
                          >
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-mono">
                              -{Math.round(d.out / 1000000)}jt
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold text-slate-600 mt-1 truncate max-w-full">
                          {d.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Category Breakdown Progress Bars (5 Cols) */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <PieChart size={14} className="text-slate-500" />
                Distribusi Kategori Pengeluaran Terbesar
              </span>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                {expenseByCategory.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    Belum ada data pengeluaran.
                  </p>
                ) : (
                  expenseByCategory.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: item.color }}
                          ></span>
                          {item.name}
                        </span>
                        <span className="font-mono text-slate-600 font-bold">
                          {formatRupiah(item.amount)} ({item.pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.pct}%`,
                            backgroundColor: item.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
                  filterType === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${
                  filterType === 'income'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pemasukan
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${
                  filterType === 'expense'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pengeluaran
              </button>
            </div>
          </div>

          <div className="text-xs text-gitlab-muted">
            Menampilkan <span className="font-semibold text-slate-700">{filteredTransactions.length}</span>{' '}
            transaksi
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
                <th className="py-2.5 px-4 text-center">Bukti / Struk</th>
                <th className="py-2.5 px-4 text-right">Nominal</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Wallet size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-semibold text-gitlab-text">
                      Tidak ada transaksi ditemukan
                    </p>
                    <p className="text-[11px] text-gitlab-secondary mt-0.5">
                      Belum ada catatan transaksi untuk filter "
                      {filterType === 'all'
                        ? 'Semua'
                        : filterType === 'income'
                        ? 'Pemasukan'
                        : 'Pengeluaran'}
                      ".
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {tx.transaction_date}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
                        style={{
                          backgroundColor: `${tx.category_color || '#3b82f6'}15`,
                          borderColor: `${tx.category_color || '#3b82f6'}40`,
                          color: tx.category_color || '#1e293b',
                        }}
                      >
                        {tx.category_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {tx.account_name}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {tx.receipt_url ? (
                        <button
                          type="button"
                          onClick={() => setSelectedReceiptTx(tx)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-semibold text-[10px] inline-flex items-center gap-1 transition-colors"
                          title="Lihat lampiran bukti struk / transfer"
                        >
                          <Receipt size={12} className="text-emerald-600" />
                          Lihat Struk
                        </button>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Transaksi Kas Baru */}
      {showAddModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl border border-gitlab-panelBorder overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-gitlab-panelBorder flex items-center justify-between bg-slate-50">
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

              <form onSubmit={handleAddTransaction} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
                {/* Type Switcher */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Tipe Transaksi</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormType('income');
                        const defaultIn = categories.find((c) => c.type === 'income');
                        if (defaultIn) setFormCategory(defaultIn.name);
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
                        const defaultOut = categories.find((c) => c.type === 'expense');
                        if (defaultOut) setFormCategory(defaultOut.name);
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
                  <label className="block font-semibold text-slate-700 mb-1.5">Nominal (Rp)</label>
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

                {/* Rekening Kas (Dynamic from Master Data) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-slate-700">Rekening / Buku Kas</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowMasterModal(true);
                        setMasterTab('accounts');
                      }}
                      className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      + Tambah Rekening
                    </button>
                  </div>
                  <select
                    value={formAccount}
                    onChange={(e) => setFormAccount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.name}>
                        {acc.name} ({acc.type === 'bank' ? 'Bank' : 'Tunai'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kategori (Dynamic from Master Data) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-slate-700">Kategori Transaksi</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowMasterModal(true);
                        setMasterTab('categories');
                      }}
                      className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      + Tambah Kategori
                    </button>
                  </div>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tanggal */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Keterangan */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Keterangan Transaksi</label>
                  <textarea
                    required
                    rows={2}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Contoh: Pembelian sound system atau konsumsi kajian shubuh"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  ></textarea>
                </div>

                {/* Lampiran Bukti Struk / Transfer */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700 flex items-center gap-1.5 text-xs">
                      <Receipt size={14} className="text-emerald-600" />
                      Lampiran Kwitansi / Struk Belanja / Bukti Transfer (Opsional)
                    </label>
                    {formReceipt && (
                      <button
                        type="button"
                        onClick={() => setFormReceipt(null)}
                        className="text-[10px] text-rose-600 hover:underline flex items-center gap-0.5"
                      >
                        <Trash2 size={11} /> Hapus Foto
                      </button>
                    )}
                  </div>

                  {formReceipt ? (
                    <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-white max-h-36 flex items-center justify-center p-1">
                      <img
                        src={formReceipt}
                        alt="Bukti Transfer"
                        className="max-h-32 object-contain rounded"
                      />
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 rounded-lg bg-white hover:bg-slate-50 cursor-pointer transition-colors text-center">
                      <Upload size={18} className="text-slate-400 mb-1" />
                      <span className="font-bold text-slate-700 text-[11px]">
                        Pilih foto struk / transfer dari galeri / desktop
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Mendukung format JPG, PNG, atau WebP (Maks. 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
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

      {/* Modal: Kelola Master Data Rekening & Kategori */}
      {showMasterModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-lg max-w-xl w-full shadow-2xl border border-gitlab-panelBorder overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-gitlab-panelBorder flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Settings2 size={18} className="text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Kelola Master Data Keuangan Organisasi
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Atur daftar rekening kas aktif dan kategori pos anggaran secara dinamis.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMasterModal(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 px-4 bg-slate-50/50 text-xs">
                <button
                  onClick={() => setMasterTab('accounts')}
                  className={`py-2.5 px-4 font-bold border-b-2 flex items-center gap-2 transition-all ${
                    masterTab === 'accounts'
                      ? 'border-emerald-600 text-emerald-700 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Building2 size={14} /> Master Rekening Kas ({accounts.length})
                </button>
                <button
                  onClick={() => setMasterTab('categories')}
                  className={`py-2.5 px-4 font-bold border-b-2 flex items-center gap-2 transition-all ${
                    masterTab === 'categories'
                      ? 'border-emerald-600 text-emerald-700 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Tag size={14} /> Master Kategori Pos ({categories.length})
                </button>
              </div>

              <div className="p-5 max-h-[70vh] overflow-y-auto space-y-5 text-xs">
                {masterTab === 'accounts' ? (
                  <>
                    {/* Add Account Form */}
                    <form
                      onSubmit={handleCreateAccount}
                      className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-3"
                    >
                      <span className="font-bold text-slate-900 block text-xs">
                        + Tambah Rekening / Buku Kas Baru
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            required
                            placeholder="Nama Rekening (cth: Bank Muamalat Operasional)"
                            value={newAccName}
                            onChange={(e) => setNewAccName(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <select
                            value={newAccType}
                            onChange={(e) =>
                              setNewAccType(e.target.value as 'cash' | 'bank' | 'ewallet')
                            }
                            className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="bank">Rekening Bank</option>
                            <option value="cash">Kas Tunai</option>
                            <option value="ewallet">e-Wallet / QRIS</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Nomor Rekening / No. HP e-Wallet (Opsional)"
                          value={newAccNumber}
                          onChange={(e) => setNewAccNumber(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded shadow-xs shrink-0"
                        >
                          Simpan Rekening
                        </button>
                      </div>
                    </form>

                    {/* Account List */}
                    <div className="space-y-2">
                      <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                        Daftar Rekening Kas Tersedia:
                      </span>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                        {accounts.map((acc) => (
                          <div
                            key={acc.id}
                            className="p-3 bg-white flex items-center justify-between hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                                {acc.type === 'bank' ? (
                                  <CreditCard size={14} />
                                ) : (
                                  <Wallet size={14} />
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{acc.name}</div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  {acc.type === 'bank'
                                    ? `Bank • No: ${acc.account_number || '-'}`
                                    : 'Kas Fisik Tunai'}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteAccount(acc.id, acc.name)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors"
                              title="Hapus Rekening"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Add Category Form */}
                    <form
                      onSubmit={handleCreateCategory}
                      className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-3"
                    >
                      <span className="font-bold text-slate-900 block text-xs">
                        + Tambah Kategori Pos Baru
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            required
                            placeholder="Nama Kategori (cth: Renovasi Tempat Wudhu)"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <select
                            value={newCatType}
                            onChange={(e) =>
                              setNewCatType(e.target.value as 'income' | 'expense')
                            }
                            className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="expense">Pos Pengeluaran</option>
                            <option value="income">Pos Pemasukan</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500">Pilih Warna Badge:</span>
                          <input
                            type="color"
                            value={newCatColor}
                            onChange={(e) => setNewCatColor(e.target.value)}
                            className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded shadow-xs"
                        >
                          Simpan Kategori
                        </button>
                      </div>
                    </form>

                    {/* Category List */}
                    <div className="space-y-2">
                      <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                        Daftar Kategori Tersedia ({categories.length}):
                      </span>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                        {categories.map((cat) => (
                          <div
                            key={cat.id}
                            className="p-3 bg-white flex items-center justify-between hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className="w-3.5 h-3.5 rounded-full inline-block shrink-0"
                                style={{ backgroundColor: cat.color }}
                              ></span>
                              <div>
                                <span className="font-bold text-slate-800">{cat.name}</span>
                                <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded font-semibold bg-slate-100 text-slate-600">
                                  {cat.type === 'income' ? 'Kas Masuk' : 'Kas Keluar'}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors"
                              title="Hapus Kategori"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowMasterModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Fullscreen Bukti Kwitansi / Struk Preview */}
      {selectedReceiptTx &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl border border-gitlab-panelBorder overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-gitlab-panelBorder flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Receipt size={18} className="text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Bukti Kwitansi / Struk Transaksi Digital
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      ID Transaksi: {selectedReceiptTx.id} • {selectedReceiptTx.transaction_date}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReceiptTx(null)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Keterangan
                    </span>
                    <span className="font-bold text-slate-800">
                      {selectedReceiptTx.description}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Nominal Resmi
                    </span>
                    <span className="font-bold text-sm text-emerald-600">
                      {formatRupiah(selectedReceiptTx.amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Rekening Kas
                    </span>
                    <span className="font-medium text-slate-700">
                      {selectedReceiptTx.account_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Kategori Pos
                    </span>
                    <span className="font-medium text-slate-700">
                      {selectedReceiptTx.category_name}
                    </span>
                  </div>
                </div>

                {/* Struk Image Container */}
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center p-2 min-h-64 max-h-96">
                  {selectedReceiptTx.receipt_url ? (
                    <img
                      src={selectedReceiptTx.receipt_url}
                      alt="Struk Pembayaran"
                      className="max-h-80 object-contain rounded shadow-xs"
                    />
                  ) : (
                    <div className="text-slate-400 text-center py-10">
                      Tidak ada gambar lampiran.
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} /> Terarsip secara aman dalam sistem TARI
                  </span>
                  <div className="flex items-center gap-2">
                    {selectedReceiptTx.receipt_url && (
                      <a
                        href={selectedReceiptTx.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-semibold text-xs flex items-center gap-1 shadow-xs"
                      >
                        <ExternalLink size={12} /> Buka Gambar Asli
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedReceiptTx(null)}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold text-xs shadow-xs"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Ekspor Laporan Keuangan */}
      {showExportModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl border border-gitlab-panelBorder overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-gitlab-panelBorder flex items-center justify-between bg-slate-50">
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
                  <label className="block font-bold text-slate-700 mb-2">Pilih Format Berkas</label>
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
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.name}>
                          {acc.name}
                        </option>
                      ))}
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
                        <span className="text-slate-800 font-bold">
                          {filtered.length} Transaksi
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">
                            Penerimaan
                          </span>
                          <span className="font-bold text-xs text-emerald-600">
                            {formatRupiah(totalIn)}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">
                            Pengeluaran
                          </span>
                          <span className="font-bold text-xs text-rose-600">
                            {formatRupiah(totalOut)}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">
                            Saldo Bersih
                          </span>
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
