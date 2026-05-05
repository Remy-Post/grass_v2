'use client';

import { useEffect, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useIsTouch } from '@/lib/motion';

export function LenisProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const isTouch = useIsTouch();

  useEffect(() => {
    if (reduce || isTouch) return;
    let cancelled = false;
    let raf = 0;
    let lenisInstance: { raf: (t: number) => void; destroy: () => void } | null = null;

    (async () => {
      const mod = await import('lenis');
      if (cancelled) return;
      const Lenis = mod.default;
      const lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1,
      });
      lenisInstance = lenis;
      const tick = (t: number) => {
        lenis.raf(t);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      lenisInstance?.destroy();
    };
  }, [reduce, isTouch]);

  return (
    <div data-lenis-root className="relative">
      {children}
    </div>
  );
}
