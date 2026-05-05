import { describe, expect, test } from 'vitest';
import {
  services,
  addOns,
  seasons,
  navItems,
  benefits,
  processSteps,
  transformations,
  faqs,
  ctaBlocks,
  footerGroups,
} from '../lib/website-data.js';

const KNOWN_HIDDEN_SLUGS = [
  'weed-treatment-hidden',
  'pet-waste-cleanup-hidden',
  'winter-hidden',
] as const;

describe('Hidden content cannot leak through the public data loader', () => {
  test('every collection is filtered to enabled === true', () => {
    const all = [
      ...navItems,
      ...services,
      ...addOns,
      ...processSteps,
      ...benefits,
      ...transformations,
      ...seasons,
      ...faqs,
      ...ctaBlocks,
      ...footerGroups,
    ];
    for (const item of all) {
      expect(item.enabled).toBe(true);
    }
  });

  test.each([...KNOWN_HIDDEN_SLUGS])(
    'hidden slug "%s" does not appear in any public collection',
    (slug) => {
      const allSlugs = [
        ...services.map((s) => s.slug),
        ...addOns.map((a) => a.slug),
        ...seasons.map((s) => s.slug),
        ...navItems.map((n) => n.slug),
      ];
      expect(allSlugs).not.toContain(slug);
    },
  );

  test('seasons exclude winter and only contain spring/summer/fall', () => {
    const seasonSlugs = seasons.map((s) => s.slug).sort();
    expect(seasonSlugs).toEqual(['fall', 'spring', 'summer']);
  });

  test('services include the 6 core offerings, no weed-treatment', () => {
    const serviceSlugs = services.map((s) => s.slug).sort();
    expect(serviceSlugs).toEqual(
      [
        'mowing',
        'trimming-edging',
        'leaf-cleanup',
        'seasonal-cleanup',
        'seeding-fertilizing',
        'garden-maintenance',
      ].sort(),
    );
  });
});
