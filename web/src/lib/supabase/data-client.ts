import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from './env';

/**
 * Server-side Supabase client for table access over HTTPS (PostgREST).
 * This is the path Hostinger’s “Connect Supabase” wizard supports —
 * not Prisma’s Postgres wire protocol on :5432/:6543.
 */
export function createDataClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const service = getSupabaseServiceRoleKey();
  const key = service || getSupabaseAnonKey();
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
