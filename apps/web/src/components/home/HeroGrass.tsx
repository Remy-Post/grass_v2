'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useIsTouch } from '@/lib/motion';

export const HERO_DOT_GRID_ROWS = 44;
export const HERO_DOT_GRID_COLUMNS = {
  desktop: 42,
  tablet: 38,
  mobile: 34,
} as const;
export const HERO_DOT_GRID_SHAPES = ['mower', 'leaf', 'flower', 'tulip'] as const;

const DEFAULT_MODE = 'desktop';
const DEFAULT_COLS = HERO_DOT_GRID_COLUMNS[DEFAULT_MODE];
const TOTAL_DURATION_MS = 1000;
const FIGURE_PAUSE_MS = 1000;
const GROUPS = 20;
const CLOUD_RADIUS = 16;
const BASE_OPACITY = 0.15;
const CHAOS_OPACITY = 0.35;
const MAX_MOUSE_DISTANCE = 200;
const MIN_MOUSE_SCALE = 0.25;

type HeroDotGridMode = keyof typeof HERO_DOT_GRID_COLUMNS;
type HeroShapeName = (typeof HERO_DOT_GRID_SHAPES)[number];
type DotVisual = {
  active: boolean;
  delay: number;
  opacity: number;
};

const INACTIVE_DOT: DotVisual = {
  active: false,
  delay: 0,
  opacity: BASE_OPACITY,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getMode(width: number): HeroDotGridMode {
  if (width >= 992) return 'desktop';
  if (width >= 768) return 'tablet';
  return 'mobile';
}

function createStaggerDelays(total: number, randomize: boolean): number[] {
  const delays = Array.from({ length: total }, () => 0);
  if (!randomize) return delays;

  const shuffled = Array.from({ length: total }, (_, i) => i).sort(() => Math.random() - 0.5);
  const groupSize = Math.ceil(total / GROUPS);
  const staggerGroup = TOTAL_DURATION_MS / GROUPS;
  const staggerInside = staggerGroup / 4;

  shuffled.forEach((dotIndex, shuffledIndex) => {
    const groupIndex = Math.floor(shuffledIndex / groupSize);
    delays[dotIndex] = groupIndex * staggerGroup + Math.random() * staggerInside;
  });

  return delays;
}

function distanceToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const lengthSq = vx * vx + vy * vy;
  const t = lengthSq === 0 ? 0 : clamp((wx * vx + wy * vy) / lengthSq, 0, 1);
  const cx = ax + vx * t;
  const cy = ay + vy * t;

  return Math.hypot(px - cx, py - cy);
}

function inEllipse(
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): boolean {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;

  return dx * dx + dy * dy <= 1;
}

function inRotatedEllipse(
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angle: number,
): boolean {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = x - cx;
  const dy = y - cy;
  const xr = dx * cos + dy * sin;
  const yr = -dx * sin + dy * cos;

  return (xr / rx) * (xr / rx) + (yr / ry) * (yr / ry) <= 1;
}

function buildMowerMask(cols: number, rows: number): Uint8Array {
  const out = new Uint8Array(cols * rows);

  for (let i = 0; i < out.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col / (cols - 1);
    const y = row / (rows - 1);
    const deck = x >= 0.16 && x <= 0.72 && y >= 0.55 && y <= 0.69;
    const engine = x >= 0.28 && x <= 0.5 && y >= 0.41 && y <= 0.55;
    const frontNose = inEllipse(x, y, 0.71, 0.62, 0.09, 0.08) && x >= 0.64;
    const handle = distanceToSegment(x, y, 0.66, 0.52, 0.91, 0.22) < 0.035;
    const grip = distanceToSegment(x, y, 0.85, 0.22, 0.95, 0.22) < 0.035;
    const wheel =
      inEllipse(x, y, 0.25, 0.75, 0.08, 0.08) ||
      inEllipse(x, y, 0.66, 0.75, 0.08, 0.08);
    const cutLine = x >= 0.1 && x <= 0.86 && y >= 0.84 && y <= 0.89 && (col + row) % 3 !== 0;

    if (deck || engine || frontNose || handle || grip || wheel || cutLine) out[i] = 1;
  }

  return out;
}

