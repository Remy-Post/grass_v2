import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_COOKIE = 'tlg_admin';

export function middleware(req: NextRequest): NextResponse {
  const path = req.nextUrl.pathname;

  // Login page is public so unauthenticated users can sign in.
  if (path === '/admin/login' || path === '/admin/logout') {
    return NextResponse.next();
  }

  if (path.startsWith('/admin')) {
    if (!req.cookies.has(ADMIN_COOKIE)) {
      const url = new URL('/admin/login', req.url);
      if (path !== '/admin') url.searchParams.set('next', path);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
