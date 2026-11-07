import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  MoreVertical,
  Mail,
  Crown,
  Wallet,
  Sparkles,
  User,
  X,
  CheckCircle2,
  Trash2,
  Shield,
  Check,
} from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'ketua' | 'sekretaris' | 'bendahara' | 'admin_media' | 'member';
  status: 'active' | 'invited';
  joined_at: string;
}

export const MembersPage: React.FC = () => {
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Invite form states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<Member['role']>('admin_media');

  // Manage member role modal state
  const [manageMember, setManageMember] = useState<Member | null>(null);
  const [selectedRole, setSelectedRole] = useState<Member['role']>('admin_media');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleUpdateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manageMember) return;
    setMembers((prev) =>
      prev.map((m) => (m.id === manageMember.id ? { ...m, role: selectedRole } : m))
    );
    setToastMessage(`Peran untuk ${manageMember.name} berhasil diperbarui menjadi "${selectedRole}".`);
    setManageMember(null);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDeleteMember = (memberId: string, memberName: string) => {
    if (confirm(`Yakin ingin menonaktifkan akses ${memberName} dari organisasi ini?`)) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      setToastMessage(`Akses untuk ${memberName} telah dinonaktifkan.`);
      setManageMember(null);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const [members, setMembers] = useState<Member[]>([
    {
      id: 'mem-1',
      name: 'Patrick Maulana',
      email: 'patrick@tari.org',
      role: 'owner',
      status: 'active',
      joined_at: '01 Nov 2026',
    },
    {
      id: 'mem-2',
      name: 'Bahruddin Farid',
      email: 'farid@alikhlas.org',
      role: 'ketua',
      status: 'active',
      joined_at: '01 Nov 2026',
    },
    {
      id: 'mem-3',
      name: 'Ahmad Bendahara',
      email: 'ahmad@alikhlas.org',
      role: 'bendahara',
      status: 'active',
      joined_at: '02 Nov 2026',
    },
    {
      id: 'mem-4',
      name: 'Ustadz Syarif',
      email: 'syarif@alikhlas.org',
      role: 'admin_media',
      status: 'active',
      joined_at: '03 Nov 2026',
    },
    {
      id: 'mem-5',
      name: 'Fauzan Sekretaris',
      email: 'fauzan@alikhlas.org',
      role: 'sekretaris',
      status: 'active',
      joined_at: '04 Nov 2026',
    },
  ]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;

    const newMem: Member = {
      id: `mem-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'invited',
      joined_at: 'Hari Ini',
    };

    setMembers([...members, newMem]);
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteName('');
  };

  const getRoleBadge = (role: Member['role']) => {
    switch (role) {
      case 'owner':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Crown size={11} className="text-amber-600" /> Owner
          </span>
        );
      case 'ketua':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
            <ShieldCheck size={11} className="text-blue-600" /> Ketua
          </span>
        );
      case 'bendahara':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <Wallet size={11} className="text-emerald-600" /> Bendahara
          </span>
        );
      case 'admin_media':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
            <Sparkles size={11} className="text-purple-600" /> Admin Media
          </span>
        );
      case 'sekretaris':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 flex items-center gap-1">
            <User size={11} className="text-cyan-600" /> Sekretaris
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Anggota
          </span>
        );
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesRole = filterRole === 'all' || m.role === filterRole;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 p-1 rounded"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gitlab-text tracking-tight flex items-center gap-2">
            <Users className="text-gitlab-blue" size={22} />
            Pengurus & Anggota Organisasi
          </h1>
          <p className="text-xs text-gitlab-secondary mt-0.5">
            Manajemen hak akses pengguna dan hierarki peran (Role-Based Access Control) multi-tenant.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-3.5 py-2 bg-tari-green hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <UserPlus size={15} />
          <span>Undang Pengurus Baru</span>
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white rounded-lg border border-gitlab-panelBorder p-3 sm:px-4 shadow-gitlab flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pengurus atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-gitlab-blue"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'owner', label: 'Owner' },
            { id: 'ketua', label: 'Ketua' },
            { id: 'bendahara', label: 'Bendahara' },
            { id: 'admin_media', label: 'Admin Media' },
            { id: 'sekretaris', label: 'Sekretaris' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterRole(tab.id)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all shrink-0 ${
                filterRole === tab.id
                  ? 'bg-gitlab-sidebarActive text-gitlab-text shadow-xs'
                  : 'text-gitlab-secondary hover:text-gitlab-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg border border-gitlab-panelBorder shadow-gitlab overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-gitlab-panelBorder text-[11px] font-semibold text-gitlab-secondary uppercase tracking-wider">
                <th className="py-2.5 px-4">Nama Pengurus</th>
                <th className="py-2.5 px-4">Email Kontak</th>
                <th className="py-2.5 px-4">Role RBAC</th>
                <th className="py-2.5 px-4">Status Akun</th>
                <th className="py-2.5 px-4">Bergabung</th>
                <th className="py-2.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((mem) => (
                <tr key={mem.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-gitlab-text flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                      {mem.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <span>{mem.name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                    {mem.email}
                  </td>
                  <td className="py-3 px-4">
                    {getRoleBadge(mem.role)}
                  </td>
                  <td className="py-3 px-4">
                    {mem.status === 'active' ? (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Aktif
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Diundang
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {mem.joined_at}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        setManageMember(mem);
                        setSelectedRole(mem.role);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                      title="Kelola hak akses pengurus"
                    >
                      <MoreVertical size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Invite Member */}
      {showInviteModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full shadow-2xl border border-gitlab-panelBorder overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 border-b border-gitlab-panelBorder flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-sm text-gitlab-text flex items-center gap-1.5">
                  <UserPlus size={16} className="text-tari-green" />
                  Undang Pengurus Baru
                </h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleInvite} className="p-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Misal: Ustadz Rahmat"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-gitlab-blue"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alamat Email Pengurus
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="rahmat@masjid.alikhlas"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-gitlab-blue"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Peran / Role Organisasi
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as Member['role'])}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-gitlab-blue bg-white"
                  >
                    <option value="admin_media">Admin Media (Kelola Poster, Kalender Konten & Vault)</option>
                    <option value="bendahara">Bendahara (Kelola Buku Kas, Catat Transaksi, Laporan)</option>
                    <option value="sekretaris">Sekretaris (Kelola Jadwal & Dokumen Keanggotaan)</option>
                    <option value="ketua">Ketua (Approval Pengeluaran Dana & Jadwal Tayang)</option>
                    <option value="member">Anggota Umum (Hanya Akses Baca Terbatas)</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-tari-green hover:bg-emerald-700 text-white rounded-md font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <Mail size={13} />
                    Kirim Undangan
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Kelola Hak Akses Pengurus */}
      {manageMember &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-lg max-w-md w-full shadow-2xl border border-gitlab-panelBorder overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 border-b border-gitlab-panelBorder flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Shield className="text-emerald-600" size={16} />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Kelola Hak Akses Pengurus
                    </h3>
                    <p className="text-[11px] text-slate-500">{manageMember.name} • {manageMember.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setManageMember(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleUpdateRole} className="p-4 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Pilih Peran / Role Organisasi (RBAC)
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as Member['role'])}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs text-slate-900 bg-white focus:outline-none focus:border-gitlab-blue"
                  >
                    <option value="admin_media">Admin Media (Kelola Poster, Kalender Konten & Vault)</option>
                    <option value="bendahara">Bendahara (Kelola Buku Kas, Catat Transaksi, Laporan)</option>
                    <option value="sekretaris">Sekretaris (Kelola Jadwal & Dokumen Keanggotaan)</option>
                    <option value="ketua">Ketua (Approval Pengeluaran Dana & Jadwal Tayang)</option>
                    <option value="owner">Owner / Pemilik Workspace (Akses Penuh)</option>
                    <option value="member">Anggota Umum (Hanya Akses Baca Terbatas)</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <span className="font-bold block text-slate-800">Deskripsi Hak Akses Role:</span>
                  {selectedRole === 'admin_media' && (
                    <p>Dapat membuat dan mengedit poster, merencanakan kalender medsos, dan mengakses akun medsos di vault.</p>
                  )}
                  {selectedRole === 'bendahara' && (
                    <p>Dapat mencatat kas masuk/keluar, mengelola buku kas, dan mengekspor laporan keuangan resmi.</p>
                  )}
                  {selectedRole === 'ketua' && (
                    <p>Memiliki wewenang review & persetujuan (approval) pengeluaran kas dan jadwal publikasi konten.</p>
                  )}
                  {selectedRole === 'sekretaris' && (
                    <p>Dapat mengelola dokumen organisasi dan jadwal agenda masjid.</p>
                  )}
                  {selectedRole === 'owner' && (
                    <p>Akses administratif tak terbatas ke seluruh modul organisasi dan audit trail.</p>
                  )}
                  {selectedRole === 'member' && (
                    <p>Hanya dapat melihat informasi ringkasan tanpa akses modifikasi data sensitif.</p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleDeleteMember(manageMember.id, manageMember.name)}
                    className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-md font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={13} />
                    Nonaktifkan Akses
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setManageMember(null)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold flex items-center gap-1 shadow-xs"
                    >
                      <Check size={13} />
                      Simpan Peran
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
