import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Wallet,
  Users,
  Sparkles,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface AuditItem {
  id: string;
  user_name: string;
  user_email: string;
  action: string;
  target_type: string;
  details: string;
  ip_address: string;
  created_at: string;
  severity: 'normal' | 'sensitive' | 'warning';
}

export const AuditPage: React.FC = () => {
  const [filterModule, setFilterModule] = useState<string>('all');

  const [auditLogs] = useState<AuditItem[]>([
    {
      id: 'log-1',
      user_name: 'Patrick Maulana',
      user_email: 'patrick@tari.org',
      action: 'vault.reveal_success',
      target_type: 'vault_credential',
      details: 'Membuka kata sandi Instagram Utama (@masjid.alikhlas) setelah re-autentikasi.',
      ip_address: '192.168.1.104',
      created_at: '2026-11-07 14:18:20',
      severity: 'sensitive',
    },
    {
      id: 'log-2',
      user_name: 'Patrick Maulana',
      user_email: 'patrick@tari.org',
      action: 'poster.generate',
      target_type: 'poster',
      details: 'Generate poster resolusi tinggi (1:1 Feed) kajian "Tafsir Surah Al-Kahfi".',
      ip_address: '192.168.1.104',
      created_at: '2026-11-07 14:15:10',
      severity: 'normal',
    },
    {
      id: 'log-3',
      user_name: 'Ahmad Bendahara',
      user_email: 'ahmad@alikhlas.org',
      action: 'finance.create_transaction',
      target_type: 'transaction',
      details: 'Mencatat pemasukan kas: Infaq Kotak Jumat Pekan Pertama (+Rp 3.250.000).',
      ip_address: '192.168.1.15',
      created_at: '2026-11-06 13:45:00',
      severity: 'normal',
    },
    {
      id: 'log-4',
      user_name: 'Patrick Maulana',
      user_email: 'patrick@tari.org',
      action: 'members.invite',
      target_type: 'member',
      details: 'Mengundang Ustadz Syarif sebagai "Admin Media".',
      ip_address: '192.168.1.104',
      created_at: '2026-11-05 10:20:00',
      severity: 'normal',
    },
    {
      id: 'log-5',
      user_name: 'Ustadz Syarif',
      user_email: 'syarif@alikhlas.org',
      action: 'vault.create',
      target_type: 'vault_credential',
      details: 'Menyimpan kredensial baru dengan enkripsi AES-256: Canva Pro Tim Desain.',
      ip_address: '192.168.1.88',
      created_at: '2026-11-04 16:12:00',
      severity: 'normal',
    },
    {
      id: 'log-6',
      user_name: 'User Tidak Dikenal',
      user_email: 'unknown@ip-ext.net',
      action: 'vault.reveal_failed_auth',
      target_type: 'vault_credential',
      details: 'Percobaan pembukaan password kredensial ditolak: kata sandi verifikasi salah.',
      ip_address: '180.252.12.9',
      created_at: '2026-11-03 21:05:40',
      severity: 'warning',
    },
  ]);

  const getActionBadge = (action: string, severity: string) => {
    if (action.startsWith('vault.')) {
      if (severity === 'warning') {
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
            <AlertTriangle size={11} /> Keamanan Vault
          </span>
        );
      }
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
          <KeyRound size={11} /> Kumpulan Akun (Vault)
        </span>
      );
    }
    if (action.startsWith('finance.')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
          <Wallet size={11} /> Buku Kas
        </span>
      );
    }
    if (action.startsWith('members.') || action.startsWith('org.')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
          <Users size={11} /> Organisasi
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
        <Sparkles size={11} /> Studio Poster
      </span>
    );
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (filterModule === 'all') return true;
    return log.action.startsWith(filterModule);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-emerald-600" size={24} />
            Audit Trail & Riwayat Aktivitas Keamanan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log rekaman aktivitas operasional organisasi yang tidak dapat dimanipulasi (*immutable audit logging*).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" />
            Integritas Data Terlindungi
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-lg border border-gitlab-panelBorder p-3.5 sm:px-4 shadow-gitlab flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gitlab-muted" />
          <span className="text-xs font-semibold text-slate-700">Filter Modul:</span>
          <div className="flex flex-wrap gap-1 bg-slate-100 p-0.5 rounded-md text-xs">
            {[
              { id: 'all', label: 'Semua Aktivitas' },
              { id: 'vault', label: 'Vault (Password)' },
              { id: 'finance', label: 'Keuangan' },
              { id: 'members', label: 'Pengurus' },
              { id: 'poster', label: 'Poster' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterModule(f.id)}
                className={`px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${filterModule === f.id
                    ? 'bg-white text-gitlab-text shadow-xs font-bold'
                    : 'text-gitlab-secondary hover:text-gitlab-text'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-gitlab-muted">
          Menampilkan <span className="font-semibold text-slate-700">{filteredLogs.length}</span> catatan peristiwa
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg border border-gitlab-panelBorder shadow-gitlab overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-gitlab-panelBorder text-[11px] font-semibold text-gitlab-secondary uppercase tracking-wider">
                <th className="py-2.5 px-4">Waktu</th>
                <th className="py-2.5 px-4">Aktor / Pengguna</th>
                <th className="py-2.5 px-4">Modul / Aksi</th>
                <th className="py-2.5 px-4">Rincian Peristiwa</th>
                <th className="py-2.5 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <ShieldCheck size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-semibold text-gitlab-text">Tidak ada log aktivitas</p>
                    <p className="text-[11px] text-gitlab-secondary mt-0.5">
                      Belum ada peristiwa tercatat untuk kategori "{filterModule}".
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={`hover:bg-slate-50/80 transition-colors ${log.severity === 'warning' ? 'bg-rose-50/30' : ''
                      }`}
                  >
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {log.created_at}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{log.user_name}</div>
                      <div className="text-[11px] text-slate-400">{log.user_email}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getActionBadge(log.action, log.severity)}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-md">
                      <div className="font-medium line-clamp-2">{log.details}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {log.ip_address}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Guarantee */}
        <div className="p-3 bg-slate-50/60 border-t border-gitlab-panelBorder text-[11px] text-gitlab-muted flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Info size={13} className="text-slate-400" />
            <span>Setiap modifikasi data keuangan dan akses kredensial vault terekam permanen untuk kepatuhan transparansi.</span>
          </div>
          <span className="font-mono text-[10px]">TARI-AUDIT-v1</span>
        </div>
      </div>
    </div>
  );
};
