import { Container } from '@/components/shared/Container';
import { Section } from '@/components/shared/Section';
import { LinkButton } from '@/components/shared/Button';
import { Icon } from '@/components/shared/Icon';
import { ServiceList } from '@/components/services/ServiceList';
import { FinalCta } from '@/components/home/FinalCta';
import { pageCopy } from '@/lib/website-data';
import { getQuoteRequestHref } from '@/lib/contact-href';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata('services');

export default function ServicesPage() {
  return (
    <>
      <Section pad="md">
        <Container className="max-w-3xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">
            Services
          </p>
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">
            {pageCopy.services.headline}
          </h1>
          <p className="text-ink-soft">{pageCopy.services.body}</p>
          <div className="pt-2">
            <LinkButton href={getQuoteRequestHref()} size="md" variant="primary">
              <Icon name="MessageCircle" size={16} />
              Request a Quote
            </LinkButton>
          </div>
        </Container>
      </Section>
      <ServiceList />
      <FinalCta />
    </>
  );
}
