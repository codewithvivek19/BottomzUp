import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Public health probe for Hostinger debugging.
 * Does not expose secrets — only booleans + short status.
 */
export async function GET() {
  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL?.trim()),
    DIRECT_URL: Boolean(process.env.DIRECT_URL?.trim()),
    SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
    SUPABASE_KEY: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
    ),
    ADMIN_EMAILS: Boolean(
      process.env.ADMIN_EMAILS?.trim() || process.env.ADMIN_EMAIL?.trim()
    ),
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL?.trim() || null,
  };

  let database: 'ok' | 'error' = 'error';
  let databaseError: string | null = null;
  let eventCount: number | null = null;

  try {
    eventCount = await prisma.event.count();
    database = 'ok';
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    if (/P1001|Can't reach|ECONNREFUSED|ENOTFOUND|timeout/i.test(message)) {
      databaseError = 'unreachable';
    } else if (/P2021|does not exist|relation/i.test(message)) {
      databaseError = 'missing_tables';
    } else {
      databaseError = 'query_failed';
    }
  }

  const ok = database === 'ok' && env.SUPABASE_URL && env.SUPABASE_KEY;

  return NextResponse.json(
    {
      ok,
      database,
      databaseError,
      eventCount,
      env,
    },
    { status: ok ? 200 : 503 }
  );
}
