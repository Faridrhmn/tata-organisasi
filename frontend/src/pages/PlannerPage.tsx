import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CalendarDays,
  Plus,
  Clock,
  Instagram,
  Facebook,
  MessageCircle,
  CheckCircle2,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Share2,
  Calendar,
  Kanban,
  List,
  Sparkles,
  Trash2,
  Send,
  Hash,
  Zap,
  RefreshCw,
} from 'lucide-react';

export interface ContentPost {
  id: string;
  title: string;
  caption: string;
  target_platforms: ('instagram' | 'facebook' | 'whatsapp')[];
  scheduled_at: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'published';
  campaign_name?: string;
  media_url?: string;
  created_by_name: string;
  approved_by_name?: string;
}

interface PlannerPageProps {
  initialData?: {
    title: string;
    caption: string;
    campaign: string;
  } | null;
  onClearInitialData?: () => void;
}

export const PlannerPage: React.FC<PlannerPageProps> = ({
  initialData,
  onClearInitialData,
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'calendar' | 'list'>('board');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);
  const [previewPlatform, setPreviewPlatform] = useState<'instagram' | 'facebook' | 'whatsapp'>('instagram');

  // Background Dispatcher States
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatcherMessage, setDispatcherMessage] = useState<string | null>(null);

  // Calendar State (Defaults to November 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // 10 is November (0-indexed)

  // New Post Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newPlatforms, setNewPlatforms] = useState<('instagram' | 'facebook' | 'whatsapp')[]>([
    'instagram',
    'whatsapp',
  ]);
  const [newScheduledDate, setNewScheduledDate] = useState('2026-11-13T06:00');
  const [newCampaign, setNewCampaign] = useState('Kajian Rutin');

  // Load Initial Posts from LocalStorage or Default Seeds
  const [posts, setPosts] = useState<ContentPost[]>(() => {
    const saved = localStorage.getItem('tari_planner_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'post-1',
        title: 'Poster Kajian Tafsir Surah Al-Kahfi',
        caption: `Bismillah. Hadirilah Kajian Rutin Sabtu Pagi bersama Ustadz Dr. Firanda Andirja, M.A. Membahas Tafsir Surah Al-Kahfi di Masjid Al-Ikhlas Kebayoran Baru.\n\n📅 Sabtu, 14 November 2026\n⏰ Ba'da Maghrib s/d Selesai\n📍 Terbuka untuk Ikhwan & Akhwat\n\nSilakan sebarkan informasi kebaikan ini. Barakallahu fiikum.\n\n#kajiansunnah #masjidalikhlas #dakwahtauhid`,
        target_platforms: ['instagram', 'facebook', 'whatsapp'],
        scheduled_at: '2026-11-13 06:00 WIB',
        status: 'approved',
        campaign_name: 'Kajian Rutin',
        created_by_name: 'Patrick Maulana',
        approved_by_name: 'Patrick Maulana',
      },
      {
        id: 'post-2',
        title: 'Pengingat Kotak Infaq Sedekah Jumat Berkah',
        caption: `Mari raih keberkahan hari Jumat dengan memperbanyak sedekah. Salurkan infaq terbaik Anda melalui rekening resmi Masjid Al-Ikhlas (BSI: 7123456789).\n\n#jumatberkah #sedekahjumat #infaqmasjid`,
        target_platforms: ['instagram', 'whatsapp'],
        scheduled_at: '2026-11-13 08:30 WIB',
        status: 'pending_approval',
        campaign_name: 'Jumat Berkah',
        created_by_name: 'Ustadz Syarif',
      },
      {
        id: 'post-3',
        title: 'Draft Pengumuman Kerja Bakti Kebersihan Masjid',
        caption: `Ahad Bersih Masjid Al-Ikhlas. Mengundang seluruh jamaah dan warga sekitar untuk bergotong royong membersihkan area wudhu dan halaman masjid.\n\n📅 Ahad, 15 November 2026 pukul 07:00 WIB.`,
        target_platforms: ['whatsapp'],
        scheduled_at: '2026-11-15 07:00 WIB',
        status: 'draft',
        campaign_name: 'Sosial & Kebersihan',
        created_by_name: 'Ahmad Bendahara',
      },
      {
        id: 'post-4',
        title: 'Dokumentasi Kajian Shubuh Ahad Pekan Lalu',
        caption: `Alhamdulillah telah terlaksana Kajian Shubuh bersama Ustadz Abdullah. Terima kasih kepada seluruh jamaah yang telah hadir dan berpartisipasi.\n\n#kajianshubuh #dokumentasikajian #alikhlas`,
        target_platforms: ['instagram', 'facebook'],
        scheduled_at: '2026-11-02 09:00 WIB',
        status: 'published',
        campaign_name: 'Dokumentasi',
        created_by_name: 'Patrick Maulana',
        approved_by_name: 'Patrick Maulana',
      },
    ];
  });

  // Save to LocalStorage whenever posts change
  useEffect(() => {
    localStorage.setItem('tari_planner_posts', JSON.stringify(posts));
  }, [posts]);

  // Handle incoming data from Dynamic Poster Studio
  useEffect(() => {
    if (initialData) {
      setNewTitle(initialData.title);
      setNewCaption(initialData.caption);
      setNewCampaign(initialData.campaign);
      setShowAddModal(true);
      if (onClearInitialData) onClearInitialData();
    }
  }, [initialData, onClearInitialData]);

  // Toggle platform selection in modal
  const togglePlatform = (p: 'instagram' | 'facebook' | 'whatsapp') => {
    if (newPlatforms.includes(p)) {
      if (newPlatforms.length > 1) {
        setNewPlatforms(newPlatforms.filter((item) => item !== p));
      }
    } else {
      setNewPlatforms([...newPlatforms, p]);
    }
  };

  // Create post handler
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCaption.trim()) return;

    const formattedDate = newScheduledDate.replace('T', ' ') + ' WIB';

    const newPost: ContentPost = {
      id: `post-${Date.now()}`,
      title: newTitle.trim(),
      caption: newCaption.trim(),
      target_platforms: newPlatforms,
      scheduled_at: formattedDate,
      status: 'pending_approval',
      campaign_name: newCampaign.trim() || undefined,
      created_by_name: 'Patrick Maulana',
    };

    setPosts([newPost, ...posts]);
    setShowAddModal(false);
    setNewTitle('');
    setNewCaption('');
  };

  // Approval Handlers
  const handleApprovePost = (id: string) => {
    setPosts(
      posts.map((p) =>
        p.id === id ? { ...p, status: 'approved', approved_by_name: 'Patrick Maulana' } : p
      )
    );
    setSelectedPost(null);
  };

  const handleRejectOrRevisePost = (id: string) => {
    setPosts(
      posts.map((p) =>
        p.id === id ? { ...p, status: 'draft' } : p
      )
    );
    setSelectedPost(null);
  };

  const handleDeletePost = (id: string) => {
    if (confirm('Yakin ingin menghapus rencana postingan ini?')) {
      setPosts(posts.filter((p) => p.id !== id));
      setSelectedPost(null);
    }
  };

  // Trigger manual dispatcher run
  const handleRunDispatcherNow = () => {
    setIsDispatching(true);
    setDispatcherMessage(null);

    const approvedList = posts.filter((p) => p.status === 'approved');

    setTimeout(() => {
      if (approvedList.length > 0) {
        const target = approvedList[0];
        setPosts((prev) =>
          prev.map((item) =>
            item.id === target.id ? { ...item, status: 'published' } : item
          )
        );
        setDispatcherMessage(`🚀 [DISPATCHED] "${target.title}" berhasil dipublikasikan ke ${target.target_platforms.join(', ')}.`);
      } else {
        setDispatcherMessage('ℹ️ Tidak ada postingan berstatus "Siap / Terjadwal" yang siap dipublikasikan.');
      }
      setIsDispatching(false);
      setTimeout(() => setDispatcherMessage(null), 5000);
    }, 900);
  };

  const getPlatformIcon = (p: string) => {
    switch (p) {
      case 'instagram':
        return <span title="Instagram Feed & Story"><Instagram size={13} className="text-pink-500" /></span>;
      case 'facebook':
        return <span title="Facebook Page"><Facebook size={13} className="text-blue-500" /></span>;
      case 'whatsapp':
        return <span title="WhatsApp Broadcast & Status"><MessageCircle size={13} className="text-emerald-500" /></span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: ContentPost['status']) => {
    switch (status) {
      case 'draft':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Draft
          </span>
        );
      case 'pending_approval':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Clock size={11} /> Menunggu Review
          </span>
        );
      case 'approved':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
            <CheckCircle2 size={11} /> Siap / Terjadwal
          </span>
        );
      case 'published':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <Check size={11} /> Telah Terbit
          </span>
        );
    }
  };

  const filterByStatus = (status: ContentPost['status']) => {
    return posts.filter((p) => p.status === status);
  };

  // Calendar Helpers
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday, ...
    const day = new Date(year, month, 1).getDay();
    // Adjust so 0 is Monday, 6 is Sunday
    return day === 0 ? 6 : day - 1;
  };

  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOffset = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Filter posts that belong to a specific calendar date (dayNumber)
  const getPostsForDay = (day: number) => {
    const paddedDay = day < 10 ? `0${day}` : `${day}`;
    const paddedMonth = currentMonth + 1 < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
    const datePrefix = `${currentYear}-${paddedMonth}-${paddedDay}`;

    return posts.filter((p) => p.scheduled_at.startsWith(datePrefix));
  };

  // Hashtag counter for caption
  const countHashtags = (text: string) => {
    const matches = text.match(/#\w+/g);
    return matches ? matches.length : 0;
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar (GitLab Clean Style) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gitlab-text tracking-tight flex items-center gap-2">
            <CalendarDays className="text-tari-green" size={22} />
            Perencanaan Kalender Konten
          </h1>
          <p className="text-xs text-gitlab-secondary mt-0.5">
            Susun strategi dan jadwal publikasi multi-kanal ke Instagram, Facebook, dan WhatsApp dengan persetujuan Ketua.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          {/* View Mode Switcher: Board, Calendar, List */}
          <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'board'
                  ? 'bg-white text-gitlab-text shadow-xs font-bold'
                  : 'text-gitlab-secondary hover:text-gitlab-text'
              }`}
              title="Tampilan Papan Alur Kerja"
            >
              <Kanban size={13} />
              <span className="hidden sm:inline">Papan Alur (Board)</span>
            </button>

            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-gitlab-text shadow-xs font-bold'
                  : 'text-gitlab-secondary hover:text-gitlab-text'
              }`}
              title="Tampilan Kalender Bulanan"
            >
              <Calendar size={13} />
              <span>Kalender</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-gitlab-text shadow-xs font-bold'
                  : 'text-gitlab-secondary hover:text-gitlab-text'
              }`}
              title="Tampilan Tabel Rinci"
            >
              <List size={13} />
              <span className="hidden sm:inline">Daftar</span>
            </button>
          </div>

          <button
            onClick={() => {
              setNewTitle('');
              setNewCaption('');
              setNewCampaign('Kajian Rutin');
              setShowAddModal(true);
            }}
            className="px-3.5 py-2 bg-tari-green hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus size={15} />
            <span>Rencanakan Konten</span>
          </button>
        </div>
      </div>

      {/* Background Dispatcher Worker Status Bar (Fase 4 Automation) */}
      <div className="bg-white rounded-lg border border-gitlab-panelBorder p-3 shadow-gitlab flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Tokio Worker: Aktif</span>
          </div>

          <div className="text-gitlab-secondary text-[11px] hidden md:flex items-center gap-2">
            <span>Interval Cek: <strong>60s</strong></span>
            <span>•</span>
            <span>Target: <strong>Meta Graph API & WA</strong></span>
            <span>•</span>
            <span>Siap Tayang: <strong>{filterByStatus('approved').length} Konten</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {dispatcherMessage && (
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 animate-in fade-in">
              {dispatcherMessage}
            </span>
          )}

          <button
            onClick={handleRunDispatcherNow}
            disabled={isDispatching}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-md font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            title="Uji coba siklus publish background worker sekarang"
          >
            {isDispatching ? (
              <RefreshCw size={13} className="animate-spin text-gitlab-blue" />
            ) : (
              <Zap size={13} className="text-amber-500" />
            )}
            <span>{isDispatching ? 'Memproses Dispatch...' : '⚡ Uji Dispatcher Sekarang'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Views */}
      {viewMode === 'board' && (
        /* View 1: Pipeline Board (GitLab Issue Board Style) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {/* Column 1: Drafts */}
          <div className="bg-[#f0f0f2]/70 rounded-lg p-3 border border-gitlab-border">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-xs font-bold text-gitlab-secondary uppercase tracking-wider flex items-center gap-1.5">
                Draf Konten
                <span className="text-[10px] bg-slate-200/90 text-slate-700 px-1.5 py-0.2 rounded-full font-semibold">
                  {filterByStatus('draft').length}
                </span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            </div>

            <div className="space-y-2.5">
              {filterByStatus('draft').map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="bg-white rounded-lg p-3.5 border border-gitlab-panelBorder shadow-gitlab hover:border-slate-400 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                      {post.campaign_name || 'Umum'}
                    </span>
                    <div className="flex items-center gap-1">
                      {post.target_platforms.map((p) => (
                        <span key={p}>{getPlatformIcon(p)}</span>
                      ))}
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-[11px] text-gitlab-secondary line-clamp-2 font-mono">
                    {post.caption}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-gitlab-muted">
                    <span>Oleh {post.created_by_name}</span>
                    <ChevronRight size={13} />
                  </div>
                </div>
              ))}
              {filterByStatus('draft').length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded">
                  Tidak ada draf konten.
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Pending Review */}
          <div className="bg-[#f0f0f2]/70 rounded-lg p-3 border border-gitlab-border">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                Menunggu Persetujuan
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-semibold">
                  {filterByStatus('pending_approval').length}
                </span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            </div>

            <div className="space-y-2.5">
              {filterByStatus('pending_approval').map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="bg-white rounded-lg p-3.5 border border-amber-300 shadow-gitlab hover:border-amber-400 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      {post.campaign_name || 'Umum'}
                    </span>
                    <div className="flex items-center gap-1">
                      {post.target_platforms.map((p) => (
                        <span key={p}>{getPlatformIcon(p)}</span>
                      ))}
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 line-clamp-2">
                    {post.title}
                  </h3>

                  <div className="flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                    <Clock size={12} />
                    <span>{post.scheduled_at}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Oleh {post.created_by_name}</span>
                    <span className="text-amber-700 font-bold text-[10px] bg-amber-50 px-1.5 py-0.5 rounded">
                      Perlu Persetujuan
                    </span>
                  </div>
                </div>
              ))}
              {filterByStatus('pending_approval').length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded">
                  Semua telah ditinjau.
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Approved / Scheduled */}
          <div className="bg-[#f0f0f2]/70 rounded-lg p-3 border border-gitlab-border">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                Disetujui / Terjadwal
                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-semibold">
                  {filterByStatus('approved').length}
                </span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            </div>

            <div className="space-y-2.5">
              {filterByStatus('approved').map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="bg-white rounded-lg p-3.5 border border-blue-200 shadow-gitlab hover:border-blue-400 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      {post.campaign_name || 'Umum'}
                    </span>
                    <div className="flex items-center gap-1">
                      {post.target_platforms.map((p) => (
                        <span key={p}>{getPlatformIcon(p)}</span>
                      ))}
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 line-clamp-2">
                    {post.title}
                  </h3>

                  <div className="flex items-center gap-1 text-[11px] text-blue-700 font-medium">
                    <CalendarDays size={12} />
                    <span>{post.scheduled_at}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={11} /> Disetujui
                    </span>
                    <Share2 size={13} className="text-blue-600" />
                  </div>
                </div>
              ))}
              {filterByStatus('approved').length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded">
                  Belum ada jadwal siap tayang.
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Published */}
          <div className="bg-[#f0f0f2]/70 rounded-lg p-3 border border-gitlab-border">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                Telah Terbit
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-semibold">
                  {filterByStatus('published').length}
                </span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>

            <div className="space-y-2.5">
              {filterByStatus('published').map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-gitlab hover:border-slate-300 transition-all cursor-pointer space-y-2 opacity-95"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {post.campaign_name || 'Umum'}
                    </span>
                    <div className="flex items-center gap-1">
                      {post.target_platforms.map((p) => (
                        <span key={p}>{getPlatformIcon(p)}</span>
                      ))}
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-800 line-clamp-2">
                    {post.title}
                  </h3>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-emerald-600 font-semibold">
                    <span className="flex items-center gap-1">
                      <Check size={12} /> Terposting
                    </span>
                    <span className="text-slate-400 font-normal">Selesai</span>
                  </div>
                </div>
              ))}
              {filterByStatus('published').length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded">
                  Belum ada konten terbit.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'calendar' && (
        /* View 2: Monthly Calendar Grid (Fitur Unggulan Fase 3) */
        <div className="bg-white rounded-lg border border-gitlab-panelBorder shadow-gitlab overflow-hidden">
          {/* Calendar Toolbar */}
          <div className="p-3.5 sm:px-4 border-b border-gitlab-panelBorder flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded hover:bg-slate-200/60 text-slate-600 transition-colors"
                title="Bulan sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>
              <h2 className="text-sm font-bold text-gitlab-text min-w-[150px] text-center">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded hover:bg-slate-200/60 text-slate-600 transition-colors"
                title="Bulan berikutnya"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => {
                  setCurrentMonth(10);
                  setCurrentYear(2026);
                }}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                Hari Ini (Nov 2026)
              </button>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Klik tanggal untuk merencanakan postingan
              </span>
            </div>
          </div>

          {/* Calendar Grid Container */}
          <div className="overflow-x-auto">
            <div className="min-w-[650px]">
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 border-b border-gitlab-panelBorder bg-slate-50 text-center text-[11px] font-bold text-gitlab-secondary py-2 uppercase tracking-wider">
                <div>Senin</div>
                <div>Selasa</div>
                <div>Rabu</div>
                <div>Kamis</div>
                <div className="text-emerald-700 font-extrabold">Jumat</div>
                <div>Sabtu</div>
                <div className="text-rose-700">Ahad</div>
              </div>

              {/* Days Grid Cells */}
              <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 text-xs">
                {/* Empty offset cells before day 1 */}
                {Array.from({ length: firstDayOffset }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-28 bg-slate-50/40 p-1.5 text-slate-300" />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
                  const dayNumber = idx + 1;
                  const dayPosts = getPostsForDay(dayNumber);
                  const isJumat = (firstDayOffset + idx) % 7 === 4;

                  return (
                    <div
                      key={`day-${dayNumber}`}
                      onClick={() => {
                        const paddedDay = dayNumber < 10 ? `0${dayNumber}` : `${dayNumber}`;
                        const paddedMonth = currentMonth + 1 < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
                        setNewScheduledDate(`${currentYear}-${paddedMonth}-${paddedDay}T08:00`);
                        setShowAddModal(true);
                      }}
                      className={`h-28 p-1.5 flex flex-col justify-between hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                        isJumat ? 'bg-emerald-50/15' : ''
                      }`}
                    >
                      {/* Day Header */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold w-5 h-5 rounded flex items-center justify-center ${
                            dayNumber === 13 && currentMonth === 10
                              ? 'bg-tari-green text-white font-bold'
                              : isJumat
                              ? 'text-emerald-700'
                              : 'text-slate-700'
                          }`}
                        >
                          {dayNumber}
                        </span>

                        <span className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 hover:text-emerald-600 transition-opacity">
                          + Tambah
                        </span>
                      </div>

                      {/* Scheduled Post Pills in this Day */}
                      <div className="space-y-1 overflow-y-auto max-h-20 my-1">
                        {dayPosts.map((post) => (
                          <div
                            key={post.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPost(post);
                            }}
                            className={`p-1 rounded text-[10px] font-semibold border truncate transition-all shadow-xs flex items-center gap-1 ${
                              post.status === 'approved'
                                ? 'bg-blue-50 text-blue-800 border-blue-200 hover:border-blue-300'
                                : post.status === 'published'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:border-emerald-300'
                                : post.status === 'pending_approval'
                                ? 'bg-amber-50 text-amber-900 border-amber-200 hover:border-amber-300'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                            title={post.title}
                          >
                            <span className="shrink-0">{getPlatformIcon(post.target_platforms[0])}</span>
                            <span className="truncate">{post.title}</span>
                          </div>
                        ))}
                      </div>

                      <div className="text-[9px] text-slate-400 text-right">
                        {dayPosts.length > 0 && `${dayPosts.length} konten`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        /* View 3: Detailed Table List View */
        <div className="bg-white rounded-lg border border-gitlab-panelBorder shadow-gitlab overflow-hidden">
          <div className="p-3.5 sm:px-4 border-b border-gitlab-panelBorder flex items-center justify-between bg-slate-50/50 text-xs">
            <span className="font-semibold text-slate-700">
              Total Seluruh Konten Terdaftar ({posts.length})
            </span>
            <span className="text-slate-400">
              Klik baris untuk meninjau atau memberikan persetujuan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-gitlab-panelBorder text-[11px] font-semibold text-gitlab-secondary uppercase tracking-wider">
                  <th className="py-2.5 px-4">Judul Konten</th>
                  <th className="py-2.5 px-4">Kanal Target</th>
                  <th className="py-2.5 px-4">Jadwal Publikasi</th>
                  <th className="py-2.5 px-4">Program / Campaign</th>
                  <th className="py-2.5 px-4">Penulis</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {post.title}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {post.target_platforms.map((p) => (
                          <span key={p}>{getPlatformIcon(p)}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {post.scheduled_at}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                        {post.campaign_name || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {post.created_by_name}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(post.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Modal: Rencanakan Konten Baru (Dengan Live Multi-Channel Preview) */}
      {showAddModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full shadow-2xl border border-gitlab-panelBorder overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-3.5 sm:px-4 border-b border-gitlab-panelBorder flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-gitlab-text flex items-center gap-2">
                <CalendarDays size={16} className="text-tari-green" />
                Rencanakan Konten Publikasi Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body: 2 Columns (Form on Left, Live Social Preview on Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              {/* Form Input Column (7 cols) */}
              <form onSubmit={handleCreatePost} className="lg:col-span-7 p-4 sm:p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Judul Publikasi
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Misal: Kajian Akbar Akhir Pekan Bersama Ustadz..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-gitlab-blue"
                  />
                </div>

                {/* Target Platforms Checkboxes */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Media Sosial (Multi-Channel)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => togglePlatform('instagram')}
                      className={`p-2 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        newPlatforms.includes('instagram')
                          ? 'border-pink-500 bg-pink-50/80 text-pink-700 font-bold'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <Instagram size={14} /> Instagram
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePlatform('facebook')}
                      className={`p-2 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        newPlatforms.includes('facebook')
                          ? 'border-blue-500 bg-blue-50/80 text-blue-700 font-bold'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <Facebook size={14} /> Facebook Page
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePlatform('whatsapp')}
                      className={`p-2 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        newPlatforms.includes('whatsapp')
                          ? 'border-emerald-500 bg-emerald-50/80 text-emerald-700 font-bold'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <MessageCircle size={14} /> WA Status
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Waktu & Tanggal Posting
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={newScheduledDate}
                      onChange={(e) => setNewScheduledDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-gitlab-blue"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Program / Kampanye
                    </label>
                    <input
                      type="text"
                      value={newCampaign}
                      onChange={(e) => setNewCampaign(e.target.value)}
                      placeholder="Misal: Kajian Rutin"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-gitlab-blue"
                    />
                  </div>
                </div>

                {/* Caption Input with Live Character Tracker */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      Teks Caption / Deskripsi
                    </label>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>{newCaption.length} karakter</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Hash size={10} /> {countHashtags(newCaption)} hashtag
                      </span>
                    </div>
                  </div>
                  <textarea
                    required
                    rows={6}
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    placeholder="Tuliskan caption lengkap, hashtag, dan detail info kegiatan..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-gitlab-blue font-sans leading-relaxed"
                  ></textarea>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-tari-green hover:bg-emerald-700 text-white rounded-md font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <Send size={13} />
                    Ajukan ke Antrean Review
                  </button>
                </div>
              </form>

              {/* Social Media Preview Column (5 cols) */}
              <div className="lg:col-span-5 p-4 sm:p-5 bg-slate-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={13} className="text-purple-600" />
                      Pratinjau Tampilan Medsos
                    </span>

                    {/* Preview Switcher */}
                    <div className="flex bg-slate-200/90 p-0.5 rounded text-[11px]">
                      <button
                        type="button"
                        onClick={() => setPreviewPlatform('instagram')}
                        className={`px-2 py-0.5 rounded font-semibold transition-all ${
                          previewPlatform === 'instagram' ? 'bg-white text-pink-700 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        IG
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewPlatform('facebook')}
                        className={`px-2 py-0.5 rounded font-semibold transition-all ${
                          previewPlatform === 'facebook' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        FB
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewPlatform('whatsapp')}
                        className={`px-2 py-0.5 rounded font-semibold transition-all ${
                          previewPlatform === 'whatsapp' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        WA
                      </button>
                    </div>
                  </div>

                  {/* Simulated Device Screen Card */}
                  {previewPlatform === 'instagram' && (
                    <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden text-xs">
                      <div className="p-2.5 flex items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 p-0.5">
                            <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-slate-700">
                              M
                            </div>
                          </div>
                          <div>
                            <span className="font-bold text-[11px] text-slate-900 block leading-tight">
                              masjid.alikhlas
                            </span>
                            <span className="text-[9px] text-slate-400">Jakarta Selatan</span>
                          </div>
                        </div>
                        <span className="text-slate-400 text-xs">•••</span>
                      </div>

                      {/* Poster Mock Banner */}
                      <div className="aspect-square bg-slate-900 text-white flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 opacity-90"></div>
                        <div className="relative z-10 space-y-1">
                          <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
                            {newCampaign || 'Kajian Rutin'}
                          </span>
                          <h4 className="text-xs font-bold line-clamp-3 text-slate-100">
                            {newTitle || 'Judul Kajian'}
                          </h4>
                          <span className="text-[9px] text-slate-400 block pt-1">
                            Masjid Al-Ikhlas
                          </span>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="p-2.5 space-y-1">
                        <div className="text-[11px] text-slate-800 leading-normal line-clamp-4 whitespace-pre-line font-sans">
                          <span className="font-bold mr-1.5">masjid.alikhlas</span>
                          {newCaption || 'Teks caption Anda akan muncul di sini secara real-time...'}
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1">
                          1 menit yang lalu • Terjadwal
                        </div>
                      </div>
                    </div>
                  )}

                  {previewPlatform === 'facebook' && (
                    <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-3 text-xs space-y-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                          M
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">
                            Masjid Al-Ikhlas Official
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <span>Diposting oleh TARI</span>
                            <span>•</span>
                            <span>Publik</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-slate-800 text-[11px] whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                        {newCaption || 'Teks publikasi Facebook Page Anda...'}
                      </div>
                    </div>
                  )}

                  {previewPlatform === 'whatsapp' && (
                    <div className="bg-[#e5ddd5] rounded-lg p-3 text-xs space-y-2 border border-slate-300">
                      <div className="bg-white rounded-lg p-2.5 shadow-xs max-w-[90%] text-slate-900 space-y-1.5">
                        <span className="text-[10px] font-bold text-emerald-700 block">
                          📢 Warta Masjid Al-Ikhlas
                        </span>
                        <div className="text-[11px] whitespace-pre-line font-sans leading-relaxed">
                          {newCaption || 'Pesan broadcast / status WhatsApp...'}
                        </div>
                        <div className="text-[9px] text-slate-400 text-right flex items-center justify-end gap-1">
                          <span>08:00</span>
                          <Check size={12} className="text-blue-500" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200/60">
                  Dispatcher akan mempublikasikan otomatis saat jam tayang tiba.
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 4. Modal: Detail & Alur Persetujuan (Review & Approval by Ketua) */}
      {selectedPost &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl border border-gitlab-panelBorder overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3.5 sm:px-4 border-b border-gitlab-panelBorder flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gitlab-text">Detail & Persetujuan Konten</span>
                {getStatusBadge(selectedPost.status)}
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 text-xs">
              <div>
                <h2 className="text-sm font-bold text-gitlab-text">{selectedPost.title}</h2>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-gitlab-muted font-mono">
                  <span>Jadwal: {selectedPost.scheduled_at}</span>
                  <span>•</span>
                  <span>Dibuat oleh: {selectedPost.created_by_name}</span>
                </div>
              </div>

              {/* Target Platforms */}
              <div className="flex items-center gap-2 py-2 px-3 bg-slate-50 rounded-md border border-gitlab-panelBorder">
                <span className="text-[11px] font-semibold text-gitlab-secondary">Kanal Publikasi:</span>
                <div className="flex items-center gap-2">
                  {selectedPost.target_platforms.map((p) => (
                    <span key={p} className="flex items-center gap-1 font-semibold capitalize text-slate-700">
                      {getPlatformIcon(p)} {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Caption View */}
              <div>
                <label className="block text-[11px] font-bold text-gitlab-secondary uppercase tracking-wider mb-1">
                  Draf Teks (Caption)
                </label>
                <div className="p-3 bg-slate-50 rounded-md border border-gitlab-panelBorder text-slate-800 whitespace-pre-wrap font-sans text-xs max-h-48 overflow-y-auto leading-relaxed">
                  {selectedPost.caption}
                </div>
              </div>

              {/* Approval Info */}
              {selectedPost.approved_by_name && (
                <div className="p-2.5 rounded bg-blue-50/70 border border-blue-200 text-blue-900 text-[11px] flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                  <span>
                    Telah disetujui oleh <strong>{selectedPost.approved_by_name}</strong> (Ketua / Owner).
                  </span>
                </div>
              )}

              {/* Approval Action Buttons */}
              <div className="pt-3 border-t border-gitlab-panelBorder flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeletePost(selectedPost.id)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Hapus postingan"
                >
                  <Trash2 size={14} />
                  <span>Hapus</span>
                </button>

                <div className="flex items-center gap-2">
                  {selectedPost.status === 'pending_approval' && (
                    <>
                      <button
                        onClick={() => handleRejectOrRevisePost(selectedPost.id)}
                        className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-md font-semibold"
                      >
                        Minta Revisi (Draf)
                      </button>
                      <button
                        onClick={() => handleApprovePost(selectedPost.id)}
                        className="px-4 py-1.5 bg-tari-green hover:bg-emerald-700 text-white rounded-md font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 size={14} /> Setujui Konten
                      </button>
                    </>
                  )}

                  {selectedPost.status === 'approved' && (
                    <button
                      onClick={() => handleRejectOrRevisePost(selectedPost.id)}
                      className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-md font-semibold"
                    >
                      Kembalikan ke Draf
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedPost(null)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md font-semibold"
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
    </div>
  );
};
