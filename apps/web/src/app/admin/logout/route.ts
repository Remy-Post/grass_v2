import { NextResponse } from 'next/server';
import { clearAdminCookie } from '@/lib/admin-auth';

export async function POST(): Promise<NextResponse> {
  await clearAdminCookie();
  return NextResponse.redirect(new URL('/admin/login', getOrigin()), { status: 303 });
}

export async function GET(): Promise<NextResponse> {
  return POST();
}

function getOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}
