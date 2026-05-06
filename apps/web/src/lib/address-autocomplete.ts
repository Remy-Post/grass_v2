import { normalizeLeadAddress } from '@lawnguy/brand/helpers';

const BRADFORD_BOUNDS = {
  lon1: -79.73,
  lat1: 44.02,
  lon2: -79.45,
  lat2: 44.24,
} as const;

const BRADFORD_CENTER = {
  lon: -79.61633,
  lat: 44.11681,
} as const;

export type GeoapifyAddressResult = {
  place_id?: string;
  formatted?: string;
  address_line1?: string;
  address_line2?: string;
  housenumber?: string;
  street?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  district?: string;
  suburb?: string;
  county?: string;
  state?: string;
  state_code?: string;
  country?: string;
  country_code?: string;
  postcode?: string;
};

export type AddressSuggestion = {
  id: string;
  primary: string;
  secondary: string;
  address: string;
};

export function getGeoapifyAutocompleteUrl(query: string, apiKey: string): string {
  const params = new URLSearchParams({
    text: query,
    format: 'json',
    lang: 'en',
    limit: '6',
    filter: `rect:${BRADFORD_BOUNDS.lon1},${BRADFORD_BOUNDS.lat1},${BRADFORD_BOUNDS.lon2},${BRADFORD_BOUNDS.lat2}`,
    bias: `proximity:${BRADFORD_CENTER.lon},${BRADFORD_CENTER.lat}`,
    apiKey,
  });

  return `https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`;
}

export function isBradfordAddressResult(result: GeoapifyAddressResult): boolean {
  const country = result.country_code?.toLowerCase();
  const state = `${result.state_code ?? ''} ${result.state ?? ''}`.toLowerCase();
  const placeText = [
    result.city,
    result.town,
    result.village,
    result.municipality,
    result.district,
    result.suburb,
    result.county,
    result.address_line2,
    result.formatted,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    country === 'ca' &&
    (state.includes('on') || state.includes('ontario')) &&
    /\bbradford\b/.test(placeText)
  );
}

export function toAddressSuggestion(result: GeoapifyAddressResult): AddressSuggestion | null {
  if (!isBradfordAddressResult(result)) return null;

  const builtStreetAddress = [result.housenumber, result.street].filter(Boolean).join(' ');
  const streetAddress =
    result.address_line1 ?? (builtStreetAddress.length > 0 ? builtStreetAddress : result.formatted ?? '');
  const city =
    result.city ??
    result.town ??
    result.village ??
    result.municipality ??
    'Bradford West Gwillimbury';
  const province = 'ON';
  const provincePostal = [province, result.postcode?.toUpperCase()].filter(Boolean).join(' ');
  const address = normalizeLeadAddress([streetAddress, city, provincePostal].filter(Boolean).join(', '));
  const primary = normalizeLeadAddress(streetAddress || address);
  const secondary = normalizeLeadAddress([city, provincePostal].filter(Boolean).join(', '));

  if (!address || !primary) return null;

  return {
    id: result.place_id ?? address,
    primary,
    secondary,
    address,
  };
}
