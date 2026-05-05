import type { Service } from '@lawnguy/brand';
import { Icon } from '@/components/shared/Icon';
import { BeforeAfter } from './BeforeAfter';

type Props = {
  service: Service;
};

export function ServiceCard({ service }: Props) {
  const d = service.data;
  return (
    <article
      id={service.slug}
      className="grid scroll-mt-20 gap-8 rounded-2xl border border-line bg-surface p-6 sm:p-8 md:grid-cols-[1fr_1.2fr]"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
            <Icon name={d.icon} size={24} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
              {d.name}
            </p>
            <h3 className="font-display text-2xl font-semibold sm:text-3xl">{service.title}</h3>
          </div>
        </div>
        <p className="text-ink-soft">{d.problem}</p>
        <p className="font-medium text-brand">{d.result}</p>
        <ul className="space-y-2 text-sm text-ink-soft">
          {d.includes.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span
                aria-hidden
                className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
              />
              {item}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2 pt-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg px-3 py-1 text-ink-soft">
            <Icon name="CalendarDays" size={12} /> {d.freq}
          </span>
          {d.quoteNote ? (
            <span className="inline-flex items-center rounded-full border border-line bg-bg px-3 py-1 text-ink-muted">
              {d.quoteNote}
            </span>
          ) : null}
        </div>
      </div>
      <BeforeAfter
        alt={`${d.name} before and after comparison`}
        beforeSrc={d.beforeImageSrc}
        afterSrc={d.afterImageSrc}
      />
    </article>
  );
}
