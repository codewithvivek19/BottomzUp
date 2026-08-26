/**
 * Resolve the public site origin for auth/cookies.
 * Never bake localhost into production — Vercel provides VERCEL_URL.
 */
export function getSiteUrl(): string {
  const explicit = (process.env.NEXTAUTH_URL || process.env.AUTH_URL || '').trim().replace(/\/$/, '');
  if (explicit) {
    // Guard: a localhost NEXTAUTH_URL on Vercel breaks cookies + redirects.
    const onVercel = Boolean(process.env.VERCEL);
    const isLocal = /localhost|127\.0\.0\.1/i.test(explicit);
    if (!(onVercel && isLocal)) return explicit;
  }

  if (process.env.VERCEL_URL) {
    const host = process.env.VERCEL_URL.replace(/^https?:\/\//, '');
    return `https://${host}`;
  }

  return 'http://localhost:3000';
}
