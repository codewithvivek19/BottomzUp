import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { getSiteUrl } from './site-url';

/**
 * NextAuth config for local + Vercel.
 *
 * Production requirements (Vercel project env):
 * - NEXTAUTH_SECRET
 * - NEXTAUTH_URL = https://YOUR_REAL_DOMAIN  (or omit; we fall back to VERCEL_URL)
 * - DATABASE_URL / DIRECT_URL
 *
 * Do NOT set NEXTAUTH_URL=http://localhost:3000 in Vercel.
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 12, // 12 hours
  },
  pages: { signIn: '/admin/login' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password || '';
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name || 'Manager' };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        (session.user as { id?: string }).id = String(token.uid);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Keep admin redirects on the current host (prod or local), never localhost-only.
      const site = getSiteUrl() || baseUrl;
      if (url.startsWith('/')) return `${site}${url}`;
      try {
        const next = new URL(url);
        const allowed = new URL(site);
        if (next.origin === allowed.origin) return url;
      } catch {
        /* ignore bad url */
      }
      return site;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Secure cookies automatically on HTTPS production hosts.
  useSecureCookies: process.env.NODE_ENV === 'production',
};
