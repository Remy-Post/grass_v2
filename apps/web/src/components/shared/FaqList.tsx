import { Container } from './Container';
import { Section } from './Section';
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
        <ul className="mt-8 divide-y divide-line rounded-xl border border-line bg-bg">
          {items.map((faq) => (
            <li key={faq.slug}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium text-ink [&::-webkit-details-marker]:hidden">
                  <span>{faq.data.question}</span>
                  <span
                    aria-hidden
                    className="grid h-7 w-7 place-items-center rounded-full bg-surface-alt text-ink-muted transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-ink-soft">{faq.data.answer}</div>
              </details>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
