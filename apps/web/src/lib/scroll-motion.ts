'use client';

import { useEffect, type RefObject } from 'react';
import { useMotionValue } from 'framer-motion';

type ViewportOffset = readonly [string, string];

type ScrollProgressInput = {
  scrollY: number;
  viewportHeight: number;
  targetTop: number;
  targetHeight: number;
};

const DEFAULT_OFFSET: ViewportOffset = ['start end', 'end start'];

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function resolvePoint(point: string, length: number): number {
  if (point === 'start') return 0;
  if (point === 'center') return length / 2;
  if (point === 'end') return length;
  if (point.endsWith('%')) return (Number.parseFloat(point) / 100) * length;
  if (point.endsWith('px')) return Number.parseFloat(point);

  const numeric = Number.parseFloat(point);
  return Number.isFinite(numeric) ? numeric : 0;
}

function resolveScrollPosition(offset: string, input: ScrollProgressInput): number {
  const [targetPoint = 'start', viewportPoint = 'start'] = offset.trim().split(/\s+/);
  const targetOffset = resolvePoint(targetPoint, input.targetHeight);
  const viewportOffset = resolvePoint(viewportPoint, input.viewportHeight);

  return input.targetTop + targetOffset - viewportOffset;
}

export function calculateViewportScrollProgress(
  input: ScrollProgressInput,
  offset: ViewportOffset = DEFAULT_OFFSET,
): number {
  const start = resolveScrollPosition(offset[0], input);
  const end = resolveScrollPosition(offset[1], input);
  const distance = end - start;

  if (distance === 0) {
    return input.scrollY >= end ? 1 : 0;
  }

  return clamp01((input.scrollY - start) / distance);
}

export function useViewportScrollProgress<T extends HTMLElement>(
  targetRef: RefObject<T | null>,
  offset: ViewportOffset = DEFAULT_OFFSET,
) {
  const progress = useMotionValue(0);
  const startOffset = offset[0];
  const endOffset = offset[1];

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    let frame = 0;
    let active = true;

    const update = () => {
      frame = 0;
      if (!active) return;

      const rect = target.getBoundingClientRect();
      const viewportHeight = document.documentElement.clientHeight || window.innerHeight;

      progress.set(
        calculateViewportScrollProgress(
          {
            scrollY: window.scrollY,
            viewportHeight,
            targetTop: rect.top + window.scrollY,
            targetHeight: rect.height,
          },
          [startOffset, endOffset],
        ),
      );
    };

    const scheduleUpdate = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('load', scheduleUpdate);

    let resizeObserver: ResizeObserver | null = null;
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(scheduleUpdate);
      resizeObserver.observe(target);
      resizeObserver.observe(document.documentElement);
    }

    document.fonts?.ready.then(scheduleUpdate).catch(() => undefined);

    return () => {
      active = false;
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('load', scheduleUpdate);
      resizeObserver?.disconnect();
    };
  }, [endOffset, progress, startOffset, targetRef]);

  return progress;
}
