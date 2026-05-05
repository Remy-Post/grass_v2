import { adminGet } from '@/lib/admin-api';
import { SettingsEditClient } from '@/components/admin/SettingsEditClient';

type Response = { data: unknown };

export default async function SettingsPage() {
  let initial: unknown = {};
  let error: string | undefined;
  try {
    const data = await adminGet<Response>('/api/admin/settings');
    initial = data.data ?? {};
  } catch (err) {
    error = (err as Error).message;
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">Admin</p>
        <h1 className="font-display text-3xl font-semibold">Site settings</h1>
        <p className="text-ink-soft">
          Singleton document. Validated server-side against the SiteSettings Zod schema.
        </p>
      </header>
      {error ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      ) : (
        <SettingsEditClient initial={initial} />
      )}
    </div>
  );
}
