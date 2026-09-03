/**
 * Hostinger Database→Connect sample entrypoint.
 * The Next.js app uses src/lib/supabase/* (TypeScript) for real work.
 * This file satisfies Hostinger’s checklist and can be required manually:
 *   node -e "require('./db')"
 */
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_API_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error(
    '[db.js] Missing SUPABASE_URL / SUPABASE_API_KEY (or NEXT_PUBLIC_SUPABASE_* equivalents)'
  );
} else {
  const supabase = createClient(url, key);
  // Prisma table name is quoted "Event" — must match exactly.
  supabase
    .from('Event')
    .select('id')
    .limit(1)
    .then(({ data, error }) => {
      if (error) console.error('[db.js] Connection error:', error.message);
      else console.log('[db.js] Connected via Supabase HTTPS:', data);
    });
}

module.exports = {
  createClient,
  getClient() {
    if (!url || !key) throw new Error('Missing Supabase env');
    return createClient(url, key);
  },
};
