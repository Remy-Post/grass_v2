import { Container } from '@/components/shared/Container';
import { LinkButton } from '@/components/shared/Button';
import { Icon } from '@/components/shared/Icon';
import { getCtaBlock, siteSettings } from '@/lib/website-data';
import { getQuoteRequestHref } from '@/lib/contact-href';
import { HeroGrass } from './HeroGrass';

export function Hero() {
  const cta = getCtaBlock('hero');
  if (!cta) return null;
  const d = cta.data;
  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium uppercase tracking-wider text-ink-soft">
              <Icon name="MapPin" size={14} className="text-brand" />
              {siteSettings.heroBadge}
            </div>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] text-ink sm:text-6xl">
              {d.headline} <span className="text-brand">{d.emphasis}</span>
            </h1>
            <p className="max-w-prose text-lg text-ink-soft">{d.body}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton href={getQuoteRequestHref()} size="lg" variant="primary">
                <Icon name="MessageCircle" size={18} />
                {d.buttonLabel}
              </LinkButton>
              <LinkButton href="/services" size="lg" variant="secondary">
                See Services
              </LinkButton>
            </div>
            <p className="text-sm text-ink-muted">{d.helperText}</p>
          </div>
          <HeroGrass />
        </div>
        <TrustStrip />
      </Container>
    </section>
  );
}

function TrustStrip() {
  return (
    <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {siteSettings.trustBadges.map((badge) => (
        <div
          key={badge.label}
          className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2"
        >
          <Icon name={badge.icon} size={18} className="shrink-0 text-brand" />
          <span className="text-xs font-medium leading-tight text-ink-soft sm:text-sm">
            {badge.label}
          </span>
        </div>
      ))}
    </div>
  );
}
