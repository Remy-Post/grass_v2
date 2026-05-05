import { Container } from '@/components/shared/Container';
import { Section } from '@/components/shared/Section';
import { ContactInfo } from '@/components/contact/ContactInfo';
import { QuoteHelperForm } from '@/components/contact/QuoteHelperForm';
import { FaqList } from '@/components/shared/FaqList';
import { pageCopy } from '@/lib/website-data';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata('contact');

export default function ContactPage() {
  return (
    <>
      <Section pad="md">
        <Container className="max-w-3xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">
            Contact
          </p>
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">
            {pageCopy.contact.headline}
          </h1>
          <p className="text-ink-soft">{pageCopy.contact.body}</p>
        </Container>
      </Section>
      <Section pad="md">
        <Container className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <ContactInfo />
          <QuoteHelperForm />
        </Container>
      </Section>
      <FaqList id="faq" />
    </>
  );
}
