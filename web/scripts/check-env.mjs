#!/usr/bin/env node
/** Print which required env vars are present (not values) during Hostinger build. */
const keys = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_URL',
  'SUPABASE_API_KEY',
  'SUPABASE_ANON_KEY',
  'ADMIN_EMAILS',
  'ADMIN_EMAIL',
  'NEXT_PUBLIC_SITE_URL',
];

const report = Object.fromEntries(
  keys.map((k) => [k, Boolean(process.env[k]?.trim())])
);

console.log('[check-env]', JSON.stringify(report));

const hasSupabaseUrl = report.NEXT_PUBLIC_SUPABASE_URL || report.SUPABASE_URL;
const hasSupabaseKey =
  report.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  report.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  report.SUPABASE_API_KEY ||
  report.SUPABASE_ANON_KEY;

if (!hasSupabaseUrl || !hasSupabaseKey) {
  console.warn(
    '[check-env] WARNING: Supabase URL/key missing — use Hostinger Database→Connect (SUPABASE_URL + SUPABASE_API_KEY) or NEXT_PUBLIC_SUPABASE_*.'
  );
}
if (!report.DATABASE_URL) {
  console.warn(
    '[check-env] NOTE: DATABASE_URL missing — OK on Hostinger if using Supabase HTTPS data path; still needed for prisma migrate/seed locally.'
  );
}
if (!report.ADMIN_EMAILS && !report.ADMIN_EMAIL) {
  console.warn('[check-env] WARNING: ADMIN_EMAILS missing — only app_metadata.role=manager will work.');
}
