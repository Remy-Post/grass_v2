'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { normalizeLeadAddress } from '@lawnguy/brand/helpers';
import { LinkButton, Button } from '@/components/shared/Button';
import { Icon } from '@/components/shared/Icon';
import { siteSettings, quoteHelperConfig } from '@/lib/website-data';
import { getQuoteCtaHref } from '@/lib/contact-href';
import { postLead } from '@/lib/api';
import { AddressAutocompleteInput } from './AddressAutocompleteInput';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'ok'; id: string }
  | { kind: 'error'; message: string; fieldErrors?: Record<string, string[]> };

const SERVICE_OPTIONS = [
  'Mowing',
  'Trimming or edging',
  'Cleanup',
  'Seeding or fertilizing',
  'Garden maintenance',
  'Not sure',
] as const;

const CADENCE_OPTIONS = ['Weekly', 'Biweekly', 'One-time', 'Not sure'] as const;

export function QuoteHelperForm() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [address, setAddress] = useState('');
  const [, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);

    const input = {
      name: String(fd.get('name') ?? ''),
      contact: String(fd.get('contact') ?? ''),
      address: normalizeLeadAddress(String(fd.get('address') ?? '')),
      serviceNeed: (fd.get('serviceNeed') as string) || undefined,
      cadence: (fd.get('cadence') as string) || undefined,
      yardState: (fd.get('yardState') as string) || undefined,
      notes: (fd.get('notes') as string) || undefined,
      website: String(fd.get('website') ?? ''),
    };

    setStatus({ kind: 'submitting' });
    startTransition(async () => {
      const result = await postLead(input);
      if (result.ok) {
        setStatus({ kind: 'ok', id: result.id });
        setAddress('');
        form.reset();
        return;
      }
      const fieldErrors = result.error.issues?.fieldErrors;
      const message =
        result.status === 429
          ? 'Too many requests right now — try again in a bit.'
          : 'Something went wrong sending your request. Please text or email Remy directly.';
      setStatus({ kind: 'error', message, fieldErrors });
    });
  }

  if (status.kind === 'ok') {
    return (
      <div className="space-y-4 rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-grass/20 text-brand">
            <Icon name="ThumbsUp" size={20} />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-xl font-semibold">Thanks — message received.</h2>
            <p className="text-sm text-ink-soft">
              {quoteHelperConfig.handoffMessage}
            </p>
            <p className="text-xs text-ink-muted">Reference id: {status.id}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <LinkButton href={getQuoteCtaHref()} size="sm" variant="primary">
            <Icon name="MessageCircle" size={16} />
            Text Remy now
          </LinkButton>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setStatus({ kind: 'idle' })}
          >
            Send another
          </Button>
        </div>
      </div>
    );
  }

  const submitting = status.kind === 'submitting';
  const fieldErrors = status.kind === 'error' ? status.fieldErrors : undefined;

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-line bg-surface p-6 sm:p-8"
      noValidate
    >
      <div className="space-y-1">
        <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">
          Quick quote helper
        </p>
        <h2 className="font-display text-2xl font-semibold">A short note. Remy texts you back.</h2>
        <p className="text-sm text-ink-soft">{quoteHelperConfig.role}</p>
      </div>

      <FormRow label="Your name" name="name" required errors={fieldErrors?.['name']}>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={120}
          className={inputClass}
        />
      </FormRow>

      <FormRow
        label="Phone or email"
        name="contact"
        required
        hint="So Remy knows how to reach you."
        errors={fieldErrors?.['contact']}
      >
        <input
          id="contact"
          name="contact"
          type="text"
          autoComplete="email"
          required
          maxLength={200}
          className={inputClass}
        />
      </FormRow>

      <FormRow
        label="Property address or neighbourhood"
        name="address"
        required
        hint="Bradford / BWG only at launch."
        errors={fieldErrors?.['address']}
      >
        <AddressAutocompleteInput
          id="address"
          name="address"
          value={address}
          onChange={setAddress}
          required
          maxLength={300}
          className={inputClass}
        />
      </FormRow>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormRow label="What do you need?" name="serviceNeed">
          <select id="serviceNeed" name="serviceNeed" className={inputClass} defaultValue="">
            <option value="">Choose one</option>
            {SERVICE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </FormRow>
        <FormRow label="How often?" name="cadence">
          <select id="cadence" name="cadence" className={inputClass} defaultValue="">
            <option value="">Choose one</option>
            {CADENCE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </FormRow>
      </div>

      <FormRow label="Lawn size" name="yardState">
        <select id="yardState" name="yardState" className={inputClass} defaultValue="">
          <option value="">Choose one</option>
          {siteSettings.lawnSizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </FormRow>

      <FormRow
        label="Anything else? (optional)"
        name="notes"
        hint="Overgrown, slope, gates, pets — whatever might affect the quote."
      >
        <textarea id="notes" name="notes" rows={3} maxLength={2000} className={inputClass} />
      </FormRow>

      {/* Honeypot — hidden from users, bots tend to fill it */}
      <div className="hidden" aria-hidden>
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status.kind === 'error' ? (
        <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
          {status.message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" variant="primary" size="md" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send to Remy'}
        </Button>
        <p className="text-xs text-ink-muted">
          No instant prices. No spam. Bradford / BWG only.
        </p>
      </div>
    </form>
  );
}

const inputClass =
  'w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1 focus:ring-offset-surface';

type FormRowProps = {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  errors?: string[];
  children: React.ReactNode;
};

function FormRow({ label, name, required, hint, errors, children }: FormRowProps) {
  return (
    <div className="block space-y-1.5">
      <label className="block text-sm font-medium text-ink" htmlFor={name}>
        {label}
        {required ? <span className="text-brand"> *</span> : null}
      </label>
      {children}
      {hint ? <span className="block text-xs text-ink-muted">{hint}</span> : null}
      {errors?.length ? (
        <span className="block text-xs text-red-700">{errors[0]}</span>
      ) : null}
    </div>
  );
}
