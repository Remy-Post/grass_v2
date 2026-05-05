import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isContentKind } from '@lawnguy/brand';
import { adminGet } from '@/lib/admin-api';

type Item = {
  _id: string;
  kind: string;
  slug: string;
  title: string;
  enabled: boolean;
  order: number;
  data: unknown;
};

type Response = { items: Item[] };

export default async function ContentListPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  if (!isContentKind(kind)) notFound();

  let items: Item[] = [];
  let error: string | undefined;
  try {
    const data = await adminGet<Response>(`/api/admin/content/${kind}`);
    items = data.items;
  } catch (err) {
    error = (err as Error).message;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">
            Content
          </p>
          <h1 className="font-display text-3xl font-semibold">{kind}</h1>
        </div>
        <Link
          href={`/admin/content/${kind}/__new`}
          className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-surface hover:bg-brand-dark"
        >
          + New {kind.replace(/-/g, ' ').replace(/s$/, '')}
        </Link>
      </header>

      {error ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-md border border-line bg-surface px-4 py-6 text-sm text-ink-muted">
          No items yet. Run <code>pnpm seed</code> to import from website.json, or use
          &ldquo;New&rdquo; above.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Enabled</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((item) => (
                <tr key={item._id}>
                  <td className="px-4 py-3 text-ink-muted">{item.order}</td>
                  <td className="px-4 py-3 font-medium">{item.title}</td>
                  <td className="px-4 py-3 text-ink-soft">{item.slug}</td>
                  <td className="px-4 py-3">
                    {item.enabled ? (
                      <span className="rounded-full bg-grass/20 px-2 py-0.5 text-xs font-medium text-brand">
                        on
                      </span>
                    ) : (
                      <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs font-medium text-ink-muted">
                        off
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/content/${kind}/${item.slug}`}
                      className="text-sm font-medium text-brand hover:underline"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
