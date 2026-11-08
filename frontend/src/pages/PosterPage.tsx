import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Download,
  Ratio,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Calendar,
  Clock,
  MapPin,
  User,
  Type,
  X,
} from 'lucide-react';

interface PosterPageProps {
  onScheduleToPlanner?: (data: {
    title: string;
    caption: string;
    campaign: string;
  }) => void;
}

export const PosterPage: React.FC<PosterPageProps> = ({ onScheduleToPlanner }) => {
  // Ratio state: '1:1' (Feed) or '9:16' (Story)
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16'>('1:1');

  // Form states
  const [statusType, setStatusType] = useState<'regular' | 'cancelled' | 'special'>('regular');
  const [title, setTitle] = useState('Tafsir Surah Al-Kahfi: Menemukan Petunjuk di Tengah Fitnah Zaman');
  const [speaker, setSpeaker] = useState('Ustadz Dr. Firanda Andirja, M.A.');
  const [dateText, setDateText] = useState('Sabtu, 14 November 2026');
  const [timeText, setTimeText] = useState("Ba'da Maghrib s/d Selesai");
  const [location, setLocation] = useState('Masjid Al-Ikhlas, Kebayoran Baru, Jakarta Selatan');
  const [cancellationReason, setCancellationReason] = useState('Ustadz Berhalangan Hadir (Sakit)');

  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Quick Presets
  const applyPreset = (type: 'regular' | 'cancelled' | 'special') => {
    setStatusType(type);
    if (type === 'cancelled') {
      setTitle('Pemberitahuan: Kajian Rutin Pekan Ini Diliburkan');
      setCancellationReason('Ustadz Sedang Menjalankan Ibadah Umroh');
    } else if (type === 'special') {
      setTitle('Tabligh Akbar: Merajut Ukhuwah Menggapai Mardhatillah');
      setSpeaker('Ustadz Abdul Somad, Lc., M.A.');
    } else {
      setTitle('Tafsir Surah Al-Kahfi: Menemukan Petunjuk di Tengah Fitnah Zaman');
      setSpeaker('Ustadz Dr. Firanda Andirja, M.A.');
    }
  };

  // Download SVG
  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `poster-tari-${aspectRatio === '1:1' ? 'feed' : 'story'}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download High-Res PNG via HTML5 Canvas
  const handleDownloadPng = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = aspectRatio === '9:16' ? 1920 : 1080;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `poster-tari-${aspectRatio === '1:1' ? 'feed' : 'story'}.png`;
      downloadLink.click();
    };
    img.src = url;
  };

  // SVG calculations
  const width = 1080;
  const height = aspectRatio === '9:16' ? 1920 : 1080;
  const yOffset = aspectRatio === '9:16' ? 220 : 0;

  const badgeBg =
    statusType === 'cancelled'
      ? '#dc2626'
      : statusType === 'special'
      ? '#d97706'
      : '#16a34a';

  const badgeText =
    statusType === 'cancelled'
      ? 'KAJIAN DILIBURKAN SEMENTARA'
      : statusType === 'special'
      ? 'KAJIAN SPESIAL / TABLIGH AKBAR'
      : 'KAJIAN RUTIN TERBUKA UNTUK UMUM';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="text-purple-600" size={24} />
            Dynamic Poster Generator (Studio Poster)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Buat poster kajian instan dengan live preview. Hanya ubah judul, pemateri, atau pengumuman libur tanpa buka aplikasi desain!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onScheduleToPlanner) {
                const autoCaption = statusType === 'cancelled'
                  ? `[PEMBERITAHUAN LIBUR KAJIAN]\n\nBismillah. Diberitahukan kepada segenap jamaah bahwa kajian:\n"${title}"\n\nUntuk pekan ini (${dateText}) DILIBURKAN dikarenakan ${cancellationReason}.\n\nInsya Allah kajian akan kembali aktif pada pekan berikutnya. Mohon bantu sebarkan informasi ini. Jazakumullahu khairan.`
                  : `Bismillah. Hadirilah kajian bersama pemateri ${speaker}.\n\nJudul: "${title}"\n📅 Hari/Tanggal: ${dateText}\n⏰ Waktu: ${timeText}\n📍 Lokasi: ${location}\n\nTerbuka untuk ikhwan dan akhwat. Mari ajak keluarga serta kerabat untuk menuntut ilmu syar'i.\n\n#kajianrutin #masjidalikhlas #dakwahsunnah #kajianjakarta`;

                const autoCampaign = statusType === 'cancelled'
                  ? 'Pengumuman Libur'
                  : statusType === 'special'
                  ? 'Tabligh Akbar'
                  : 'Kajian Rutin';

                onScheduleToPlanner({
                  title: `Publikasi Poster: ${title.slice(0, 50)}...`,
                  caption: autoCaption,
                  campaign: autoCampaign,
                });
              } else {
                setToastNotice('Poster berhasil dijadwalkan ke Content Planner!');
                setTimeout(() => setToastNotice(null), 4000);
              }
            }}
            className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Sparkles size={14} className="text-purple-600" />
            Jadwalkan ke Planner
          </button>
          <button
            onClick={handleDownloadSvg}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FileDown size={14} />
            Unduh SVG
          </button>
          <button
            onClick={handleDownloadPng}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download size={14} />
            Unduh Gambar PNG (1080px)
          </button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastNotice && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-purple-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-purple-600 shrink-0" />
            <span>{toastNotice}</span>
          </div>
          <button
            onClick={() => setToastNotice(null)}
            className="text-purple-600 hover:text-purple-800 p-1 rounded"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (5 span): Controls & Form */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-gitlab-panelBorder p-4 sm:p-5 shadow-gitlab space-y-4">
          {/* Quick Presets */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Preset Cepat Organisasi
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('regular')}
                className={`p-2 rounded-lg border text-left text-xs font-medium transition-all ${
                  statusType === 'regular'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-600" /> Rutin
                </div>
                <div className="text-[10px] text-slate-400">Kajian Mingguan</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('cancelled')}
                className={`p-2 rounded-lg border text-left text-xs font-medium transition-all ${
                  statusType === 'cancelled'
                    ? 'border-rose-500 bg-rose-50 text-rose-800'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold flex items-center gap-1 text-rose-700">
                  <AlertCircle size={12} /> Libur
                </div>
                <div className="text-[10px] text-slate-400">Pemberitahuan</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('special')}
                className={`p-2 rounded-lg border text-left text-xs font-medium transition-all ${
                  statusType === 'special'
                    ? 'border-amber-500 bg-amber-50 text-amber-800'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold flex items-center gap-1 text-amber-700">
                  <Sparkles size={12} /> Tabligh
                </div>
                <div className="text-[10px] text-slate-400">Kajian Spesial</div>
              </button>
            </div>
          </div>

          {/* Aspect Ratio Switcher */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Format Ukuran Media Sosial
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAspectRatio('1:1')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  aspectRatio === '1:1'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Ratio size={14} /> Feed Instagram (1:1 / Persegi)
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  aspectRatio === '9:16'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Ratio size={14} /> Story IG / WA (9:16 / Vertikal)
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 my-2"></div>

          {/* Dynamic Variable Inputs */}
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Type size={13} className="text-slate-400" />
                Judul / Tema Kajian
              </label>
              <textarea
                rows={2}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User size={13} className="text-slate-400" />
                Nama Pemateri / Ustadz
              </label>
              <input
                type="text"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {statusType === 'cancelled' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <label className="block font-bold text-rose-900 mb-1 flex items-center gap-1.5 text-xs">
                  <AlertCircle size={13} className="text-rose-600" />
                  Alasan Libur / Pemberitahuan
                </label>
                <input
                  type="text"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full px-3 py-1.5 border border-rose-300 rounded-md text-xs font-medium text-rose-950 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" />
                  Hari & Tanggal
                </label>
                <input
                  type="text"
                  value={dateText}
                  onChange={(e) => setDateText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-400" />
                  Waktu / Jam
                </label>
                <input
                  type="text"
                  value={timeText}
                  onChange={(e) => setTimeText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400" />
                Lokasi / Masjid
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column (7 span): Live SVG Canvas Preview */}
        <div className="lg:col-span-7 bg-slate-900 rounded-lg p-5 border border-slate-800 shadow-gitlab flex flex-col items-center justify-center min-h-[580px] overflow-hidden">
          <div className="text-[11px] text-slate-400 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Vector Rendering ({aspectRatio === '1:1' ? '1080 x 1080' : '1080 x 1920'})</span>
          </div>

          <div
            className={`w-full max-w-[460px] bg-black rounded-lg overflow-hidden shadow-xl border border-slate-700/60 transition-all ${
              aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-square'
            }`}
          >
            <svg
              ref={svgRef}
              xmlns="http://www.w3.org/2000/svg"
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full block"
            >
              <defs>
                <linearGradient id="liveBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#064e3b" />
                  <stop offset="50%" stopColor="#022c22" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <pattern id="liveIslamicPattern" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 30,0 L 60,30 L 30,60 L 0,30 Z" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
                  <circle cx="30" cy="30" r="10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
                </pattern>
              </defs>

              {/* Background */}
              <rect width={width} height={height} fill="url(#liveBgGrad)" />
              <rect width={width} height={height} fill="url(#liveIslamicPattern)" />

              {/* Borders */}
              <rect x="40" y="40" width={width - 80} height={height - 80} rx="24" fill="none" stroke="rgba(22, 163, 74, 0.4)" strokeWidth="2" />
              <rect x="52" y="52" width={width - 104} height={height - 104} rx="20" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />

              {/* Basmalah */}
              <text x="540" y={120 + yOffset} fill="#a7f3d0" fontFamily="'Inter', sans-serif" fontWeight="600" fontSize="24" textAnchor="middle" letterSpacing="4">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </text>

              {/* Status Badge */}
              <rect x={540 - 200} y={170 + yOffset} width="400" height="48" rx="24" fill={badgeBg} />
              <text x="540" y={200 + yOffset} fill="#ffffff" fontFamily="'Inter', sans-serif" fontWeight="bold" fontSize="15" textAnchor="middle" letterSpacing="1.5">
                {badgeText}
              </text>

              {/* Title */}
              <text x="540" y={290 + yOffset} fill="#ffffff" fontFamily="'Inter', sans-serif" fontWeight="900" fontSize="48" textAnchor="middle">
                {title.length > 40 ? `${title.substring(0, 38)}...` : title}
              </text>

              {/* Speaker */}
              <text x="540" y={380 + yOffset} fill="#6ee7b7" fontFamily="'Inter', sans-serif" fontWeight="bold" fontSize="20" textAnchor="middle" letterSpacing="2">
                BERSAMA PEMATERI:
              </text>
              <text x="540" y={430 + yOffset} fill="#fef08a" fontFamily="'Inter', sans-serif" fontWeight="bold" fontSize="38" textAnchor="middle">
                {speaker}
              </text>

              {/* Cancellation Banner */}
              {statusType === 'cancelled' && (
                <g>
                  <rect x="140" y={500 + yOffset} width="800" height="80" rx="16" fill="#fef2f2" stroke="#f87171" strokeWidth="2" />
                  <text x="540" y={548 + yOffset} fill="#991b1b" fontFamily="'Inter', sans-serif" fontWeight="bold" fontSize="20" textAnchor="middle">
                    PEMBERITAHUAN: {cancellationReason}
                  </text>
                </g>
              )}

              {/* Details Box */}
              <rect
                x="140"
                y={statusType === 'cancelled' ? 600 + yOffset : 500 + yOffset}
                width="800"
                height="160"
                rx="20"
                fill="rgba(15, 23, 42, 0.7)"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1.5"
              />

              <text x="180" y={statusType === 'cancelled' ? 650 + yOffset : 550 + yOffset} fill="#ffffff" fontFamily="'Inter', sans-serif" fontWeight="bold" fontSize="24">
                📅 {dateText}
              </text>
              <text x="180" y={statusType === 'cancelled' ? 695 + yOffset : 595 + yOffset} fill="#e2e8f0" fontFamily="'Inter', sans-serif" fontWeight="medium" fontSize="22">
                ⏰ {timeText}
              </text>
              <text x="180" y={statusType === 'cancelled' ? 740 + yOffset : 640 + yOffset} fill="#93c5fd" fontFamily="'Inter', sans-serif" fontWeight="bold" fontSize="22">
                📍 {location.length > 45 ? `${location.substring(0, 43)}...` : location}
              </text>

              {/* Footer */}
              <text x="540" y={height - 70} fill="rgba(255,255,255,0.5)" fontFamily="'Inter', sans-serif" fontWeight="medium" fontSize="16" textAnchor="middle">
                DIBUAT DENGAN TARI (TATA ORGANISASI) — MULTI-TENANT SAAS
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
