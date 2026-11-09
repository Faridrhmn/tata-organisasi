import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Upload,
  Image as ImageIcon,
  Palette,
  Layers,
  Trash2,
  Sliders,
  Check,
  AlignCenter,
  AlignLeft,
} from 'lucide-react';

export interface PosterTemplate {
  id: string;
  name: string;
  category: string;
  ratio: '1:1' | '9:16';
  backgroundType: 'preset' | 'custom_image';
  bgImageUrl?: string;
  presetStyle?: 'emerald_classic' | 'modern_minimal' | 'midnight_gold' | 'sunset_warm';
  textConfig: {
    align: 'center' | 'left';
    yPosition: number;
    titleColor: string;
    speakerColor: string;
    dateColor: string;
    showBasmalah: boolean;
    showDetailsBox: boolean;
    detailsBg: string;
  };
}

interface PosterPageProps {
  onScheduleToPlanner?: (data: {
    title: string;
    caption: string;
    campaign: string;
  }) => void;
}

const DEFAULT_TEMPLATES: PosterTemplate[] = [
  {
    id: 'tmpl-emerald',
    name: 'Emerald Classic (Islami Elegan)',
    category: 'Kajian Rutin',
    ratio: '1:1',
    backgroundType: 'preset',
    presetStyle: 'emerald_classic',
    textConfig: {
      align: 'center',
      yPosition: 0,
      titleColor: '#ffffff',
      speakerColor: '#fef08a',
      dateColor: '#ffffff',
      showBasmalah: true,
      showDetailsBox: true,
      detailsBg: 'rgba(15, 23, 42, 0.75)',
    },
  },
  {
    id: 'tmpl-modern',
    name: 'Modern Minimalist (Clean White)',
    category: 'Kajian Pemuda',
    ratio: '1:1',
    backgroundType: 'preset',
    presetStyle: 'modern_minimal',
    textConfig: {
      align: 'center',
      yPosition: 10,
      titleColor: '#0f172a',
      speakerColor: '#047857',
      dateColor: '#0f172a',
      showBasmalah: true,
      showDetailsBox: true,
      detailsBg: 'rgba(255, 255, 255, 0.9)',
    },
  },
  {
    id: 'tmpl-midnight',
    name: 'Midnight Gold (Tabligh Akbar)',
    category: 'Event Spesial',
    ratio: '1:1',
    backgroundType: 'preset',
    presetStyle: 'midnight_gold',
    textConfig: {
      align: 'center',
      yPosition: 0,
      titleColor: '#ffffff',
      speakerColor: '#fbbf24',
      dateColor: '#e2e8f0',
      showBasmalah: true,
      showDetailsBox: true,
      detailsBg: 'rgba(2, 6, 23, 0.85)',
    },
  },
  {
    id: 'tmpl-sunset',
    name: 'Sunset Warm (Shubuh & Sosial)',
    category: 'Kajian Shubuh',
    ratio: '1:1',
    backgroundType: 'preset',
    presetStyle: 'sunset_warm',
    textConfig: {
      align: 'center',
      yPosition: 0,
      titleColor: '#ffffff',
      speakerColor: '#fef08a',
      dateColor: '#ffedd5',
      showBasmalah: true,
      showDetailsBox: true,
      detailsBg: 'rgba(69, 26, 3, 0.8)',
    },
  },
];

