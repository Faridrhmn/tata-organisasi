import React from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Crosshair,
  Eye,
  EyeOff,
  ImagePlus,
  Layers,
  Plus,
  RotateCcw,
  Trash2,
  Type,
} from 'lucide-react';
import {
  BuiltInBlockKey,
  CustomTextBlock,
  PosterElementLayout,
  PosterLayoutMap,
  PosterLogoLayer,
  PosterRatio,
  PosterStatusType,
  SelectedLayer,
  TextAlign,
} from './posterTypes';
import { BUILTIN_BLOCK_META, BUILTIN_BLOCK_ORDER } from './posterPresets';
import { POSTER_FONTS, PosterFontOption } from './posterFonts';

interface LayerInspectorPanelProps {
  aspectRatio: PosterRatio;
  statusType: PosterStatusType;
  layoutMap: PosterLayoutMap;
  customTextBlocks: CustomTextBlock[];
  logos: PosterLogoLayer[];
  footerText: string;
  selectedLayer: SelectedLayer;
  onSelectLayer: (layer: SelectedLayer) => void;
  onUpdateBuiltinLayout: (
    key: BuiltInBlockKey,
    patch: Partial<PosterElementLayout>
  ) => void;
  onUpdateCustomText: (id: string, patch: Partial<CustomTextBlock>) => void;
  onDeleteCustomText: (id: string) => void;
  onUpdateLogo: (id: string, patch: Partial<PosterLogoLayer>) => void;
  onDeleteLogo: (id: string) => void;
  onChangeFooterText: (val: string) => void;
  onAddCustomText: () => void;
  onTriggerLogoUpload: () => void;
  onResetLayout: () => void;
}

const FONT_CATEGORIES: PosterFontOption['category'][] = [
  'Sans Modern',
  'Serif Elegan',
  'Display Tegas',
  'Arab / Kaligrafi',
];

function resolveMatchingFontFamily(currentFamily: string): string {
  const exact = POSTER_FONTS.find((f) => f.family === currentFamily);
  if (exact) return exact.family;
  const partial = POSTER_FONTS.find((f) =>
    currentFamily.toLowerCase().includes(f.cssFamilyName.toLowerCase())
  );
  return partial ? partial.family : POSTER_FONTS[0].family;
}

