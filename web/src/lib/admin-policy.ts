/** Pure manager authorization helpers (safe for Edge middleware). */

export function allowedAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS?.trim() || process.env.ADMIN_EMAIL?.trim() || '';
  return new Set(
    raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

/**
 * Manager gate:
 * - Prefer app_metadata.role = manager|admin (set in Supabase Auth, not user_metadata)
 * - Or email allowlist via ADMIN_EMAILS / ADMIN_EMAIL
 */
export function isManager(email: string | null | undefined, role: string | null | undefined): boolean {
  if (!email) return false;
  if (role === 'manager' || role === 'admin') return true;
  const allow = allowedAdminEmails();
  if (allow.size === 0) {
    // Dev convenience only — production must set allowlist or role.
    return process.env.NODE_ENV !== 'production';
  }
  return allow.has(email.toLowerCase());
}