function buildLeafMask(cols: number, rows: number): Uint8Array {
  const out = new Uint8Array(cols * rows);

  for (let i = 0; i < out.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col / (cols - 1);
    const y = row / (rows - 1);
    const blade = inRotatedEllipse(x, y, 0.5, 0.49, 0.34, 0.18, -0.7);
    const vein = distanceToSegment(x, y, 0.27, 0.7, 0.74, 0.27) < 0.025;
    const sideVeinA = distanceToSegment(x, y, 0.42, 0.55, 0.28, 0.44) < 0.018;
    const sideVeinB = distanceToSegment(x, y, 0.5, 0.48, 0.63, 0.39) < 0.018;
    const sideVeinC = distanceToSegment(x, y, 0.55, 0.42, 0.42, 0.32) < 0.018;
    const stem = distanceToSegment(x, y, 0.16, 0.84, 0.32, 0.66) < 0.03;

    if (blade || vein || sideVeinA || sideVeinB || sideVeinC || stem) out[i] = 1;
  }

  return out;
}

function buildFlowerMask(cols: number, rows: number): Uint8Array {
  const out = new Uint8Array(cols * rows);

  for (let i = 0; i < out.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col / (cols - 1);
    const y = row / (rows - 1);
    const center = inEllipse(x, y, 0.5, 0.33, 0.07, 0.07);
    const petal =
      inEllipse(x, y, 0.5, 0.18, 0.09, 0.12) ||
      inEllipse(x, y, 0.65, 0.29, 0.12, 0.09) ||
      inEllipse(x, y, 0.59, 0.46, 0.1, 0.12) ||
      inEllipse(x, y, 0.41, 0.46, 0.1, 0.12) ||
      inEllipse(x, y, 0.35, 0.29, 0.12, 0.09);
    const stem = distanceToSegment(x, y, 0.5, 0.42, 0.5, 0.86) < 0.028;
    const leafA = inRotatedEllipse(x, y, 0.36, 0.67, 0.14, 0.06, -0.45);
    const leafB = inRotatedEllipse(x, y, 0.64, 0.73, 0.14, 0.06, 0.45);
    const soil = x >= 0.28 && x <= 0.72 && y >= 0.9 && y <= 0.94 && (col + row) % 2 === 0;

    if (center || petal || stem || leafA || leafB || soil) out[i] = 1;
  }

  return out;
}

function buildSpadeMask(cols: number, rows: number): Uint8Array {
  const out = new Uint8Array(cols * rows);

  for (let i = 0; i < out.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col / (cols - 1);
    const y = row / (rows - 1);
    const grip =
      inEllipse(x, y, 0.5, 0.14, 0.13, 0.08) &&
      !inEllipse(x, y, 0.5, 0.14, 0.07, 0.035);
    const shaft = distanceToSegment(x, y, 0.5, 0.2, 0.5, 0.58) < 0.03;
    const collar = x >= 0.41 && x <= 0.59 && y >= 0.56 && y <= 0.63;
    const blade =
      inEllipse(x, y, 0.5, 0.76, 0.18, 0.22) &&
      y >= 0.6 &&
      y <= 0.93 &&
      Math.abs(x - 0.5) < 0.26 - (y - 0.6) * 0.23;
    const bladeTip = Math.abs(x - 0.5) < 0.04 && y >= 0.9 && y <= 0.98;

    if (grip || shaft || collar || blade || bladeTip) out[i] = 1;
  }

  return out;
}

function rotateMask180(mask: Uint8Array, cols: number, rows: number): Uint8Array {
  const out = new Uint8Array(mask.length);

  for (let i = 0; i < mask.length; i++) {
    if (mask[i] !== 1) continue;

    const col = i % cols;
    const row = Math.floor(i / cols);
    const rotatedCol = cols - 1 - col;
    const rotatedRow = rows - 1 - row;
    out[rotatedRow * cols + rotatedCol] = 1;
  }

  return out;
}

function buildTulipMask(cols: number, rows: number): Uint8Array {
  return rotateMask180(buildSpadeMask(cols, rows), cols, rows);
}

