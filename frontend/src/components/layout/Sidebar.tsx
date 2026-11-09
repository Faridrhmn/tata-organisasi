import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Home,
  Wallet,
  KeyRound,
  Image as ImageIcon,
  CalendarDays,
  Users,
  ShieldCheck,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Command,
  BookOpen,
  Code2,
  Send,
  MessageSquare,
  CheckCircle2,
  Globe,
  Terminal,
  Database,
  Layers,
  Palette,
  Server,
} from 'lucide-react';

interface SidebarProps {
  currentModule: string;
  onSelectModule: (module: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  collapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [activeHelpTab, setActiveHelpTab] = useState<'guide' | 'developer' | 'feedback'>('guide');

  // Feedback form states
  const [feedbackCategory, setFeedbackCategory] = useState('Ide Fitur Baru');
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackContact, setFeedbackContact] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSentNotice, setFeedbackSentNotice] = useState<string | null>(null);

  const handleSendWhatsAppFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    const text =
      `[MASUKAN PENGEMBANGAN TARI SYSTEM]\n` +
      `--------------------------------\n` +
      `Kategori : ${feedbackCategory}\n` +
      `Pengirim : ${feedbackName.trim() || 'Pengurus Organisasi'}\n` +
      `Kontak   : ${feedbackContact.trim() || '-'}\n\n` +
      `Pesan / Usulan:\n"${feedbackMessage.trim()}"\n\n` +
      `Dikirim dari Platform TARI (tari.faridrhmn.my.id)`;

    // WhatsApp target number for developer
    const waUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');

    setFeedbackSentNotice('Pesan telah disiapkan! Jendela WhatsApp terbuka untuk mengirimkan masukan.');
    setFeedbackMessage('');
    setTimeout(() => setFeedbackSentNotice(null), 6000);
  };

  const handleSaveDirectFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    const savedFeedback = JSON.parse(localStorage.getItem('tari_user_feedback') || '[]');
    savedFeedback.push({
      id: `fb-${Date.now()}`,
      category: feedbackCategory,
      name: feedbackName || 'Anonim',
      contact: feedbackContact || '-',
      message: feedbackMessage,
      date: new Date().toISOString(),
    });
    localStorage.setItem('tari_user_feedback', JSON.stringify(savedFeedback));

    setFeedbackSentNotice('Jazakallahu khairan! Masukan Anda telah tersimpan dan diteruskan ke catatan pengembang (Bahruddin Farid).');
    setFeedbackMessage('');
    setTimeout(() => setFeedbackSentNotice(null), 6000);
  };

  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: Home },
    { id: 'finance', label: 'Buku Kas & Keuangan', icon: Wallet },
    { id: 'vault', label: 'Kumpulan Akun (Vault)', icon: KeyRound, badge: 7 },
    { id: 'poster', label: 'Studio Desain Poster', icon: ImageIcon },
    { id: 'planner', label: 'Jadwal Konten', icon: CalendarDays, badge: 2 },
    { id: 'members', label: 'Pengurus & Anggota', icon: Users },
    { id: 'audit', label: 'Log Audit Keamanan', icon: ShieldCheck },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`bg-gitlab-sidebar text-gitlab-text flex flex-col border-r border-gitlab-border select-none transition-all duration-200 z-50 ${
          collapsed ? 'lg:w-14' : 'lg:w-60'
        } ${
          isMobileOpen
            ? 'fixed inset-y-0 left-0 w-64 shadow-2xl flex'
            : 'hidden lg:flex'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-12 px-3.5 flex items-center justify-between border-b border-gitlab-border/80">
          {!collapsed || isMobileOpen ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gitlab-secondary uppercase tracking-wider">
                Menu Organisasi
              </span>
            </div>
          ) : (
            <div className="w-5 h-5 mx-auto rounded-md bg-tari-green text-white flex items-center justify-center font-bold text-[10px]">
              T
            </div>
          )}

          {isMobileOpen && onMobileClose && (
            <button
              onClick={onMobileClose}
              className="p-1 rounded text-gitlab-secondary hover:text-gitlab-text hover:bg-gitlab-sidebarHover lg:hidden"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectModule(item.id);
                  if (onMobileClose) onMobileClose();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                  isActive
                    ? 'bg-gitlab-sidebarActive text-gitlab-text font-bold shadow-xs'
                    : 'text-gitlab-secondary hover:bg-gitlab-sidebarHover hover:text-gitlab-text font-medium'
                } ${collapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
                title={collapsed && !isMobileOpen ? item.label : undefined}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    size={16}
                    className={`shrink-0 ${
                      isActive ? 'text-gitlab-text' : 'text-gitlab-secondary'
                    }`}
                  />
                  {(!collapsed || isMobileOpen) && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>

                {(!collapsed || isMobileOpen) && item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive
                        ? 'bg-slate-300 text-slate-800'
                        : 'bg-slate-200/90 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer: Help & Collapse */}
        <div className="p-2 border-t border-gitlab-border/80 space-y-0.5 text-xs text-gitlab-secondary">
          <button
            onClick={() => setShowHelpModal(true)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-gitlab-sidebarHover hover:text-gitlab-text ${
              collapsed && !isMobileOpen ? 'justify-center px-0' : ''
            }`}
            title="Bantuan & Profil Pengembang"
          >
            <HelpCircle size={16} className="shrink-0 text-emerald-600" />
            {(!collapsed || isMobileOpen) && (
              <span className="flex items-center justify-between w-full">
                <span>Bantuan & Pengembang</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </span>
            )}
          </button>

          <button
            onClick={onToggleCollapse}
            className={`w-full hidden lg:flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-gitlab-sidebarHover hover:text-gitlab-text ${
              collapsed ? 'justify-center px-0' : ''
            }`}
            title={collapsed ? 'Perluas menu bilah samping' : 'Ciutkan menu bilah samping'}
          >
            {collapsed ? (
              <ChevronRight size={16} className="shrink-0" />
            ) : (
              <>
                <ChevronLeft size={16} className="shrink-0" />
                <span>Ciutkan menu</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Modal: Pusat Bantuan, Portofolio Pengembang & Masukan */}
      {showHelpModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-lg max-w-xl w-full shadow-2xl border border-gitlab-panelBorder overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="p-4 border-b border-gitlab-panelBorder flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Pusat Bantuan & Profil Pengembang
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      TARI System • Platform Tata Kelola Digital Masjid & Organisasi.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 px-4 bg-slate-50/50 text-xs">
                <button
                  onClick={() => setActiveHelpTab('guide')}
                  className={`py-2.5 px-3.5 font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                    activeHelpTab === 'guide'
                      ? 'border-emerald-600 text-emerald-700 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Command size={14} /> Panduan Modul
                </button>

                <button
                  onClick={() => setActiveHelpTab('developer')}
                  className={`py-2.5 px-3.5 font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                    activeHelpTab === 'developer'
                      ? 'border-emerald-600 text-emerald-700 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Code2 size={14} /> Profil Pengembang (Porto)
                </button>

                <button
                  onClick={() => setActiveHelpTab('feedback')}
                  className={`py-2.5 px-3.5 font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                    activeHelpTab === 'feedback'
                      ? 'border-emerald-600 text-emerald-700 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <MessageSquare size={14} /> Kirim Masukan / Saran
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
                {/* Notification */}
                {feedbackSentNotice && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>{feedbackSentNotice}</span>
                    </div>
                    <button
                      onClick={() => setFeedbackSentNotice(null)}
                      className="text-emerald-600 hover:text-emerald-800 p-1 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {activeHelpTab === 'guide' && (
                  <div className="space-y-4">
                    {/* Keyboard Shortcuts */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs">
                        <Command size={14} className="text-emerald-600" />
                        Pintasan Keyboard Cepat (GitLab Shortcuts)
                      </h4>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Pencarian & Command Palette Global</span>
                          <div className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-slate-300 rounded shadow-xs">/</kbd>
                            <span className="text-slate-400">atau</span>
                            <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-slate-300 rounded shadow-xs">Ctrl + K</kbd>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Tutup Modal Dialog / Palette</span>
                          <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-slate-300 rounded shadow-xs">Esc</kbd>
                        </div>
                      </div>
                    </div>

                    {/* Modul Overview */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2 text-xs">
                        Fitur-Fitur Utama TARI
                      </h4>
                      <div className="space-y-2">
                        <div className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <Wallet size={13} className="text-emerald-600" />
                            Buku Kas & Keuangan Multi-Rekening
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Visualisasi diagram arus kas bulanan, master data rekening & pos kategori, lampiran foto struk / transfer, serta ekspor laporan CSV dan cetak PDF bertanda tangan.
                          </p>
                        </div>

                        <div className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <KeyRound size={13} className="text-amber-600" />
                            Account Vault Terenkripsi AES-256
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Kumpulan kata sandi bersama (Instagram, TikTok, Canva, Web) dengan master data platform fleksibel dan verifikasi re-autentikasi otomatis.
                          </p>
                        </div>

                        <div className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <Sparkles size={13} className="text-purple-600" />
                            Studio Poster Dinamis & Custom Background
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Divisi medsos dapat mengunggah desain poster kustom dari Canva/Photoshop tanpa teks, mengatur tipografi & offset koordinat, lalu export instan PNG 1080px.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeHelpTab === 'developer' && (
                  <div className="space-y-4">
                    {/* Developer Card (Portfolio) */}
                    <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs space-y-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
                            BF
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">
                              Bahruddin Farid
                            </h4>
                            <p className="text-xs text-emerald-700 font-semibold">
                              Lead Software & Systems Engineer
                            </p>
                            <span className="text-[11px] text-slate-500">
                              Arsitek & Pengembang Platform TARI
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
                          v0.1.0-release
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        TARI dirancang dengan standar keandalan tinggi dan arsitektur multi-tenant modern untuk digitalisasi tata kelola operasional, transparansi buku kas, dan publikasi media organisasi dakwah di Indonesia.
                      </p>

                      {/* Tech Stack Badges */}
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">
                          Arsitektur & Tech Stack Sistem:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-1 rounded bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-medium flex items-center gap-1.5">
                            <Terminal size={12} className="text-orange-600" />
                            Rust (Axum Framework)
                          </span>
                          <span className="px-2.5 py-1 rounded bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-medium flex items-center gap-1.5">
                            <Database size={12} className="text-blue-600" />
                            PostgreSQL Multi-Tenant
                          </span>
                          <span className="px-2.5 py-1 rounded bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-medium flex items-center gap-1.5">
                            <Layers size={12} className="text-cyan-600" />
                            React 19 + TypeScript
                          </span>
                          <span className="px-2.5 py-1 rounded bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-medium flex items-center gap-1.5">
                            <Palette size={12} className="text-teal-600" />
                            Tailwind CSS
                          </span>
                          <span className="px-2.5 py-1 rounded bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-medium flex items-center gap-1.5">
                            <Server size={12} className="text-slate-600" />
                            Linux Systemd & Nginx SSL
                          </span>
                        </div>
                      </div>

                      {/* Contact & Portfolio Links */}
                      <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 flex-wrap">
                        <a
                          href="https://tari.faridrhmn.my.id"
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
                        >
                          <Globe size={13} className="text-slate-500" />
                          tari.faridrhmn.my.id
                        </a>

                        <button
                          type="button"
                          onClick={() => setActiveHelpTab('feedback')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Send size={12} /> Kirim Masukan / Diskusi
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeHelpTab === 'feedback' && (
                  <form onSubmit={handleSaveDirectFeedback} className="space-y-3.5">
                    <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                      <MessageSquare size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                      <span>
                        Punya saran fitur baru, perbaikan alur, atau ingin mengajak kerjasama? Kirimkan langsung masukan Anda ke pengembang sistem (Bahruddin Farid).
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Kategori Masukan
                        </label>
                        <select
                          value={feedbackCategory}
                          onChange={(e) => setFeedbackCategory(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="Ide Fitur Baru">Ide Fitur Baru</option>
                          <option value="Laporan Bug / Kendala">Laporan Bug / Kendala</option>
                          <option value="Saran Tampilan & Desain">Saran Tampilan & UX</option>
                          <option value="Konsultasi & Kerjasama">Konsultasi & Kerjasama</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Nama Anda (Opsional)
                        </label>
                        <input
                          type="text"
                          placeholder="Nama atau jabatan Anda"
                          value={feedbackName}
                          onChange={(e) => setFeedbackName(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Nomor HP / WhatsApp / Email (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="0812-xxxx-xxxx atau email Anda"
                        value={feedbackContact}
                        onChange={(e) => setFeedbackContact(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Pesan Masukan / Usulan Fitur
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Tuliskan masukan Anda di sini. Misal: Rekonsiliasi bank otomatis atau QRIS dinamis."
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      ></textarea>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleSendWhatsAppFeedback}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Send size={12} /> Kirim via WhatsApp
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowHelpModal(false)}
                          className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold text-xs"
                        >
                          Tutup
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs shadow-xs"
                        >
                          Simpan Masukan
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Footer Action */}
                {activeHelpTab !== 'feedback' && (
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[11px] text-slate-400">
                    <span>
                      TARI System • Versi 0.1.0 (Production)
                    </span>
                    <button
                      onClick={() => setShowHelpModal(false)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs"
                    >
                      Tutup
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
