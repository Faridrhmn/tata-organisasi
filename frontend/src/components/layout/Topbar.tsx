import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Bell,
  Plus,
  Building2,
  ChevronDown,
  Check,
  User,
  LogOut,
  Wallet,
  Sparkles,
  KeyRound,
  CalendarDays,
  Users,
  ShieldCheck,
  Settings,
  X,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  role: string;
}

interface TopbarProps {
  currentModule: string;
  currentOrg: Organization;
  organizations: Organization[];
  onSelectOrg: (org: Organization) => void;
  currentUser?: any;
  onLogout?: () => void;
  onMobileMenuToggle?: () => void;
  onSelectModule?: (mod: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentModule,
  currentOrg,
  organizations,
  onSelectOrg,
  currentUser,
  onLogout,
  onMobileMenuToggle,
  onSelectModule,
}) => {
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [plusDropdownOpen, setPlusDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Search Command Palette State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Notifications State
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const notifContainerRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState([
    {
      id: 'n-1',
      title: 'Review Jadwal Tayang Konten',
      desc: 'Poster Kajian Tafsir Surah Al-Kahfi butuh approval Ketua DKM.',
      time: '15 menit yang lalu',
      unread: true,
      module: 'planner',
    },
    {
      id: 'n-2',
      title: 'Pencatatan Kas Berhasil',
      desc: 'Infaq Kotak Jumat (+Rp 3.250.000) telah terverifikasi.',
      time: '2 jam yang lalu',
      unread: true,
      module: 'finance',
    },
    {
      id: 'n-3',
      title: 'Audit Keamanan Vault',
      desc: 'Kredensial Instagram Utama dibuka oleh Patrick Maulana.',
      time: '1 hari yang lalu',
      unread: true,
      module: 'audit',
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (item: (typeof notifications)[0]) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    if (onSelectModule) {
      onSelectModule(item.module);
    }
    setNotifDropdownOpen(false);
  };

  // Keyboard shortcut listener (/ or Ctrl+K) & click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' &&
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA') ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setOrgDropdownOpen(false);
        setPlusDropdownOpen(false);
        setUserDropdownOpen(false);
        setNotifDropdownOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
      if (
        notifContainerRef.current &&
        !notifContainerRef.current.contains(e.target as Node)
      ) {
        setNotifDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search items catalog
  const searchableItems = [
    // Modules
    { id: 'm-dash', type: 'Modul', title: 'Home / Dashboard', desc: 'Ringkasan tugas, buku kas, dan aktivitas', module: 'dashboard', icon: Sparkles },
    { id: 'm-fin', type: 'Modul', title: 'Buku Kas & Keuangan', desc: 'Pencatatan kas multi-rekening dan ekspor laporan', module: 'finance', icon: Wallet },
    { id: 'm-vault', type: 'Modul', title: 'Account Vault', desc: 'Brankas kata sandi medsos terenkripsi AES-256', module: 'vault', icon: KeyRound },
    { id: 'm-poster', type: 'Modul', title: 'Studio Dynamic Poster', desc: 'Generator poster kajian otomatis 1:1 dan 9:16', module: 'poster', icon: Sparkles },
    { id: 'm-plan', type: 'Modul', title: 'Jadwal Konten / Planner', desc: 'Kalender publikasi medsos dan review approval', module: 'planner', icon: CalendarDays },
    { id: 'm-mem', type: 'Modul', title: 'Pengurus & Anggota', desc: 'Manajemen hak akses role RBAC dan undangan pengurus', module: 'members', icon: Users },
    { id: 'm-audit', type: 'Modul', title: 'Audit Trail Keamanan', desc: 'Log rekaman aktivitas operasional immutable', module: 'audit', icon: ShieldCheck },
    { id: 'm-set', type: 'Modul', title: 'Pengaturan Organisasi', desc: 'Profil masjid, preferensi sistem, dan disaster backup', module: 'settings', icon: Settings },

    // Data / Entities
    { id: 'd-1', type: 'Transaksi', title: 'Infaq Kotak Jumat Pekan Pertama', desc: '+Rp 3.250.000 • Kas Tunai Utama', module: 'finance', icon: Wallet },
    { id: 'd-2', type: 'Transaksi', title: 'Pembayaran Tagihan Listrik PLN', desc: '-Rp 820.000 • BSI Operasional', module: 'finance', icon: Wallet },
    { id: 'd-3', type: 'Transaksi', title: 'Donasi Khusus Dakwah QRIS BSI', desc: '+Rp 1.500.000 • BSI Operasional', module: 'finance', icon: Wallet },
    { id: 'd-4', type: 'Kredensial', title: 'Instagram Utama (@masjid.alikhlas)', desc: 'Akun Publikasi Dakwah Utama', module: 'vault', icon: KeyRound },
    { id: 'd-5', type: 'Kredensial', title: 'Facebook Page Dakwah Masjid', desc: 'Halaman Facebook Dakwah Resmi', module: 'vault', icon: KeyRound },
    { id: 'd-6', type: 'Kredensial', title: 'Canva Pro Tim Desain Poster', desc: 'Akun Canva Pro Organisasi', module: 'vault', icon: KeyRound },
    { id: 'd-7', type: 'Konten', title: 'Poster Kajian Tafsir Surah Al-Kahfi', desc: 'Jadwal Tayang: Jumat 16:30 WIB • Menunggu Approval', module: 'planner', icon: CalendarDays },
    { id: 'd-8', type: 'Konten', title: 'Jumat Berkah Donasi Yatim & Dhuafa', desc: 'Jadwal Tayang: Jumat 06:00 WIB • Terjadwal', module: 'planner', icon: CalendarDays },
    { id: 'd-9', type: 'Pengurus', title: 'Patrick Maulana', desc: 'Admin Utama • patrick@tari.org', module: 'members', icon: Users },
    { id: 'd-10', type: 'Pengurus', title: 'Ust. H. Ahmad Fauzi', desc: 'Ketua DKM • fauzi@masjid.alikhlas', module: 'members', icon: Users },

    // Actions
    { id: 'a-1', type: 'Aksi Cepat', title: 'Catat Transaksi Kas Baru', desc: 'Tambah kas masuk infaq atau pengeluaran operasional', module: 'finance', icon: Wallet },
    { id: 'a-2', type: 'Aksi Cepat', title: 'Buat Poster Kajian Baru', desc: 'Buka studio generator poster dinamis', module: 'poster', icon: Sparkles },
    { id: 'a-3', type: 'Aksi Cepat', title: 'Simpan Kredensial Baru', desc: 'Tambah kredensial akun sosial media ke vault', module: 'vault', icon: KeyRound },
    { id: 'a-4', type: 'Aksi Cepat', title: 'Rencanakan Konten Baru', desc: 'Jadwalkan postingan sosial media baru', module: 'planner', icon: CalendarDays },
  ];

  const searchItemsFiltered = (query: string, items: typeof searchableItems) => {
    if (!query.trim()) {
      return items.slice(0, 8);
    }
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
    );
  };

  const filteredSearchResults = searchItemsFiltered(searchQuery, searchableItems);

  const handleSelectSearchItem = (item: (typeof searchableItems)[0]) => {
    if (onSelectModule) {
      onSelectModule(item.module);
    }
    setSearchQuery('');
    setSearchOpen(false);
  };

  const getModuleTitle = (mod: string) => {
    switch (mod) {
      case 'dashboard':
        return 'Home';
      case 'finance':
        return 'Buku Kas & Keuangan';
      case 'vault':
        return 'Account Vault';
      case 'poster':
        return 'Dynamic Poster';
      case 'planner':
        return 'Jadwal Konten';
      case 'members':
        return 'Pengurus & Anggota';
      case 'audit':
        return 'Audit Trail';
      case 'settings':
        return 'Pengaturan';
      default:
        return mod;
    }
  };

  return (
    <header className="bg-white border-b border-gitlab-border sticky top-0 z-30 select-none">
      {/* Primary Global Bar (GitLab Top Navbar Style) */}
      <div className="h-11 px-3 sm:px-4 flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle + Logo + Workspace Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Hamburger Button */}
          <button
            onClick={onMobileMenuToggle}
            className="p-1.5 -ml-1 rounded text-gitlab-secondary hover:text-gitlab-text hover:bg-slate-100 lg:hidden"
            title="Menu"
          >
            <Menu size={18} />
          </button>

          {/* Logo Brand Icon */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-tari-green text-white flex items-center justify-center font-bold text-xs shadow-xs">
              T
            </div>
            <span className="hidden sm:inline-block font-bold text-xs tracking-tight text-slate-800">
              TARI
            </span>
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          {/* Organization Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setOrgDropdownOpen(!orgDropdownOpen);
                setPlusDropdownOpen(false);
                setUserDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-100 text-slate-800 font-semibold text-xs transition-colors"
            >
              <Building2 size={13} className="text-emerald-600 shrink-0" />
              <span className="max-w-[130px] sm:max-w-[180px] truncate">
                {currentOrg.name}
              </span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {orgDropdownOpen && (
              <div className="absolute left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Ruang Kerja Organisasi
                </div>
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      onSelectOrg(org);
                      setOrgDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">{org.name}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded capitalize">
                        {org.role}
                      </span>
                    </div>
                    {org.id === currentOrg.id && (
                      <Check size={13} className="text-emerald-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: GitLab Search Bar (Interactive Command Palette) */}
        <div ref={searchContainerRef} className="flex-1 max-w-md mx-2 hidden md:block relative">
          <div className="relative w-full">
            <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                setSearchOpen(true);
                setOrgDropdownOpen(false);
                setPlusDropdownOpen(false);
                setUserDropdownOpen(false);
                setNotifDropdownOpen(false);
              }}
              placeholder="Search or go to..."
              className="w-full pl-7 pr-12 py-1 text-xs bg-slate-50/80 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-slate-300 rounded-md focus:outline-none text-slate-700 placeholder-slate-400 transition-colors shadow-xs"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 p-0.5 text-slate-400 hover:text-slate-600 rounded"
              >
                <X size={12} />
              </button>
            ) : (
              <kbd className="absolute right-2 top-1.5 px-1 py-0.2 text-[9px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
                /
              </kbd>
            )}
          </div>

          {/* Search Results Dropdown Palette */}
          {searchOpen && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-96 overflow-y-auto text-xs">
              <div className="px-3 py-1 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                <span>{searchQuery ? `Hasil Pencarian (${filteredSearchResults.length})` : 'Pintasan & Navigasi Cepat'}</span>
                <span className="font-normal font-mono lowercase">Esc untuk tutup</span>
              </div>

              {filteredSearchResults.length === 0 ? (
                <div className="px-4 py-6 text-center text-slate-400 text-xs">
                  Tidak ada data atau modul yang cocok dengan "{searchQuery}".
                </div>
              ) : (
                <div className="py-1">
                  {filteredSearchResults.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectSearchItem(item)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700 flex items-center justify-center shrink-0 transition-colors">
                            <Icon size={13} />
                          </div>
                          <div className="truncate">
                            <div className="font-semibold text-slate-800 group-hover:text-emerald-700 flex items-center gap-1.5">
                              <span className="truncate">{item.title}</span>
                              <span className="text-[9px] font-normal px-1 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200">
                                {item.type}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {item.desc}
                            </div>
                          </div>
                        </div>
                        <ArrowRight size={12} className="text-slate-300 group-hover:text-emerald-600 shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Plus Button, Notifications, Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Create (+) Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setPlusDropdownOpen(!plusDropdownOpen);
                setOrgDropdownOpen(false);
                setUserDropdownOpen(false);
                setNotifDropdownOpen(false);
                setSearchOpen(false);
              }}
              className="w-7 h-7 rounded hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors"
              title="Buat baru..."
            >
              <Plus size={16} />
            </button>

            {plusDropdownOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Aksi Cepat
                </div>
                <button
                  onClick={() => {
                    if (onSelectModule) onSelectModule('poster');
                    setPlusDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Sparkles size={14} className="text-purple-600" /> Buat Poster Baru
                </button>
                <button
                  onClick={() => {
                    if (onSelectModule) onSelectModule('finance');
                    setPlusDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Wallet size={14} className="text-emerald-600" /> Catat Kas Masuk/Keluar
                </button>
                <button
                  onClick={() => {
                    if (onSelectModule) onSelectModule('planner');
                    setPlusDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <CalendarDays size={14} className="text-blue-600" /> Rencanakan Konten
                </button>
                <button
                  onClick={() => {
                    if (onSelectModule) onSelectModule('vault');
                    setPlusDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <KeyRound size={14} className="text-amber-600" /> Simpan Kredensial
                </button>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div ref={notifContainerRef} className="relative">
            <button
              onClick={() => {
                setNotifDropdownOpen(!notifDropdownOpen);
                setSearchOpen(false);
                setOrgDropdownOpen(false);
                setPlusDropdownOpen(false);
                setUserDropdownOpen(false);
              }}
              className="w-7 h-7 rounded hover:bg-slate-100 text-slate-600 flex items-center justify-center relative transition-colors"
              title="Notifikasi"
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-1 w-80 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Notifikasi Organisasi</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotifsRead}
                      className="text-[11px] text-blue-600 hover:underline font-medium"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5 ${
                        n.unread ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div
                        className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                          n.unread ? 'bg-blue-600' : 'bg-transparent'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 truncate">
                          {n.title}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {n.desc}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                          <Clock size={10} /> {n.time}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="p-2 border-t border-slate-100 text-center bg-slate-50/50">
                  <span className="text-[11px] text-slate-400">
                    Notifikasi tersinkronisasi multi-tenant
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar with dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setUserDropdownOpen(!userDropdownOpen);
                setOrgDropdownOpen(false);
                setPlusDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-slate-200 transition-all ml-1"
            >
              <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                <User size={12} />
              </div>
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="font-bold text-slate-900 truncate">
                    {currentUser?.full_name || 'Patrick Maulana'}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {currentUser?.email || 'patrick@tari.org'}
                  </div>
                  <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                    {currentOrg.role}
                  </span>
                </div>

                <div className="py-1">
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut size={13} /> Keluar (Logout)
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-bar: GitLab Clean Breadcrumbs (Your work / Home) */}
      <div className="h-7 px-4 bg-white border-t border-slate-100 flex items-center text-[12px] text-slate-500">
        <span className="hover:text-slate-800 cursor-pointer">
          {currentOrg.name}
        </span>
        <span className="mx-1.5 text-slate-300">/</span>
        <span className="font-medium text-slate-800">
          {getModuleTitle(currentModule)}
        </span>
      </div>
    </header>
  );
};
