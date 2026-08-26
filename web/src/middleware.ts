import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * Auth gate for manager surfaces only.
 *
 * Public /events is NOT matched — stays open on local and Vercel.
 * /admin/login stays reachable; everything else under /admin needs a session.
 */
export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    pages: { signIn: '/admin/login' },
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
          return true;
        }
        return Boolean(token);
      },
    },
  }
);

export const config = {
  // Cover /admin and every nested manager route (events, coupon, leads, …).
  matcher: ['/admin', '/admin/:path*'],
};