function centerMask(mask: Uint8Array, cols: number, rows: number): Uint8Array {
  let minCol = cols;
  let maxCol = -1;
  let minRow = rows;
  let maxRow = -1;

  for (let i = 0; i < mask.length; i++) {
    if (mask[i] !== 1) continue;

    const col = i % cols;
    const row = Math.floor(i / cols);
    minCol = Math.min(minCol, col);
    maxCol = Math.max(maxCol, col);
    minRow = Math.min(minRow, row);
    maxRow = Math.max(maxRow, row);
  }

  if (maxCol < 0 || maxRow < 0) return mask;

  const targetColCenter = (cols - 1) / 2;
  const targetRowCenter = (rows - 1) / 2;
  const maskColCenter = (minCol + maxCol) / 2;
  const maskRowCenter = (minRow + maxRow) / 2;
  const colShift = clamp(
    Math.round(targetColCenter - maskColCenter),
    -minCol,
    cols - 1 - maxCol,
  );
  const rowShift = clamp(
    Math.round(targetRowCenter - maskRowCenter),
    -minRow,
    rows - 1 - maxRow,
  );

  if (colShift === 0 && rowShift === 0) return mask;

  const centered = new Uint8Array(mask.length);
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] !== 1) continue;

    const col = i % cols;
    const row = Math.floor(i / cols);
    const shiftedCol = col + colShift;
    const shiftedRow = row + rowShift;
    centered[shiftedRow * cols + shiftedCol] = 1;
  }

  return centered;
}

export function buildHeroShapeMask(
  name: HeroShapeName,
  cols: number = DEFAULT_COLS,
  rows: number = HERO_DOT_GRID_ROWS,
): Uint8Array {
  const mask =
    name === 'mower'
      ? buildMowerMask(cols, rows)
      : name === 'leaf'
        ? buildLeafMask(cols, rows)
        : name === 'flower'
          ? buildFlowerMask(cols, rows)
          : buildTulipMask(cols, rows);

  return centerMask(mask, cols, rows);
}

function buildCloudVisuals(cols: number, randomize: boolean): DotVisual[] {
  const rows = HERO_DOT_GRID_ROWS;
  const total = cols * rows;
  const delays = createStaggerDelays(total, randomize);
  const cx = Math.floor(cols / 2);
  const cy = Math.floor(rows / 2);

  return Array.from({ length: total }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const dist = Math.hypot(col - cx, row - cy);
    const coreFactor = Math.max(0, 1 - dist / CLOUD_RADIUS);
    const chaos = randomize ? (Math.random() - 0.5) * CHAOS_OPACITY : 0;
    const opacity = clamp(BASE_OPACITY + coreFactor * 0.7 + chaos, BASE_OPACITY, 1);

    return {
      active: opacity >= 0.45,
      delay: delays[i] ?? 0,
      opacity,
    };
  });
}

function buildPatternVisuals(
  name: HeroShapeName,
  cols: number,
  randomize: boolean,
): DotVisual[] {
  const mask = buildHeroShapeMask(name, cols, HERO_DOT_GRID_ROWS);
  const delays = createStaggerDelays(mask.length, randomize);

  return Array.from(mask, (on, i) => ({
    active: on === 1,
    delay: delays[i] ?? 0,
    opacity: on === 1 ? 1 : BASE_OPACITY,
  }));
}

function resetMouseScale(dots: HTMLElement[]) {
  dots.forEach((dot) => dot.style.setProperty('--mouse-scale', '1'));
}

