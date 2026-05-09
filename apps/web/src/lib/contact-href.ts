import { siteSettings } from './website-data.js';

export const QUOTE_REQUEST_HREF = '/contact';

export function getQuoteRequestHref(): string {
  return QUOTE_REQUEST_HREF;
}

/**
 * Owner SMS link. Falls back to mailto if no public phone number is set.
 */
export function getQuoteCtaHref(prefilledMessage?: string): string {
  const cleanedPhone = siteSettings.phoneHref.replace(/^tel:/, '').replace(/[^\d+]/g, '');
  if (cleanedPhone.length > 0) {
    const sms = `sms:${cleanedPhone}`;
    if (!prefilledMessage) return sms;
    return `${sms}?&body=${encodeURIComponent(prefilledMessage)}`;
  }
  // Fallback: email Remy
  const subject = 'Lawn care quote request';
  const body = prefilledMessage ?? 'Hi Remy, I would like a quote for my lawn at ___.';
  const params = new URLSearchParams({ subject, body });
  return `${siteSettings.emailHref}?${params.toString()}`;
}

export function hasPublicPhoneNumber(): boolean {
  const cleaned = siteSettings.phoneHref.replace(/^tel:/, '').replace(/[^\d+]/g, '');
  return cleaned.length > 0;
}
