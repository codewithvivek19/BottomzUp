/**
 * Supabase env resolution.
 *
 * Supports both our Next.js names and Hostinger’s Database→Connect wizard:
 *   SUPABASE_URL
 *   SUPABASE_API_KEY  (anon / publishable)
 *   SUPABASE_ANON_KEY
 */

export function getSupabaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  if (!url) {
    throw new Error(
      'Missing Supabase URL (set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL)'
    );
  }
  return url;
}

export function getSupabaseAnonKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_API_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim();
  if (!key) {
    throw new Error(
      'Missing Supabase key (set NEXT_PUBLIC_SUPABASE_ANON_KEY / PUBLISHABLE_KEY, or Hostinger SUPABASE_API_KEY)'
    );
  }
  return key;
}

/** Optional — bypasses RLS for server-side admin/data. Prefer when available. */
export function getSupabaseServiceRoleKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null;
}

export function hasSupabaseEnv(): boolean {
  try {
    getSupabaseUrl();
    getSupabaseAnonKey();
    return true;
  } catch {
    return false;
  }
}
