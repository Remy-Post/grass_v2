import { Container } from '@/components/shared/Container';
import { Section } from '@/components/shared/Section';
import { LinkButton } from '@/components/shared/Button';
import { Icon } from '@/components/shared/Icon';
import { Reveal } from '@/components/shared/Reveal';
import { getCtaBlock } from '@/lib/website-data';
import { getQuoteRequestHref } from '@/lib/contact-href';

export function FinalCta() {
  const cta = getCtaBlock('final');
  if (!cta) return null;
  const d = cta.data;
  return (
    <Section tone="brand" pad="lg">
      <Container className="text-center">
        <Reveal preset="rise">
          <p className="text-sm font-medium uppercase tracking-wider text-surface/70">
            {d.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
            {d.headline} <span className="text-accent">{d.emphasis}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-surface/85">{d.body}</p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <LinkButton
              href={getQuoteRequestHref()}
              size="lg"
              className="bg-accent text-ink hover:bg-yellow-300"
            >
              <Icon name="MessageCircle" size={18} />
              {d.buttonLabel}
            </LinkButton>
            <p className="text-sm text-surface/70">{d.helperText}</p>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
