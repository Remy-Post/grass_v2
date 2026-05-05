'use client';

import { useState, useTransition, type FormEvent } from 'react';

type Props = { initial: unknown };

export function SettingsEditClient({ initial }: Props) {
  const [json, setJson] = useState(JSON.stringify(initial, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch (err) {
      setError(`Invalid JSON: ${(err as Error).message}`);
      return;
    }

    startTransition(async () => {
      const res = await fetch('/admin/settings/api', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      if (!res.ok) {
        const text = await res.text();
        setError(`Save failed (${res.status}): ${text}`);
        return;
      }
      setSuccess(true);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        rows={28}
        spellCheck={false}
        className="w-full rounded-md border border-line bg-surface px-3 py-2 font-mono text-xs text-ink focus:border-brand focus:outline-none"
      />
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
          Saved. Reload the public site to see changes.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-surface hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save settings'}
      </button>
    </form>
  );
}