export function HeroGrass() {
  const reduceMotion = useReducedMotion();
  const isTouch = useIsTouch();
  const gridRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<HeroDotGridMode>(DEFAULT_MODE);
  const cols = HERO_DOT_GRID_COLUMNS[mode];
  const total = cols * HERO_DOT_GRID_ROWS;
  const [visuals, setVisuals] = useState<DotVisual[]>(() =>
    buildCloudVisuals(DEFAULT_COLS, false),
  );

  const dots = useMemo(() => Array.from({ length: total }, (_, i) => i), [total]);
  const fallbackVisuals = useMemo(() => buildCloudVisuals(cols, false), [cols]);
  const displayVisuals = visuals.length === total ? visuals : fallbackVisuals;

  useEffect(() => {
    const updateMode = () => setMode(getMode(window.innerWidth));

    updateMode();
    window.addEventListener('resize', updateMode);

    return () => window.removeEventListener('resize', updateMode);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setVisuals(buildPatternVisuals(HERO_DOT_GRID_SHAPES[0], cols, false));
      return;
    }

    let visible = true;
    let timer: number | null = null;
    let shapeIndex = 0;
    const node = gridRef.current;

    const clearTimer = () => {
      if (timer != null) {
        window.clearTimeout(timer);
        timer = null;
      }
    };

    const canRun = () => visible && !document.hidden;

    const cycle = () => {
      timer = null;
      if (!canRun()) return;

      const shape = HERO_DOT_GRID_SHAPES[shapeIndex] ?? HERO_DOT_GRID_SHAPES[0];
      setVisuals(buildPatternVisuals(shape, cols, true));

      timer = window.setTimeout(() => {
        timer = null;
        if (!canRun()) return;

        shapeIndex = (shapeIndex + 1) % HERO_DOT_GRID_SHAPES.length;
        setVisuals(buildCloudVisuals(cols, true));
        timer = window.setTimeout(cycle, TOTAL_DURATION_MS);
      }, TOTAL_DURATION_MS + FIGURE_PAUSE_MS);
    };

    const start = () => {
      if (timer != null || !canRun()) return;
      setVisuals(buildCloudVisuals(cols, true));
      timer = window.setTimeout(cycle, TOTAL_DURATION_MS);
    };

    const stop = () => clearTimer();

    start();

    let observer: IntersectionObserver | null = null;
    if (node && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          visible = entry ? entry.isIntersecting : true;
          if (visible) start();
          else stop();
        },
        { threshold: 0.05 },
      );
      observer.observe(node);
    }

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [cols, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;

    const node = gridRef.current;
    if (!node) return;

    const dotNodes = Array.from(node.querySelectorAll<HTMLElement>('.hero-dot'));
    let frame: number | null = null;
    let mouseX = 0;
    let mouseY = 0;

    const updateScales = () => {
      frame = null;
      dotNodes.forEach((dot) => {
        const rect = dot.getBoundingClientRect();
        const dotX = rect.left + rect.width / 2;
        const dotY = rect.top + rect.height / 2;
        const dist = Math.hypot(dotX - mouseX, dotY - mouseY);
        const proximity = Math.max(0, (MAX_MOUSE_DISTANCE - dist) / MAX_MOUSE_DISTANCE);
        const scale = 1 - (1 - MIN_MOUSE_SCALE) * proximity;

        dot.style.setProperty('--mouse-scale', clamp(scale, MIN_MOUSE_SCALE, 1).toFixed(3));
      });
    };

    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (frame == null) {
        frame = window.requestAnimationFrame(updateScales);
      }
    };

    const onPointerOut = (e: PointerEvent) => {
      if (e.relatedTarget == null) resetMouseScale(dotNodes);
    };

    const onBlur = () => resetMouseScale(dotNodes);

    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerout', onPointerOut);
    window.addEventListener('blur', onBlur);

    return () => {
      if (frame != null) window.cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('blur', onBlur);
    };
  }, [cols, reduceMotion]);

  return (
    <div
      className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl border border-line shadow-sm sm:aspect-[4/3] lg:aspect-[5/6]"
      style={{
        background:
          'linear-gradient(to bottom, #d6e8f0 0%, #e8f1d9 50%, #d7eaa4 74%, #98cf41 100%)',
      }}
      role="img"
      aria-label="Footer-style animated dot yard preview"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 grid place-items-center px-3 py-8"
      >
        <div
          ref={gridRef}
          className="footer-dot-grid hero-dot-grid"
          style={
            {
              '--cols': cols,
              '--rows': HERO_DOT_GRID_ROWS,
            } as CSSProperties
          }
        >
          {dots.map((i) => {
            const visual = displayVisuals[i] ?? INACTIVE_DOT;

            return (
              <span
                key={i}
                className="footer-dot hero-dot"
                data-active={visual.active ? '1' : '0'}
                data-hero-dot={i}
                style={
                  {
                    '--dot-opacity': visual.opacity.toFixed(3),
                    '--delay': `${visual.delay.toFixed(0)}ms`,
                  } as CSSProperties
                }
              />
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-medium text-ink-soft shadow-sm backdrop-blur">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-grass" />
        {reduceMotion
          ? 'Dot preview'
          : isTouch
            ? 'Tap and watch the dots'
            : 'Move your cursor - garden dots'}
      </div>

      <div className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-bg/90 px-2.5 py-1 text-xs font-medium text-ink shadow-sm backdrop-blur">
        Bradford ON
      </div>
    </div>
  );
}
