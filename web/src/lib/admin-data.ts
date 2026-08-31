import { prisma } from '@/lib/prisma';

/** Run a Prisma read for admin UI without blowing up the whole RSC tree. */
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
    // Keep message short / safe for UI — no connection strings.
    const safe =
      /P1001|Can't reach|ECONNREFUSED|timeout|ENOTFOUND/i.test(message)
        ? 'Cannot reach the database. Check DATABASE_URL / DIRECT_URL on Hostinger.'
        : /P2021|does not exist|relation/i.test(message)
          ? 'Database tables are missing. Run prisma migrate deploy on Hostinger (included in build).'
          : 'Database error while loading admin data.';
    return { data: fallback, error: safe };
  }
}

export { prisma };
