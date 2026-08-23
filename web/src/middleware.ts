import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * Protect manager surfaces. Login stays public.
 * No public-site links — managers open /admin/login by URL.
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
        if (pathname.startsWith('/admin/login')) return true;
        return Boolean(token);
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin',
    '/admin/events/:path*',
    '/admin/coupon/:path*',
    '/admin/leads/:path*',
  ],
};