export const PosterPage: React.FC<PosterPageProps> = ({ onScheduleToPlanner }) => {
  // Templates State (Saved to localStorage)
  const [templates, setTemplates] = useState<PosterTemplate[]>(() => {
    const saved = localStorage.getItem('tari_poster_templates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return DEFAULT_TEMPLATES;
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DEFAULT_TEMPLATES[0].id);
  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Ratio state: '1:1' (Feed) or '9:16' (Story)
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16'>(activeTemplate.ratio || '1:1');

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

  // Template Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('Kajian Rutin');
  const [newTemplateRatio, setNewTemplateRatio] = useState<'1:1' | '9:16'>('1:1');
  const [newTemplateImage, setNewTemplateImage] = useState<string | null>(null);
  const [newTextAlign, setNewTextAlign] = useState<'center' | 'left'>('center');
  const [newTextY, setNewTextY] = useState<number>(0);
  const [newTitleColor, setNewTitleColor] = useState('#ffffff');
  const [newSpeakerColor, setNewSpeakerColor] = useState('#fef08a');
  const [newShowBasmalah, setNewShowBasmalah] = useState(true);
  const [newShowDetailsBox, setNewShowDetailsBox] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist templates to localStorage
  useEffect(() => {
    localStorage.setItem('tari_poster_templates', JSON.stringify(templates));
  }, [templates]);

  // Handle Image Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar (PNG, JPG, atau WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewTemplateImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNewTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) {
      alert('Nama template wajib diisi.');
      return;
    }

    const newTemplate: PosterTemplate = {
      id: `tmpl-custom-${Date.now()}`,
      name: newTemplateName.trim(),
      category: newTemplateCategory,
      ratio: newTemplateRatio,
      backgroundType: newTemplateImage ? 'custom_image' : 'preset',
      bgImageUrl: newTemplateImage || undefined,
      presetStyle: newTemplateImage ? undefined : 'emerald_classic',
      textConfig: {
        align: newTextAlign,
        yPosition: newTextY,
        titleColor: newTitleColor,
        speakerColor: newSpeakerColor,
        dateColor: '#ffffff',
        showBasmalah: newShowBasmalah,
        showDetailsBox: newShowDetailsBox,
        detailsBg: 'rgba(15, 23, 42, 0.75)',
      },
    };

    setTemplates([newTemplate, ...templates]);
    setSelectedTemplateId(newTemplate.id);
    setAspectRatio(newTemplate.ratio);
    setShowUploadModal(false);

    // Reset Form
    setNewTemplateName('');
    setNewTemplateImage(null);
    setNewTextY(0);
    setToastNotice(`Template custom "${newTemplate.name}" berhasil ditambahkan & diaktifkan!`);
    setTimeout(() => setToastNotice(null), 4000);
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    if (confirm(`Hapus template "${name}"?`)) {
      const next = templates.filter((t) => t.id !== id);
      setTemplates(next);
      if (selectedTemplateId === id) {
        setSelectedTemplateId(next[0]?.id || DEFAULT_TEMPLATES[0].id);
      }
      setToastNotice(`Template "${name}" telah dihapus.`);
      setTimeout(() => setToastNotice(null), 3000);
    }
  };

  // Quick Presets for Status
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
    link.download = `poster-tari-${activeTemplate.name.toLowerCase().replace(/\s+/g, '-')}-${aspectRatio === '1:1' ? 'feed' : 'story'}.svg`;
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
      downloadLink.download = `poster-tari-${activeTemplate.name.toLowerCase().replace(/\s+/g, '-')}-${aspectRatio === '1:1' ? 'feed' : 'story'}.png`;
      downloadLink.click();
    };
    img.src = url;
  };

  // SVG calculations
  const width = 1080;
  const height = aspectRatio === '9:16' ? 1920 : 1080;
  const yOffset = (aspectRatio === '9:16' ? 220 : 0) + (activeTemplate.textConfig.yPosition || 0);
  const isCentered = activeTemplate.textConfig.align === 'center';
  const textAnchor = isCentered ? 'middle' : 'start';
  const textX = isCentered ? 540 : 140;

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
            Studio Desain Poster Dinamis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih template desain dari tim media atau upload background karya desainer Anda, lalu ubah teks secara instan!
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Upload size={14} className="text-purple-600" />
            + Upload Template Sendiri
          </button>

          <button
            onClick={() => {
              if (onScheduleToPlanner) {
                const autoCaption =
                  statusType === 'cancelled'
                    ? `[PEMBERITAHUAN LIBUR KAJIAN]\n\nBismillah. Diberitahukan kepada segenap jamaah bahwa kajian:\n"${title}"\n\nUntuk pekan ini (${dateText}) DILIBURKAN dikarenakan ${cancellationReason}.\n\nInsya Allah kajian akan kembali aktif pada pekan berikutnya. Mohon bantu sebarkan informasi ini. Jazakumullahu khairan.`
                    : `Bismillah. Hadirilah kajian bersama pemateri ${speaker}.\n\nJudul: "${title}"\n📅 Hari/Tanggal: ${dateText}\n⏰ Waktu: ${timeText}\n📍 Lokasi: ${location}\n\nTerbuka untuk ikhwan dan akhwat. Mari ajak keluarga serta kerabat untuk menuntut ilmu syar'i.\n\n#kajianrutin #masjidalikhlas #dakwahsunnah #kajianjakarta`;

                const autoCampaign =
                  statusType === 'cancelled'
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
                setToastNotice('Poster berhasil dijadwalkan ke Kalender Konten!');
                setTimeout(() => setToastNotice(null), 4000);
              }
            }}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Calendar size={14} className="text-blue-600" />
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

      {/* Template Selector Bar (Carousel Cards) */}
      <div className="bg-white rounded-xl border border-gitlab-panelBorder p-4 shadow-gitlab space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-purple-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Pilih Master Template Poster ({templates.length} Tersedia)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Klik kartu untuk mengganti latar & gaya desain secara instan
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 text-xs">
          {templates.map((tmpl) => {
            const isSelected = tmpl.id === selectedTemplateId;
            return (
              <div
                key={tmpl.id}
                onClick={() => {
                  setSelectedTemplateId(tmpl.id);
                  setAspectRatio(tmpl.ratio);
                }}
                className={`group relative shrink-0 w-52 p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/50 shadow-md ring-2 ring-purple-100'
                    : 'border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded uppercase bg-white border border-slate-200 text-slate-700">
                      {tmpl.ratio === '1:1' ? '1:1 Feed' : '9:16 Story'}
                    </span>
                    {tmpl.backgroundType === 'custom_image' && (
                      <span className="text-[9px] font-semibold text-purple-700 bg-purple-100 px-1 rounded">
                        Karya Sendiri
                      </span>
                    )}
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                        <Check size={12} />
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Preview representation */}
                  <div className="h-16 rounded overflow-hidden mb-2 border border-slate-200 relative flex items-center justify-center">
                    {tmpl.backgroundType === 'custom_image' && tmpl.bgImageUrl ? (
                      <img
                        src={tmpl.bgImageUrl}
                        alt={tmpl.name}
                        className="w-full h-full object-cover"
                      />
                    ) : tmpl.presetStyle === 'modern_minimal' ? (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-700 font-bold border-l-4 border-emerald-600">
                        Modern Clean
                      </div>
                    ) : tmpl.presetStyle === 'midnight_gold' ? (
                      <div className="w-full h-full bg-slate-950 flex items-center justify-center text-[10px] text-amber-300 font-bold border-l-4 border-amber-500">
                        Midnight Gold
                      </div>
                    ) : tmpl.presetStyle === 'sunset_warm' ? (
                      <div className="w-full h-full bg-amber-900 flex items-center justify-center text-[10px] text-amber-200 font-bold border-l-4 border-orange-500">
                        Sunset Warm
                      </div>
                    ) : (
                      <div className="w-full h-full bg-emerald-900 flex items-center justify-center text-[10px] text-emerald-200 font-bold border-l-4 border-emerald-500">
                        Emerald Classic
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs line-clamp-1">
                    {tmpl.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                    {tmpl.category}
                  </p>
                </div>

                {tmpl.backgroundType === 'custom_image' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(tmpl.id, tmpl.name);
                    }}
                    className="mt-2 text-[10px] text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold self-end"
                    title="Hapus template kustom"
                  >
                    <Trash2 size={11} /> Hapus
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (5 span): Controls & Form */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-gitlab-panelBorder p-4 sm:p-5 shadow-gitlab space-y-4">
          {/* Active Template Notice */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Palette size={14} className="text-purple-600" />
              <span className="font-bold text-slate-800">
                Template Aktif: <span className="text-purple-700">{activeTemplate.name}</span>
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {activeTemplate.backgroundType === 'custom_image' ? 'Background Custom' : 'Desain Bawaan'}
            </span>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Status Kegiatan Kajian
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
            <span>
              Live Canvas ({aspectRatio === '1:1' ? '1080 x 1080' : '1080 x 1920'}) • {activeTemplate.name}
            </span>
          </div>

          <div
            className={`w-full max-w-[460px] bg-black rounded-lg overflow-hidden shadow-2xl border border-slate-700/60 transition-all ${
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
                {/* Emerald Gradient */}
                <linearGradient id="gradEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#064e3b" />
                  <stop offset="50%" stopColor="#022c22" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>

                {/* Modern Minimal Gradient */}
                <linearGradient id="gradModern" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>

                {/* Midnight Gold Gradient */}
                <linearGradient id="gradMidnight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#020617" />
                  <stop offset="50%" stopColor="#090d16" />
                  <stop offset="100%" stopColor="#1e1b4b" />
                </linearGradient>

                {/* Sunset Warm Gradient */}
                <linearGradient id="gradSunset" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#451a03" />
                  <stop offset="50%" stopColor="#7c2d12" />
                  <stop offset="100%" stopColor="#18181b" />
                </linearGradient>

                {/* Islamic Pattern */}
                <pattern id="liveIslamicPattern" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 30,0 L 60,30 L 30,60 L 0,30 Z" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
                  <circle cx="30" cy="30" r="10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
                </pattern>
              </defs>

              {/* 1. Background Layer: Custom Image OR Preset Gradients */}
              {activeTemplate.backgroundType === 'custom_image' && activeTemplate.bgImageUrl ? (
                <image
                  href={activeTemplate.bgImageUrl}
                  width={width}
                  height={height}
                  preserveAspectRatio="xMidYMid slice"
                />
              ) : activeTemplate.presetStyle === 'modern_minimal' ? (
                <>
                  <rect width={width} height={height} fill="url(#gradModern)" />
                  <rect x="30" y="30" width={width - 60} height={height - 60} rx="16" fill="none" stroke="rgba(15, 23, 42, 0.08)" strokeWidth="3" />
                </>
              ) : activeTemplate.presetStyle === 'midnight_gold' ? (
                <>
                  <rect width={width} height={height} fill="url(#gradMidnight)" />
                  <circle cx={width / 2} cy={height / 3} r="350" fill="rgba(217, 119, 6, 0.08)" filter="blur(40px)" />
                  <rect x="40" y="40" width={width - 80} height={height - 80} rx="24" fill="none" stroke="rgba(251, 191, 36, 0.3)" strokeWidth="2" />
                </>
              ) : activeTemplate.presetStyle === 'sunset_warm' ? (
                <>
                  <rect width={width} height={height} fill="url(#gradSunset)" />
                  <circle cx={width / 2} cy={height / 4} r="280" fill="rgba(249, 115, 22, 0.12)" filter="blur(30px)" />
                  <rect x="40" y="40" width={width - 80} height={height - 80} rx="24" fill="none" stroke="rgba(251, 146, 60, 0.3)" strokeWidth="2" />
                </>
              ) : (
                /* Default Emerald Classic */
                <>
                  <rect width={width} height={height} fill="url(#gradEmerald)" />
                  <rect width={width} height={height} fill="url(#liveIslamicPattern)" />
                  <rect x="40" y="40" width={width - 80} height={height - 80} rx="24" fill="none" stroke="rgba(22, 163, 74, 0.4)" strokeWidth="2" />
                  <rect x="52" y="52" width={width - 104} height={height - 104} rx="20" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
                </>
              )}

              {/* 2. Basmalah Header */}
              {activeTemplate.textConfig.showBasmalah && (
                <text
                  x={textX}
                  y={120 + yOffset}
                  fill={activeTemplate.presetStyle === 'modern_minimal' ? '#047857' : '#a7f3d0'}
                  fontFamily="'Inter', sans-serif"
                  fontWeight="600"
                  fontSize="24"
                  textAnchor={textAnchor}
                  letterSpacing="4"
                >
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </text>
              )}

              {/* 3. Status Badge */}
              <rect
                x={isCentered ? 540 - 200 : 140}
                y={170 + yOffset}
                width="400"
                height="48"
                rx="24"
                fill={badgeBg}
              />
              <text
                x={isCentered ? 540 : 340}
                y={200 + yOffset}
                fill="#ffffff"
                fontFamily="'Inter', sans-serif"
                fontWeight="bold"
                fontSize="15"
                textAnchor="middle"
                letterSpacing="1.5"
              >
                {badgeText}
              </text>

              {/* 4. Title (Judul Kajian) */}
              <text
                x={textX}
                y={290 + yOffset}
                fill={activeTemplate.textConfig.titleColor || '#ffffff'}
                fontFamily="'Inter', sans-serif"
                fontWeight="900"
                fontSize="48"
                textAnchor={textAnchor}
              >
                {title.length > 40 ? `${title.substring(0, 38)}...` : title}
              </text>

              {/* 5. Speaker Name (Pemateri) */}
              <text
                x={textX}
                y={380 + yOffset}
                fill={activeTemplate.presetStyle === 'modern_minimal' ? '#64748b' : '#6ee7b7'}
                fontFamily="'Inter', sans-serif"
                fontWeight="bold"
                fontSize="20"
                textAnchor={textAnchor}
                letterSpacing="2"
              >
                BERSAMA PEMATERI:
              </text>
              <text
                x={textX}
                y={430 + yOffset}
                fill={activeTemplate.textConfig.speakerColor || '#fef08a'}
                fontFamily="'Inter', sans-serif"
                fontWeight="bold"
                fontSize="38"
                textAnchor={textAnchor}
              >
                {speaker}
              </text>

              {/* 6. Cancellation Notice (if cancelled) */}
              {statusType === 'cancelled' && (
                <g>
                  <rect
                    x="140"
                    y={500 + yOffset}
                    width="800"
                    height="80"
                    rx="16"
                    fill="#fef2f2"
                    stroke="#f87171"
                    strokeWidth="2"
                  />
                  <text
                    x="540"
                    y={548 + yOffset}
                    fill="#991b1b"
                    fontFamily="'Inter', sans-serif"
                    fontWeight="bold"
                    fontSize="20"
                    textAnchor="middle"
                  >
                    PEMBERITAHUAN: {cancellationReason}
                  </text>
                </g>
              )}

              {/* 7. Details Box (Waktu & Lokasi) */}
              {activeTemplate.textConfig.showDetailsBox && (
                <rect
                  x="140"
                  y={statusType === 'cancelled' ? 600 + yOffset : 500 + yOffset}
                  width="800"
                  height="160"
                  rx="20"
                  fill={activeTemplate.textConfig.detailsBg || 'rgba(15, 23, 42, 0.75)'}
                  stroke={activeTemplate.presetStyle === 'modern_minimal' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)'}
                  strokeWidth="1.5"
                />
              )}

              <text
                x="180"
                y={statusType === 'cancelled' ? 650 + yOffset : 550 + yOffset}
                fill={activeTemplate.presetStyle === 'modern_minimal' ? '#0f172a' : '#ffffff'}
                fontFamily="'Inter', sans-serif"
                fontWeight="bold"
                fontSize="24"
              >
                Hari / Tanggal: {dateText}
              </text>
              <text
                x="180"
                y={statusType === 'cancelled' ? 695 + yOffset : 595 + yOffset}
                fill={activeTemplate.presetStyle === 'modern_minimal' ? '#334155' : '#e2e8f0'}
                fontFamily="'Inter', sans-serif"
                fontWeight="medium"
                fontSize="22"
              >
                Waktu: {timeText}
              </text>
              <text
                x="180"
                y={statusType === 'cancelled' ? 740 + yOffset : 640 + yOffset}
                fill={activeTemplate.presetStyle === 'modern_minimal' ? '#0284c7' : '#93c5fd'}
                fontFamily="'Inter', sans-serif"
                fontWeight="bold"
                fontSize="22"
              >
                Lokasi: {location.length > 45 ? `${location.substring(0, 43)}...` : location}
              </text>

              {/* 8. Footer Branding */}
              <text
                x="540"
                y={height - 70}
                fill={activeTemplate.presetStyle === 'modern_minimal' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255,255,255,0.5)'}
                fontFamily="'Inter', sans-serif"
                fontWeight="medium"
                fontSize="16"
                textAnchor="middle"
              >
                DIBUAT DENGAN TARI (TATA ORGANISASI) — MULTI-TENANT SAAS
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Modal: Upload / Tambah Template Baru */}
      {showUploadModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Upload size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Upload Master Template Desain Baru
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Gunakan background karya tim desain/Canva dan atur posisi teks secara presisi.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveNewTemplate} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Template
                    </label>
                    <input
                      type="text"
                      required
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="Misal: Template Canva Kajian Ustadz Firanda"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kategori Kegiatan
                    </label>
                    <input
                      type="text"
                      value={newTemplateCategory}
                      onChange={(e) => setNewTemplateCategory(e.target.value)}
                      placeholder="Misal: Kajian Rutin / Khutbah"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Rasio Template */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Format Ukuran
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewTemplateRatio('1:1')}
                      className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-1.5 ${
                        newTemplateRatio === '1:1'
                          ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Ratio size={14} /> 1:1 Feed Persegi (1080×1080)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTemplateRatio('9:16')}
                      className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-1.5 ${
                        newTemplateRatio === '9:16'
                          ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Ratio size={14} /> 9:16 Story Vertikal (1080×1920)
                    </button>
                  </div>
                </div>

                {/* Upload Image Area */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    File Gambar Background (Dari Canva / Photoshop)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-purple-50/20"
                  >
                    {newTemplateImage ? (
                      <div className="space-y-2">
                        <img
                          src={newTemplateImage}
                          alt="Preview"
                          className="h-28 mx-auto rounded shadow-sm object-cover"
                        />
                        <span className="text-[11px] text-purple-700 font-semibold block">
                          ✓ Gambar background terpilih. Klik untuk mengganti.
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <ImageIcon size={28} className="mx-auto text-slate-400" />
                        <span className="font-semibold text-slate-700 block">
                          Klik untuk memilih file gambar dari komputer/HP
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Format PNG atau JPG dengan resolusi 1080×1080 atau 1080×1920
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Typography & Position Configurator */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Sliders size={14} className="text-purple-600" />
                    Penyesuaian Posisi Teks di Atas Background
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Perataan Teks
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setNewTextAlign('center')}
                          className={`py-1.5 rounded border text-[11px] font-semibold flex items-center justify-center gap-1 ${
                            newTextAlign === 'center'
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          <AlignCenter size={13} /> Tengah
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewTextAlign('left')}
                          className={`py-1.5 rounded border text-[11px] font-semibold flex items-center justify-center gap-1 ${
                            newTextAlign === 'left'
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          <AlignLeft size={13} /> Kiri
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Offset Posisi Vertikal Y ({newTextY}px)
                      </label>
                      <input
                        type="range"
                        min={-100}
                        max={300}
                        step={10}
                        value={newTextY}
                        onChange={(e) => setNewTextY(parseInt(e.target.value))}
                        className="w-full accent-purple-600 mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Warna Tulisan Judul
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newTitleColor}
                          onChange={(e) => setNewTitleColor(e.target.value)}
                          className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                        />
                        <span className="font-mono text-[11px] text-slate-600">{newTitleColor}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Warna Tulisan Pemateri
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newSpeakerColor}
                          onChange={(e) => setNewSpeakerColor(e.target.value)}
                          className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                        />
                        <span className="font-mono text-[11px] text-slate-600">{newSpeakerColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-700">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newShowBasmalah}
                        onChange={(e) => setNewShowBasmalah(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>Tampilkan Basmalah</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newShowDetailsBox}
                        onChange={(e) => setNewShowDetailsBox(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>Kotak Info Tanggal/Lokasi</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    Simpan Master Template
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
