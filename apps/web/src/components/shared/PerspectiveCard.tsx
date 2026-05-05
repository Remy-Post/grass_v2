'use client';

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import type { PointerEvent, ReactNode } from 'react';
import { useRef } from 'react';
import { SPRING_PRESETS, useIsTouch } from '@/lib/motion';

type Props = {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
};

export function PerspectiveCard({ children, className, maxTilt = 7 }: Props) {
  const reduce = useReducedMotion();
  const isTouch = useIsTouch();
  const ref = useRef<HTMLDivElement>(null);
  const xRaw = useMotionValue(0);
  const yRaw = useMotionValue(0);
  const x = useSpring(xRaw, SPRING_PRESETS.card);
  const y = useSpring(yRaw, SPRING_PRESETS.card);

  const rotateY = useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]);
  const rotateX = useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]);

  if (reduce || isTouch) {
    return <div className={className}>{children}</div>;
  }

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    xRaw.set(px - 0.5);
    yRaw.set(py - 0.5);
    node.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    node.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
  };

  const handleLeave = () => {
    xRaw.set(0);
    yRaw.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`perspective-card ${className ?? ''}`}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
      <span className="perspective-card-glare" aria-hidden />
    </motion.div>
  );
}
