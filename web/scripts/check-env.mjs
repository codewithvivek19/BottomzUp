#!/usr/bin/env node
/** Print which required env vars are present (not values) during Hostinger build. */
const keys = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'ADMIN_EMAILS',
  'ADMIN_EMAIL',
  'NEXT_PUBLIC_SITE_URL',
];

const report = Object.fromEntries(
  keys.map((k) => [k, Boolean(process.env[k]?.trim())])
);

console.log('[check-env]', JSON.stringify(report));

if (!report.DATABASE_URL) {
  console.warn('[check-env] WARNING: DATABASE_URL missing — admin/events will fail at runtime.');
} else {
  const raw = process.env.DATABASE_URL.trim();
  const looksUri = /^(?:DATABASE_URL\s*=\s*)?["']?(postgres|postgresql):\/\//i.test(raw);
  if (!looksUri) {
    console.warn(
      '[check-env] WARNING: DATABASE_URL does not look like a postgres:// URI (length=' +
        raw.length +
        '). Paste the Transaction pooler URI only — no quotes.'
    );
  }
}
if (!report.NEXT_PUBLIC_SUPABASE_URL || !(report.NEXT_PUBLIC_SUPABASE_ANON_KEY || report.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) {
  console.warn('[check-env] WARNING: Supabase public env missing — auth will fail.');
}
if (!report.ADMIN_EMAILS && !report.ADMIN_EMAIL) {
  console.warn('[check-env] WARNING: ADMIN_EMAILS missing — only app_metadata.role=manager will work.');
}
