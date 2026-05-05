import { Icon } from '@/components/shared/Icon';

const FACTORS = [
  {
    icon: 'MapPin',
    title: 'Yard size and access',
    description:
      'Total square footage, gates, slopes, and how easy the property is to reach all matter.',
  },
  {
    icon: 'Scissors',
    title: 'Lawn condition',
    description:
      'Long, overgrown, or uneven grass needs a different first cut than a regularly maintained yard.',
  },
  {
    icon: 'Leaf',
    title: 'Cleanup needs',
    description:
      'Leaf volume, debris, and bagging or disposal preferences change the time required.',
  },
  {
    icon: 'CalendarDays',
    title: 'Cadence',
    description:
      'Weekly, biweekly, and one-time visits price differently and affect schedule fit.',
  },
  {
    icon: 'Sprout',
    title: 'Add-ons',
    description:
      'Edging, garden tidy-up, seeding, or fertilizing can be bundled or quoted separately.',
  },
] as const;

export function QuoteAffects() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {FACTORS.map((f) => (
        <li key={f.title} className="rounded-xl border border-line bg-surface p-5">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-brand/10 text-brand">
            <Icon name={f.icon} size={20} />
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold">{f.title}</h3>
          <p className="mt-1 text-sm text-ink-soft">{f.description}</p>
        </li>
      ))}
    </ul>
  );
}
