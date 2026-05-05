import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isContentKind } from '@lawnguy/brand';
import { adminGet } from '@/lib/admin-api';
import { ContentEditClient } from '@/components/admin/ContentEditClient';

type Item = {
  _id: string;
  kind: string;
  slug: string;
  title: string;
  enabled: boolean;
  order: number;
  data: unknown;
};

export default async function ContentEditPage({
  params,
}: {
  params: Promise<{ kind: string; slug: string }>;
}) {
  const { kind, slug } = await params;
  if (!isContentKind(kind)) notFound();

  const isNew = slug === '__new';

  let item: Item | null = null;
  if (!isNew) {
    try {
      const data = await adminGet<{ item: Item }>(`/api/admin/content/${kind}/${slug}`);
      item = data.item;
    } catch {
      // 404 — let user know
    }
  }

  if (!isNew && !item) {
    return (
      <div className="space-y-4">
        <Link href={`/admin/content/${kind}`} className="text-sm text-ink-muted hover:text-brand">
          ← Back to {kind}
        </Link>
        <p className="rounded-md border border-line bg-surface px-4 py-6 text-sm">
          Item not found. It may have been deleted.
        </p>
      </div>
    );
  }

  const initial = item ?? {
    title: '',
    slug: '',
    enabled: true,
    order: 100,
    data: {},
  };

  return (
    <div className="space-y-6">
      <Link href={`/admin/content/${kind}`} className="text-sm text-ink-muted hover:text-brand">
        ← Back to {kind}
      </Link>
      <header>
        <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">
          {kind}
        </p>
        <h1 className="font-display text-3xl font-semibold">
          {isNew ? `New ${kind}` : initial.title}
        </h1>
      </header>
      <ContentEditClient kind={kind} slug={slug} initial={initial} isNew={isNew} />
    </div>
  );
}
