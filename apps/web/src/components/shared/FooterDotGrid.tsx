'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useReducedMotion } from 'framer-motion';

export const FOOTER_DOT_GRID_ROWS = 14;
export const FOOTER_DOT_GRID_COLUMNS = {
  desktop: 52,
  tablet: 24,
  mobile: 22,
} as const;

const DEFAULT_MODE = 'desktop';
const DEFAULT_COLS = FOOTER_DOT_GRID_COLUMNS[DEFAULT_MODE];
const PATTERN_SIZE = 18;
const TOTAL_DURATION_MS = 1000;
const FIGURE_PAUSE_MS = 1000;
const GROUPS = 20;
const CLOUD_RADIUS = 12;
const BASE_OPACITY = 0.15;
const CHAOS_OPACITY = 0.35;
const MAX_MOUSE_DISTANCE = 200;
const MIN_MOUSE_SCALE = 0.25;

export const FOOTER_DOT_GRID_SHAPES = ['spark', 'heart', 'diamond', 'balloon'] as const;

type DotGridMode = keyof typeof FOOTER_DOT_GRID_COLUMNS;
type ShapeName = (typeof FOOTER_DOT_GRID_SHAPES)[number];
type DotVisual = {
  active: boolean;
  delay: number;
  opacity: number;
};

const PATTERNS: Record<ShapeName, readonly string[]> = {
  spark: [
    '------------------',
    '------------------',
    '------------------',
    '--------11--------',
    '-----1--11--1-----',
    '----111-11-111----',
    '-----11----11-----',
    '------------------',
    '---111------111---',
    '---111------111---',
    '------------------',
    '-----11----11-----',
    '----111-11-111----',
    '-----1--11--1-----',
    '--------11--------',
    '------------------',
    '------------------',
    '------------------',
  ],
  heart: [
    '------------------',
    '------------------',
    '------------------',
    '------------------',
    '------11--11------',
    '----1111111111----',
    '---111111111111---',
    '---111111111111---',
    '---111111111111---',
    '----1111111111----',
    '-----11111111-----',
    '------111111------',
    '-------1111-------',
    '--------11--------',
    '------------------',
    '------------------',
    '------------------',
    '------------------',
  ],
  diamond: [
    '------------------',
    '------------------',
    '------------------',
    '--------1---------',
    '--------11--------',
    '--------11--------',
    '-------1111-------',
    '------111111------',
    '----1111--11111---',
    '---11111--1111----',
    '------111111------',
    '-------1111-------',
    '--------11--------',
    '--------11--------',
    '---------1--------',
    '------------------',
    '------------------',
    '------------------',
  ],
  balloon: [
    '------------------',
    '------------------',
    '------------------',
    '-------1111-------',
    '------111111------',
    '-----11111111-----',
    '-----11111111-----',
    '-----11111111-----',
    '------111111------',
    '-------1111-------',
    '------111111------',
    '-----111--111-----',
    '----11------11----',
    '----11------11----',
    '----1--------1----',
    '------------------',
    '------------------',
    '------------------',
  ],
};

const INACTIVE_DOT: DotVisual = {
  active: false,
  delay: 0,
  opacity: BASE_OPACITY,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getMode(width: number): DotGridMode {
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

export function buildShapeMask(
  name: ShapeName,
  cols: number = DEFAULT_COLS,
  rows: number = FOOTER_DOT_GRID_ROWS,
): Uint8Array {
  const out = new Uint8Array(cols * rows);
  const cx = Math.floor(cols / 2);
  const cy = Math.floor(rows / 2);

  PATTERNS[name].forEach((patternRow, r) => {
    [...patternRow].forEach((mark, i) => {
      if (mark !== '1') return;

      const col = cx - PATTERN_SIZE / 2 + i;
      const row = cy - PATTERN_SIZE / 2 + r;

      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        out[row * cols + col] = 1;
      }
    });
  });

  return out;
}

function buildCloudVisuals(cols: number, randomize: boolean): DotVisual[] {
  const rows = FOOTER_DOT_GRID_ROWS;
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

function buildPatternVisuals(name: ShapeName, cols: number, randomize: boolean): DotVisual[] {
  const mask = buildShapeMask(name, cols);
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

export function FooterDotGrid() {
  const reduceMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<DotGridMode>(DEFAULT_MODE);
  const cols = FOOTER_DOT_GRID_COLUMNS[mode];
  const total = cols * FOOTER_DOT_GRID_ROWS;
  const [visuals, setVisuals] = useState<DotVisual[]>(() => buildCloudVisuals(DEFAULT_COLS, false));

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
      setVisuals(buildPatternVisuals(FOOTER_DOT_GRID_SHAPES[0], cols, false));
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

      const shape = FOOTER_DOT_GRID_SHAPES[shapeIndex] ?? FOOTER_DOT_GRID_SHAPES[0];
      setVisuals(buildPatternVisuals(shape, cols, true));

      timer = window.setTimeout(() => {
        timer = null;
        if (!canRun()) return;

        shapeIndex = (shapeIndex + 1) % FOOTER_DOT_GRID_SHAPES.length;
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

    const dotNodes = Array.from(node.querySelectorAll<HTMLElement>('.footer-dot'));
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
    <div className="border-t border-line bg-surface-alt">
      <div className="mx-auto w-full overflow-hidden px-4 py-8">
        <div
          ref={gridRef}
          aria-hidden="true"
          className="footer-dot-grid"
          style={
            {
              '--cols': cols,
              '--rows': FOOTER_DOT_GRID_ROWS,
            } as CSSProperties
          }
        >
          {dots.map((i) => {
            const visual = displayVisuals[i] ?? INACTIVE_DOT;

            return (
              <span
                key={i}
                className="footer-dot"
                data-active={visual.active ? '1' : '0'}
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
    </div>
  );
}
