import { describe, expect, test } from 'vitest';
import {
  services,
  faqs,
  processSteps,
  benefits,
  transformations,
  ctaBlocks,
  footerGroups,
  addOns,
  navItems,
  seasons,
  pageCopy,
  siteSettings,
} from '../lib/website-data.js';
import { disallowedPhrases } from '../lib/brand-data.js';

/**
 * Concatenate every public-facing string in website.json so we can grep it
 * for compliance violations. Hidden items have already been filtered out by
 * the data loader; only enabled content reaches here.
 */
function collectAllPublicText(): string {
  return [
    JSON.stringify(siteSettings),
    JSON.stringify(pageCopy),
    JSON.stringify(navItems),
    JSON.stringify(services),
    JSON.stringify(addOns),
    JSON.stringify(processSteps),
    JSON.stringify(benefits),
    JSON.stringify(transformations),
    JSON.stringify(seasons),
    JSON.stringify(faqs),
    JSON.stringify(ctaBlocks),
    JSON.stringify(footerGroups),
  ]
    .join('\n')
    .toLowerCase();
}

describe('Compliance lock — disallowed launch wording', () => {
  test('brand.json declares the list of disallowed phrases', () => {
    expect(disallowedPhrases.length).toBeGreaterThan(0);
  });

  const allText = collectAllPublicText();

  test.each([...disallowedPhrases])(
    'public website data does not contain disallowed phrase: "%s"',
    (phrase) => {
      expect(allText).not.toContain(phrase.toLowerCase());
    },
  );
});
