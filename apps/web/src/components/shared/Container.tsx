import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Props = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

export function Container({ children, className, as: Tag = 'div' }: Props) {
  return <Tag className={cn('mx-auto w-full max-w-6xl px-5 sm:px-8', className)}>{children}</Tag>;
}
