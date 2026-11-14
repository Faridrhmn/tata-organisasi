import {
  BuiltInBlockKey,
  LegacyTextConfig,
  PosterLayoutMap,
  PosterRatio,
  PosterTemplate,
  PresetStyle,
} from './posterTypes';

export const BUILTIN_BLOCK_META: Record<
  BuiltInBlockKey,
  { label: string; shortLabel: string; hasBox?: boolean }
> = {
  basmalah: { label: 'Basmalah Arab', shortLabel: 'Basmalah' },
  badge: { label: 'Badge Status Kajian', shortLabel: 'Badge Status', hasBox: true },
  title: { label: 'Judul / Tema Kajian', shortLabel: 'Judul Kajian' },
  speakerLabel: { label: 'Label "Bersama Pemateri"', shortLabel: 'Label Pemateri' },
  speaker: { label: 'Nama Pemateri / Ustadz', shortLabel: 'Nama Pemateri' },
  cancellationNotice: {
    label: 'Kotak Pemberitahuan Libur',
    shortLabel: 'Info Libur',
    hasBox: true,
  },
  detailsBox: {
    label: 'Kotak Tanggal, Waktu & Lokasi',
    shortLabel: 'Detail Jadwal',
    hasBox: true,
  },
  footer: { label: 'Footer Organisasi / Branding', shortLabel: 'Footer' },
};

export const BUILTIN_BLOCK_ORDER: BuiltInBlockKey[] = [
  'basmalah',
  'badge',
  'title',
  'speakerLabel',
  'speaker',
  'cancellationNotice',
  'detailsBox',
  'footer',
];

export function createDefaultLayoutMap(
  ratio: PosterRatio,
  presetStyle: PresetStyle = 'emerald_classic',
  legacy?: LegacyTextConfig
): PosterLayoutMap {
  const isStory = ratio === '9:16';
  const yShift = legacy?.yPosition || 0;
  const align = legacy?.align || 'center';
  const anchorX = align === 'left' ? 110 : 540;
  const isLight = presetStyle === 'modern_minimal';

  const titleFont =
    presetStyle === 'midnight_gold'
      ? "'Cinzel', 'Noto Serif Local', serif"
      : presetStyle === 'sunset_warm'
      ? "'Oswald', 'Noto Display Local', sans-serif"
      : presetStyle === 'modern_minimal'
      ? "'Montserrat', 'Noto Sans Local', sans-serif"
      : "'Plus Jakarta Sans', 'Noto Sans Local', sans-serif";

  const speakerFont =
    presetStyle === 'midnight_gold' || presetStyle === 'emerald_classic'
      ? "'Playfair Display', 'Noto Serif Local', serif"
      : "'Poppins', 'Noto Sans Local', sans-serif";

  const arabicFont =
    presetStyle === 'sunset_warm'
      ? "'Noto Kufi Arabic Local', serif"
      : "'Amiri', 'Noto Naskh Arabic Local', serif";

  const bodyFont = "'Inter', 'Noto Sans Local', sans-serif";

  const defaultTitleColor =
    legacy?.titleColor || (isLight ? '#0f172a' : '#ffffff');
  const defaultSpeakerColor =
    legacy?.speakerColor ||
    (isLight
      ? '#047857'
      : presetStyle === 'midnight_gold'
      ? '#fbbf24'
      : '#fef08a');
  const defaultDateColor =
    legacy?.dateColor ||
    (isLight
      ? '#0f172a'
      : presetStyle === 'sunset_warm'
      ? '#ffedd5'
      : '#ffffff');
  const defaultDetailsBg =
    legacy?.detailsBg ||
    (isLight
      ? 'rgba(255, 255, 255, 0.92)'
      : presetStyle === 'midnight_gold'
      ? 'rgba(2, 6, 23, 0.85)'
      : presetStyle === 'sunset_warm'
      ? 'rgba(69, 26, 3, 0.8)'
      : 'rgba(15, 23, 42, 0.78)');

  return {
    basmalah: {
      x: anchorX,
      y: (isStory ? 250 : 112) + yShift,
      fontFamily: arabicFont,
      fontSize: isStory ? 34 : 30,
      fontWeight: '700',
      color: isLight ? '#047857' : '#a7f3d0',
      align,
      letterSpacing: 1,
      maxWidth: 860,
      visible: legacy?.showBasmalah ?? true,
    },
    badge: {
      x: anchorX,
      y: (isStory ? 310 : 156) + yShift,
      fontFamily: bodyFont,
      fontSize: 15,
      fontWeight: '700',
      color: '#ffffff',
      align,
      letterSpacing: 1.5,
      maxWidth: 440,
      visible: true,
    },
    title: {
      x: anchorX,
      y: (isStory ? 460 : 278) + yShift,
      fontFamily: titleFont,
      fontSize: isStory ? 54 : 46,
      fontWeight: '800',
      color: defaultTitleColor,
      align,
      letterSpacing: presetStyle === 'sunset_warm' ? 1.5 : 0,
      maxWidth: 880,
      visible: true,
    },
    speakerLabel: {
      x: anchorX,
      y: (isStory ? 690 : 422) + yShift,
      fontFamily: bodyFont,
      fontSize: 19,
      fontWeight: '700',
      color: isLight ? '#64748b' : '#6ee7b7',
      align,
      letterSpacing: 2,
      maxWidth: 800,
      visible: true,
    },
    speaker: {
      x: anchorX,
      y: (isStory ? 748 : 472) + yShift,
      fontFamily: speakerFont,
      fontSize: isStory ? 44 : 38,
      fontWeight: '700',
      color: defaultSpeakerColor,
      align,
      letterSpacing: 0,
      maxWidth: 880,
      visible: true,
    },
    cancellationNotice: {
      x: 540,
      y: (isStory ? 840 : 520) + yShift,
      fontFamily: bodyFont,
      fontSize: 20,
      fontWeight: '700',
      color: '#991b1b',
      align: 'center',
      letterSpacing: 0,
      maxWidth: 800,
      visible: true,
      backgroundColor: '#fef2f2',
      borderColor: '#f87171',
    },
    detailsBox: {
      x: 540,
      y: (isStory ? 960 : 620) + yShift,
      fontFamily: bodyFont,
      fontSize: 23,
      fontWeight: '700',
      color: defaultDateColor,
      align: 'left',
      letterSpacing: 0,
      maxWidth: 800,
      visible: legacy?.showDetailsBox ?? true,
      backgroundColor: defaultDetailsBg,
      borderColor: isLight ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.18)',
    },
    footer: {
      x: 540,
      y: isStory ? 1810 : 1015,
      fontFamily: bodyFont,
      fontSize: 15,
      fontWeight: '600',
      color: isLight ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.55)',
      align: 'center',
      letterSpacing: 1,
      maxWidth: 900,
      visible: true,
    },
  };
}

