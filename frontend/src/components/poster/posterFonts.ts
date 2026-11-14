export interface PosterFontOption {
  id: string;
  label: string;
  family: string;
  cssFamilyName: string;
  category: 'Sans Modern' | 'Serif Elegan' | 'Display Tegas' | 'Arab / Kaligrafi';
  source: 'local' | 'google';
  googleCssUrl?: string;
  localFiles?: Array<{
    url: string;
    weight: string;
    format: 'truetype' | 'woff2';
  }>;
  supportedWeights: string[];
  sampleText: string;
}

export const POSTER_FONTS: PosterFontOption[] = [
  // Curated Local Fonts (100% Offline & Export-Safe)
  {
    id: 'noto-sans-local',
    label: 'Noto Sans (Lokal)',
    family: "'Noto Sans Local', sans-serif",
    cssFamilyName: 'Noto Sans Local',
    category: 'Sans Modern',
    source: 'local',
    localFiles: [
      { url: '/fonts/NotoSans-Regular.ttf', weight: '400', format: 'truetype' },
      { url: '/fonts/NotoSans-Bold.ttf', weight: '700', format: 'truetype' },
      { url: '/fonts/NotoSans-Black.ttf', weight: '900', format: 'truetype' },
    ],
    supportedWeights: ['400', '700', '900'],
    sampleText: 'Kajian Rutin Pekanan',
  },
  {
    id: 'noto-display-local',
    label: 'Noto Display Black (Lokal)',
    family: "'Noto Display Local', sans-serif",
    cssFamilyName: 'Noto Display Local',
    category: 'Display Tegas',
    source: 'local',
    localFiles: [
      { url: '/fonts/NotoSansDisplay-Black.ttf', weight: '900', format: 'truetype' },
    ],
    supportedWeights: ['900'],
    sampleText: 'TABLIGH AKBAR',
  },
  {
    id: 'noto-serif-local',
    label: 'Noto Serif (Lokal)',
    family: "'Noto Serif Local', serif",
    cssFamilyName: 'Noto Serif Local',
    category: 'Serif Elegan',
    source: 'local',
    localFiles: [
      { url: '/fonts/NotoSerif-Regular.ttf', weight: '400', format: 'truetype' },
      { url: '/fonts/NotoSerif-Bold.ttf', weight: '700', format: 'truetype' },
    ],
    supportedWeights: ['400', '700'],
    sampleText: 'Majelis Ilmu & Adab',
  },
  {
    id: 'noto-naskh-arabic-local',
    label: 'Noto Naskh Arabic (Lokal)',
    family: "'Noto Naskh Arabic Local', serif",
    cssFamilyName: 'Noto Naskh Arabic Local',
    category: 'Arab / Kaligrafi',
    source: 'local',
    localFiles: [
      { url: '/fonts/NotoNaskhArabic-Regular.ttf', weight: '400', format: 'truetype' },
      { url: '/fonts/NotoNaskhArabic-Bold.ttf', weight: '700', format: 'truetype' },
    ],
    supportedWeights: ['400', '700'],
    sampleText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  },
  {
    id: 'noto-kufi-arabic-local',
    label: 'Noto Kufi Arabic (Lokal)',
    family: "'Noto Kufi Arabic Local', serif",
    cssFamilyName: 'Noto Kufi Arabic Local',
    category: 'Arab / Kaligrafi',
    source: 'local',
    localFiles: [
      { url: '/fonts/NotoKufiArabic-Bold.ttf', weight: '700', format: 'truetype' },
    ],
    supportedWeights: ['700'],
    sampleText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  },

  // Curated Google Fonts (Auto-embedded into SVG/PNG on export)
  {
    id: 'inter',
    label: 'Inter',
    family: "'Inter', sans-serif",
    cssFamilyName: 'Inter',
    category: 'Sans Modern',
    source: 'google',
    googleCssUrl:
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap',
    supportedWeights: ['400', '600', '700', '800', '900'],
    sampleText: 'Kajian Tafsir Al-Kahfi',
  },
  {
    id: 'plus-jakarta-sans',
    label: 'Plus Jakarta Sans',
    family: "'Plus Jakarta Sans', sans-serif",
    cssFamilyName: 'Plus Jakarta Sans',
    category: 'Sans Modern',
    source: 'google',
    googleCssUrl:
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap',
    supportedWeights: ['400', '600', '700', '800'],
    sampleText: 'Kajian Pemuda Masjid',
  },
  {
    id: 'poppins',
    label: 'Poppins',
    family: "'Poppins', sans-serif",
    cssFamilyName: 'Poppins',
    category: 'Sans Modern',
    source: 'google',
    googleCssUrl:
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap',
    supportedWeights: ['400', '600', '700', '800'],
    sampleText: 'Ramah & Modern',
  },
  {
    id: 'montserrat',
    label: 'Montserrat',
    family: "'Montserrat', sans-serif",
    cssFamilyName: 'Montserrat',
    category: 'Sans Modern',
    source: 'google',
    googleCssUrl:
      'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap',
    supportedWeights: ['400', '600', '700', '800'],
    sampleText: 'Tegas & Geometris',
  },
  {
    id: 'playfair-display',
    label: 'Playfair Display',
    family: "'Playfair Display', serif",
    cssFamilyName: 'Playfair Display',
    category: 'Serif Elegan',
    source: 'google',
    googleCssUrl:
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&display=swap',
    supportedWeights: ['600', '700', '800'],
    sampleText: 'Kajian Akhlak Mulia',
  },
  {
    id: 'cinzel',
    label: 'Cinzel',
    family: "'Cinzel', serif",
    cssFamilyName: 'Cinzel',
    category: 'Serif Elegan',
    source: 'google',
    googleCssUrl:
      'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&display=swap',
    supportedWeights: ['600', '700', '800'],
    sampleText: 'TABLIGH AKBAR 1448H',
  },
  {
    id: 'merriweather',
    label: 'Merriweather',
    family: "'Merriweather', serif",
    cssFamilyName: 'Merriweather',
    category: 'Serif Elegan',
    source: 'google',
    googleCssUrl:
      'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
    supportedWeights: ['400', '700'],
    sampleText: 'Kajian Kitab Klasik',
  },
  {
    id: 'bebas-neue',
    label: 'Bebas Neue',
    family: "'Bebas Neue', sans-serif",
    cssFamilyName: 'Bebas Neue',
    category: 'Display Tegas',
    source: 'google',
    googleCssUrl:
      'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
    supportedWeights: ['400'],
    sampleText: 'HADIRILAH KAJIAN AKBAR',
  },
  {
    id: 'oswald',
    label: 'Oswald',
    family: "'Oswald', sans-serif",
    cssFamilyName: 'Oswald',
    category: 'Display Tegas',
    source: 'google',
    googleCssUrl:
      'https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap',
    supportedWeights: ['500', '600', '700'],
    sampleText: 'KAJIAN SPESIAL AKHIR PEKAN',
  },
  {
    id: 'amiri',
    label: 'Amiri (Kaligrafi Arab)',
    family: "'Amiri', serif",
    cssFamilyName: 'Amiri',
    category: 'Arab / Kaligrafi',
    source: 'google',
    googleCssUrl:
      'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap',
    supportedWeights: ['400', '700'],
    sampleText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  },
];

