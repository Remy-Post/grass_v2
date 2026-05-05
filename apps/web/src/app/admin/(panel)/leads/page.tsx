import { adminGet } from '@/lib/admin-api';

type Lead = {
  _id: string;
  name: string;
  contact: string;
  address: string;
  serviceNeed?: string;
  cadence?: string;
  yardState?: string;
  notes?: string;
  source?: string;
  createdAt: string;
};

type Response = { items: Lead[]; total: number };

export default async function LeadsPage() {
  let items: Lead[] = [];
  let total = 0;
  let error: string | undefined;
  try {
    const data = await adminGet<Response>('/api/admin/leads?limit=200');
    items = data.items;
    total = data.total ?? items.length;
  } catch (err) {
    error = (err as Error).message;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">Admin</p>
          <h1 className="font-display text-3xl font-semibold">Leads</h1>
          <p className="text-ink-soft">{total} total</p>
        </div>
      </header>

      {error ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-md border border-line bg-surface px-4 py-6 text-sm text-ink-muted">
          No leads yet. The contact form will populate this list when visitors submit.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Need</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((lead) => (
                <tr key={lead._id}>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {new Date(lead.createdAt).toLocaleString('en-CA')}
                  </td>
                  <td className="px-4 py-3 font-medium">{lead.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{lead.contact}</td>
                  <td className="px-4 py-3 text-ink-soft">{lead.address}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {[lead.serviceNeed, lead.cadence, lead.yardState].filter(Boolean).join(' · ')}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{lead.notes ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