export const LayerInspectorPanel: React.FC<LayerInspectorPanelProps> = ({
  aspectRatio,
  statusType,
  layoutMap,
  customTextBlocks,
  logos,
  footerText,
  selectedLayer,
  onSelectLayer,
  onUpdateBuiltinLayout,
  onUpdateCustomText,
  onDeleteCustomText,
  onUpdateLogo,
  onDeleteLogo,
  onChangeFooterText,
  onAddCustomText,
  onTriggerLogoUpload,
  onResetLayout,
}) => {
  const canvasHeight = aspectRatio === '9:16' ? 1920 : 1080;

  // Resolve active text-like layer (builtin or customText)
  const activeBuiltinKey =
    selectedLayer?.kind === 'builtin' ? selectedLayer.key : null;
  const activeCustomBlock =
    selectedLayer?.kind === 'customText'
      ? customTextBlocks.find((b) => b.id === selectedLayer.id) || null
      : null;
  const activeLogo =
    selectedLayer?.kind === 'logo'
      ? logos.find((l) => l.id === selectedLayer.id) || null
      : null;

  const activeTextLayout: PosterElementLayout | CustomTextBlock | null =
    activeBuiltinKey
      ? layoutMap[activeBuiltinKey]
      : activeCustomBlock
      ? activeCustomBlock
      : null;

  const updateActiveTextLayout = (patch: Partial<PosterElementLayout>) => {
    if (activeBuiltinKey) {
      onUpdateBuiltinLayout(activeBuiltinKey, patch);
    } else if (activeCustomBlock) {
      onUpdateCustomText(activeCustomBlock.id, patch);
    }
  };

  const renderTextControls = () => {
    if (!activeTextLayout) return null;

    const titleLabel = activeBuiltinKey
      ? BUILTIN_BLOCK_META[activeBuiltinKey].label
      : activeCustomBlock?.label || 'Teks Bebas';

    const matchedFontValue = resolveMatchingFontFamily(activeTextLayout.fontFamily);
    const matchedFontMeta = POSTER_FONTS.find((f) => f.family === matchedFontValue);
    const hasBoxBg =
      activeBuiltinKey === 'detailsBox' ||
      activeBuiltinKey === 'badge' ||
      activeBuiltinKey === 'cancellationNotice';

    return (
      <div className="p-3.5 rounded-lg border border-purple-200 bg-purple-50/40 space-y-3 text-xs">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-purple-100">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
              Properti Elemen Terpilih
            </span>
            <h4 className="font-bold text-slate-900 truncate">{titleLabel}</h4>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => updateActiveTextLayout({ x: 540, align: 'center' })}
              className="px-2 py-1 bg-white hover:bg-purple-50 text-slate-700 border border-slate-200 rounded text-[11px] font-semibold flex items-center gap-1"
              title="Pusatkan ke tengah kanvas (X = 540)"
            >
              <Crosshair size={12} className="text-purple-600" /> Tengah X
            </button>
            {activeCustomBlock && (
              <button
                type="button"
                onClick={() => {
                  onDeleteCustomText(activeCustomBlock.id);
                  onSelectLayer(null);
                }}
                className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded"
                title="Hapus blok teks ini"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Custom text content editor */}
        {activeCustomBlock && (
          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nama Layer
              </label>
              <input
                type="text"
                value={activeCustomBlock.label}
                onChange={(e) =>
                  onUpdateCustomText(activeCustomBlock.id, { label: e.target.value })
                }
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Isi Tulisan (Bisa Multi-Baris)
              </label>
              <textarea
                rows={2}
                value={activeCustomBlock.text}
                onChange={(e) =>
                  onUpdateCustomText(activeCustomBlock.id, { text: e.target.value })
                }
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        )}

        {/* Footer text quick edit */}
        {activeBuiltinKey === 'footer' && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Teks Footer
            </label>
            <input
              type="text"
              value={footerText}
              onChange={(e) => onChangeFooterText(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        )}

        {/* Font Picker */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-slate-700">
              Jenis Font (Tipografi)
            </label>
            {matchedFontMeta && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                {matchedFontMeta.source === 'local' ? 'Offline Ready' : 'Google Font'}
              </span>
            )}
          </div>
          <select
            value={matchedFontValue}
            onChange={(e) => updateActiveTextLayout({ fontFamily: e.target.value })}
            style={{ fontFamily: matchedFontValue }}
            className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            {FONT_CATEGORIES.map((category) => (
              <optgroup key={category} label={category}>
                {POSTER_FONTS.filter((f) => f.category === category).map((font) => (
                  <option key={font.id} value={font.family}>
                    {font.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Size & Weight */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Ukuran ({activeTextLayout.fontSize}px)
            </label>
            <input
              type="range"
              min={12}
              max={96}
              step={1}
              value={activeTextLayout.fontSize}
              onChange={(e) =>
                updateActiveTextLayout({ fontSize: parseInt(e.target.value, 10) })
              }
              className="w-full accent-purple-600 mt-1"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Ketebalan
            </label>
            <select
              value={activeTextLayout.fontWeight}
              onChange={(e) => updateActiveTextLayout({ fontWeight: e.target.value })}
              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="400">Regular (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">SemiBold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">ExtraBold (800)</option>
              <option value="900">Black (900)</option>
            </select>
          </div>
        </div>

        {/* Alignment & Color */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Perataan Teks
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  { id: 'left', icon: AlignLeft, label: 'Kiri' },
                  { id: 'center', icon: AlignCenter, label: 'Tengah' },
                  { id: 'right', icon: AlignRight, label: 'Kanan' },
                ] as { id: TextAlign; icon: React.ComponentType<{ size?: number }>; label: string }[]
              ).map((item) => {
                const Icon = item.icon;
                const active = activeTextLayout.align === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateActiveTextLayout({ align: item.id })}
                    title={`Rata ${item.label}`}
                    className={`py-1.5 rounded border flex items-center justify-center transition-colors ${
                      active
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={13} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Warna Teks
            </label>
            <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-md px-2 py-1">
              <input
                type="color"
                value={
                  activeTextLayout.color.startsWith('#')
                    ? activeTextLayout.color.slice(0, 7)
                    : '#ffffff'
                }
                onChange={(e) => updateActiveTextLayout({ color: e.target.value })}
                className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
              />
              <span className="font-mono text-[11px] text-slate-600 truncate">
                {activeTextLayout.color}
              </span>
            </div>
          </div>
        </div>

        {/* Optional Box Background for badge / detailsBox / cancellation */}
        {hasBoxBg && 'backgroundColor' in activeTextLayout && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Warna Latar Kotak (Hex / RGBA)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={
                  activeTextLayout.backgroundColor?.startsWith('#')
                    ? activeTextLayout.backgroundColor.slice(0, 7)
                    : '#0f172a'
                }
                onChange={(e) =>
                  updateActiveTextLayout({ backgroundColor: e.target.value })
                }
                className="w-7 h-7 rounded border border-slate-300 cursor-pointer shrink-0"
              />
              <input
                type="text"
                value={activeTextLayout.backgroundColor || ''}
                placeholder="Default template (mis. rgba(15,23,42,0.8))"
                onChange={(e) =>
                  updateActiveTextLayout({
                    backgroundColor: e.target.value || undefined,
                  })
                }
                className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-mono text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        )}

        {/* Max Width & Letter Spacing */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Lebar Area ({activeTextLayout.maxWidth}px)
            </label>
            <input
              type="range"
              min={260}
              max={980}
              step={20}
              value={activeTextLayout.maxWidth}
              onChange={(e) =>
                updateActiveTextLayout({ maxWidth: parseInt(e.target.value, 10) })
              }
              className="w-full accent-purple-600 mt-1"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Spasi Huruf ({activeTextLayout.letterSpacing}px)
            </label>
            <input
              type="range"
              min={-2}
              max={12}
              step={0.5}
              value={activeTextLayout.letterSpacing}
              onChange={(e) =>
                updateActiveTextLayout({ letterSpacing: parseFloat(e.target.value) })
              }
              className="w-full accent-purple-600 mt-1"
            />
          </div>
        </div>

        {/* Fine-tune Coordinates X / Y */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-purple-100">
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
              Posisi X (0–1080)
            </label>
            <input
              type="number"
              min={0}
              max={1080}
              value={Math.round(activeTextLayout.x)}
              onChange={(e) =>
                updateActiveTextLayout({
                  x: Math.max(0, Math.min(1080, Number(e.target.value) || 0)),
                })
              }
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-[11px]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
              Posisi Y (0–{canvasHeight})
            </label>
            <input
              type="number"
              min={0}
              max={canvasHeight}
              value={Math.round(activeTextLayout.y)}
              onChange={(e) =>
                updateActiveTextLayout({
                  y: Math.max(0, Math.min(canvasHeight, Number(e.target.value) || 0)),
                })
              }
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-[11px]"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderLogoControls = () => {
    if (!activeLogo) return null;
    const aspect = activeLogo.height / Math.max(1, activeLogo.width);

    const placeLogoQuick = (preset: 'top-left' | 'top-center' | 'top-right' | 'bottom-center') => {
      const margin = 56;
      if (preset === 'top-left') {
        onUpdateLogo(activeLogo.id, { x: margin, y: margin });
      } else if (preset === 'top-center') {
        onUpdateLogo(activeLogo.id, {
          x: Math.round((1080 - activeLogo.width) / 2),
          y: margin,
        });
      } else if (preset === 'top-right') {
        onUpdateLogo(activeLogo.id, {
          x: Math.round(1080 - activeLogo.width - margin),
          y: margin,
        });
      } else {
        onUpdateLogo(activeLogo.id, {
          x: Math.round((1080 - activeLogo.width) / 2),
          y: Math.round(canvasHeight - activeLogo.height - 96),
        });
      }
    };

    return (
      <div className="p-3.5 rounded-lg border border-purple-200 bg-purple-50/40 space-y-3 text-xs">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-purple-100">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
              Properti Logo Terpilih
            </span>
            <h4 className="font-bold text-slate-900 truncate">{activeLogo.name}</h4>
          </div>
          <button
            type="button"
            onClick={() => {
              onDeleteLogo(activeLogo.id);
              onSelectLayer(null);
            }}
            className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded text-[11px] font-semibold flex items-center gap-1 shrink-0"
          >
            <Trash2 size={12} /> Hapus
          </button>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Label Logo
          </label>
          <input
            type="text"
            value={activeLogo.name}
            onChange={(e) => onUpdateLogo(activeLogo.id, { name: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Posisi Cepat
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => placeLogoQuick('top-left')}
              className="py-1 px-2 bg-white hover:bg-slate-50 border border-slate-300 rounded text-[11px] font-medium text-slate-700"
            >
              Kiri Atas
            </button>
            <button
              type="button"
              onClick={() => placeLogoQuick('top-center')}
              className="py-1 px-2 bg-white hover:bg-slate-50 border border-slate-300 rounded text-[11px] font-medium text-slate-700"
            >
              Tengah Atas
            </button>
            <button
              type="button"
              onClick={() => placeLogoQuick('top-right')}
              className="py-1 px-2 bg-white hover:bg-slate-50 border border-slate-300 rounded text-[11px] font-medium text-slate-700"
            >
              Kanan Atas
            </button>
            <button
              type="button"
              onClick={() => placeLogoQuick('bottom-center')}
              className="py-1 px-2 bg-white hover:bg-slate-50 border border-slate-300 rounded text-[11px] font-medium text-slate-700"
            >
              Tengah Bawah
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Ukuran Logo ({Math.round(activeLogo.width)}px)
          </label>
          <input
            type="range"
            min={48}
            max={600}
            step={4}
            value={Math.round(activeLogo.width)}
            onChange={(e) => {
              const nextW = parseInt(e.target.value, 10);
              onUpdateLogo(activeLogo.id, {
                width: nextW,
                height: Math.round(nextW * aspect),
              });
            }}
            className="w-full accent-purple-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Transparansi ({Math.round(activeLogo.opacity * 100)}%)
            </label>
            <input
              type="range"
              min={15}
              max={100}
              step={5}
              value={Math.round(activeLogo.opacity * 100)}
              onChange={(e) =>
                onUpdateLogo(activeLogo.id, {
                  opacity: parseInt(e.target.value, 10) / 100,
                })
              }
              className="w-full accent-purple-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Sudut ({activeLogo.borderRadius}px)
            </label>
            <input
              type="range"
              min={0}
              max={Math.round(Math.max(activeLogo.width, activeLogo.height) / 2)}
              step={4}
              value={activeLogo.borderRadius}
              onChange={(e) =>
                onUpdateLogo(activeLogo.id, {
                  borderRadius: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-purple-600"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Quick Add Custom Text / Logo Bar */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onAddCustomText}
          className="py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus size={14} className="text-purple-600" />
          Tambah Teks Bebas
        </button>

        <button
          type="button"
          onClick={onTriggerLogoUpload}
          className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <ImagePlus size={14} className="text-emerald-600" />
          Upload Logo Masjid
        </button>
      </div>

      {/* Selected Layer Controls */}
      {activeTextLayout && renderTextControls()}
      {activeLogo && renderLogoControls()}

      {!activeTextLayout && !activeLogo && (
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
          Klik elemen tulisan atau logo langsung di atas kanvas (atau pilih dari daftar layer di bawah) untuk menggeser posisi, mengganti font, warna, dan ukuran.
        </div>
      )}

      {/* Layer List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={13} /> Daftar Layer Kanvas
          </span>
          <button
            type="button"
            onClick={onResetLayout}
            className="text-[11px] text-slate-600 hover:text-purple-700 font-semibold flex items-center gap-1"
            title="Kembalikan posisi & font bawaan template ini"
          >
            <RotateCcw size={11} /> Reset Posisi
          </button>
        </div>

        <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
          {/* Uploaded Logos */}
          {logos.map((logo) => {
            const active =
              selectedLayer?.kind === 'logo' && selectedLayer.id === logo.id;
            return (
              <div
                key={logo.id}
                onClick={() => onSelectLayer({ kind: 'logo', id: logo.id })}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border text-xs cursor-pointer transition-colors ${
                  active
                    ? 'border-purple-500 bg-purple-50 text-purple-950 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={logo.imageUrl}
                    alt={logo.name}
                    className="w-5 h-5 rounded object-contain bg-slate-100 border border-slate-200 shrink-0"
                  />
                  <span className="truncate">{logo.name}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateLogo(logo.id, { visible: !logo.visible });
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700"
                  title={logo.visible ? 'Sembunyikan layer' : 'Tampilkan layer'}
                >
                  {logo.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
              </div>
            );
          })}

          {/* Custom Freeform Text Blocks */}
          {customTextBlocks.map((block) => {
            const active =
              selectedLayer?.kind === 'customText' && selectedLayer.id === block.id;
            return (
              <div
                key={block.id}
                onClick={() => onSelectLayer({ kind: 'customText', id: block.id })}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border text-xs cursor-pointer transition-colors ${
                  active
                    ? 'border-purple-500 bg-purple-50 text-purple-950 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Type size={13} className="text-purple-600 shrink-0" />
                  <span className="truncate">{block.label}</span>
                  <span className="text-[10px] text-slate-400 truncate">
                    • {block.text.slice(0, 18)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateCustomText(block.id, { visible: !block.visible });
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700"
                  title={block.visible ? 'Sembunyikan layer' : 'Tampilkan layer'}
                >
                  {block.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
              </div>
            );
          })}

          {/* Built-in Poster Layers */}
          {BUILTIN_BLOCK_ORDER.filter(
            (key) => key !== 'cancellationNotice' || statusType === 'cancelled'
          ).map((key) => {
            const lay = layoutMap[key];
            const meta = BUILTIN_BLOCK_META[key];
            const active =
              selectedLayer?.kind === 'builtin' && selectedLayer.key === key;
            return (
              <div
                key={key}
                onClick={() => onSelectLayer({ kind: 'builtin', key })}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border text-xs cursor-pointer transition-colors ${
                  active
                    ? 'border-purple-500 bg-purple-50 text-purple-950 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Type size={13} className="text-slate-400 shrink-0" />
                  <span className={`truncate ${!lay.visible ? 'line-through opacity-50' : ''}`}>
                    {meta.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateBuiltinLayout(key, { visible: !lay.visible });
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700"
                  title={lay.visible ? 'Sembunyikan layer' : 'Tampilkan layer'}
                >
                  {lay.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

