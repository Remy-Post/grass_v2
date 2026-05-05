import Link from 'next/link';
import type { Route } from 'next';
import { CONTENT_KINDS } from '@lawnguy/brand';
import { adminGet } from '@/lib/admin-api';

type LeadsResponse = { count: number; total: number };
type ContentResponse = { items: Array<{ slug: string; enabled: boolean }> };

async function safeCount(path: string): Promise<{ ok: boolean; count: number }> {
  try {
    const data = await adminGet<ContentResponse>(path);
    return { ok: true, count: data.items.length };
  } catch {
    return { ok: false, count: 0 };
  }
}

export default async function DashboardPage() {
  const [leads, ...kindCounts] = await Promise.all([
    adminGet<LeadsResponse>('/api/admin/leads?limit=1').catch(() => ({ count: 0, total: 0 })),
    ...CONTENT_KINDS.map((kind) => safeCount(`/api/admin/content/${kind}`)),
  ]);

  const totalEnabled = kindCounts.reduce((sum, k) => sum + (k.ok ? k.count : 0), 0);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">Admin</p>
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <p className="text-ink-soft">Quick view of content and leads.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat title="Leads" value={String(leads.total ?? leads.count)} href="/admin/leads" />
        <Stat
          title="Content items (in DB)"
          value={String(totalEnabled)}
          href={`/admin/content/${CONTENT_KINDS[0]}` as Route}
        />
        <Stat title="Site settings" value="View" href="/admin/settings" />
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Content collections</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {CONTENT_KINDS.map((kind, i) => {
            const c = kindCounts[i];
            return (
              <li key={kind}>
                <Link
                  href={`/admin/content/${kind}` as Route}
                  className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3 hover:border-brand"
                >
                  <span className="font-medium">{kind}</span>
                  <span className="text-sm text-ink-muted">
                    {c?.ok ? `${c.count} items` : 'unavailable'}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="text-xs text-ink-muted">
        Tip: run <code>pnpm seed</code> if any collection shows 0 items — that re-imports
        from <code>website.json</code>.
      </p>
    </div>
  );
}

function Stat({ title, value, href }: { title: string; value: string; href: Route }) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-line bg-surface p-5 hover:border-brand"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">{title}</p>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
    </Link>
  );
}
