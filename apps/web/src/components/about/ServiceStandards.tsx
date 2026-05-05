import { Icon } from '@/components/shared/Icon';

const STANDARDS = [
  {
    icon: 'Scissors',
    title: 'Cut, trim, blow, check',
    description:
      'Every standard mow includes a cut at clean height, trimming around edges, blowing visible hard surfaces, and a quick finish check before leaving.',
  },
  {
    icon: 'CalendarDays',
    title: 'Reschedule when conditions are bad',
    description:
      'If weather or lawn conditions make the cut unsafe or likely to look bad, the visit reschedules as soon as practical.',
  },
  {
    icon: 'MessageCircle',
    title: 'Quotes summarized in writing',
    description:
      'Quote visits happen in person and the agreed scope is summarized by text afterward so nothing is left to memory.',
  },
  {
    icon: 'ThumbsUp',
    title: '48-hour fix fallback',
    description:
      'If something is missed on a visit, it gets fixed within 48 hours where conditions allow. No drama, no fine print.',
  },
] as const;

export function ServiceStandards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {STANDARDS.map((s) => (
        <div key={s.title} className="rounded-xl border border-line bg-surface p-5">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-brand/10 text-brand">
            <Icon name={s.icon} size={20} />
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold">{s.title}</h3>
          <p className="mt-1 text-sm text-ink-soft">{s.description}</p>
        </div>
      ))}
    </div>
  );
}
