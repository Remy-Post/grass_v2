type Props = {
  alt: string;
};

/**
 * Static before/after diptych placeholder. Real images go in `public/images/services/`
 * and are wired in Phase 4 once Remy provides Bradford yard photos.
 */
export function BeforeAfter({ alt }: Props) {
  return (
    <div
      role="img"
      aria-label={alt}
      className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line"
    >
      <div className="absolute inset-0 grid grid-cols-2">
        <div className="relative bg-gradient-to-br from-amber-100 to-yellow-300/80">
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-amber-700/40 via-amber-600/30 to-transparent"
          />
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2 py-0.5 text-xs font-medium text-ink-muted backdrop-blur">
            Before
          </span>
        </div>
        <div className="relative bg-gradient-to-br from-emerald-100 via-grass/40 to-emerald-300">
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-grass via-grass/60 to-transparent"
          />
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2 py-0.5 text-xs font-medium text-ink-muted backdrop-blur">
            After
          </span>
        </div>
      </div>
      <div aria-hidden className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-surface" />
    </div>
  );
}
