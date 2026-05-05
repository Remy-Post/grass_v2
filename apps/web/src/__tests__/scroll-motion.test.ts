import { describe, expect, test } from 'vitest';
import { calculateViewportScrollProgress } from '../lib/scroll-motion.js';

describe('viewport scroll progress', () => {
  test('maps start/start to end/start offsets for the hero grass', () => {
    const base = {
      viewportHeight: 800,
      targetTop: 200,
      targetHeight: 600,
    };

    expect(
      calculateViewportScrollProgress({ ...base, scrollY: 200 }, ['start start', 'end start']),
    ).toBe(0);
    expect(
      calculateViewportScrollProgress({ ...base, scrollY: 500 }, ['start start', 'end start']),
    ).toBe(0.5);
    expect(
      calculateViewportScrollProgress({ ...base, scrollY: 800 }, ['start start', 'end start']),
    ).toBe(1);
  });

  test('supports viewport percentage offsets for the transformation slider', () => {
    const progress = calculateViewportScrollProgress(
      {
        viewportHeight: 1000,
        targetTop: 1000,
        targetHeight: 400,
        scrollY: 650,
      },
      ['start 80%', 'end 30%'],
    );

    expect(progress).toBe(0.5);
  });

  test('maps pinned sections from top lock to bottom release', () => {
    const progress = calculateViewportScrollProgress(
      {
        viewportHeight: 900,
        targetTop: 1800,
        targetHeight: 2700,
        scrollY: 2700,
      },
      ['start start', 'end end'],
    );

    expect(progress).toBe(0.5);
  });

  test('clamps progress outside the active scroll range', () => {
    const base = {
      viewportHeight: 900,
      targetTop: 1200,
      targetHeight: 300,
    };

    expect(
      calculateViewportScrollProgress({ ...base, scrollY: 0 }, ['start start', 'end start']),
    ).toBe(0);
    expect(
      calculateViewportScrollProgress({ ...base, scrollY: 2000 }, ['start start', 'end start']),
    ).toBe(1);
  });
});
