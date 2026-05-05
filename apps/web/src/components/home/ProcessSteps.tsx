import { Container } from '@/components/shared/Container';
import { Section } from '@/components/shared/Section';
import { Icon } from '@/components/shared/Icon';
import { Reveal, RevealItem } from '@/components/shared/Reveal';
import { processSteps } from '@/lib/website-data';

export function ProcessSteps() {
  return (
    <Section tone="surface-alt" pad="lg">
      <Container>
        <Reveal preset="rise" as="header" className="max-w-2xl space-y-3">
          <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">
            How a quote works
          </p>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Text first. <span className="text-brand">Quoted after seeing the yard.</span>
          </h2>
        </Reveal>
        <Reveal
          preset="stagger"
          as="ol"
          className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {processSteps.map((step) => (
            <RevealItem
              key={step.slug}
              as="li"
              className="relative flex flex-col gap-3 rounded-xl border border-line bg-surface p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl font-semibold text-ink-muted">
                  {step.data.number}
                </span>
                <Icon name={step.data.icon} size={22} className="text-brand" />
              </div>
              <h3 className="font-display text-lg font-semibold">{step.data.title}</h3>
              <p className="text-sm text-ink-soft">{step.data.description}</p>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
