import { Container } from '@/components/shared/Container';
import { Section } from '@/components/shared/Section';
import { LinkButton } from '@/components/shared/Button';
import { Icon } from '@/components/shared/Icon';
import { OwnerCard } from '@/components/about/OwnerCard';
import { ServiceStandards } from '@/components/about/ServiceStandards';
import { WhyBradford } from '@/components/about/WhyBradford';
import { FinalCta } from '@/components/home/FinalCta';
import { pageCopy } from '@/lib/website-data';
import { getQuoteCtaHref } from '@/lib/contact-href';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata('about');

export default function AboutPage() {
  return (
    <>
      <Section pad="md">
        <Container className="max-w-3xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">About</p>
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">
            {pageCopy.about.headline}
          </h1>
          <p className="text-ink-soft">{pageCopy.about.body}</p>
          <div className="pt-2">
            <LinkButton href={getQuoteCtaHref()} size="md" variant="primary">
              <Icon name="MessageCircle" size={16} />
              Text For A Quote
            </LinkButton>
          </div>
        </Container>
      </Section>
      <Section pad="md">
        <Container>
          <OwnerCard />
        </Container>
      </Section>
      <Section pad="md">
        <Container className="space-y-8">
          <header className="max-w-2xl space-y-2">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Service standards.
            </h2>
            <p className="text-ink-soft">
              Concrete commitments instead of vague promises. These apply to every visit.
            </p>
          </header>
          <ServiceStandards />
        </Container>
      </Section>
      <Section pad="md">
        <Container>
          <WhyBradford />
        </Container>
      </Section>
      <Section pad="md">
        <Container>
          <div className="rounded-xl border border-line bg-surface p-6">
            <h2 className="font-display text-xl font-semibold">
              How photos and reviews will be built.
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              Real Bradford yard photos and customer reviews will be added with explicit
              permission as visits happen. Until then, mockups are clearly labelled and
              testimonials are not displayed.
            </p>
          </div>
        </Container>
      </Section>
      <FinalCta />
    </>
  );
}