// Cache embedded @font-face CSS per font option ID so repeat exports are instant
const embeddedFontCssCache = new Map<string, string>();
let measureCanvasCtx: CanvasRenderingContext2D | null = null;

function getMeasureCtx(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!measureCanvasCtx) {
    const canvas = document.createElement('canvas');
    measureCanvasCtx = canvas.getContext('2d');
  }
  return measureCanvasCtx;
}

export function measureLineWidth(
  line: string,
  fontSize: number,
  fontWeight: string,
  fontFamily: string,
  letterSpacing: number
): number {
  const ctx = getMeasureCtx();
  const trackingExtra = Math.max(0, line.length - 1) * letterSpacing;
  if (!ctx) {
    return line.length * fontSize * 0.56 + trackingExtra;
  }
  ctx.font = `${fontWeight || '700'} ${fontSize}px ${fontFamily}`;
  return ctx.measureText(line).width + trackingExtra;
}

export function measureMaxLinesWidth(
  lines: string[],
  fontSize: number,
  fontWeight: string,
  fontFamily: string,
  letterSpacing = 0
): number {
  if (lines.length === 0) return 0;
  return Math.max(
    ...lines.map((line) =>
      measureLineWidth(line, fontSize, fontWeight, fontFamily, letterSpacing)
    )
  );
}

/**
 * Wrap text into lines fitting `maxWidth` inside the 1080px SVG coordinate space.
 */
