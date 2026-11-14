export type PosterRatio = '1:1' | '9:16';

export type TextAlign = 'left' | 'center' | 'right';

export type PosterStatusType = 'regular' | 'cancelled' | 'special';

export type PresetStyle =
  | 'emerald_classic'
  | 'modern_minimal'
  | 'midnight_gold'
  | 'sunset_warm';

export type BuiltInBlockKey =
  | 'basmalah'
  | 'badge'
  | 'title'
  | 'speakerLabel'
  | 'speaker'
  | 'cancellationNotice'
  | 'detailsBox'
  | 'footer';

export interface PosterElementLayout {
  x: number;
  y: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  align: TextAlign;
  letterSpacing: number;
  maxWidth: number;
  visible: boolean;
  backgroundColor?: string;
  borderColor?: string;
}

export type PosterLayoutMap = Record<BuiltInBlockKey, PosterElementLayout>;

export interface CustomTextBlock {
  id: string;
  label: string;
  text: string;
  x: number;
  y: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  align: TextAlign;
  letterSpacing: number;
  maxWidth: number;
  visible: boolean;
}

export interface PosterLogoLayer {
  id: string;
  name: string;
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  borderRadius: number;
  visible: boolean;
}

export interface LegacyTextConfig {
  align?: 'center' | 'left';
  yPosition?: number;
  titleColor?: string;
  speakerColor?: string;
  dateColor?: string;
  showBasmalah?: boolean;
  showDetailsBox?: boolean;
  detailsBg?: string;
}

export interface PosterTemplate {
  id: string;
  name: string;
  category: string;
  ratio: PosterRatio;
  backgroundType: 'preset' | 'custom_image';
  bgImageUrl?: string;
  presetStyle?: PresetStyle;
  textConfig?: LegacyTextConfig;
  layouts: Record<PosterRatio, PosterLayoutMap>;
  customTextBlocks: CustomTextBlock[];
  logos: PosterLogoLayer[];
}

export type SelectedLayer =
  | { kind: 'builtin'; key: BuiltInBlockKey }
  | { kind: 'customText'; id: string }
  | { kind: 'logo'; id: string }
  | null;

