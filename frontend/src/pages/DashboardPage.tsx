import React, { useState } from 'react';
import {
  Wallet,
  KeyRound,
  Sparkles,
  CalendarDays,
  Check,
  Clock,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
} from 'lucide-react';

interface DashboardProps {
  orgName: string;
  onSelectModule?: (module: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ orgName, onSelectModule }) => {
  const [attentionTab, setAttentionTab] = useState<'all' | 'review' | 'vault' | 'finance'>('all');
  const [quickAccessTab, setQuickAccessTab] = useState<'recent' | 'modules'>('recent');

  const attentionItems = [
    {
      id: 'att-1',
      type: 'planner',
      title: 'Review Jadwal: Poster Kajian Tafsir Surah Al-Kahfi',
      subtitle: 'Diajukan oleh Patrick Maulana • Target: Instagram Feed & WhatsApp Status',
      time: '3 hari yang lalu',
      category: 'review',
    },
    {
      id: 'att-2',
      type: 'finance',
      title: 'Konfirmasi Pengeluaran: Pembayaran Tagihan Listrik PLN Pascabayar',
      subtitle: 'Nominal Rp 820.000 • Rekening BSI Operasional (7123456789)',
      time: '1 minggu yang lalu',
      category: 'finance',
    },
    {
      id: 'att-3',
      type: 'vault',
      title: 'Pembaruan Kredensial: Akun Instagram Utama (@masjid.alikhlas)',
      subtitle: 'Terenkripsi AES-256-GCM • Penanggung jawab Humas',
      time: '2 minggu yang lalu',
      category: 'vault',
    },
  ];

  const filteredAttention = attentionItems.filter((item) => {
    if (attentionTab === 'all') return true;
    return item.category === attentionTab;
  });

  return (
    <div className="space-y-5">
      {/* 1. GitLab User Profile Greeting Row (Exact Match Image 1) */}
      <div className="flex items-center gap-3 py-1">
        <div className="w-12 h-12 rounded-full bg-slate-800 text-white font-bold text-base flex items-center justify-center ring-2 ring-slate-200 shrink-0">
          PM
        </div>
        <div>
          <h1 className="text-base font-bold text-gitlab-text tracking-tight flex items-center gap-2">
            Patrick Maulana
          </h1>
          <p className="text-xs text-gitlab-secondary mt-0.5">
            Admin Utama • {orgName}
          </p>
        </div>
      </div>

      {/* 2. Main GitLab 2-Column Grid Layout (Image 1 Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (Main Panels, 8 span) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Panel 1: Items that need your attention */}
          <div className="bg-white rounded-lg border border-gitlab-panelBorder shadow-gitlab overflow-hidden">
            {/* Panel Header & Tabs (GitLab Style) */}
            <div className="border-b border-gitlab-panelBorder">
              <div className="pt-4 px-4 pb-2">
                <h2 className="text-sm font-bold text-gitlab-text">
                  Items that need your attention
                </h2>
              </div>

              {/* Filter Tabs with subtle grey counter badges */}
              <div className="flex items-center gap-6 px-4 text-xs overflow-x-auto">
                <button
                  onClick={() => setAttentionTab('all')}
                  className={`pb-2.5 pt-1 font-semibold flex items-center gap-1.5 transition-colors border-b-2 -mb-px whitespace-nowrap ${
                    attentionTab === 'all'
                      ? 'border-gitlab-blue text-gitlab-text font-bold'
                      : 'border-transparent text-gitlab-secondary hover:text-gitlab-text hover:border-slate-300'
                  }`}
                >
                  All
                </button>

                <button
                  onClick={() => setAttentionTab('review')}
                  className={`pb-2.5 pt-1 font-medium flex items-center gap-1.5 transition-colors border-b-2 -mb-px whitespace-nowrap ${
                    attentionTab === 'review'
                      ? 'border-gitlab-blue text-gitlab-text font-bold'
                      : 'border-transparent text-gitlab-secondary hover:text-gitlab-text hover:border-slate-300'
                  }`}
                >
                  <span>Review requested</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-semibold">
                    1
                  </span>
                </button>

                <button
                  onClick={() => setAttentionTab('finance')}
                  className={`pb-2.5 pt-1 font-medium flex items-center gap-1.5 transition-colors border-b-2 -mb-px whitespace-nowrap ${
                    attentionTab === 'finance'
                      ? 'border-gitlab-blue text-gitlab-text font-bold'
                      : 'border-transparent text-gitlab-secondary hover:text-gitlab-text hover:border-slate-300'
                  }`}
                >
                  <span>Keuangan</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-semibold">
                    1
                  </span>
                </button>

                <button
                  onClick={() => setAttentionTab('vault')}
                  className={`pb-2.5 pt-1 font-medium flex items-center gap-1.5 transition-colors border-b-2 -mb-px whitespace-nowrap ${
                    attentionTab === 'vault'
                      ? 'border-gitlab-blue text-gitlab-text font-bold'
                      : 'border-transparent text-gitlab-secondary hover:text-gitlab-text hover:border-slate-300'
                  }`}
                >
                  <span>Vault Medsos</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-semibold">
                    7
                  </span>
                </button>
              </div>
            </div>

            {/* Attention List Items */}
            <div className="divide-y divide-slate-100 text-xs">
              {filteredAttention.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:px-4 flex items-start justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 text-slate-500">
                      {item.type === 'planner' && <CalendarDays size={15} className="text-blue-600" />}
                      {item.type === 'finance' && <Wallet size={15} className="text-emerald-600" />}
                      {item.type === 'vault' && <KeyRound size={15} className="text-amber-600" />}
                    </div>

                    <div>
                      <button
                        onClick={() => onSelectModule && onSelectModule(item.type)}
                        className="text-left font-semibold text-slate-800 hover:text-gitlab-blue transition-colors"
                      >
                        {item.title}
                      </button>
                      <p className="text-[11px] text-gitlab-secondary mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Actions / Time */}
                  <div className="flex items-center gap-2 shrink-0 text-gitlab-muted text-[11px]">
                    <span className="hidden sm:inline">{item.time}</span>
                    <button
                      onClick={() => onSelectModule && onSelectModule(item.type)}
                      className="p-1 hover:text-slate-800 hover:bg-slate-200/60 rounded"
                      title="Buka detail"
                    >
                      <Clock size={14} />
                    </button>
                    <button
                      onClick={() => onSelectModule && onSelectModule(item.type)}
                      className="p-1 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                      title="Selesai / Review"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom link */}
            <div className="p-3 bg-slate-50/50 border-t border-gitlab-panelBorder text-xs">
              <button
                onClick={() => onSelectModule && onSelectModule('planner')}
                className="text-gitlab-blue hover:underline font-medium text-left"
              >
                Lihat semua tugas organisasi →
              </button>
            </div>
          </div>

          {/* Panel 2: Follow the latest updates (GitLab Activity Feed Style) */}
          <div className="bg-white rounded-lg border border-gitlab-panelBorder shadow-gitlab p-4">
            <div className="flex items-center justify-between pb-3 border-b border-gitlab-panelBorder">
              <h2 className="text-sm font-bold text-gitlab-text">
                Follow the latest updates
              </h2>
              <button className="px-2 py-1 text-xs border border-slate-200 rounded text-slate-600 hover:bg-slate-50 flex items-center gap-1 font-medium">
                <span>Aktivitas terbaru</span>
                <ChevronDown size={12} />
              </button>
            </div>

            <div className="pt-4 space-y-4 text-xs">
              {[
                {
                  action: 'Mencatat transaksi kas masuk',
                  target: 'Infaq Kotak Jumat Pekan Pertama (+Rp 3.250.000)',
                  hash: 'tx_c189e4f',
                  actor: 'Patrick Maulana',
                  time: '5 hari yang lalu',
                  icon: Wallet,
                  color: 'text-emerald-600',
                },
                {
                  action: 'Generate poster resolusi tinggi (1:1 Feed)',
                  target: 'Kajian Rutin Tafsir Surah Al-Kahfi (Ustadz Dr. Firanda Andirja, M.A.)',
                  hash: 'svg_8a72b1',
                  actor: 'Patrick Maulana',
                  time: '1 minggu yang lalu',
                  icon: Sparkles,
                  color: 'text-purple-600',
                },
                {
                  action: 'Pembaruan kredensial terenkripsi AES-256',
                  target: 'Canva Pro Tim Desain Poster (@alikhlas.org)',
                  hash: 'sec_vault_09',
                  actor: 'Ustadz Syarif',
                  time: '1 minggu yang lalu',
                  icon: KeyRound,
                  color: 'text-amber-600',
                },
              ].map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5 p-1 rounded-full bg-slate-100 text-slate-600 shrink-0">
                      <Icon size={13} className={act.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 font-medium">
                        <span className="font-bold">{act.actor}</span> {act.action} di{' '}
                        <span className="font-semibold text-gitlab-blue hover:underline cursor-pointer">
                          {act.target}
                        </span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gitlab-muted font-mono">
                        <span className="bg-slate-100 px-1 py-0.2 rounded text-slate-600">{act.hash}</span>
                        <span>•</span>
                        <span>{act.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (Side Widgets, 4 span - like Image 1) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Widget 1: Ringkasan Kas (GitLab Merge Requests Widget Style) */}
          <div className="bg-white rounded-lg border border-gitlab-panelBorder shadow-gitlab p-4">
            <h3 className="text-xs font-bold text-gitlab-text uppercase tracking-wider mb-2">
              Buku Kas & Keuangan
            </h3>

            <div className="space-y-3 pt-1">
              <div>
                <span className="text-[11px] text-gitlab-secondary block">Saldo Kas Bersih</span>
                <div className="text-xl font-bold text-slate-900">Rp 14.850.000</div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div className="bg-slate-50 p-2 rounded">
                  <span className="text-[10px] text-slate-400 block">Pemasukan</span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight size={12} /> +Rp 4.750.000
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <span className="text-[10px] text-slate-400 block">Pengeluaran</span>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-0.5">
                    <ArrowDownRight size={12} /> -Rp 1.670.000
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-gitlab-muted pt-1">
                Updated Nov 07, 2026, 2:45 PM
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => onSelectModule && onSelectModule('finance')}
                  className="text-xs text-gitlab-blue hover:underline font-semibold flex items-center gap-1"
                >
                  Buka Buku Kas Selengkapnya <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Widget 2: Quick Access (GitLab Segmented Button Style) */}
          <div className="bg-white rounded-lg border border-gitlab-panelBorder shadow-gitlab p-4">
            <h3 className="text-xs font-bold text-gitlab-text uppercase tracking-wider mb-2.5">
              Quick access
            </h3>

            {/* Segmented Control */}
            <div className="flex rounded-md border border-slate-200 p-0.5 text-xs bg-slate-50 mb-3">
              <button
                onClick={() => setQuickAccessTab('recent')}
                className={`flex-1 py-1 rounded font-semibold transition-all ${
                  quickAccessTab === 'recent'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Recently viewed
              </button>
              <button
                onClick={() => setQuickAccessTab('modules')}
                className={`flex-1 py-1 rounded font-semibold transition-all ${
                  quickAccessTab === 'modules'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Modul Utama
              </button>
            </div>

            {/* Quick Links */}
            {quickAccessTab === 'recent' ? (
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => onSelectModule && onSelectModule('poster')}
                  className="w-full text-left flex items-center gap-2 p-2 rounded hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors font-medium"
                >
                  <Sparkles size={14} className="text-purple-600 shrink-0" />
                  <span className="truncate">Studio Poster Kajian (1:1 & 9:16)</span>
                </button>

                <button
                  onClick={() => onSelectModule && onSelectModule('vault')}
                  className="w-full text-left flex items-center gap-2 p-2 rounded hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors font-medium"
                >
                  <KeyRound size={14} className="text-amber-600 shrink-0" />
                  <span className="truncate">Instagram Utama (@masjid.alikhlas)</span>
                </button>

                <button
                  onClick={() => onSelectModule && onSelectModule('planner')}
                  className="w-full text-left flex items-center gap-2 p-2 rounded hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors font-medium"
                >
                  <CalendarDays size={14} className="text-blue-600 shrink-0" />
                  <span className="truncate">Jadwal Konten Jumat Berkah</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => onSelectModule && onSelectModule('finance')}
                  className="w-full text-left flex items-center gap-2 p-2 rounded hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors font-medium"
                >
                  <Wallet size={14} className="text-emerald-600 shrink-0" />
                  <span className="truncate">Buku Kas & Keuangan</span>
                </button>

                <button
                  onClick={() => onSelectModule && onSelectModule('vault')}
                  className="w-full text-left flex items-center gap-2 p-2 rounded hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors font-medium"
                >
                  <KeyRound size={14} className="text-amber-600 shrink-0" />
                  <span className="truncate">Account Vault (Medsos)</span>
                </button>

                <button
                  onClick={() => onSelectModule && onSelectModule('poster')}
                  className="w-full text-left flex items-center gap-2 p-2 rounded hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors font-medium"
                >
                  <Sparkles size={14} className="text-purple-600 shrink-0" />
                  <span className="truncate">Dynamic Poster Studio</span>
                </button>

                <button
                  onClick={() => onSelectModule && onSelectModule('planner')}
                  className="w-full text-left flex items-center gap-2 p-2 rounded hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors font-medium"
                >
                  <CalendarDays size={14} className="text-blue-600 shrink-0" />
                  <span className="truncate">Jadwal Konten & Publikasi</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
