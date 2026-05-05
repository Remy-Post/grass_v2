import { Container } from '@/components/shared/Container';
import { Section } from '@/components/shared/Section';
import { Icon } from '@/components/shared/Icon';
import { Reveal, RevealItem } from '@/components/shared/Reveal';
import { PerspectiveCard } from '@/components/shared/PerspectiveCard';
import { benefits } from '@/lib/website-data';

export function Benefits() {
  return (
    <Section pad="lg">
      <Container>
        <Reveal preset="rise" as="header" className="max-w-2xl space-y-3">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Why people choose The Lawn Guy.
          </h2>
        </Reveal>
        <Reveal preset="stagger" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <RevealItem key={b.slug}>
              <PerspectiveCard className="h-full rounded-xl border border-line bg-surface p-5 shadow-sm">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-brand/10 text-brand">
                  <Icon name={b.data.icon} size={20} />
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold">{b.data.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{b.data.description}</p>
              </PerspectiveCard>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
