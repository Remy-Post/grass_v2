'use client';

import { useEffect, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { ChevronsLeftRight } from 'lucide-react';
import { useViewportScrollProgress } from '@/lib/scroll-motion';

type Props = {
  beforeLabel: string;
  afterLabel: string;
};

const MIN_REVEAL = 2;
const MAX_REVEAL = 98;
const KEYBOARD_STEP = 4;
const KEYBOARD_LARGE_STEP = 10;

function clampReveal(value: number) {
  return Math.max(MIN_REVEAL, Math.min(MAX_REVEAL, value));
}

export function TransformationSlider({ beforeLabel, afterLabel }: Props) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const userInteractedRef = useRef(false);

  const reveal = useMotionValue(50);

  const scrollYProgress = useViewportScrollProgress(figureRef, ['start 80%', 'end 30%']);
  const scrollReveal = useTransform(scrollYProgress, [0, 1], [12, 88]);

  useMotionValueEvent(scrollReveal, 'change', (v) => {
    if (!userInteractedRef.current && !reduceMotion) {
      reveal.set(v);
    }
  });

  useEffect(() => {
    const unsub = reveal.on('change', (v) => {
      const node = figureRef.current;
      if (node) {
        node.style.setProperty('--reveal', `${v}%`);
      }
    });
    return () => unsub();
  }, [reveal]);

  useEffect(() => {
    if (!userInteractedRef.current && !reduceMotion) {
      reveal.set(scrollReveal.get());
    }
  }, [reduceMotion, reveal, scrollReveal]);

  const setReveal = (pct: number, markUserInteracted = false) => {
    reveal.set(clampReveal(pct));
    if (markUserInteracted) {
      userInteractedRef.current = true;
    }
  };

  const setRevealFromClientX = (clientX: number) => {
    const node = figureRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setReveal(pct, true);
  };

  const nudgeReveal = (delta: number) => {
    setReveal(reveal.get() + delta, true);
  };

  if (reduceMotion) {
    return (
      <div ref={containerRef} className="grid gap-4 sm:grid-cols-2">
        <StaticPane variant="before" label={beforeLabel} />
        <StaticPane variant="after" label={afterLabel} />
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <figure
        ref={figureRef}
        className="relative aspect-[16/9] w-full select-none overflow-hidden rounded-xl border border-line bg-bg shadow-sm"
        style={{ '--reveal': '50%', touchAction: 'pan-y' } as React.CSSProperties}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          setRevealFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            setRevealFromClientX(e.clientX);
          }
        }}
        onPointerUp={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        }}
        onPointerCancel={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        }}
      >
        <Pane variant="before" />
        <div
          className="absolute inset-0"
          style={{ clipPath: 'inset(0 calc(100% - var(--reveal)) 0 0)' }}
        >
          <Pane variant="after" />
        </div>

        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-medium text-ink-soft shadow-sm backdrop-blur">
          {beforeLabel}
        </span>
        <span
          className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-medium text-ink-soft shadow-sm backdrop-blur"
          style={{ opacity: 'min(calc((var(--reveal) - 30) / 50), 1)' }}
        >
          {afterLabel}
        </span>

        <div
          className="pointer-events-none absolute top-0 bottom-0 w-px bg-surface mix-blend-difference"
          style={{ left: 'var(--reveal)' }}
          aria-hidden
        />

        <div
          className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: 'var(--reveal)' }}
        >
          <motion.button
            type="button"
            className="grid h-11 w-11 cursor-ew-resize place-items-center rounded-full border border-line bg-surface text-ink shadow-md backdrop-blur focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Drag to compare before and after"
            onKeyDown={(e) => {
              const step = e.shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP;
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                nudgeReveal(-step);
              }
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                nudgeReveal(step);
              }
              if (e.key === 'Home') {
                e.preventDefault();
                setReveal(MIN_REVEAL, true);
              }
              if (e.key === 'End') {
                e.preventDefault();
                setReveal(MAX_REVEAL, true);
              }
            }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
          >
            <ChevronsLeftRight className="h-5 w-5" aria-hidden />
          </motion.button>
        </div>

        <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-bg/90 px-2.5 py-1 text-xs font-medium text-ink shadow-sm backdrop-blur">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
          Drag · scroll · explore
        </span>
      </figure>
    </div>
  );
}

function Pane({ variant }: { variant: 'before' | 'after' }) {
  const filterId = `noise-${variant}`;
  return (
    <div className="absolute inset-0">
      <div
        className={
          variant === 'before'
            ? 'absolute inset-0 bg-gradient-to-br from-amber-200 via-yellow-200 to-amber-400'
            : 'absolute inset-0 bg-gradient-to-br from-emerald-200 via-grass/70 to-emerald-500'
        }
      />
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full opacity-40 mix-blend-overlay"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id={filterId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency={variant === 'before' ? 0.85 : 0.55}
              numOctaves="2"
              seed={variant === 'before' ? 7 : 13}
            />
            <feColorMatrix
              type="matrix"
              values={
                variant === 'before'
                  ? '0 0 0 0 0.5  0 0 0 0 0.35  0 0 0 0 0.1  0 0 0 1 0'
                  : '0 0 0 0 0.18  0 0 0 0 0.42  0 0 0 0 0.16  0 0 0 1 0'
              }
            />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
      <div
        aria-hidden
        className={
          variant === 'before'
            ? 'absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-amber-700/30 to-transparent'
            : 'absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-emerald-700/30 to-transparent'
        }
      />
    </div>
  );
}

function StaticPane({ variant, label }: { variant: 'before' | 'after'; label: string }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-line">
      <div className="relative aspect-video">
        <Pane variant={variant} />
      </div>
      <figcaption className="border-t border-line bg-bg px-4 py-2 text-sm font-medium text-ink-muted">
        {label}
      </figcaption>
    </figure>
  );
}
