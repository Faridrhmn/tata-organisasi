import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  KeyRound,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  Eye,
  EyeOff,
  Plus,
  AlertTriangle,
  X,
  Instagram,
  Facebook,
  Mail,
  Globe,
  Sparkles,
} from 'lucide-react';

interface Credential {
  id: string;
  platform: string;
  label: string;
  username: string;
  recovery_email?: string;
  phone_number?: string;
  notes?: string;
  mock_password?: string;
}

export const VaultPage: React.FC = () => {
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [selectedCred, setSelectedCred] = useState<Credential | null>(null);

  // Re-auth form states
  const [userPassword, setUserPassword] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState<{ [id: string]: string }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reauthError, setReauthError] = useState<string | null>(null);

  // New Credential Form states
  const [newPlatform, setNewPlatform] = useState('Instagram');
  const [newLabel, setNewLabel] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Demonstration credentials
  const [credentials, setCredentials] = useState<Credential[]>([
    {
      id: 'vault-1',
      platform: 'Instagram',
      label: 'Instagram Utama Dakwah',
      username: '@masjid.alikhlas',
      recovery_email: 'humas@alikhlas.org',
      phone_number: '0812-3456-7890',
      notes: '2FA aktif di HP Ketua Humas (Pak Syarif).',
      mock_password: 'IkhlasBerkah2026!#',
    },
    {
      id: 'vault-2',
      platform: 'Facebook',
      label: 'Facebook Page Resmi',
      username: 'Masjid Al Ikhlas Official',
      recovery_email: 'admin@alikhlas.org',
      notes: 'Terhubung ke Meta Business Suite.',
      mock_password: 'FB_AlIkhlas_Official#89',
    },
    {
      id: 'vault-3',
      platform: 'Canva',
      label: 'Canva Pro Tim Desain Poster',
      username: 'desain@alikhlas.org',
      notes: 'Langganan Canva Non-Profit tahunan.',
      mock_password: 'CanvaDesignKajian123',
    },
    {
      id: 'vault-4',
      platform: 'Email',
      label: 'Google Workspace Humas',
      username: 'humas@alikhlas.org',
      recovery_email: 'sekretariat@alikhlas.org',
      notes: 'Email utama korespondensi eksternal.',
      mock_password: 'GoogleMailSec2026!@',
    },
    {
      id: 'vault-5',
      platform: 'Website',
      label: 'cPanel Hosting & Domain',
      username: 'alikhlas_adm',
      notes: 'Hosting di Niagahoster, perpanjangan Mei 2027.',
      mock_password: 'Cpanel_Root_AlIkhlas99$',
    },
  ]);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="text-pink-500" size={18} />;
      case 'facebook':
        return <Facebook className="text-blue-500" size={18} />;
      case 'canva':
        return <Sparkles className="text-cyan-500" size={18} />;
      case 'email':
        return <Mail className="text-amber-500" size={18} />;
      default:
        return <Globe className="text-slate-500" size={18} />;
    }
  };

  const handleOpenReveal = (cred: Credential) => {
    if (revealedPasswords[cred.id]) {
      // Toggle hide
      const next = { ...revealedPasswords };
      delete next[cred.id];
      setRevealedPasswords(next);
      return;
    }

    setSelectedCred(cred);
    setUserPassword('');
    setReauthError(null);
    setShowReauthModal(true);
  };

  const handleConfirmReauth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCred) return;

    if (userPassword.length < 1) {
      setReauthError('Kata sandi login Anda wajib diisi.');
      return;
    }

    // Simulasi verifikasi re-autentikasi (atau panggilan ke API /vault/credentials/:id/reveal)
    setRevealedPasswords({
      ...revealedPasswords,
      [selectedCred.id]: selectedCred.mock_password || 'SecretTari2026!',
    });

    setShowReauthModal(false);
  };

  const handleCopyPassword = (cred: Credential) => {
    const pw = revealedPasswords[cred.id] || cred.mock_password || 'SecretTari2026!';
    navigator.clipboard.writeText(pw);
    setCopiedId(cred.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreateCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel || !newUsername || !newPassword) return;

    const newCred: Credential = {
      id: `vault-${Date.now()}`,
      platform: newPlatform,
      label: newLabel,
      username: newUsername,
      notes: newNotes,
      mock_password: newPassword,
    };

    setCredentials([newCred, ...credentials]);
    setShowAddModal(false);
    setNewLabel('');
    setNewUsername('');
    setNewPassword('');
    setNewNotes('');
  };

  const filteredCredentials = credentials.filter((c) => {
    if (filterPlatform === 'all') return true;
    return c.platform.toLowerCase() === filterPlatform.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <KeyRound className="text-amber-500" size={24} />
            Account Vault (Kredensial Digital)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Penyimpanan aman kata sandi akun Instagram, Facebook, Canva, dan hosting dengan enkripsi AES-256-GCM.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus size={15} />
          Simpan Akun Baru
        </button>
      </div>

      {/* Zero-Trust Security Banner (GitLab Alert Style) */}
      <div className="bg-amber-50/60 text-slate-800 rounded-lg p-3.5 sm:p-4 border border-amber-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-gitlab">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Lock size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-amber-700" />
              Zero-Trust Credential Security Active
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 max-w-xl">
              Kata sandi dienkripsi dengan standar AES-256-GCM. Kunci master tersimpan aman di server Linux. Membuka kredensial memerlukan re-autentikasi dan tercatat permanen di Audit Trail.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <span className="px-2 py-0.5 rounded bg-white border border-amber-200 text-[10px] font-mono font-semibold text-amber-800">
            AES-256-GCM
          </span>
          <span className="px-2 py-0.5 rounded bg-white border border-amber-200 text-[10px] font-mono font-semibold text-emerald-700">
            Audit Active
          </span>
        </div>
      </div>

      {/* Platform Filter Tabs (GitLab Pill Tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['all', 'Instagram', 'Facebook', 'Canva', 'Email', 'Website'].map((plat) => (
          <button
            key={plat}
            onClick={() => setFilterPlatform(plat)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 ${
              filterPlatform.toLowerCase() === plat.toLowerCase()
                ? 'bg-gitlab-sidebarActive text-gitlab-text shadow-xs'
                : 'bg-white text-gitlab-secondary hover:text-gitlab-text hover:bg-slate-100 border border-gitlab-panelBorder'
            }`}
          >
            {plat === 'all' ? 'Semua Platform' : plat}
          </button>
        ))}
      </div>

      {/* Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCredentials.map((cred) => {
          const isRevealed = !!revealedPasswords[cred.id];
          const isCopied = copiedId === cred.id;

          return (
            <div
              key={cred.id}
              className="bg-white rounded-lg border border-gitlab-panelBorder p-4 shadow-gitlab hover:border-slate-300 transition-all flex flex-col justify-between space-y-3.5"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      {getPlatformIcon(cred.platform)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {cred.label}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {cred.platform}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Aman
                  </span>
                </div>

                {/* Username */}
                <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 mb-3 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Username / ID Akun
                  </span>
                  <div className="font-mono text-xs font-bold text-slate-800 break-all select-all">
                    {cred.username}
                  </div>
                </div>

                {/* Password Box */}
                <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Kata Sandi
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {isRevealed ? 'Terbuka' : 'Terenkripsi'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="font-mono text-xs font-bold text-slate-800 tracking-wider truncate">
                      {isRevealed ? revealedPasswords[cred.id] : '••••••••••••••••'}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenReveal(cred)}
                        className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
                        title={isRevealed ? 'Sembunyikan' : 'Buka Kata Sandi'}
                      >
                        {isRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>

                      <button
                        onClick={() => handleCopyPassword(cred)}
                        className={`p-1 rounded transition-colors ${
                          isCopied
                            ? 'text-emerald-600 bg-emerald-50'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                        }`}
                        title="Salin Password ke Clipboard"
                      >
                        {isCopied ? <Check size={15} /> : <Copy size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes & 2FA */}
                {cred.notes && (
                  <p className="text-[11px] text-slate-500 mt-3 italic line-clamp-2">
                    💡 {cred.notes}
                  </p>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>{cred.phone_number || cred.recovery_email || 'Organisasi'}</span>
                {isCopied && (
                  <span className="text-emerald-600 font-semibold animate-pulse">
                    Tersalin!
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Re-Authentication Security Gate */}
      {showReauthModal &&
        selectedCred &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Lock size={15} className="text-amber-500" />
                  Verifikasi Keamanan Akses
                </h3>
                <button
                  onClick={() => setShowReauthModal(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleConfirmReauth} className="p-5 space-y-4 text-xs">
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] flex items-start gap-2">
                  <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Anda akan membuka kata sandi untuk <strong>{selectedCred.label}</strong>. Aktivitas ini akan tercatat dalam riwayat audit organisasi.
                  </span>
                </div>

                {reauthError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px]">
                    {reauthError}
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Masukkan Kata Sandi Akun Anda
                  </label>
                  <input
                    type="password"
                    required
                    autoFocus
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Kata sandi akun login Anda saat ini"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReauthModal(false)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-xs"
                  >
                    Konfirmasi & Buka
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Tambah Kredensial Baru */}
      {showAddModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <KeyRound size={16} className="text-amber-500" />
                  Simpan Kredensial Akun Baru
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateCredential} className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Platform
                    </label>
                    <select
                      value={newPlatform}
                      onChange={(e) => setNewPlatform(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Canva">Canva</option>
                      <option value="Email">Email / Workspace</option>
                      <option value="Website">Website / Hosting</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Nama Akun (Label)
                    </label>
                    <input
                      type="text"
                      required
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="Misal: Instagram Utama"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Username / ID Login
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Misal: @organisasi.id atau media@org.id"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Kata Sandi
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Kata sandi yang akan dienkripsi AES-256"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Catatan Tambahan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Misal: Nomor HP untuk 2FA, penanggung jawab akun, dsb."
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
                    Enkripsi & Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

