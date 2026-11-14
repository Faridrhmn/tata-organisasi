import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  AlignCenter,
  AlignLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Crosshair,
  Download,
  FileDown,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  MapPin,
  Move,
  Palette,
  Plus,
  Ratio,
  Sliders,
  Sparkles,
  Trash2,
  Type,
  Upload,
  User,
  X,
} from 'lucide-react';
import {
  BuiltInBlockKey,
  CustomTextBlock,
  PosterElementLayout,
  PosterLogoLayer,
  PosterRatio,
  PosterStatusType,
  PosterTemplate,
  SelectedLayer,
} from '../components/poster/posterTypes';
import {
  BUILTIN_BLOCK_META,
  BUILTIN_BLOCK_ORDER,
  DEFAULT_TEMPLATES,
  createDefaultLayoutMap,
  normalizePosterTemplate,
} from '../components/poster/posterPresets';
import {
  POSTER_FONTS,
  serializeSvgForExport,
} from '../components/poster/posterFonts';
import { PosterCanvas } from '../components/poster/PosterCanvas';
import { LayerInspectorPanel } from '../components/poster/LayerInspectorPanel';

export type { PosterTemplate };

interface PosterPageProps {
  onScheduleToPlanner?: (data: {
    title: string;
    caption: string;
    campaign: string;
  }) => void;
}

