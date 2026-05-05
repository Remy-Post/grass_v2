import Link from 'next/link';
import type { Route } from 'next';
import { CONTENT_KINDS } from '@lawnguy/brand';

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-bg md:grid-cols-[16rem_1fr]">
      <aside className="border-r border-line bg-surface-alt p-4 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <Link
          href="/admin/dashboard"
          className="mb-6 flex items-center gap-2 font-display text-lg font-semibold text-ink"
        >
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-md bg-brand text-surface text-xs font-semibold"
          >
            TLG
          </span>
          Admin
        </Link>
        <nav className="space-y-1 text-sm">
          <NavLink href="/admin/dashboard">Dashboard</NavLink>
          <NavLink href="/admin/leads">Leads</NavLink>
          <NavLink href="/admin/settings">Site settings</NavLink>
          <p className="mt-4 px-3 text-xs font-medium uppercase tracking-wider text-ink-muted">
            Content
          </p>
          {CONTENT_KINDS.map((kind) => (
            <NavLink key={kind} href={`/admin/content/${kind}` as Route}>
              {kind}
            </NavLink>
          ))}
        </nav>
        <form action="/admin/logout" method="POST" className="mt-6 px-3">
          <button
            type="submit"
            className="text-xs font-medium text-ink-muted hover:text-brand"
          >
            Sign out
          </button>
        </form>
      </aside>
      <main className="p-6 md:p-10">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: Route; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-md px-3 py-2 text-ink-soft hover:bg-surface hover:text-ink"
    >
      {children}
    </Link>
  );
}
