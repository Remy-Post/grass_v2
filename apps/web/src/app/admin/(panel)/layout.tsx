import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/admin-auth';
import { AdminShell } from '@/components/admin/AdminShell';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const ok = await isAuthenticated();
  if (!ok) redirect('/admin/login');
  return <AdminShell>{children}</AdminShell>;
}
