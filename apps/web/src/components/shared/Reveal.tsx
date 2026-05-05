'use client';

import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';
import { REVEAL_VARIANTS } from '@/lib/motion';

type Preset = 'fade' | 'rise' | 'stagger';
type AsTag = 'div' | 'section' | 'article' | 'header' | 'ul' | 'ol' | 'li';

const MOTION_BY_TAG: Record<AsTag, React.ComponentType<HTMLMotionProps<'div'>>> = {
  div: motion.div as React.ComponentType<HTMLMotionProps<'div'>>,
  section: motion.section as unknown as React.ComponentType<HTMLMotionProps<'div'>>,
  article: motion.article as unknown as React.ComponentType<HTMLMotionProps<'div'>>,
  header: motion.header as unknown as React.ComponentType<HTMLMotionProps<'div'>>,
  ul: motion.ul as unknown as React.ComponentType<HTMLMotionProps<'div'>>,
  ol: motion.ol as unknown as React.ComponentType<HTMLMotionProps<'div'>>,
  li: motion.li as unknown as React.ComponentType<HTMLMotionProps<'div'>>,
};

type BaseProps = {
  children: ReactNode;
  preset?: Preset;
  as?: AsTag;
  className?: string;
  delay?: number;
  amount?: number;
  once?: boolean;
};

export function Reveal({
  children,
  preset = 'rise',
  as = 'div',
  className,
  delay = 0,
  amount = 0.2,
  once = true,
}: BaseProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    const Tag = as as ElementType;
    return <Tag className={className}>{children}</Tag>;
  }

  const Component = MOTION_BY_TAG[as];
  const variants: Variants =
    preset === 'fade'
      ? REVEAL_VARIANTS.fade
      : preset === 'rise'
        ? REVEAL_VARIANTS.rise
        : REVEAL_VARIANTS.staggerParent;

  return (
    <Component
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      transition={preset === 'stagger' ? undefined : { delay }}
    >
      {children}
    </Component>
  );
}

type ItemProps = {
  children: ReactNode;
  className?: string;
  as?: AsTag;
};

export function RevealItem({ children, className, as = 'div' }: ItemProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    const Tag = as as ElementType;
    return <Tag className={className}>{children}</Tag>;
  }
  const Component = MOTION_BY_TAG[as];
  return (
    <Component className={className} variants={REVEAL_VARIANTS.staggerChild}>
      {children}
    </Component>
  );
}