export const PosterPage: React.FC<PosterPageProps> = ({ onScheduleToPlanner }) => {
  // Templates State (Saved to localStorage with legacy migration)
  const [templates, setTemplates] = useState<PosterTemplate[]>(() => {
    const saved = localStorage.getItem('tari_poster_templates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) => normalizePosterTemplate(item));
        }
      } catch {
        // fallback to defaults
      }
    }
    return DEFAULT_TEMPLATES;
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    () => templates[0]?.id || DEFAULT_TEMPLATES[0].id
  );
  const activeTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const [aspectRatio, setAspectRatio] = useState<PosterRatio>(
    activeTemplate.ratio || '1:1'
  );
  const [editorTab, setEditorTab] = useState<'content' | 'design'>('content');
  const [selectedLayer, setSelectedLayer] = useState<SelectedLayer>({
    kind: 'builtin',
    key: 'title',
  });

  // Form content states
  const [statusType, setStatusType] = useState<PosterStatusType>('regular');
  const [title, setTitle] = useState(
    'Tafsir Surah Al-Kahfi: Menemukan Petunjuk di Tengah Fitnah Zaman'
  );
  const [speaker, setSpeaker] = useState('Ustadz Dr. Firanda Andirja, M.A.');
  const [dateText, setDateText] = useState('Sabtu, 14 November 2026');
  const [timeText, setTimeText] = useState("Ba'da Maghrib s/d Selesai");
  const [location, setLocation] = useState(
    'Masjid Al-Ikhlas, Kebayoran Baru, Jakarta Selatan'
  );
  const [cancellationReason, setCancellationReason] = useState(
    'Ustadz Berhalangan Hadir (Sakit)'
  );
  const [footerText, setFooterText] = useState(
    'DIBUAT DENGAN TARI (TATA ORGANISASI) — MULTI-TENANT SAAS'
  );

  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [exportingType, setExportingType] = useState<'svg' | 'png' | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Template Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('Kajian Rutin');
  const [newTemplateRatio, setNewTemplateRatio] = useState<PosterRatio>('1:1');
  const [newTemplateImage, setNewTemplateImage] = useState<string | null>(null);
  const [newTextAlign, setNewTextAlign] = useState<'center' | 'left'>('center');
  const [newTextY, setNewTextY] = useState<number>(0);
  const [newTitleColor, setNewTitleColor] = useState('#ffffff');
  const [newSpeakerColor, setNewSpeakerColor] = useState('#fef08a');
  const [newShowBasmalah, setNewShowBasmalah] = useState(true);
  const [newShowDetailsBox, setNewShowDetailsBox] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, durationMs = 3500) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), durationMs);
  };

  // Persist templates to localStorage safely
  useEffect(() => {
    try {
      localStorage.setItem('tari_poster_templates', JSON.stringify(templates));
    } catch {
      // Ignore quota errors if user uploads very large images
    }
  }, [templates]);

  const activeLayoutMap = activeTemplate.layouts[aspectRatio];

  const updateActiveTemplate = (
    updater: (prev: PosterTemplate) => PosterTemplate
  ) => {
    setTemplates((prevList) =>
      prevList.map((tmpl) =>
        tmpl.id === activeTemplate.id ? updater(tmpl) : tmpl
      )
    );
  };

  const handleUpdateBuiltinLayout = (
    key: BuiltInBlockKey,
    patch: Partial<PosterElementLayout>
  ) => {
    updateActiveTemplate((tmpl) => ({
      ...tmpl,
      layouts: {
        ...tmpl.layouts,
        [aspectRatio]: {
          ...tmpl.layouts[aspectRatio],
          [key]: {
            ...tmpl.layouts[aspectRatio][key],
            ...patch,
          },
        },
      },
    }));
  };

  const handleMoveBuiltinBlock = (key: BuiltInBlockKey, x: number, y: number) => {
    handleUpdateBuiltinLayout(key, { x, y });
  };

  const handleAddCustomText = () => {
    const newId = `txt-${Date.now()}`;
    const count = activeTemplate.customTextBlocks.length + 1;
    const isLight = activeTemplate.presetStyle === 'modern_minimal';
    const canvasHeight = aspectRatio === '9:16' ? 1920 : 1080;

    const newBlock: CustomTextBlock = {
      id: newId,
      label: `Teks Bebas #${count}`,
      text: 'Gratis & Terbuka Untuk Umum • Live YouTube',
      x: 540,
      y: Math.round(canvasHeight * 0.86),
      fontFamily: "'Plus Jakarta Sans', 'Noto Sans Local', sans-serif",
      fontSize: 26,
      fontWeight: '700',
      color: isLight ? '#0f172a' : '#fef08a',
      align: 'center',
      letterSpacing: 0.5,
      maxWidth: 820,
      visible: true,
    };

    updateActiveTemplate((tmpl) => ({
      ...tmpl,
      customTextBlocks: [...tmpl.customTextBlocks, newBlock],
    }));
    setSelectedLayer({ kind: 'customText', id: newId });
    setEditorTab('design');
    showToast('Blok teks bebas ditambahkan! Geser langsung posisinya di atas kanvas.');
  };

  const handleUpdateCustomText = (
    id: string,
    patch: Partial<CustomTextBlock>
  ) => {
    updateActiveTemplate((tmpl) => ({
      ...tmpl,
      customTextBlocks: tmpl.customTextBlocks.map((b) =>
        b.id === id ? { ...b, ...patch } : b
      ),
    }));
  };

  const handleMoveCustomText = (id: string, x: number, y: number) => {
    handleUpdateCustomText(id, { x, y });
  };

  const handleDeleteCustomText = (id: string) => {
    updateActiveTemplate((tmpl) => ({
      ...tmpl,
      customTextBlocks: tmpl.customTextBlocks.filter((b) => b.id !== id),
    }));
    showToast('Blok teks bebas dihapus.');
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar logo (PNG, SVG, JPG, atau WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string | undefined;
      if (!dataUrl) return;

      const probeImg = new Image();
      probeImg.onload = () => {
        const natW = probeImg.naturalWidth || 160;
        const natH = probeImg.naturalHeight || 160;
        const targetW = 160;
        const targetH = Math.max(40, Math.round((targetW * natH) / natW));
        const logoId = `logo-${Date.now()}`;
        const cleanName = file.name.replace(/\.[^.]+$/, '') || 'Logo Masjid';

        const newLogo: PosterLogoLayer = {
          id: logoId,
          name: cleanName,
          imageUrl: dataUrl,
          x: 68,
          y: 62,
          width: targetW,
          height: targetH,
          opacity: 1,
          borderRadius: 0,
          visible: true,
        };

        updateActiveTemplate((tmpl) => ({
          ...tmpl,
          logos: [...tmpl.logos, newLogo],
        }));
        setSelectedLayer({ kind: 'logo', id: logoId });
        setEditorTab('design');
        showToast(
          `Logo "${cleanName}" ditambahkan! Seret di kanvas atau tarik sudutnya untuk ubah ukuran.`
        );
      };
      probeImg.onerror = () => {
        alert('Gagal membaca file gambar logo.');
      };
      probeImg.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateLogo = (id: string, patch: Partial<PosterLogoLayer>) => {
    updateActiveTemplate((tmpl) => ({
      ...tmpl,
      logos: tmpl.logos.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  };

  const handleMoveLogo = (id: string, x: number, y: number) => {
    handleUpdateLogo(id, { x, y });
  };

  const handleResizeLogo = (id: string, width: number, height: number) => {
    handleUpdateLogo(id, { width, height });
  };

  const handleDeleteLogo = (id: string) => {
    updateActiveTemplate((tmpl) => ({
      ...tmpl,
      logos: tmpl.logos.filter((l) => l.id !== id),
    }));
    showToast('Logo dihapus dari template.');
  };

  const handleResetLayout = () => {
    const freshLayout = createDefaultLayoutMap(
      aspectRatio,
      activeTemplate.presetStyle || 'emerald_classic',
      activeTemplate.textConfig
    );
    updateActiveTemplate((tmpl) => ({
      ...tmpl,
      layouts: {
        ...tmpl.layouts,
        [aspectRatio]: freshLayout,
      },
    }));
    showToast(
      `Posisi & tipografi rasio ${aspectRatio} dikembalikan ke pengaturan awal template.`
    );
  };

  // Handle Background Image Upload for New Template Modal
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

    const legacyCfg = {
      align: newTextAlign,
      yPosition: newTextY,
      titleColor: newTitleColor,
      speakerColor: newSpeakerColor,
      dateColor: '#ffffff',
      showBasmalah: newShowBasmalah,
      showDetailsBox: newShowDetailsBox,
      detailsBg: 'rgba(15, 23, 42, 0.75)',
    };

    const newTemplate: PosterTemplate = {
      id: `tmpl-custom-${Date.now()}`,
      name: newTemplateName.trim(),
      category: newTemplateCategory,
      ratio: newTemplateRatio,
      backgroundType: newTemplateImage ? 'custom_image' : 'preset',
      bgImageUrl: newTemplateImage || undefined,
      presetStyle: newTemplateImage ? undefined : 'emerald_classic',
      textConfig: legacyCfg,
      layouts: {
        '1:1': createDefaultLayoutMap('1:1', 'emerald_classic', legacyCfg),
        '9:16': createDefaultLayoutMap('9:16', 'emerald_classic', legacyCfg),
      },
      customTextBlocks: [],
      logos: [],
    };

    setTemplates([newTemplate, ...templates]);
    setSelectedTemplateId(newTemplate.id);
    setAspectRatio(newTemplate.ratio);
    setShowUploadModal(false);

    setNewTemplateName('');
    setNewTemplateImage(null);
    setNewTextY(0);
    showToast(
      `Template custom "${newTemplate.name}" ditambahkan! Silakan geser teks langsung di kanvas.`
    );
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    if (confirm(`Hapus template "${name}"?`)) {
      const next = templates.filter((t) => t.id !== id);
      const safeNext = next.length > 0 ? next : DEFAULT_TEMPLATES;
      setTemplates(safeNext);
      if (selectedTemplateId === id) {
        setSelectedTemplateId(safeNext[0].id);
      }
      showToast(`Template "${name}" telah dihapus.`);
    }
  };

  const applyPreset = (type: PosterStatusType) => {
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

  const collectUsedFontFamilies = (): string[] => {
    const families = new Set<string>();
    for (const key of BUILTIN_BLOCK_ORDER) {
      if (activeLayoutMap[key].visible) {
        families.add(activeLayoutMap[key].fontFamily);
      }
    }
    for (const block of activeTemplate.customTextBlocks) {
      if (block.visible) {
        families.add(block.fontFamily);
      }
    }
    return Array.from(families);
  };

  // Download SVG with embedded fonts & stripped editor overlays
  const handleDownloadSvg = async () => {
    if (!svgRef.current || exportingType) return;
    setExportingType('svg');
    try {
      const svgData = await serializeSvgForExport(
        svgRef.current,
        collectUsedFontFamilies()
      );
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `poster-tari-${activeTemplate.name
        .toLowerCase()
        .replace(/\s+/g, '-')}-${aspectRatio === '1:1' ? 'feed' : 'story'}.svg`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('File SVG beserta font berhasil diunduh!');
    } finally {
      setExportingType(null);
    }
  };

  // Download High-Res PNG via HTML5 Canvas with embedded fonts
  const handleDownloadPng = async () => {
    if (!svgRef.current || exportingType) return;
    setExportingType('png');
    try {
      const svgData = await serializeSvgForExport(
        svgRef.current,
        collectUsedFontFamilies()
      );
      const canvas = document.createElement('canvas');
      const exportW = 1080;
      const exportH = aspectRatio === '9:16' ? 1920 : 1080;
      canvas.width = exportW;
      canvas.height = exportH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setExportingType(null);
        return;
      }

      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, exportW, exportH);
        URL.revokeObjectURL(url);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `poster-tari-${activeTemplate.name
          .toLowerCase()
          .replace(/\s+/g, '-')}-${aspectRatio === '1:1' ? 'feed' : 'story'}.png`;
        downloadLink.click();
        setExportingType(null);
        showToast('Gambar PNG resolusi 1080px berhasil diunduh!');
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        setExportingType(null);
        alert('Gagal merender poster ke gambar PNG.');
      };

      img.src = url;
    } catch {
      setExportingType(null);
    }
  };

  // Quick bar summary for currently selected layer under the canvas
  const renderSelectedQuickBar = () => {
    if (!selectedLayer) {
      return (
        <div className="w-full max-w-[480px] mt-3 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <Move size={13} className="text-purple-400 shrink-0" />
            Seret teks atau logo langsung di kanvas untuk memindahkan posisi.
          </span>
          <button
            type="button"
            onClick={() => setEditorTab('design')}
            className="text-purple-300 hover:text-purple-200 font-semibold shrink-0"
          >
            Buka Layer →
          </button>
        </div>
      );
    }

    if (selectedLayer.kind === 'logo') {
      const logo = activeTemplate.logos.find((l) => l.id === selectedLayer.id);
      if (!logo) return null;
      return (
        <div className="w-full max-w-[480px] mt-3 px-3 py-2 rounded-lg bg-slate-800 border border-purple-500/40 text-[11px] text-slate-200 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-1.5 py-0.5 rounded bg-purple-600/30 text-purple-200 font-semibold">
              Logo
            </span>
            <span className="font-semibold truncate max-w-[140px]">{logo.name}</span>
            <span className="font-mono text-slate-400">
              {Math.round(logo.width)}px
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                handleUpdateLogo(logo.id, {
                  x: Math.round((1080 - logo.width) / 2),
                })
              }
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[11px] font-medium flex items-center gap-1"
            >
              <Crosshair size={11} /> Tengah
            </button>
            <button
              type="button"
              onClick={() => setEditorTab('design')}
              className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[11px] font-semibold"
            >
              Atur Logo
            </button>
          </div>
        </div>
      );
    }

    const textLayout =
      selectedLayer.kind === 'builtin'
        ? activeLayoutMap[selectedLayer.key]
        : activeTemplate.customTextBlocks.find((b) => b.id === selectedLayer.id);
    if (!textLayout) return null;

    const label =
      selectedLayer.kind === 'builtin'
        ? BUILTIN_BLOCK_META[selectedLayer.key].shortLabel
        : (textLayout as CustomTextBlock).label;

    const currentFontOption =
      POSTER_FONTS.find(
        (f) =>
          f.family === textLayout.fontFamily ||
          textLayout.fontFamily.toLowerCase().includes(f.cssFamilyName.toLowerCase())
      ) || POSTER_FONTS[0];

    const patchText = (patch: Partial<PosterElementLayout>) => {
      if (selectedLayer.kind === 'builtin') {
        handleUpdateBuiltinLayout(selectedLayer.key, patch);
      } else {
        handleUpdateCustomText(selectedLayer.id, patch);
      }
    };

    return (
      <div className="w-full max-w-[480px] mt-3 px-3 py-2 rounded-lg bg-slate-800 border border-purple-500/40 text-[11px] text-slate-200 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-1.5 py-0.5 rounded bg-purple-600/30 text-purple-200 font-semibold shrink-0">
            {label}
          </span>
          <select
            aria-label="Pilih font elemen aktif"
            value={currentFontOption.family}
            onChange={(e) => patchText({ fontFamily: e.target.value })}
            className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-[11px] text-white max-w-[140px] focus:outline-none focus:border-purple-400"
          >
            {POSTER_FONTS.map((font) => (
              <option key={font.id} value={font.family}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="color"
            aria-label="Warna teks elemen aktif"
            value={
              textLayout.color.startsWith('#')
                ? textLayout.color.slice(0, 7)
                : '#ffffff'
            }
            onChange={(e) => patchText({ color: e.target.value })}
            className="w-6 h-6 rounded border border-slate-600 bg-transparent cursor-pointer"
          />
          <button
            type="button"
            onClick={() => patchText({ x: 540, align: 'center' })}
            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[11px] font-medium flex items-center gap-1"
            title="Pusatkan ke tengah kanvas"
          >
            <Crosshair size={11} /> Tengah
          </button>
          <button
            type="button"
            onClick={() => setEditorTab('design')}
            className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[11px] font-semibold"
          >
            Properti
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Hidden input for uploading mosque logo */}
      <input
        type="file"
        ref={logoInputRef}
        accept="image/*"
        onChange={handleLogoFileChange}
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="text-purple-600" size={24} />
            Studio Desain Poster Dinamis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geser bebas posisi tulisan (drag & drop), pilih beragam font, tambah teks bebas & logo masjid, lalu ekspor ke PNG/SVG!
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Upload size={14} className="text-purple-600" />
            + Upload Template Sendiri
          </button>

          <button
            type="button"
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
                showToast('Poster berhasil dijadwalkan ke Kalender Konten!');
              }
            }}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Calendar size={14} className="text-blue-600" />
            Jadwalkan ke Planner
          </button>

          <button
            type="button"
            disabled={exportingType !== null}
            onClick={handleDownloadSvg}
            className="px-3 py-2 bg-white hover:bg-slate-50 disabled:opacity-60 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FileDown size={14} />
            {exportingType === 'svg' ? 'Menyematkan Font...' : 'Unduh SVG'}
          </button>

          <button
            type="button"
            disabled={exportingType !== null}
            onClick={handleDownloadPng}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download size={14} />
            {exportingType === 'png'
              ? 'Merender PNG...'
              : 'Unduh Gambar PNG (1080px)'}
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
            type="button"
            onClick={() => setToastNotice(null)}
            className="text-purple-600 hover:text-purple-800 p-1 rounded"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Template Selector Bar (Carousel Cards) */}
      <div className="bg-white rounded-lg border border-gitlab-panelBorder p-4 shadow-gitlab space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-purple-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Pilih Master Template Poster ({templates.length} Tersedia)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Posisi teks, font & logo tersimpan otomatis per template
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
        {/* Left Column (5 span): Controls, Form & Layer/Typography Inspector */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-gitlab-panelBorder p-4 sm:p-5 shadow-gitlab space-y-4">
          {/* Active Template Notice */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Palette size={14} className="text-purple-600 shrink-0" />
              <span className="font-bold text-slate-800 truncate">
                Template: <span className="text-purple-700">{activeTemplate.name}</span>
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 shrink-0">
              {activeTemplate.backgroundType === 'custom_image'
                ? 'Background Custom'
                : 'Desain Bawaan'}
            </span>
          </div>

          {/* Segmented Tabs: Isi Konten vs Desain, Font & Layer */}
          <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setEditorTab('content')}
              className={`py-1.5 px-2 rounded-md font-semibold flex items-center justify-center gap-1.5 transition-all ${
                editorTab === 'content'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Type size={13} /> Isi Konten
            </button>
            <button
              type="button"
              onClick={() => setEditorTab('design')}
              className={`py-1.5 px-2 rounded-md font-semibold flex items-center justify-center gap-1.5 transition-all ${
                editorTab === 'design'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders size={13} /> Posisi, Font & Layer
            </button>
          </div>

          {editorTab === 'content' ? (
            <div className="space-y-4">
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
                    <Ratio size={14} /> Feed (1:1)
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
                    <Ratio size={14} /> Story / WA (9:16)
                  </button>
                </div>
              </div>

              {/* Quick Add Custom Text & Logo */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddCustomText}
                  className="py-2 px-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus size={14} className="text-purple-600" />
                  Tambah Teks Bebas
                </button>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ImagePlus size={14} className="text-emerald-600" />
                  Upload Logo Masjid
                </button>
              </div>

              <div className="border-t border-slate-100 my-1"></div>

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
          ) : (
            <LayerInspectorPanel
              aspectRatio={aspectRatio}
              statusType={statusType}
              layoutMap={activeLayoutMap}
              customTextBlocks={activeTemplate.customTextBlocks}
              logos={activeTemplate.logos}
              footerText={footerText}
              selectedLayer={selectedLayer}
              onSelectLayer={setSelectedLayer}
              onUpdateBuiltinLayout={handleUpdateBuiltinLayout}
              onUpdateCustomText={handleUpdateCustomText}
              onDeleteCustomText={handleDeleteCustomText}
              onUpdateLogo={handleUpdateLogo}
              onDeleteLogo={handleDeleteLogo}
              onChangeFooterText={setFooterText}
              onAddCustomText={handleAddCustomText}
              onTriggerLogoUpload={() => logoInputRef.current?.click()}
              onResetLayout={handleResetLayout}
            />
          )}
        </div>

        {/* Right Column (7 span): Interactive Drag & Drop SVG Canvas Preview */}
        <div className="lg:col-span-7 bg-slate-900 rounded-lg p-5 border border-slate-800 shadow-gitlab flex flex-col items-center justify-center min-h-[600px] overflow-hidden">
          <div className="w-full max-w-[480px] text-[11px] text-slate-400 mb-3 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                Kanvas Interaktif ({aspectRatio === '1:1' ? '1080 × 1080' : '1080 × 1920'})
              </span>
            </div>
            <span className="text-[10px] text-slate-500">
              Drag teks/logo • Panah keyboard untuk geser presisi
            </span>
          </div>

          <PosterCanvas
            svgRef={svgRef}
            aspectRatio={aspectRatio}
            backgroundType={activeTemplate.backgroundType}
            bgImageUrl={activeTemplate.bgImageUrl}
            presetStyle={activeTemplate.presetStyle}
            statusType={statusType}
            title={title}
            speaker={speaker}
            dateText={dateText}
            timeText={timeText}
            location={location}
            cancellationReason={cancellationReason}
            footerText={footerText}
            layoutMap={activeLayoutMap}
            customTextBlocks={activeTemplate.customTextBlocks}
            logos={activeTemplate.logos}
            selectedLayer={selectedLayer}
            onSelectLayer={setSelectedLayer}
            onMoveBuiltinBlock={handleMoveBuiltinBlock}
            onMoveCustomText={handleMoveCustomText}
            onMoveLogo={handleMoveLogo}
            onResizeLogo={handleResizeLogo}
          />

          {renderSelectedQuickBar()}
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
                      Gunakan background karya tim desain/Canva, lalu geser posisi teks bebas di kanvas.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                >
                  <X size={16} />
                </button>
              </div>

              <form
                onSubmit={handleSaveNewTemplate}
                className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto"
              >
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

                {/* Initial Typography & Position Configurator */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Sliders size={14} className="text-purple-600" />
                    Pengaturan Awal Posisi & Warna (Bisa Digeser Lagi di Kanvas)
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Perataan Teks Awal
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
                        Offset Vertikal Awal ({newTextY}px)
                      </label>
                      <input
                        type="range"
                        min={-100}
                        max={300}
                        step={10}
                        value={newTextY}
                        onChange={(e) => setNewTextY(parseInt(e.target.value, 10))}
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
                        <span className="font-mono text-[11px] text-slate-600">
                          {newTitleColor}
                        </span>
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
                        <span className="font-mono text-[11px] text-slate-600">
                          {newSpeakerColor}
                        </span>
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
