import { NextResponse, type NextRequest } from 'next/server';
import { isAuthenticated, getAdminToken } from '@/lib/admin-auth';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ kind: string; slug: string }> },
): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = await getAdminToken();
  const { kind, slug } = await params;
  const body = await req.text();

  const res = await fetch(`${API_BASE}/api/admin/content/${kind}/${slug}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  return new NextResponse(await res.text(), {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ kind: string; slug: string }> },
): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = await getAdminToken();
  const { kind, slug } = await params;
  const res = await fetch(`${API_BASE}/api/admin/content/${kind}/${slug}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return new NextResponse(null, { status: res.status });
}
