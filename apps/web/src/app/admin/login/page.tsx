import { login } from './actions';

type SearchParams = { error?: string; next?: string };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const errored = params.error === 'invalid';
  const next = params.next ?? '/admin/dashboard';

  return (
    <main className="grid min-h-screen place-items-center bg-bg p-6">
      <form
        action={login}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-sm"
      >
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">Admin</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Enter the admin token from your <code>.env.local</code>.
          </p>
        </div>
        <input type="hidden" name="next" value={next} />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">Admin token</span>
          <input
            name="token"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </label>
        {errored ? (
          <p
            role="alert"
            className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900"
          >
            That token didn&apos;t match. Try again.
          </p>
        ) : null}
        <button
          type="submit"
          className="w-full rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-surface hover:bg-brand-dark"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
