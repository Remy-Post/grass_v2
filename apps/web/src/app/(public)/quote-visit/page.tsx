import { Container } from '@/components/shared/Container';
import { Section } from '@/components/shared/Section';
import { Icon } from '@/components/shared/Icon';
import { LinkButton } from '@/components/shared/Button';
import { QuoteAffects } from '@/components/quote-visit/QuoteAffects';
import { FirstAppointmentFlow } from '@/components/quote-visit/FirstAppointmentFlow';
import { FinalCta } from '@/components/home/FinalCta';
import { pageCopy } from '@/lib/website-data';
import { getQuoteCtaHref } from '@/lib/contact-href';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata('quoteVisit');

export default function QuoteVisitPage() {
  return (
    <>
      <Section pad="md">
        <Container className="max-w-3xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">
            Quote Visit
          </p>
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">
            {pageCopy.quoteVisit.headline}
          </h1>
          <p className="text-ink-soft">{pageCopy.quoteVisit.body}</p>
          <div className="pt-2">
            <LinkButton href={getQuoteCtaHref()} size="md" variant="primary">
              <Icon name="MessageCircle" size={16} />
              Text For A Quote
            </LinkButton>
          </div>
        </Container>
      </Section>

      <Section pad="md">
        <Container className="space-y-8">
          <header className="max-w-2xl space-y-2">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              No instant prices.
            </h2>
            <p className="text-ink-soft">
              Online prices can miss the parts of a quote that actually matter — access,
              slope, overgrowth, edges, cleanup, and the customer&apos;s priorities. A
              short visit keeps the scope honest.
            </p>
          </header>
          <div className="rounded-xl border border-line bg-surface-alt p-6">
            <div className="flex items-start gap-3">
              <Icon name="ShieldCheck" size={20} className="mt-0.5 shrink-0 text-brand" />
              <p className="text-sm text-ink-soft">
                You will not be pressured into a recurring plan after a quote visit. The
                quote is for the work you actually want.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section pad="md">
        <Container className="space-y-8">
          <header className="max-w-2xl space-y-2">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              What affects a quote.
            </h2>
            <p className="text-ink-soft">
              These are the parts that change the price most. Listing them up front keeps
              expectations realistic.
            </p>
          </header>
          <QuoteAffects />
        </Container>
      </Section>

      <Section pad="md">
        <Container className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-3">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              How a first appointment flows.
            </h2>
            <p className="text-ink-soft">
              Four short steps. Most of it happens by text; the in-person part is brief.
            </p>
          </div>
          <FirstAppointmentFlow />
        </Container>
      </Section>

      <Section pad="md">
        <Container>
          <div className="rounded-xl border border-line bg-surface p-6">
            <h2 className="font-display text-xl font-semibold">
              A note on overgrown yards.
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              Overgrown lawns are quoted separately because they take more time and may
              need a different first-cut approach. That is normal — please send a few
              photos if you can.
            </p>
          </div>
        </Container>
      </Section>

      <FinalCta />
    </>
  );
}
