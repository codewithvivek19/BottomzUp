/** Run an admin data read without blowing up the whole RSC tree. */
export async function safeAdminQuery<T>(
  label: string,
  run: () => Promise<T>,
  fallback: T
): Promise<{ data: T; error: string | null }> {
  try {
    const data = await run();
    return { data, error: null };
  } catch (err) {
    console.error(`[admin-data] ${label} failed`, err);
    const message =
      err instanceof Error ? err.message : 'Database request failed';
    const safe =
      /permission|policy|RLS|JWT/i.test(message)
        ? 'Supabase blocked table access. Run web/supabase/hostinger-grants.sql in the SQL editor (or set SUPABASE_SERVICE_ROLE_KEY on Hostinger).'
        : /Missing Supabase|SUPABASE_/i.test(message)
          ? 'Supabase env missing. Use Hostinger Database→Connect→Supabase (SUPABASE_URL + SUPABASE_API_KEY), then redeploy.'
          : 'Database error while loading admin data via Supabase HTTPS.';
    return { data: fallback, error: safe };
  }
}
