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
          /* Desktop Width */
          collapsed ? 'lg:w-14' : 'lg:w-60'
          } ${
          /* Mobile Drawer */
          isMobileOpen
            ? 'fixed inset-y-0 left-0 w-64 shadow-2xl flex'
            : 'hidden lg:flex'
          }`}
      >
        {/* Sidebar Header: "Your work" section like GitLab */}
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

          {/* Close button for mobile */}
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
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${isActive
                    ? 'bg-gitlab-sidebarActive text-gitlab-text font-bold shadow-xs'
                    : 'text-gitlab-secondary hover:bg-gitlab-sidebarHover hover:text-gitlab-text font-medium'
                  } ${collapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
                title={collapsed && !isMobileOpen ? item.label : undefined}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    size={16}
                    className={`shrink-0 ${isActive ? 'text-gitlab-text' : 'text-gitlab-secondary'
                      }`}
                  />
                  {(!collapsed || isMobileOpen) && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>

                {/* Subtle Counter Badge (like Image 1 GitLab) */}
                {(!collapsed || isMobileOpen) && item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${isActive
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

        {/* Footer: Help & Collapse (like GitLab Image 1 bottom) */}
        <div className="p-2 border-t border-gitlab-border/80 space-y-0.5 text-xs text-gitlab-secondary">
          <button
            onClick={() => setShowHelpModal(true)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-gitlab-sidebarHover hover:text-gitlab-text ${collapsed && !isMobileOpen ? 'justify-center px-0' : ''
              }`}
            title="Bantuan & Panduan Cepat"
          >
            <HelpCircle size={16} className="shrink-0" />
            {(!collapsed || isMobileOpen) && <span>Bantuan</span>}
          </button>

          <button
            onClick={onToggleCollapse}
            className={`w-full hidden lg:flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-gitlab-sidebarHover hover:text-gitlab-text ${collapsed ? 'justify-center px-0' : ''
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

      {/* Modal: Pusat Bantuan & Dokumentasi TARI */}
      {showHelpModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl border border-gitlab-panelBorder overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-gitlab-panelBorder flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Pusat Bantuan & Panduan Cepat TARI
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Platform Tata Kelola Digital Masjid & Organisasi Multi-Tenant.
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

              <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
                {/* Keyboard Shortcuts */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs">
                    <Command size={14} className="text-emerald-600" />
                    Pintasan Keyboard (GitLab Shortcuts)
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
                    Panduan Fitur Modul Utama
                  </h4>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Wallet size={13} className="text-emerald-600" />
                        Buku Kas & Keuangan
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Pencatatan kas multi-rekening, surplus kas, dan ekspor laporan resmi (.csv & cetak PDF bertanda tangan).
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <KeyRound size={13} className="text-amber-600" />
                        Account Vault Medsos
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Kumpulan kata sandi bersama terenkripsi AES-256-GCM dengan gerbang re-otentikasi & audit trail otomatis.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-purple-600" />
                        Dynamic Poster Studio
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Generator poster kajian otomatis rasio 1:1 (feed) & 9:16 (story) dengan unduhan SVG/PNG tajam.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-blue-600" />
                        Content Planner & Scheduler
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Kalender publikasi multi-kanal (Instagram, WhatsApp, Facebook) dengan alur approval Ketua DKM.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-2 flex items-center justify-end border-t border-slate-100">
                  <button
                    onClick={() => setShowHelpModal(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs"
                  >
                    Tutup Panduan
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
