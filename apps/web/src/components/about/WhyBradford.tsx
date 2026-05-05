import { Icon } from '@/components/shared/Icon';
import { siteSettings } from '@/lib/website-data';

export function WhyBradford() {
  return (
    <div className="grid gap-6 rounded-2xl border border-line bg-surface-alt p-8 md:grid-cols-[auto_1fr] md:items-start md:gap-10 md:p-10">
      <div
        className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand text-surface"
        aria-hidden
      >
        <Icon name="MapPin" size={28} />
      </div>
      <div className="space-y-3">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl" id="service-area">
          Why Bradford only.
        </h2>
        <p className="text-ink-soft">
          {siteSettings.serviceArea} is the entire service area on purpose. A focused local
          area keeps drive time short, the brand personal, and the schedule easier to keep.
        </p>
        <p className="text-sm text-ink-muted">
          If you are outside {siteSettings.serviceArea}, the answer is usually no for now —
          but it is worth a quick text either way.
        </p>
      </div>
    </div>
  );
}
