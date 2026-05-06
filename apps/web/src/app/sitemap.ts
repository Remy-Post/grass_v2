import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thelawnguybradford.ca';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified, priority: 1.0, changeFrequency: 'weekly' },
    { url: `${SITE_URL}/services`, lastModified, priority: 0.9, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/about`, lastModified, priority: 0.7, changeFrequency: 'monthly' },
    {
      url: `${SITE_URL}/quote-visit`,
      lastModified,
      priority: 0.7,
      changeFrequency: 'monthly',
    },
    { url: `${SITE_URL}/contact`, lastModified, priority: 0.7, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/partner`, lastModified, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/privacy`, lastModified, priority: 0.3, changeFrequency: 'yearly' },
  ];
}
