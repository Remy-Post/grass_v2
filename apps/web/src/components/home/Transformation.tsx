import { Container } from '@/components/shared/Container';
import { Section } from '@/components/shared/Section';
import { getTransformation } from '@/lib/website-data';
import { TransformationSlider } from './TransformationSlider';

export function TransformationSection() {
  const t = getTransformation();
  if (!t) return null;
  const d = t.data;
  return (
    <Section tone="surface" pad="lg">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">
            {d.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
            {d.title} <span className="text-brand">{d.emphasis}</span>
          </h2>
          <p className="mt-4 text-ink-soft">{d.subtitle}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {d.badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center rounded-full border border-line bg-bg px-3 py-1 text-xs font-medium text-ink-soft"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-10">
          <TransformationSlider beforeLabel={d.beforeLabel} afterLabel={d.afterLabel} />
        </div>
      </Container>
    </Section>
  );
}
