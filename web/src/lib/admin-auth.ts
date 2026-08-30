import { NextResponse } from 'next/server';
import { isManager } from '@/lib/admin-policy';
import { createClient } from '@/lib/supabase/server';

export type AdminUser = {
  id: string;
  email: string;
  role: string | null;
};

export { isManager } from '@/lib/admin-policy';

export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient();

  let email: string | null = null;
  let role: string | null = null;
  let id = '';

  try {
    const { data, error } = await supabase.auth.getClaims();
    if (!error && data?.claims) {
      email = typeof data.claims.email === 'string' ? data.claims.email : null;
      id = typeof data.claims.sub === 'string' ? data.claims.sub : '';
      const appMeta = (data.claims.app_metadata || {}) as Record<string, unknown>;
      role = typeof appMeta.role === 'string' ? appMeta.role : null;
    }
  } catch {
    /* fall through to getUser */
  }

  if (!email) {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    email = data.user.email ?? null;
    id = data.user.id;
    const appMeta = (data.user.app_metadata || {}) as Record<string, unknown>;
    role = typeof appMeta.role === 'string' ? appMeta.role : null;
  }

  if (!isManager(email, role) || !email) return null;
  return { id, email, role };
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { user, error: null };
}
