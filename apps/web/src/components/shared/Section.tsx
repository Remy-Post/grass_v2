import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'default' | 'surface' | 'surface-alt' | 'brand';
type Pad = 'sm' | 'md' | 'lg';

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: ElementType;
  pad?: Pad;
  tone?: Tone;
};

const PADDING: Record<Pad, string> = {
  sm: 'py-10 sm:py-14',
  md: 'py-14 sm:py-20',
  lg: 'py-20 sm:py-28',
};

const TONE: Record<Tone, string> = {
  default: '',
  surface: 'bg-surface',
  'surface-alt': 'bg-surface-alt',
  brand: 'bg-brand text-surface',
};

export function Section({
  children,
  className,
  id,
  as: Tag = 'section',
  pad = 'md',
  tone = 'default',
}: Props) {
  return (
    <Tag id={id} className={cn(PADDING[pad], TONE[tone], className)}>
      {children}
    </Tag>
  );
}
