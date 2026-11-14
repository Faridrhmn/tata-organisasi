import React, { useRef, useState } from 'react';
import {
  BuiltInBlockKey,
  CustomTextBlock,
  PosterElementLayout,
  PosterLayoutMap,
  PosterLogoLayer,
  PosterRatio,
  PosterStatusType,
  PresetStyle,
  SelectedLayer,
  TextAlign,
} from './posterTypes';
import { BUILTIN_BLOCK_META } from './posterPresets';
import { measureMaxLinesWidth, wrapSvgText } from './posterFonts';

interface PosterCanvasProps {
  svgRef: React.RefObject<SVGSVGElement>;
  aspectRatio: PosterRatio;
  backgroundType: 'preset' | 'custom_image';
  bgImageUrl?: string;
  presetStyle?: PresetStyle;
  statusType: PosterStatusType;
  title: string;
  speaker: string;
  dateText: string;
  timeText: string;
  location: string;
  cancellationReason: string;
  footerText: string;
  layoutMap: PosterLayoutMap;
  customTextBlocks: CustomTextBlock[];
  logos: PosterLogoLayer[];
  selectedLayer: SelectedLayer;
  onSelectLayer: (layer: SelectedLayer) => void;
  onMoveBuiltinBlock: (key: BuiltInBlockKey, x: number, y: number) => void;
  onMoveCustomText: (id: string, x: number, y: number) => void;
  onMoveLogo: (id: string, x: number, y: number) => void;
  onResizeLogo: (id: string, width: number, height: number) => void;
}

type DragTarget =
  | { kind: 'builtin'; key: BuiltInBlockKey }
  | { kind: 'customText'; id: string }
  | { kind: 'logo'; id: string }
  | { kind: 'logoResize'; id: string };

interface ActiveDragState {
  pointerId: number;
  target: DragTarget;
  startClientX: number;
  startClientY: number;
  startSvgX: number;
  startSvgY: number;
  initialX: number;
  initialY: number;
  initialWidth?: number;
  initialHeight?: number;
  hasMoved: boolean;
}

interface SnapGuides {
  verticalCenter: boolean;
  horizontalCenter: boolean;
}

function alignToSvgAnchor(align: TextAlign): 'start' | 'middle' | 'end' {
  if (align === 'left') return 'start';
  if (align === 'right') return 'end';
  return 'middle';
}

