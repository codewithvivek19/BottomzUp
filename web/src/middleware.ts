import { NextResponse, type NextRequest } from 'next/server';
import { isManager } from '@/lib/admin-policy';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Supabase session refresh + manager gate.
 * Public /events is not matched — stays open.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === '/admin/login' || pathname.startsWith('/admin/login/');
  const isAdminArea = pathname === '/admin' || pathname.startsWith('/admin/');

  let supabaseResponse = NextResponse.next({ request });
  let email: string | null = null;
  let role: string | null = null;

  try {
    const session = await updateSession(request);
    supabaseResponse = session.supabaseResponse;
    email = session.email;
    role = session.role;
  } catch (err) {
    console.error('[middleware] session update failed', err);
    // Never 500 the whole admin surface from auth/env failures.
    if (isAdminArea && !isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (!isAdminArea) {
    return supabaseResponse;
  }

  const allowed = isManager(email, role);

  if (isLogin) {
    if (allowed) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (!allowed) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    // Keep session fresh when hitting auth-aware APIs from the browser.
    '/api/admin/:path*',
    '/api/events',
    '/api/events/:path*',
    '/api/leads',
    '/api/leads/:path*',
    '/api/upload',
  ],
};
