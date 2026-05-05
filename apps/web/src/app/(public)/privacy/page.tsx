import type { Metadata } from 'next';
import { Container } from '@/components/shared/Container';
import { Section } from '@/components/shared/Section';
import { siteSettings } from '@/lib/website-data';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'How The Lawn Guy Bradford handles quote requests and contact details.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <Section pad="lg">
      <Container className="max-w-3xl">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">
            Last updated May 5, 2026
          </p>
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">Privacy</h1>
          <p className="text-ink-soft">
            The Lawn Guy Bradford only collects the information needed to answer quote requests,
            plan visits, and keep in touch about lawn care work.
          </p>
        </header>

        <div className="mt-10 space-y-8 text-ink-soft">
          <section className="space-y-2">
            <h2 className="font-display text-2xl font-semibold text-ink">Information Collected</h2>
            <p>
              Quote and contact forms may ask for your name, contact details, address or service
              area, yard notes, photos you choose to share, and the services you are interested in.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-2xl font-semibold text-ink">How It Is Used</h2>
            <p>
              This information is used to respond to requests, prepare estimates, schedule visits,
              complete requested work, and follow up about service details.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-2xl font-semibold text-ink">Sharing</h2>
            <p>
              Personal details are not sold. Information is only shared when needed to operate the
              site, respond to your request, comply with law, or complete work you asked for.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-2xl font-semibold text-ink">Contact</h2>
            <p>
              To ask about your information, email{' '}
              <a href={siteSettings.emailHref} className="font-medium text-brand hover:underline">
                {siteSettings.emailDisplay}
              </a>
              .
            </p>
          </section>
        </div>
      </Container>
    </Section>
  );
}
