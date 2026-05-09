import { describe, expect, test } from 'vitest';
import { getNextOpenFaqSlugs } from './faq-open-state';

describe('getNextOpenFaqSlugs', () => {
  test('opens up to three FAQ items', () => {
    expect(getNextOpenFaqSlugs([], 'one')).toEqual(['one']);
    expect(getNextOpenFaqSlugs(['one'], 'two')).toEqual(['one', 'two']);
    expect(getNextOpenFaqSlugs(['one', 'two'], 'three')).toEqual(['one', 'two', 'three']);
  });

  test('opening a fourth item keeps the newest and removes the oldest', () => {
    expect(getNextOpenFaqSlugs(['one', 'two', 'three'], 'four')).toEqual(['two', 'three', 'four']);
  });

  test('clicking an already-open item closes it', () => {
    expect(getNextOpenFaqSlugs(['one', 'two', 'three'], 'two')).toEqual(['one', 'three']);
  });
});
