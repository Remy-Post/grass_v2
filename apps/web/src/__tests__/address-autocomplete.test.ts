import { describe, expect, test } from 'vitest';
import { normalizeLeadAddress } from '@lawnguy/brand/helpers';
import {
  getGeoapifyAutocompleteUrl,
  isBradfordAddressResult,
  toAddressSuggestion,
  type GeoapifyAddressResult,
} from '../lib/address-autocomplete.js';

describe('address autocomplete helpers', () => {
  test('normalizes saved lead addresses', () => {
    expect(normalizeLeadAddress('  123  Holland St W , Bradford, Ontario, Canada  ')).toBe(
      '123 Holland St W, Bradford, ON',
    );
  });

  test('builds a strict Bradford Geoapify query', () => {
    const url = new URL(getGeoapifyAutocompleteUrl('123 Holland', 'test-key'));

    expect(url.hostname).toBe('api.geoapify.com');
    expect(url.searchParams.get('text')).toBe('123 Holland');
    expect(url.searchParams.get('filter')).toBe('rect:-79.73,44.02,-79.45,44.24');
    expect(url.searchParams.get('bias')).toBe('proximity:-79.61633,44.11681');
    expect(url.searchParams.get('apiKey')).toBe('test-key');
  });

  test('keeps Ontario Bradford suggestions and formats one saved address string', () => {
    const result: GeoapifyAddressResult = {
      place_id: 'abc',
      address_line1: '123 Holland Street West',
      address_line2: 'Bradford, ON L3Z 2A4, Canada',
      city: 'Bradford',
      state: 'Ontario',
      country_code: 'ca',
      postcode: 'l3z 2a4',
    };

    expect(isBradfordAddressResult(result)).toBe(true);
    expect(toAddressSuggestion(result)).toEqual({
      id: 'abc',
      primary: '123 Holland Street West',
      secondary: 'Bradford, ON L3Z 2A4',
      address: '123 Holland Street West, Bradford, ON L3Z 2A4',
    });
  });

  test('rejects suggestions outside Bradford', () => {
    expect(
      isBradfordAddressResult({
        formatted: '123 Main Street, Newmarket, Ontario, Canada',
        city: 'Newmarket',
        state: 'Ontario',
        country_code: 'ca',
      }),
    ).toBe(false);
  });
});
