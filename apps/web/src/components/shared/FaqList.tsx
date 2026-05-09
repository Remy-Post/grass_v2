import { Container } from './Container';
import { Section } from './Section';
import { FaqAccordionClient } from './FaqAccordionClient';
import { faqs } from '@/lib/website-data';

type Props = {
  /** how many FAQs to show; default all */
  limit?: number;
  /** id used as the section anchor */
  id?: string;
  /** optional title override */
  title?: string;
};

export function FaqList({ limit, id = 'faq', title = 'Common questions' }: Props) {
  const items = limit ? faqs.slice(0, limit) : faqs;
  return (
    <Section tone="surface" pad="lg" id={id}>
      <Container>
        <header className="max-w-2xl space-y-3">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h2>
        </header>
        <FaqAccordionClient items={items} />
      </Container>
    </Section>
  );
}
