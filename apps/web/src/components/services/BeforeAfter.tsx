'use client';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import Image from 'next/image';
import { ChevronsLeftRight } from 'lucide-react';

type Props = {
  alt: string;
  beforeSrc?: string;
  afterSrc?: string;
  beforeLabel?: string;
  afterLabel?: string;
};

const MIN_REVEAL = 2;
const MAX_REVEAL = 98;
const KEYBOARD_STEP = 4;
const KEYBOARD_LARGE_STEP = 10;

function clampReveal(value: number) {
  return Math.max(MIN_REVEAL, Math.min(MAX_REVEAL, value));
}

export function BeforeAfter({
  alt,
  beforeSrc,
  afterSrc,
  beforeLabel = 'Before',
  afterLabel = 'After',
}: Props) {
  const figureRef = useRef<HTMLElement>(null);
  const [reveal, setReveal] = useState(50);
  const [failedImages, setFailedImages] = useState({ before: false, after: false });

  useEffect(() => {
    setFailedImages({ before: false, after: false });
  }, [beforeSrc, afterSrc]);

  const setRevealFromClientX = (clientX: number) => {
    const node = figureRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setReveal(clampReveal(pct));
  };

  const nudgeReveal = (delta: number) => {
    setReveal((current) => clampReveal(current + delta));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      nudgeReveal(-step);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      nudgeReveal(step);
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setReveal(MIN_REVEAL);
    }

    if (event.key === 'End') {
      event.preventDefault();
      setReveal(MAX_REVEAL);
    }
  };

  return (
    <figure
      ref={figureRef}
      className="relative aspect-[4/3] select-none overflow-hidden rounded-xl border border-line bg-bg shadow-sm"
      style={{ '--reveal': `${reveal}%`, touchAction: 'pan-y' } as CSSProperties}
      onPointerDown={(event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        setRevealFromClientX(event.clientX);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          setRevealFromClientX(event.clientX);
        }
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onPointerCancel={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
    >
      <figcaption className="sr-only">{alt}</figcaption>
      <Pane
        variant="after"
        src={afterSrc}
        failed={failedImages.after}
        onError={() => setFailedImages((current) => ({ ...current, after: true }))}
      />
      <div
        className="absolute inset-0"
        style={{ clipPath: 'inset(0 calc(100% - var(--reveal)) 0 0)' }}
      >
        <Pane
          variant="before"
          src={beforeSrc}
          failed={failedImages.before}
          onError={() => setFailedImages((current) => ({ ...current, before: true }))}
        />
      </div>

      <span className="absolute bottom-2 left-2 inline-flex max-w-[45%] items-center rounded-full bg-surface/90 px-2 py-0.5 text-[11px] font-medium text-ink-muted shadow-sm backdrop-blur sm:text-xs">
        {beforeLabel}
      </span>
      <span className="absolute bottom-2 right-2 inline-flex max-w-[45%] items-center rounded-full bg-surface/90 px-2 py-0.5 text-[11px] font-medium text-ink-muted shadow-sm backdrop-blur sm:text-xs">
        {afterLabel}
      </span>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-surface shadow-[0_0_0_1px_rgba(24,34,23,0.15)]"
        style={{ left: 'var(--reveal)' }}
      />

      <div
        className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
        style={{ left: 'var(--reveal)' }}
      >
        <button
          type="button"
          role="slider"
          aria-label={`Drag to compare ${beforeLabel.toLowerCase()} and ${afterLabel.toLowerCase()}`}
          aria-valuemin={MIN_REVEAL}
          aria-valuemax={MAX_REVEAL}
          aria-valuenow={Math.round(reveal)}
          aria-valuetext={`${Math.round(reveal)}% ${beforeLabel.toLowerCase()} visible`}
          className="grid h-10 w-10 cursor-ew-resize place-items-center rounded-full border border-line bg-surface text-ink shadow-md backdrop-blur transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-95 sm:h-11 sm:w-11"
          onKeyDown={handleKeyDown}
        >
          <ChevronsLeftRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </figure>
  );
}

type PaneProps = {
  variant: 'before' | 'after';
  src?: string;
  failed: boolean;
  onError: () => void;
};

function Pane({ variant, src, failed, onError }: PaneProps) {
  const imageSrc = !failed && src ? src : null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="(min-width: 768px) 45vw, 100vw"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          onError={onError}
        />
      ) : (
        <FallbackPane variant={variant} />
      )}
    </div>
  );
}

function FallbackPane({ variant }: { variant: 'before' | 'after' }) {
  return (
    <div
      aria-hidden
      className={
        variant === 'before'
          ? 'absolute inset-0 bg-gradient-to-br from-amber-100 to-yellow-300/80'
          : 'absolute inset-0 bg-gradient-to-br from-emerald-100 via-grass/40 to-emerald-300'
      }
    >
      <div
        className={
          variant === 'before'
            ? 'absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-amber-700/40 via-amber-600/30 to-transparent'
            : 'absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-grass via-grass/60 to-transparent'
        }
      />
    </div>
  );
}
