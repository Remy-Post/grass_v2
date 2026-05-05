import type { Metadata } from 'next';
import { seoSpec } from './website-data.js';

type PageKey = 'home' | 'services' | 'about' | 'contact' | 'quoteVisit';

const PAGE_PATHS: Record<PageKey, string> = {
  home: '/',
  services: '/services',
  about: '/about',
  contact: '/contact',
  quoteVisit: '/quote-visit',
};

export function buildMetadata(page: PageKey): Metadata {
  const title = seoSpec.titleTags[page] ?? 'The Lawn Guy Bradford';
  const description = seoSpec.metaDescriptions[page] ?? '';
  const path = PAGE_PATHS[page];

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: path,
      siteName: 'The Lawn Guy Bradford',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
