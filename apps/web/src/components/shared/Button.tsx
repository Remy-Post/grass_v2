import Link from 'next/link';
import type { Route } from 'next';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

type StyleProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed';

const SIZES: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-6 py-3 text-base',
};

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-surface hover:bg-brand-dark',
  secondary: 'bg-surface text-ink border border-line hover:bg-surface-alt',
  ghost: 'text-ink hover:bg-surface-alt',
};

function buttonClasses({ variant = 'primary', size = 'md', className }: StyleProps): string {
  return cn(BASE, SIZES[size], VARIANTS[variant], className);
}

type LinkButtonProps = StyleProps & {
  href: string;
  children: ReactNode;
  prefetch?: boolean;
  ariaLabel?: string;
};

export function LinkButton({ href, children, prefetch, ariaLabel, ...style }: LinkButtonProps) {
  const isExternal = /^(https?:|sms:|tel:|mailto:)/.test(href);
  const className = buttonClasses(style);
  if (isExternal) {
    return (
      <a href={href} className={className} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href as Route} className={className} prefetch={prefetch} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

type ButtonProps = StyleProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
  };

export function Button({ children, variant, size, className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button {...rest} type={type} className={buttonClasses({ variant, size, className })}>
      {children}
    </button>
  );
}
