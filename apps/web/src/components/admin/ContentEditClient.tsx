'use client';

import { useState, useTransition, type FormEvent } from 'react';

type Props = {
  kind: string;
  slug: string;
  initial: {
    title: string;
    slug: string;
    enabled: boolean;
    order: number;
    data: unknown;
  };
  isNew: boolean;
};

export function ContentEditClient({ kind, slug, initial, isNew }: Props) {
  const [title, setTitle] = useState(initial.title);
  const [slugInput, setSlugInput] = useState(initial.slug);
  const [enabled, setEnabled] = useState(initial.enabled);
  const [order, setOrder] = useState(initial.order);
  const [dataJson, setDataJson] = useState(JSON.stringify(initial.data, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    let parsedData: unknown;
    try {
      parsedData = JSON.parse(dataJson);
    } catch (err) {
      setError(`Invalid JSON in data field: ${(err as Error).message}`);
      return;
    }

    startTransition(async () => {
      const targetSlug = isNew ? slugInput : slug;
      const res = await fetch(`/admin/content/${kind}/${targetSlug}/api`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: slugInput,
          enabled,
          order,
          data: parsedData,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        setError(`Save failed (${res.status}): ${text}`);
        return;
      }
      setSuccess(true);
      if (isNew) {
        // Navigate to the saved item's edit page
        window.location.href = `/admin/content/${kind}/${slugInput}`;
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            required
          />
        </Field>
        <Field label="Slug">
          <input
            value={slugInput}
            onChange={(e) => setSlugInput(e.target.value)}
            className={inputClass}
            required
            disabled={!isNew}
          />
        </Field>
        <Field label="Order">
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className={inputClass}
            min={0}
          />
        </Field>
        <Field label="Enabled">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4"
            />
            Visible on the public site
          </label>
        </Field>
      </div>

      <Field label="Data (JSON)">
        <textarea
          value={dataJson}
          onChange={(e) => setDataJson(e.target.value)}
          rows={20}
          className={`${inputClass} font-mono text-xs`}
          spellCheck={false}
        />
        <p className="mt-1 text-xs text-ink-muted">
          Shape varies by kind. The server validates with the matching Zod schema before saving.
        </p>
      </Field>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900"
        >
          {error}
        </p>
      ) : null}
      {success ? (
        <p
          role="status"
          className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900"
        >
          Saved.
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-surface hover:bg-brand-dark disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save'}
        </button>
        <a
          href={`/admin/content/${kind}`}
          className="text-sm font-medium text-ink-soft hover:text-ink"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

const inputClass =
  'w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-60';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
