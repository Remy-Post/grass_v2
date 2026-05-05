import { Icon } from '@/components/shared/Icon';
import { pageCopy, siteSettings } from '@/lib/website-data';

export function OwnerCard() {
  const note = pageCopy.home.ownerNote;
  return (
    <div className="grid gap-8 rounded-2xl border border-line bg-surface p-8 md:grid-cols-[auto_1fr] md:items-center md:gap-10 md:p-12">
      <div
        className="grid h-32 w-32 shrink-0 place-items-center rounded-full bg-brand text-surface"
        aria-hidden
      >
        <span className="font-display text-5xl font-semibold">R</span>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">
          Owner-led
        </p>
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">{note.headline}</h2>
        <p className="text-ink-soft">{note.body}</p>
        <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="MapPin" size={14} /> {siteSettings.serviceArea}
          </span>
          <span aria-hidden>·</span>
          <span>{siteSettings.socialScore} of local lawn-care experience</span>
          <span aria-hidden>·</span>
          <span>{siteSettings.socialCount}</span>
        </p>
      </div>
    </div>
  );
}
