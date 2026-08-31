import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAnonKey, getSupabaseUrl } from './env';

/**
 * Refresh the auth cookie on each matched request.
 * Always verify identity with getClaims()/getUser() — never trust getSession() alone.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  let email: string | null = null;
  let role: string | null = null;

  let url: string;
  let key: string;
  try {
    url = getSupabaseUrl();
    key = getSupabaseAnonKey();
  } catch (err) {
    console.error('[updateSession] missing Supabase env', err);
    return { supabaseResponse, email, role, supabase: null };
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // Validates JWT (getClaims) or falls back to Auth server lookup (getUser).
  try {
    const { data, error } = await supabase.auth.getClaims();
    if (!error && data?.claims) {
      email = typeof data.claims.email === 'string' ? data.claims.email : null;
      const appMeta = (data.claims.app_metadata || {}) as Record<string, unknown>;
      role = typeof appMeta.role === 'string' ? appMeta.role : null;
    }
  } catch {
    // Older projects / symmetric JWT: getClaims may be unavailable.
  }

  if (!email) {
    try {
      const { data } = await supabase.auth.getUser();
      email = data.user?.email ?? null;
      const appMeta = (data.user?.app_metadata || {}) as Record<string, unknown>;
      role = typeof appMeta.role === 'string' ? appMeta.role : role;
    } catch (err) {
      console.error('[updateSession] getUser failed', err);
    }
  }

  return { supabaseResponse, email, role, supabase };
}
