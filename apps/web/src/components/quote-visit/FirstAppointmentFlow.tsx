import { Icon } from '@/components/shared/Icon';

const STEPS = [
  {
    icon: 'MessageCircle',
    title: 'Send a quick text',
    description:
      'Address, the rough scope, and a few yard photos if you have them. That alone is often enough to know whether a visit is needed.',
  },
  {
    icon: 'CalendarDays',
    title: 'Schedule a quote visit',
    description:
      'Most quote visits happen evenings or weekends so the yard can be inspected when access is easy.',
  },
  {
    icon: 'ClipboardCheck',
    title: 'Walk the yard together',
    description:
      'A short in-person look covers the cut, edges, cleanup, and any add-ons you are considering.',
  },
  {
    icon: 'Sparkles',
    title: 'Receive a clear text quote',
    description:
      'After the visit, the agreed scope and price are summarized by text so the details are easy to keep.',
  },
] as const;

export function FirstAppointmentFlow() {
  return (
    <ol className="space-y-3">
      {STEPS.map((step, i) => (
        <li key={step.title} className="flex gap-4 rounded-xl border border-line bg-surface p-5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-surface">
            <span className="font-display text-base font-semibold">{i + 1}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Icon name={step.icon} size={16} className="text-brand" />
              <h3 className="font-display text-lg font-semibold">{step.title}</h3>
            </div>
            <p className="text-sm text-ink-soft">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