export const PosterCanvas: React.FC<PosterCanvasProps> = ({
  svgRef,
  aspectRatio,
  backgroundType,
  bgImageUrl,
  presetStyle = 'emerald_classic',
  statusType,
  title,
  speaker,
  dateText,
  timeText,
  location,
  cancellationReason,
  footerText,
  layoutMap,
  customTextBlocks,
  logos,
  selectedLayer,
  onSelectLayer,
  onMoveBuiltinBlock,
  onMoveCustomText,
  onMoveLogo,
  onResizeLogo,
}) => {
  const width = 1080;
  const height = aspectRatio === '9:16' ? 1920 : 1080;

  const dragRef = useRef<ActiveDragState | null>(null);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [snapGuides, setSnapGuides] = useState<SnapGuides>({
    verticalCenter: false,
    horizontalCenter: false,
  });

  const clientToSvg = (clientX: number, clientY: number): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const ctm = svg.getScreenCTM();
    if (ctm) {
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const transformed = pt.matrixTransform(ctm.inverse());
      return { x: transformed.x, y: transformed.y };
    }

    const rect = svg.getBoundingClientRect();
    const scaleX = width / Math.max(1, rect.width);
    const scaleY = height / Math.max(1, rect.height);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const clampPoint = (
    x: number,
    y: number,
    minX = 24,
    maxX = width - 24,
    minY = 24,
    maxY = height - 24
  ) => ({
    x: Math.round(Math.max(minX, Math.min(x, maxX))),
    y: Math.round(Math.max(minY, Math.min(y, maxY))),
  });

  const layerKeyString = (target: DragTarget): string => {
    if (target.kind === 'builtin') return `builtin:${target.key}`;
    if (target.kind === 'customText') return `custom:${target.id}`;
    return `logo:${target.id}`;
  };

  const startDrag = (
    e: React.PointerEvent<SVGGElement>,
    target: DragTarget,
    initialX: number,
    initialY: number,
    initialWidth?: number,
    initialHeight?: number
  ) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    if (target.kind === 'builtin') {
      onSelectLayer({ kind: 'builtin', key: target.key });
    } else if (target.kind === 'customText') {
      onSelectLayer({ kind: 'customText', id: target.id });
    } else {
      onSelectLayer({ kind: 'logo', id: target.id });
    }

    const startSvg = clientToSvg(e.clientX, e.clientY);
    dragRef.current = {
      pointerId: e.pointerId,
      target,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startSvgX: startSvg.x,
      startSvgY: startSvg.y,
      initialX,
      initialY,
      initialWidth,
      initialHeight,
      hasMoved: false,
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if synthetic event
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGGElement>) => {
    const active = dragRef.current;
    if (!active || active.pointerId !== e.pointerId) return;

    if (!active.hasMoved) {
      const dist = Math.hypot(
        e.clientX - active.startClientX,
        e.clientY - active.startClientY
      );
      if (dist < 3) return;
      active.hasMoved = true;
      setDraggingKey(layerKeyString(active.target));
    }

    const curSvg = clientToSvg(e.clientX, e.clientY);
    const dx = curSvg.x - active.startSvgX;
    const dy = curSvg.y - active.startSvgY;

    if (active.target.kind === 'logoResize') {
      const baseW = active.initialWidth || 140;
      const baseH = active.initialHeight || 140;
      const aspect = baseH / Math.max(1, baseW);
      const nextW = Math.round(Math.max(48, Math.min(760, baseW + dx)));
      const nextH = Math.round(nextW * aspect);
      onResizeLogo(active.target.id, nextW, nextH);
      return;
    }

    let nextX = active.initialX + dx;
    let nextY = active.initialY + dy;
    let snapV = false;
    let snapH = false;
    const SNAP_THRESHOLD = 14;

    if (active.target.kind === 'logo') {
      const w = active.initialWidth || 120;
      const h = active.initialHeight || 120;
      if (Math.abs(nextX + w / 2 - width / 2) <= SNAP_THRESHOLD) {
        nextX = width / 2 - w / 2;
        snapV = true;
      }
      if (Math.abs(nextY + h / 2 - height / 2) <= SNAP_THRESHOLD) {
        nextY = height / 2 - h / 2;
        snapH = true;
      }
      const clamped = clampPoint(
        nextX,
        nextY,
        0,
        width - Math.min(w, 120),
        0,
        height - Math.min(h, 120)
      );
      setSnapGuides({ verticalCenter: snapV, horizontalCenter: snapH });
      onMoveLogo(active.target.id, clamped.x, clamped.y);
      return;
    }

    if (Math.abs(nextX - width / 2) <= SNAP_THRESHOLD) {
      nextX = width / 2;
      snapV = true;
    }
    if (Math.abs(nextY - height / 2) <= SNAP_THRESHOLD) {
      nextY = height / 2;
      snapH = true;
    }

    const clamped = clampPoint(nextX, nextY);
    setSnapGuides({ verticalCenter: snapV, horizontalCenter: snapH });

    if (active.target.kind === 'builtin') {
      onMoveBuiltinBlock(active.target.key, clamped.x, clamped.y);
    } else if (active.target.kind === 'customText') {
      onMoveCustomText(active.target.id, clamped.x, clamped.y);
    }
  };

  const endDrag = (e: React.PointerEvent<SVGGElement>) => {
    const active = dragRef.current;
    if (!active || active.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setDraggingKey(null);
    setSnapGuides({ verticalCenter: false, horizontalCenter: false });
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore if already released
    }
  };

  const handleLayerKeyDown = (
    e: React.KeyboardEvent<SVGGElement>,
    currentX: number,
    currentY: number,
    onMove: (x: number, y: number) => void,
    minX = 24,
    maxX = width - 24,
    minY = 24,
    maxY = height - 24
  ) => {
    const step = e.shiftKey ? 24 : 6;
    let dx = 0;
    let dy = 0;
    if (e.key === 'ArrowLeft') dx = -step;
    else if (e.key === 'ArrowRight') dx = step;
    else if (e.key === 'ArrowUp') dy = -step;
    else if (e.key === 'ArrowDown') dy = step;
    else return;

    e.preventDefault();
    e.stopPropagation();
    const clamped = clampPoint(currentX + dx, currentY + dy, minX, maxX, minY, maxY);
    onMove(clamped.x, clamped.y);
  };

  const isSelected = (candidate: SelectedLayer): boolean => {
    if (!selectedLayer || !candidate || selectedLayer.kind !== candidate.kind) {
      return false;
    }
    if (selectedLayer.kind === 'builtin' && candidate.kind === 'builtin') {
      return selectedLayer.key === candidate.key;
    }
    if (selectedLayer.kind === 'customText' && candidate.kind === 'customText') {
      return selectedLayer.id === candidate.id;
    }
    if (selectedLayer.kind === 'logo' && candidate.kind === 'logo') {
      return selectedLayer.id === candidate.id;
    }
    return false;
  };

  const renderSelectionOutline = (
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    active: boolean,
    hovered: boolean
  ) => {
    if (!active && !hovered) return null;
    const tagWidth = Math.min(260, Math.max(110, label.length * 10 + 24));
    const tagY = y > 36 ? y - 30 : y + h + 6;
    return (
      <g data-editor-only="true" pointerEvents="none">
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={8}
          fill={active ? 'rgba(147, 51, 234, 0.06)' : 'transparent'}
          stroke={active ? '#a855f7' : 'rgba(168, 85, 247, 0.55)'}
          strokeWidth={active ? 3 : 2}
          strokeDasharray={active ? '10 6' : '6 6'}
        />
        {active && (
          <g>
            <rect x={x} y={tagY} width={tagWidth} height={26} rx={6} fill="#7e22ce" />
            <text
              x={x + 10}
              y={tagY + 18}
              fill="#ffffff"
              fontFamily="'Inter', sans-serif"
              fontSize="14"
              fontWeight="700"
            >
              {label}
            </text>
          </g>
        )}
      </g>
    );
  };

  /**
   * Shared renderer for all draggable pure-text layers (built-in and custom freeform).
   */
  const renderDraggableTextBlock = (params: {
    reactKey: string;
    target: Extract<DragTarget, { kind: 'builtin' | 'customText' }>;
    selectTarget: SelectedLayer;
    label: string;
    text: string;
    layout: Pick<
      PosterElementLayout,
      | 'x'
      | 'y'
      | 'fontFamily'
      | 'fontSize'
      | 'fontWeight'
      | 'color'
      | 'align'
      | 'letterSpacing'
      | 'maxWidth'
    >;
    lineHeightMultiplier?: number;
    onMove: (nx: number, ny: number) => void;
  }) => {
    const {
      reactKey,
      target,
      selectTarget,
      label,
      text,
      layout,
      lineHeightMultiplier = 1.24,
      onMove,
    } = params;

    const lines = wrapSvgText(
      text,
      layout.maxWidth || 860,
      layout.fontSize,
      layout.fontWeight,
      layout.fontFamily,
      layout.letterSpacing
    );
    const lineHeight = Math.round(layout.fontSize * lineHeightMultiplier);
    const measuredW = measureMaxLinesWidth(
      lines,
      layout.fontSize,
      layout.fontWeight,
      layout.fontFamily,
      layout.letterSpacing
    );
    const boxW = Math.min(width - 40, Math.max(120, Math.round(measuredW + 32)));
    const boxX =
      layout.align === 'center'
        ? layout.x - boxW / 2
        : layout.align === 'right'
        ? layout.x - boxW + 16
        : layout.x - 16;
    const boxY = layout.y - layout.fontSize * 0.92;
    const boxH = Math.max(
      layout.fontSize * 1.25,
      (lines.length - 1) * lineHeight + layout.fontSize * 1.3
    );

    const keyStr = layerKeyString(target);

    return (
      <g
        key={reactKey}
        tabIndex={0}
        role="button"
        aria-label={`Pindahkan ${label}. Gunakan tombol panah untuk menggeser, Shift+panah untuk langkah besar.`}
        className={`poster-drag-handle focus:outline-none ${
          draggingKey === keyStr ? 'dragging' : ''
        }`}
        onPointerEnter={() => setHoveredKey(keyStr)}
        onPointerLeave={() => setHoveredKey(null)}
        onPointerDown={(e) => startDrag(e, target, layout.x, layout.y)}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onLostPointerCapture={endDrag}
        onKeyDown={(e) => handleLayerKeyDown(e, layout.x, layout.y, onMove)}
      >
        <rect x={boxX} y={boxY} width={boxW} height={boxH} fill="transparent" />
        <text
          x={layout.x}
          y={layout.y}
          fill={layout.color}
          fontFamily={layout.fontFamily}
          fontWeight={layout.fontWeight}
          fontSize={layout.fontSize}
          textAnchor={alignToSvgAnchor(layout.align)}
          letterSpacing={layout.letterSpacing}
        >
          {lines.map((line, idx) => (
            <tspan key={idx} x={layout.x} dy={idx === 0 ? 0 : lineHeight}>
              {line}
            </tspan>
          ))}
        </text>
        {renderSelectionOutline(
          boxX,
          boxY,
          boxW,
          boxH,
          label,
          isSelected(selectTarget),
          hoveredKey === keyStr
        )}
      </g>
    );
  };

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

  // Box block geometries
  const detailsLayout = layoutMap.detailsBox;
  const detailsBoxW = Math.max(360, Math.min(1000, detailsLayout.maxWidth || 800));
  const detailsBoxLeft = detailsLayout.x - detailsBoxW / 2;
  const detailsTextX =
    detailsLayout.align === 'center'
      ? detailsLayout.x
      : detailsLayout.align === 'right'
      ? detailsBoxLeft + detailsBoxW - 36
      : detailsBoxLeft + 36;
  const detailsLineGap = Math.round(detailsLayout.fontSize * 1.65);
  const locationLines = wrapSvgText(
    `Lokasi: ${location}`,
    detailsBoxW - 72,
    Math.max(16, detailsLayout.fontSize - 2),
    detailsLayout.fontWeight,
    detailsLayout.fontFamily,
    detailsLayout.letterSpacing
  );
  const detailsBoxH = Math.max(
    160,
    92 + detailsLineGap + locationLines.length * Math.round(detailsLayout.fontSize * 1.32)
  );

  const cancelLayout = layoutMap.cancellationNotice;
  const cancelBoxW = Math.max(360, Math.min(1000, cancelLayout.maxWidth || 800));
  const cancelBoxLeft = cancelLayout.x - cancelBoxW / 2;
  const cancelLines = wrapSvgText(
    `PEMBERITAHUAN: ${cancellationReason}`,
    cancelBoxW - 60,
    cancelLayout.fontSize,
    cancelLayout.fontWeight,
    cancelLayout.fontFamily,
    cancelLayout.letterSpacing
  );
  const cancelLineH = Math.round(cancelLayout.fontSize * 1.3);
  const cancelBoxH = Math.max(76, 36 + cancelLines.length * cancelLineH);

  const badgeLayout = layoutMap.badge;
  const badgeW = Math.max(260, Math.min(900, badgeLayout.maxWidth || 440));
  const badgeLeft =
    badgeLayout.align === 'center'
      ? badgeLayout.x - badgeW / 2
      : badgeLayout.align === 'right'
      ? badgeLayout.x - badgeW
      : badgeLayout.x;
  const badgeTextX = badgeLeft + badgeW / 2;

  return (
    <div
      className={`w-full max-w-[480px] bg-black rounded-lg overflow-hidden shadow-2xl border border-slate-700/60 transition-all ${
        aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-square'
      }`}
    >
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full block"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) {
            onSelectLayer(null);
          }
        }}
      >
        <defs>
          <linearGradient id="gradEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="50%" stopColor="#022c22" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="gradModern" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          <linearGradient id="gradMidnight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="50%" stopColor="#090d16" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>

          <linearGradient id="gradSunset" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#451a03" />
            <stop offset="50%" stopColor="#7c2d12" />
            <stop offset="100%" stopColor="#18181b" />
          </linearGradient>

          <pattern id="liveIslamicPattern" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 30,0 L 60,30 L 30,60 L 0,30 Z"
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1.5"
            />
            <circle
              cx="30"
              cy="30"
              r="10"
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1.5"
            />
          </pattern>

          {logos
            .filter((logo) => logo.visible && logo.borderRadius > 0)
            .map((logo) => (
              <clipPath key={`clip-${logo.id}`} id={`logo-clip-${logo.id}`}>
                <rect
                  x={logo.x}
                  y={logo.y}
                  width={logo.width}
                  height={logo.height}
                  rx={logo.borderRadius}
                  ry={logo.borderRadius}
                />
              </clipPath>
            ))}
        </defs>

        {/* 1. Background Layer */}
        <g onPointerDown={() => onSelectLayer(null)}>
          {backgroundType === 'custom_image' && bgImageUrl ? (
            <image
              href={bgImageUrl}
              width={width}
              height={height}
              preserveAspectRatio="xMidYMid slice"
            />
          ) : presetStyle === 'modern_minimal' ? (
            <>
              <rect width={width} height={height} fill="url(#gradModern)" />
              <rect
                x="30"
                y="30"
                width={width - 60}
                height={height - 60}
                rx="16"
                fill="none"
                stroke="rgba(15, 23, 42, 0.08)"
                strokeWidth="3"
              />
            </>
          ) : presetStyle === 'midnight_gold' ? (
            <>
              <rect width={width} height={height} fill="url(#gradMidnight)" />
              <circle
                cx={width / 2}
                cy={height / 3}
                r="350"
                fill="rgba(217, 119, 6, 0.08)"
                filter="blur(40px)"
              />
              <rect
                x="40"
                y="40"
                width={width - 80}
                height={height - 80}
                rx="24"
                fill="none"
                stroke="rgba(251, 191, 36, 0.3)"
                strokeWidth="2"
              />
            </>
          ) : presetStyle === 'sunset_warm' ? (
            <>
              <rect width={width} height={height} fill="url(#gradSunset)" />
              <circle
                cx={width / 2}
                cy={height / 4}
                r="280"
                fill="rgba(249, 115, 22, 0.12)"
                filter="blur(30px)"
              />
              <rect
                x="40"
                y="40"
                width={width - 80}
                height={height - 80}
                rx="24"
                fill="none"
                stroke="rgba(251, 146, 60, 0.3)"
                strokeWidth="2"
              />
            </>
          ) : (
            <>
              <rect width={width} height={height} fill="url(#gradEmerald)" />
              <rect width={width} height={height} fill="url(#liveIslamicPattern)" />
              <rect
                x="40"
                y="40"
                width={width - 80}
                height={height - 80}
                rx="24"
                fill="none"
                stroke="rgba(22, 163, 74, 0.4)"
                strokeWidth="2"
              />
              <rect
                x="52"
                y="52"
                width={width - 104}
                height={height - 104}
                rx="20"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
              />
            </>
          )}
        </g>

        {/* 2. Uploaded Mosque / Organization Logos */}
        {logos
          .filter((logo) => logo.visible)
          .map((logo) => {
            const active = isSelected({ kind: 'logo', id: logo.id });
            const keyStr = `logo:${logo.id}`;
            const hovered = hoveredKey === keyStr;

            return (
              <React.Fragment key={logo.id}>
                <g
                  tabIndex={0}
                  role="button"
                  aria-label={`Pindahkan logo ${logo.name}. Gunakan tombol panah untuk menggeser.`}
                  className={`poster-drag-handle focus:outline-none ${
                    draggingKey === keyStr ? 'dragging' : ''
                  }`}
                  onPointerEnter={() => setHoveredKey(keyStr)}
                  onPointerLeave={() => setHoveredKey(null)}
                  onPointerDown={(e) =>
                    startDrag(
                      e,
                      { kind: 'logo', id: logo.id },
                      logo.x,
                      logo.y,
                      logo.width,
                      logo.height
                    )
                  }
                  onPointerMove={handlePointerMove}
                  onPointerUp={endDrag}
                  onLostPointerCapture={endDrag}
                  onKeyDown={(e) =>
                    handleLayerKeyDown(
                      e,
                      logo.x,
                      logo.y,
                      (nx, ny) => onMoveLogo(logo.id, nx, ny),
                      0,
                      width - Math.min(logo.width, 120),
                      0,
                      height - Math.min(logo.height, 120)
                    )
                  }
                >
                  <image
                    href={logo.imageUrl}
                    x={logo.x}
                    y={logo.y}
                    width={logo.width}
                    height={logo.height}
                    opacity={logo.opacity}
                    preserveAspectRatio="xMidYMid meet"
                    clipPath={logo.borderRadius > 0 ? `url(#logo-clip-${logo.id})` : undefined}
                  />
                  {renderSelectionOutline(
                    logo.x - 4,
                    logo.y - 4,
                    logo.width + 8,
                    logo.height + 8,
                    `Logo: ${logo.name}`,
                    active,
                    hovered
                  )}
                </g>

                {active && (
                  <g
                    data-editor-only="true"
                    className="cursor-nwse-resize"
                    style={{ touchAction: 'none' }}
                    onPointerDown={(e) =>
                      startDrag(
                        e,
                        { kind: 'logoResize', id: logo.id },
                        logo.x,
                        logo.y,
                        logo.width,
                        logo.height
                      )
                    }
                    onPointerMove={handlePointerMove}
                    onPointerUp={endDrag}
                    onLostPointerCapture={endDrag}
                  >
                    <circle
                      cx={logo.x + logo.width}
                      cy={logo.y + logo.height}
                      r={14}
                      fill="#ffffff"
                      stroke="#7e22ce"
                      strokeWidth={4}
                    />
                  </g>
                )}
              </React.Fragment>
            );
          })}

        {/* 3. Built-in Draggable Poster Blocks */}
        {layoutMap.basmalah.visible &&
          renderDraggableTextBlock({
            reactKey: 'builtin-basmalah',
            target: { kind: 'builtin', key: 'basmalah' },
            selectTarget: { kind: 'builtin', key: 'basmalah' },
            label: BUILTIN_BLOCK_META.basmalah.shortLabel,
            text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            layout: layoutMap.basmalah,
            onMove: (nx, ny) => onMoveBuiltinBlock('basmalah', nx, ny),
          })}

        {/* Status Badge */}
        {badgeLayout.visible && (() => {
          const keyStr = 'builtin:badge';
          return (
            <g
              tabIndex={0}
              role="button"
              aria-label={`Pindahkan ${BUILTIN_BLOCK_META.badge.label}. Gunakan tombol panah untuk menggeser.`}
              className={`poster-drag-handle focus:outline-none ${
                draggingKey === keyStr ? 'dragging' : ''
              }`}
              onPointerEnter={() => setHoveredKey(keyStr)}
              onPointerLeave={() => setHoveredKey(null)}
              onPointerDown={(e) =>
                startDrag(e, { kind: 'builtin', key: 'badge' }, badgeLayout.x, badgeLayout.y)
              }
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onLostPointerCapture={endDrag}
              onKeyDown={(e) =>
                handleLayerKeyDown(e, badgeLayout.x, badgeLayout.y, (nx, ny) =>
                  onMoveBuiltinBlock('badge', nx, ny)
                )
              }
            >
              <rect
                x={badgeLeft}
                y={badgeLayout.y}
                width={badgeW}
                height={48}
                rx={24}
                fill={badgeLayout.backgroundColor || badgeBg}
              />
              <text
                x={badgeTextX}
                y={badgeLayout.y + 30}
                fill={badgeLayout.color || '#ffffff'}
                fontFamily={badgeLayout.fontFamily}
                fontWeight={badgeLayout.fontWeight}
                fontSize={badgeLayout.fontSize}
                textAnchor="middle"
                letterSpacing={badgeLayout.letterSpacing}
              >
                {badgeText}
              </text>
              {renderSelectionOutline(
                badgeLeft - 6,
                badgeLayout.y - 6,
                badgeW + 12,
                60,
                BUILTIN_BLOCK_META.badge.shortLabel,
                isSelected({ kind: 'builtin', key: 'badge' }),
                hoveredKey === keyStr
              )}
            </g>
          );
        })()}

        {layoutMap.title.visible &&
          renderDraggableTextBlock({
            reactKey: 'builtin-title',
            target: { kind: 'builtin', key: 'title' },
            selectTarget: { kind: 'builtin', key: 'title' },
            label: BUILTIN_BLOCK_META.title.shortLabel,
            text: title,
            layout: layoutMap.title,
            lineHeightMultiplier: 1.22,
            onMove: (nx, ny) => onMoveBuiltinBlock('title', nx, ny),
          })}

        {layoutMap.speakerLabel.visible &&
          renderDraggableTextBlock({
            reactKey: 'builtin-speakerLabel',
            target: { kind: 'builtin', key: 'speakerLabel' },
            selectTarget: { kind: 'builtin', key: 'speakerLabel' },
            label: BUILTIN_BLOCK_META.speakerLabel.shortLabel,
            text: 'BERSAMA PEMATERI:',
            layout: layoutMap.speakerLabel,
            onMove: (nx, ny) => onMoveBuiltinBlock('speakerLabel', nx, ny),
          })}

        {layoutMap.speaker.visible &&
          renderDraggableTextBlock({
            reactKey: 'builtin-speaker',
            target: { kind: 'builtin', key: 'speaker' },
            selectTarget: { kind: 'builtin', key: 'speaker' },
            label: BUILTIN_BLOCK_META.speaker.shortLabel,
            text: speaker,
            layout: layoutMap.speaker,
            onMove: (nx, ny) => onMoveBuiltinBlock('speaker', nx, ny),
          })}

        {/* Cancellation Notice */}
        {statusType === 'cancelled' && cancelLayout.visible && (() => {
          const keyStr = 'builtin:cancellationNotice';
          return (
            <g
              tabIndex={0}
              role="button"
              aria-label={`Pindahkan ${BUILTIN_BLOCK_META.cancellationNotice.label}. Gunakan tombol panah untuk menggeser.`}
              className={`poster-drag-handle focus:outline-none ${
                draggingKey === keyStr ? 'dragging' : ''
              }`}
              onPointerEnter={() => setHoveredKey(keyStr)}
              onPointerLeave={() => setHoveredKey(null)}
              onPointerDown={(e) =>
                startDrag(
                  e,
                  { kind: 'builtin', key: 'cancellationNotice' },
                  cancelLayout.x,
                  cancelLayout.y
                )
              }
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onLostPointerCapture={endDrag}
              onKeyDown={(e) =>
                handleLayerKeyDown(e, cancelLayout.x, cancelLayout.y, (nx, ny) =>
                  onMoveBuiltinBlock('cancellationNotice', nx, ny)
                )
              }
            >
              <rect
                x={cancelBoxLeft}
                y={cancelLayout.y}
                width={cancelBoxW}
                height={cancelBoxH}
                rx={16}
                fill={cancelLayout.backgroundColor || '#fef2f2'}
                stroke={cancelLayout.borderColor || '#f87171'}
                strokeWidth={2}
              />
              <text
                x={cancelLayout.x}
                y={cancelLayout.y + 38}
                fill={cancelLayout.color || '#991b1b'}
                fontFamily={cancelLayout.fontFamily}
                fontWeight={cancelLayout.fontWeight}
                fontSize={cancelLayout.fontSize}
                textAnchor="middle"
                letterSpacing={cancelLayout.letterSpacing}
              >
                {cancelLines.map((line, idx) => (
                  <tspan key={idx} x={cancelLayout.x} dy={idx === 0 ? 0 : cancelLineH}>
                    {line}
                  </tspan>
                ))}
              </text>
              {renderSelectionOutline(
                cancelBoxLeft - 6,
                cancelLayout.y - 6,
                cancelBoxW + 12,
                cancelBoxH + 12,
                BUILTIN_BLOCK_META.cancellationNotice.shortLabel,
                isSelected({ kind: 'builtin', key: 'cancellationNotice' }),
                hoveredKey === keyStr
              )}
            </g>
          );
        })()}

        {/* Details Box */}
        {detailsLayout.visible && (() => {
          const keyStr = 'builtin:detailsBox';
          const isLight = presetStyle === 'modern_minimal';
          const textAnchor = alignToSvgAnchor(detailsLayout.align);
          const subColor = isLight ? '#334155' : '#e2e8f0';
          const locColor = isLight ? '#0284c7' : '#93c5fd';

          return (
            <g
              tabIndex={0}
              role="button"
              aria-label={`Pindahkan ${BUILTIN_BLOCK_META.detailsBox.label}. Gunakan tombol panah untuk menggeser.`}
              className={`poster-drag-handle focus:outline-none ${
                draggingKey === keyStr ? 'dragging' : ''
              }`}
              onPointerEnter={() => setHoveredKey(keyStr)}
              onPointerLeave={() => setHoveredKey(null)}
              onPointerDown={(e) =>
                startDrag(
                  e,
                  { kind: 'builtin', key: 'detailsBox' },
                  detailsLayout.x,
                  detailsLayout.y
                )
              }
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onLostPointerCapture={endDrag}
              onKeyDown={(e) =>
                handleLayerKeyDown(e, detailsLayout.x, detailsLayout.y, (nx, ny) =>
                  onMoveBuiltinBlock('detailsBox', nx, ny)
                )
              }
            >
              <rect
                x={detailsBoxLeft}
                y={detailsLayout.y}
                width={detailsBoxW}
                height={detailsBoxH}
                rx={20}
                fill={detailsLayout.backgroundColor || 'rgba(15, 23, 42, 0.78)'}
                stroke={
                  detailsLayout.borderColor ||
                  (isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.18)')
                }
                strokeWidth={1.5}
              />
              <text
                x={detailsTextX}
                y={detailsLayout.y + 48}
                fill={detailsLayout.color}
                fontFamily={detailsLayout.fontFamily}
                fontWeight={detailsLayout.fontWeight}
                fontSize={detailsLayout.fontSize}
                textAnchor={textAnchor}
                letterSpacing={detailsLayout.letterSpacing}
              >
                Hari / Tanggal: {dateText}
              </text>
              <text
                x={detailsTextX}
                y={detailsLayout.y + 48 + detailsLineGap}
                fill={subColor}
                fontFamily={detailsLayout.fontFamily}
                fontWeight="500"
                fontSize={Math.max(16, detailsLayout.fontSize - 1)}
                textAnchor={textAnchor}
                letterSpacing={detailsLayout.letterSpacing}
              >
                Waktu: {timeText}
              </text>
              <text
                x={detailsTextX}
                y={detailsLayout.y + 48 + detailsLineGap * 2}
                fill={locColor}
                fontFamily={detailsLayout.fontFamily}
                fontWeight="700"
                fontSize={Math.max(16, detailsLayout.fontSize - 2)}
                textAnchor={textAnchor}
                letterSpacing={detailsLayout.letterSpacing}
              >
                {locationLines.map((line, idx) => (
                  <tspan
                    key={idx}
                    x={detailsTextX}
                    dy={idx === 0 ? 0 : Math.round(detailsLayout.fontSize * 1.3)}
                  >
                    {line}
                  </tspan>
                ))}
              </text>

              {renderSelectionOutline(
                detailsBoxLeft - 6,
                detailsLayout.y - 6,
                detailsBoxW + 12,
                detailsBoxH + 12,
                BUILTIN_BLOCK_META.detailsBox.shortLabel,
                isSelected({ kind: 'builtin', key: 'detailsBox' }),
                hoveredKey === keyStr
              )}
            </g>
          );
        })()}

        {layoutMap.footer.visible &&
          renderDraggableTextBlock({
            reactKey: 'builtin-footer',
            target: { kind: 'builtin', key: 'footer' },
            selectTarget: { kind: 'builtin', key: 'footer' },
            label: BUILTIN_BLOCK_META.footer.shortLabel,
            text: footerText,
            layout: layoutMap.footer,
            onMove: (nx, ny) => onMoveBuiltinBlock('footer', nx, ny),
          })}

        {/* 4. Custom Freeform Text Blocks */}
        {customTextBlocks
          .filter((block) => block.visible)
          .map((block) =>
            renderDraggableTextBlock({
              reactKey: block.id,
              target: { kind: 'customText', id: block.id },
              selectTarget: { kind: 'customText', id: block.id },
              label: block.label,
              text: block.text || 'Teks Baru',
              layout: block,
              onMove: (nx, ny) => onMoveCustomText(block.id, nx, ny),
            })
          )}

        {/* 5. Smart Snap Guides (Editor Only, Stripped on Export) */}
        {snapGuides.verticalCenter && (
          <line
            data-editor-only="true"
            x1={width / 2}
            y1={0}
            x2={width / 2}
            y2={height}
            stroke="#c084fc"
            strokeWidth={2.5}
            strokeDasharray="12 8"
            pointerEvents="none"
          />
        )}
        {snapGuides.horizontalCenter && (
          <line
            data-editor-only="true"
            x1={0}
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke="#38bdf8"
            strokeWidth={2.5}
            strokeDasharray="12 8"
            pointerEvents="none"
          />
        )}
      </svg>
    </div>
  );
};
