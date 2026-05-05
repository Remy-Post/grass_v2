import { LinkButton } from './Button';
import { Icon } from './Icon';
import { getCtaBlock } from '@/lib/website-data';
import { getQuoteCtaHref } from '@/lib/contact-href';

export function MobileStickyCta() {
  const cta = getCtaBlock('mobile-sticky');
  if (!cta) return null;
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-md md:hidden"
      role="region"
      aria-label="Quick contact"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{cta.data.title}</p>
          <p className="truncate text-sm text-ink-soft">{cta.data.subtitle}</p>
        </div>
        <LinkButton href={getQuoteCtaHref()} size="sm" variant="primary">
          <Icon name="MessageCircle" size={16} />
          {cta.data.buttonLabel}
        </LinkButton>
      </div>
    </div>
  );
}
