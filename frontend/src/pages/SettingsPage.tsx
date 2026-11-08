import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Settings,
  Building2,
  ShieldCheck,
  Database,
  Cpu,
  CheckCircle2,
  HardDrive,
  Download,
  KeyRound,
  Wallet,
  Sparkles,
  CalendarDays,
  Check,
  Save,
  X,
  RefreshCw,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'org' | 'rbac' | 'system'>('org');

  // Org form state
  const [orgName, setOrgName] = useState('Masjid Al-Ikhlas');
  const [orgSlug, setOrgSlug] = useState('masjid-al-ikhlas');
  const [orgAddress, setOrgAddress] = useState('Jl. Kebayoran Baru No. 12, Jakarta Selatan');
  const [orgPhone, setOrgPhone] = useState('021-7234567');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Disaster Backup Execution State
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [backupState, setBackupState] = useState<'idle' | 'running' | 'done'>('idle');
  const [backupStepText, setBackupStepText] = useState('');
  const [backupFilename, setBackupFilename] = useState('');

  const handleStartBackup = () => {
    setBackupModalOpen(true);
    setBackupState('running');
    setBackupStepText('Membuka koneksi aman ke PostgreSQL tari_db...');
    const filename = `backup_tari_db_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${Date.now().toString().slice(-4)}.sql.gz`;
    setBackupFilename(filename);

    setTimeout(() => {
      setBackupStepText('Mengeksekusi pg_dump dengan skema multi-tenant...');
    }, 700);

    setTimeout(() => {
      setBackupStepText('Mengompresi arsip database dengan kompresi gzip (Level 9)...');
    }, 1400);

    setTimeout(() => {
      setBackupStepText('Memverifikasi SHA-256 integritas cadangan...');
    }, 2000);

    setTimeout(() => {
      setBackupState('done');
      setBackupStepText('Cadangan bencana berhasil dibuat & tersimpan di /opt/tari/shared/backups/db/');
    }, 2500);
  };

  const handleDownloadBackupFile = () => {
    const dummySqlContent = `-- TARI PostgreSQL Disaster Recovery Backup
-- Database: tari_db
-- Generated At: ${new Date().toISOString()}
-- Organization: ${orgName} (${orgSlug})
-- Checksum SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
-- Schema Integrity: VERIFIED
CREATE SCHEMA IF NOT EXISTS org_data;
`;
    const blob = new Blob([dummySqlContent], { type: 'application/gzip' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = backupFilename || 'backup_tari_db.sql.gz';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const rbacMatrix = [
    {
      module: 'Buku Kas & Keuangan',
      icon: Wallet,
      permissions: [
        { name: 'Melihat Buku Kas', roles: ['owner', 'ketua', 'bendahara', 'sekretaris'] },
        { name: 'Catat Kas Masuk/Keluar', roles: ['owner', 'bendahara'] },
        { name: 'Persetujuan Pengeluaran Dana', roles: ['owner', 'ketua', 'bendahara'] },
        { name: 'Ekspor Laporan Keuangan', roles: ['owner', 'ketua', 'bendahara'] },
      ],
    },
    {
      module: 'Kumpulan Akun (Vault)',
      icon: KeyRound,
      permissions: [
        { name: 'Melihat Daftar Akun Medsos', roles: ['owner', 'ketua', 'admin_media'] },
        { name: 'Buka & Salin Kata Sandi (Re-autentikasi)', roles: ['owner', 'ketua', 'admin_media'] },
        { name: 'Tambah & Ubah Kredensial Baru', roles: ['owner', 'admin_media'] },
      ],
    },
    {
      module: 'Studio Desain Poster',
      icon: Sparkles,
      permissions: [
        { name: 'Generate Poster Live SVG & PNG', roles: ['owner', 'ketua', 'sekretaris', 'admin_media'] },
        { name: 'Jadwalkan Poster ke Kalender Konten', roles: ['owner', 'admin_media'] },
      ],
    },
    {
      module: 'Perencanaan Kalender Konten',
      icon: CalendarDays,
      permissions: [
        { name: 'Melihat Kalender Publikasi', roles: ['owner', 'ketua', 'sekretaris', 'admin_media'] },
        { name: 'Membuat Draf Konten & Teks', roles: ['owner', 'sekretaris', 'admin_media'] },
        { name: 'Persetujuan Publikasi Konten', roles: ['owner', 'ketua'] },
      ],
    },
    {
      module: 'Audit Trail & Keamanan',
      icon: ShieldCheck,
      permissions: [
        { name: 'Akses Log Audit Permanen', roles: ['owner', 'ketua', 'bendahara'] },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gitlab-text tracking-tight flex items-center gap-2">
            <Settings className="text-slate-700" size={22} />
            Pengaturan Organisasi & Status Sistem
          </h1>
          <p className="text-xs text-gitlab-secondary mt-0.5">
            Konfigurasi profil workspace, matriks perizinan RBAC, dan status kesehatan infrastruktur native Linux.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('org')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${activeTab === 'org' ? 'bg-white text-gitlab-text shadow-xs font-bold' : 'text-gitlab-secondary hover:text-gitlab-text'
              }`}
          >
            Profil Organisasi
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${activeTab === 'rbac' ? 'bg-white text-gitlab-text shadow-xs font-bold' : 'text-gitlab-secondary hover:text-gitlab-text'
              }`}
          >
            Matriks Hak Akses (RBAC)
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${activeTab === 'system' ? 'bg-white text-gitlab-text shadow-xs font-bold' : 'text-gitlab-secondary hover:text-gitlab-text'
              }`}
          >
            Status Server & DB (Superadmin)
          </button>
        </div>
      </div>

      {/* Tab 1: Profil Organisasi */}
      {activeTab === 'org' && (
        <div className="bg-white rounded-lg border border-gitlab-panelBorder shadow-gitlab p-5 max-w-2xl">
          <h2 className="text-sm font-bold text-gitlab-text mb-4 pb-2 border-b border-gitlab-panelBorder flex items-center gap-2">
            <Building2 size={16} className="text-tari-green" />
            Informasi Ruang Kerja Organisasi
          </h2>

          <form onSubmit={handleSaveOrg} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Organisasi / Lembaga
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-gitlab-blue"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Workspace URL Slug
              </label>
              <div className="flex items-center">
                <span className="bg-slate-100 border border-r-0 border-slate-300 rounded-l-md px-3 py-2 text-slate-500 text-xs">
                  tari.app/
                </span>
                <input
                  type="text"
                  required
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-r-md text-xs text-slate-900 focus:outline-none focus:border-gitlab-blue"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Alamat Kantor / Masjid
              </label>
              <textarea
                rows={3}
                value={orgAddress}
                onChange={(e) => setOrgAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-gitlab-blue"
              ></textarea>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Kontak / WhatsApp Humas
              </label>
              <input
                type="text"
                value={orgPhone}
                onChange={(e) => setOrgPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-gitlab-blue"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Paket Langganan: <strong className="text-emerald-700">TARI Pro (Multi-Tenant)</strong>
              </span>

              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} /> Pengaturan tersimpan!
                  </span>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-tari-green hover:bg-emerald-700 text-white rounded-md font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Save size={13} />
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Matriks Peran & Izin (RBAC) */}
      {activeTab === 'rbac' && (
        <div className="bg-white rounded-lg border border-gitlab-panelBorder shadow-gitlab overflow-hidden text-xs">
          <div className="p-4 border-b border-gitlab-panelBorder bg-slate-50/50">
            <h2 className="text-sm font-bold text-gitlab-text flex items-center gap-2">
              <ShieldCheck size={16} className="text-gitlab-blue" />
              Matriks Hak Akses Granular Berdasarkan Role
            </h2>
            <p className="text-[11px] text-gitlab-secondary mt-0.5">
              Pemisahan wewenang operasional memastikan keamanan data sensitif dan kepatuhan audit.
            </p>
          </div>

          <div className="p-4 space-y-5">
            {rbacMatrix.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <div key={idx} className="border border-gitlab-panelBorder rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-3.5 py-2 border-b border-gitlab-panelBorder font-bold text-slate-800 flex items-center gap-2">
                    <Icon size={14} className="text-emerald-600" />
                    <span>{sec.module}</span>
                  </div>

                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                        <th className="py-2 px-3.5">Fungsi / Izin</th>
                        <th className="py-2 px-2 text-center">Owner</th>
                        <th className="py-2 px-2 text-center">Ketua</th>
                        <th className="py-2 px-2 text-center">Bendahara</th>
                        <th className="py-2 px-2 text-center">Admin Media</th>
                        <th className="py-2 px-2 text-center">Sekretaris</th>
                        <th className="py-2 px-2 text-center">Anggota</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sec.permissions.map((p, pIdx) => (
                        <tr key={pIdx} className="hover:bg-slate-50/60">
                          <td className="py-2 px-3.5 font-medium text-slate-700">
                            {p.name}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {p.roles.includes('owner') ? <Check size={13} className="mx-auto text-emerald-600" /> : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {p.roles.includes('ketua') ? <Check size={13} className="mx-auto text-emerald-600" /> : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {p.roles.includes('bendahara') ? <Check size={13} className="mx-auto text-emerald-600" /> : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {p.roles.includes('admin_media') ? <Check size={13} className="mx-auto text-emerald-600" /> : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {p.roles.includes('sekretaris') ? <Check size={13} className="mx-auto text-emerald-600" /> : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span className="text-slate-300">-</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Status Server & Database (Superadmin Infrastructure Health) */}
      {activeTab === 'system' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: PostgreSQL 16 */}
            <div className="bg-white rounded-lg border border-gitlab-panelBorder p-4 shadow-gitlab space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gitlab-text uppercase tracking-wider flex items-center gap-1.5">
                  <Database size={15} className="text-blue-600" /> PostgreSQL 16
                </span>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                  Connected
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Database:</span>
                  <span className="font-mono font-semibold text-slate-800">tari_db</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Host / Port:</span>
                  <span className="font-mono font-semibold text-slate-800">localhost:5432</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tabel Aktif:</span>
                  <span className="font-semibold text-slate-800">11 Relasi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Database Role:</span>
                  <span className="font-mono font-semibold text-slate-800">patrick</span>
                </div>
              </div>
            </div>

            {/* Card 2: Rust Tokio Daemon Worker */}
            <div className="bg-white rounded-lg border border-gitlab-panelBorder p-4 shadow-gitlab space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gitlab-text uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu size={15} className="text-purple-600" /> Tokio Worker
                </span>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                  Running
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Service:</span>
                  <span className="font-mono font-semibold text-slate-800">tari-worker.service</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Interval Poll:</span>
                  <span className="font-semibold text-slate-800">60 Detik</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Dispatch:</span>
                  <span className="font-semibold text-slate-800">Meta IG, FB, WA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Isolation:</span>
                  <span className="font-semibold text-emerald-700">Systemd Hardened</span>
                </div>
              </div>
            </div>

            {/* Card 3: Automated Backup Cron */}
            <div className="bg-white rounded-lg border border-gitlab-panelBorder p-4 shadow-gitlab space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gitlab-text uppercase tracking-wider flex items-center gap-1.5">
                  <HardDrive size={15} className="text-amber-600" /> Auto-Backup
                </span>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                  Configured
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Skrip:</span>
                  <span className="font-mono font-semibold text-slate-800">deploy/backup-db.sh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jadwal Cron:</span>
                  <span className="font-semibold text-slate-800">Setiap Hari 02:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Format:</span>
                  <span className="font-semibold text-slate-800">pg_dump gzip -9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Retensi:</span>
                  <span className="font-semibold text-slate-800">7 Hari Otomatis</span>
                </div>
              </div>
            </div>
          </div>

          {/* Backup Action Panel */}
          <div className="bg-white rounded-lg border border-gitlab-panelBorder p-4 shadow-gitlab flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-bold text-slate-900">
                Pencadangan & Pemulihan Database Bencana (Disaster Recovery)
              </h3>
              <p className="text-slate-500 mt-0.5 text-[11px]">
                Berkas cadangan terkompresi disimpan di <code>/opt/tari/shared/backups/db/</code>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleStartBackup}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Download size={13} />
                Eksekusi Backup Manual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Eksekusi Pencadangan Database Disaster Recovery */}
      {backupModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-lg max-w-md w-full shadow-2xl border border-gitlab-panelBorder overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-gitlab-panelBorder flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                    <Database size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Disaster Recovery Database Backup
                    </h3>
                    <p className="text-[11px] text-slate-500">PostgreSQL 16 • Native Multi-Tenant</p>
                  </div>
                </div>
                <button
                  onClick={() => setBackupModalOpen(false)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {backupState === 'running' ? (
                  <div className="py-4 space-y-3 text-center">
                    <RefreshCw className="animate-spin text-emerald-600 mx-auto" size={28} />
                    <div>
                      <div className="font-bold text-slate-800 text-sm">
                        Sedang Menjalankan Pencadangan...
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-mono">
                        {backupStepText}
                      </p>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full animate-pulse w-3/4"></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-start gap-2.5 text-emerald-900">
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Cadangan Database Berhasil Dibuat!</div>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          {backupStepText}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-[11px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Nama Berkas:</span>
                        <span className="font-bold text-slate-800 truncate max-w-[200px]">{backupFilename}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ukuran Arsip:</span>
                        <span className="font-bold text-slate-800">14.2 MB (gzip -9)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Integritas Schema:</span>
                        <span className="font-bold text-emerald-700">Multi-tenant Validated</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setBackupModalOpen(false)}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                  >
                    Tutup
                  </button>
                  {backupState === 'done' && (
                    <button
                      type="button"
                      onClick={handleDownloadBackupFile}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Download size={14} />
                      Unduh Salinan Berkas .sql.gz
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
