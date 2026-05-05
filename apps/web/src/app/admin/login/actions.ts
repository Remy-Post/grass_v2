'use server';

import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { isValidToken, setAdminCookie } from '@/lib/admin-auth';

export async function login(formData: FormData): Promise<void> {
  const token = String(formData.get('token') ?? '');
  const next = String(formData.get('next') ?? '/admin/dashboard');

  if (!isValidToken(token)) {
    const params = new URLSearchParams({ error: 'invalid' });
    if (next && next !== '/admin/dashboard') params.set('next', next);
    redirect(`/admin/login?${params.toString()}` as Route);
  }

  await setAdminCookie(token);
  redirect((next.startsWith('/admin') ? next : '/admin/dashboard') as Route);
}
