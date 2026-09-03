import net from 'node:net';
import { NextResponse } from 'next/server';
import { probeSupabaseData } from '@/lib/data/store';
import { inspectDatabaseUrl } from '@/lib/db-url';
import { hasSupabaseEnv } from '@/lib/supabase/env';

export const dynamic = 'force-dynamic';

/**
 * Public health probe for Hostinger.
 * Prefers Supabase HTTPS (Hostinger-supported path). Prisma TCP is secondary.
 */
function tcpProbe(
  host: string | null,
  port: string | null,
  timeoutMs = 4000
): Promise<'open' | 'closed' | 'timeout' | 'error' | 'skipped'> {
  if (!host || !port) return Promise.resolve('skipped');
  const portNum = Number(port);
  if (!Number.isFinite(portNum)) return Promise.resolve('skipped');

  return new Promise((resolve) => {
    const socket = net.connect({ host, port: portNum });
    let settled = false;
    const finish = (result: 'open' | 'closed' | 'timeout' | 'error') => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };
    const timer = setTimeout(() => finish('timeout'), timeoutMs);
    socket.once('connect', () => {
      clearTimeout(timer);
      finish('open');
    });
    socket.once('error', (err: NodeJS.ErrnoException) => {
      clearTimeout(timer);
      if (err.code === 'ECONNREFUSED') finish('closed');
      else if (err.code === 'ETIMEDOUT') finish('timeout');
      else finish('error');
    });
  });
}

export async function GET() {
  const db = inspectDatabaseUrl(process.env.DATABASE_URL);
  const direct = inspectDatabaseUrl(process.env.DIRECT_URL);

  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL?.trim()),
    DIRECT_URL: Boolean(process.env.DIRECT_URL?.trim()),
    SUPABASE_URL: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || process.env.SUPABASE_URL?.trim()
    ),
    SUPABASE_KEY: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
        process.env.SUPABASE_API_KEY?.trim() ||
        process.env.SUPABASE_ANON_KEY?.trim()
    ),
    ADMIN_EMAILS: Boolean(
      process.env.ADMIN_EMAILS?.trim() || process.env.ADMIN_EMAIL?.trim()
    ),
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL?.trim() || null,
    HOSTINGER_SUPABASE_URL: Boolean(process.env.SUPABASE_URL?.trim()),
    HOSTINGER_SUPABASE_API_KEY: Boolean(process.env.SUPABASE_API_KEY?.trim()),
  };

  const [tcpDatabase, tcpDirect, supabaseProbe] = await Promise.all([
    tcpProbe(db.host, db.port),
    tcpProbe(direct.host, direct.port),
    hasSupabaseEnv()
      ? probeSupabaseData()
      : Promise.resolve({
          ok: false as const,
          eventCount: null,
          error: 'missing_supabase_env',
        }),
  ]);

  const dataPath: 'supabase_https' | 'none' = supabaseProbe.ok
    ? 'supabase_https'
    : 'none';

  const ok = supabaseProbe.ok && env.SUPABASE_URL && env.SUPABASE_KEY;

  let hint: string | null = null;
  if (!env.SUPABASE_URL || !env.SUPABASE_KEY) {
    hint =
      'Missing Supabase URL/key. Use Hostinger Database→Connect→Supabase (sets SUPABASE_URL + SUPABASE_API_KEY), or set NEXT_PUBLIC_SUPABASE_URL + anon key.';
  } else if (!supabaseProbe.ok) {
    hint =
      supabaseProbe.error?.includes('permission') ||
      supabaseProbe.error?.includes('RLS') ||
      supabaseProbe.error?.includes('policy')
        ? 'Supabase HTTPS reached but table access is blocked. Run web/supabase/hostinger-grants.sql in the Supabase SQL editor (expose Event/CouponSetting/Lead).'
        : `Supabase HTTPS data probe failed: ${supabaseProbe.error || 'unknown'}. Confirm Hostinger SUPABASE_URL / SUPABASE_API_KEY and that tables Event, CouponSetting, Lead exist.`;
  }

  return NextResponse.json(
    {
      ok,
      dataPath,
      database: supabaseProbe.ok ? 'ok' : 'error',
      databaseError: supabaseProbe.ok ? null : supabaseProbe.error,
      eventCount: supabaseProbe.eventCount,
      env,
      supabaseHttps: {
        ok: supabaseProbe.ok,
        eventCount: supabaseProbe.eventCount,
        error: supabaseProbe.error,
      },
      // Prisma/TCP diagnostics kept for debugging only — not required for ok.
      prismaTcp: {
        databaseHost: db.host,
        databasePort: db.port,
        databaseTcp: tcpDatabase,
        databaseHasPgBouncer: db.hasPgBouncerFlag,
        directHost: direct.host,
        directPort: direct.port,
        directTcp: tcpDirect,
        hint:
          tcpDatabase === 'open' && !db.hasPgBouncerFlag && db.port === '6543'
            ? 'Prisma pooler :6543 should include pgbouncer=true (app sanitizes this). App data now prefers Supabase HTTPS.'
            : null,
      },
      hint,
    },
    { status: ok ? 200 : 503 }
  );
}
