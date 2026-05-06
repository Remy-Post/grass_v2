import Link from 'next/link';
import type { Route } from 'next';
import Image from 'next/image';
import { Container } from './Container';
import { footerGroups, siteSettings } from '@/lib/website-data';

const FOOTER_LINK_HREF: Record<string, Route> = {
  'Lawn mowing': '/services#mowing',
  'Trimming and edging': '/services#trimming-edging',
  'Leaf cleanup': '/services#leaf-cleanup',
  'Seasonal cleanup': '/services#seasonal-cleanup',
  'Garden maintenance': '/services#garden-maintenance',
  About: '/about',
  'Quote Visit': '/quote-visit',
  'Service Area': '/about#service-area',
  Contact: '/contact',
  FAQ: '/contact#faq',
  'Rain Policy': '/contact#faq',
  'Before Your Visit': '/contact#faq',
  Partner: '/partner',
  'Web Development Team': '/partner',
  Privacy: '/privacy',
};

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-surface-alt" role="contentinfo">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-3">
          <Link href="/" aria-label={`${siteSettings.businessName} home`} className="block w-fit">
            <Image
              src="/images/lawnguy-logo-full-transparent.webp"
              alt={siteSettings.businessName}
              width={1128}
              height={635}
              sizes="(min-width: 768px) 224px, 192px"
              className="h-auto w-48 rounded-sm md:w-56"
            />
          </Link>
          <p className="text-sm text-ink-soft">{siteSettings.serviceArea}</p>
          <p className="text-sm text-ink-muted">{siteSettings.socialCount}</p>
        </div>
        {footerGroups.map((group) => (
          <div key={group.slug} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
              {group.data.title}
            </h2>
            <ul className="space-y-2 text-sm">
              {group.data.links.map((label) => {
                const href = FOOTER_LINK_HREF[label];
                return (
                  <li key={label}>
                    {href ? (
                      <Link href={href} className="text-ink-soft transition-colors hover:text-brand">
                        {label}
                      </Link>
                    ) : (
                      <span className="text-ink-soft">{label}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-line">
        <Container className="flex flex-col items-start justify-between gap-2 py-4 text-xs text-ink-muted sm:flex-row">
          <p>
            © {year} {siteSettings.businessName}. {siteSettings.serviceArea} only.
          </p>
          <p>
            <a href={siteSettings.emailHref} className="hover:text-brand">
              {siteSettings.emailDisplay}
            </a>
          </p>
        </Container>
      </div>
    </footer>
  );
}
