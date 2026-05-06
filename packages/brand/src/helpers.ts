export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function smsHref(phone: string, body?: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (!cleaned) return '';
  if (!body) return `sms:${cleaned}`;
  return `sms:${cleaned}?&body=${encodeURIComponent(body)}`;
}

export function telHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned ? `tel:${cleaned}` : '';
}

export function mailtoHref(email: string, subject?: string, body?: string): string {
  if (!email) return '';
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const qs = params.toString();
  return `mailto:${email}${qs ? `?${qs}` : ''}`;
}

export function isEnabled<T extends { enabled: boolean }>(item: T): boolean {
  return item.enabled === true;
}

export function byOrder<T extends { order: number }>(a: T, b: T): number {
  return a.order - b.order;
}

export function compactList<T>(items: ReadonlyArray<T | null | undefined | false>): T[] {
  return items.filter((item): item is T => Boolean(item));
}

export function normalizeLeadAddress(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/,+/g, ',')
    .replace(/\bOnt\.?\b/gi, 'ON')
    .replace(/\bOntario\b/gi, 'ON')
    .replace(/,\s*Canada\s*$/i, '')
    .replace(/(?:,\s*)+$/g, '')
    .trim();
}