export function wrapSvgText(
  text: string,
  maxWidth: number,
  fontSize: number,
  fontWeight: string,
  fontFamily: string,
  letterSpacing = 0
): string[] {
  const trimmed = text ?? '';
  if (!trimmed) return [''];
  const effectiveMax = Math.max(160, maxWidth);
  const paragraphs = trimmed.split(/\r?\n/);
  const lines: string[] = [];

  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }

    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      const width = measureLineWidth(
        candidate,
        fontSize,
        fontWeight,
        fontFamily,
        letterSpacing
      );

      if (width <= effectiveMax || !current) {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) {
      lines.push(current);
    }
  }

  return lines.length > 0 ? lines : [''];
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

async function fetchAsDataUrl(url: string, mimeType: string, timeoutMs = 5000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching ${url}`);
    }
    const buffer = await res.arrayBuffer();
    const base64 = arrayBufferToBase64(buffer);
    return `data:${mimeType};base64,${base64}`;
  } finally {
    clearTimeout(timer);
  }
}

async function buildFontCssForOption(font: PosterFontOption): Promise<string> {
  const cached = embeddedFontCssCache.get(font.id);
  if (cached !== undefined) {
    return cached;
  }

  try {
    if (font.source === 'local' && font.localFiles) {
      const rules = await Promise.all(
        font.localFiles.map(async (f) => {
          const mime = f.format === 'woff2' ? 'font/woff2' : 'font/ttf';
          const dataUrl = await fetchAsDataUrl(f.url, mime, 5000);
          return `@font-face { font-family: '${font.cssFamilyName}'; font-style: normal; font-weight: ${f.weight}; src: url('${dataUrl}') format('${f.format}'); }`;
        })
      );
      const css = rules.join('\n');
      embeddedFontCssCache.set(font.id, css);
      return css;
    }

    if (font.source === 'google' && font.googleCssUrl) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      let cssText = '';
      try {
        const res = await fetch(font.googleCssUrl, { signal: controller.signal });
        if (!res.ok) throw new Error(`Google Fonts CSS HTTP ${res.status}`);
        cssText = await res.text();
      } finally {
        clearTimeout(timer);
      }

      const urlRegex = /url\((https:\/\/[^)]+\.woff2)\)/g;
      const matchedUrls = new Set<string>();
      let match: RegExpExecArray | null;
      while ((match = urlRegex.exec(cssText)) !== null) {
        matchedUrls.add(match[1]);
      }

      const replacements = new Map<string, string>();
      await Promise.all(
        Array.from(matchedUrls).map(async (remoteUrl) => {
          try {
            const dataUrl = await fetchAsDataUrl(remoteUrl, 'font/woff2', 5000);
            replacements.set(remoteUrl, dataUrl);
          } catch {
            // Skip individual font subset if fetch fails
          }
        })
      );

      let embeddedCss = cssText;
      for (const [remoteUrl, dataUrl] of replacements.entries()) {
        embeddedCss = embeddedCss.split(remoteUrl).join(dataUrl);
      }

      if (replacements.size > 0) {
        embeddedFontCssCache.set(font.id, embeddedCss);
      }
      return embeddedCss;
    }
  } catch {
    // Offline or blocked network: fall back cleanly without breaking export
  }

  return '';
}

export async function buildEmbeddedFontCss(usedFontFamilies: string[]): Promise<string> {
  const normalizedSet = new Set(usedFontFamilies.map((f) => f.trim()));
  const matchedFonts = POSTER_FONTS.filter(
    (font) =>
      normalizedSet.has(font.family) ||
      Array.from(normalizedSet).some((used) =>
        used.toLowerCase().includes(font.cssFamilyName.toLowerCase())
      )
  );

  if (matchedFonts.length === 0) return '';

  const chunks = await Promise.all(matchedFonts.map((f) => buildFontCssForOption(f)));
  return chunks.filter(Boolean).join('\n');
}

/**
 * Clone the live SVG element, strip editor-only selection/snap overlays,
 * inject base64-embedded `@font-face` CSS into `<defs>`, and serialize cleanly.
 */
export async function serializeSvgForExport(
  svgElement: SVGSVGElement,
  usedFontFamilies: string[]
): Promise<string> {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  // Remove interactive selection outlines, handles, and snap lines
  const editorOverlays = clone.querySelectorAll('[data-editor-only="true"]');
  editorOverlays.forEach((el) => el.remove());

  const embeddedCss = await buildEmbeddedFontCss(usedFontFamilies);
  if (embeddedCss) {
    let defs = clone.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      clone.insertBefore(defs, clone.firstChild);
    }
    const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleEl.setAttribute('type', 'text/css');
    styleEl.textContent = embeddedCss;
    defs.insertBefore(styleEl, defs.firstChild);
  }

  return new XMLSerializer().serializeToString(clone);
}