export const DEFAULT_TEMPLATES: PosterTemplate[] = [
  {
    id: 'tmpl-emerald',
    name: 'Emerald Classic (Islami Elegan)',
    category: 'Kajian Rutin',
    ratio: '1:1',
    backgroundType: 'preset',
    presetStyle: 'emerald_classic',
    layouts: {
      '1:1': createDefaultLayoutMap('1:1', 'emerald_classic'),
      '9:16': createDefaultLayoutMap('9:16', 'emerald_classic'),
    },
    customTextBlocks: [],
    logos: [],
  },
  {
    id: 'tmpl-modern',
    name: 'Modern Minimalist (Clean White)',
    category: 'Kajian Pemuda',
    ratio: '1:1',
    backgroundType: 'preset',
    presetStyle: 'modern_minimal',
    layouts: {
      '1:1': createDefaultLayoutMap('1:1', 'modern_minimal'),
      '9:16': createDefaultLayoutMap('9:16', 'modern_minimal'),
    },
    customTextBlocks: [],
    logos: [],
  },
  {
    id: 'tmpl-midnight',
    name: 'Midnight Gold (Tabligh Akbar)',
    category: 'Event Spesial',
    ratio: '1:1',
    backgroundType: 'preset',
    presetStyle: 'midnight_gold',
    layouts: {
      '1:1': createDefaultLayoutMap('1:1', 'midnight_gold'),
      '9:16': createDefaultLayoutMap('9:16', 'midnight_gold'),
    },
    customTextBlocks: [],
    logos: [],
  },
  {
    id: 'tmpl-sunset',
    name: 'Sunset Warm (Shubuh & Sosial)',
    category: 'Kajian Shubuh',
    ratio: '1:1',
    backgroundType: 'preset',
    presetStyle: 'sunset_warm',
    layouts: {
      '1:1': createDefaultLayoutMap('1:1', 'sunset_warm'),
      '9:16': createDefaultLayoutMap('9:16', 'sunset_warm'),
    },
    customTextBlocks: [],
    logos: [],
  },
];

function mergeLayoutMap(
  defaults: PosterLayoutMap,
  partial?: Partial<PosterLayoutMap>
): PosterLayoutMap {
  if (!partial) return defaults;
  const result = { ...defaults };
  for (const key of BUILTIN_BLOCK_ORDER) {
    if (partial[key]) {
      result[key] = { ...defaults[key], ...partial[key] };
    }
  }
  return result;
}

/**
 * Upgrade legacy `PosterTemplate` entries stored in localStorage to the full per-layer model.
 */
export function normalizePosterTemplate(raw: Partial<PosterTemplate>): PosterTemplate {
  const presetStyle: PresetStyle = raw.presetStyle || 'emerald_classic';
  const default1x1 = createDefaultLayoutMap('1:1', presetStyle, raw.textConfig);
  const default9x16 = createDefaultLayoutMap('9:16', presetStyle, raw.textConfig);

  return {
    id: raw.id || `tmpl-${Date.now()}`,
    name: raw.name || 'Template Poster',
    category: raw.category || 'Kajian Rutin',
    ratio: raw.ratio === '9:16' ? '9:16' : '1:1',
    backgroundType: raw.backgroundType === 'custom_image' ? 'custom_image' : 'preset',
    bgImageUrl: raw.bgImageUrl,
    presetStyle: raw.backgroundType === 'custom_image' ? undefined : presetStyle,
    textConfig: raw.textConfig,
    layouts: {
      '1:1': mergeLayoutMap(default1x1, raw.layouts?.['1:1']),
      '9:16': mergeLayoutMap(default9x16, raw.layouts?.['9:16']),
    },
    customTextBlocks: Array.isArray(raw.customTextBlocks) ? raw.customTextBlocks : [],
    logos: Array.isArray(raw.logos) ? raw.logos : [],
  };
}

