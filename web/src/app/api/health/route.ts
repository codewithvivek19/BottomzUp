import net from 'node:net';
import { NextResponse } from 'next/server';
import { inspectDatabaseUrl } from '@/lib/db-url';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Public health probe for Hostinger debugging.
 * Does not expose secrets — only booleans + short status.
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

  const [tcpDatabase, tcpDirect] = await Promise.all([
    tcpProbe(db.host, db.port),
    tcpProbe(direct.host, direct.port),
  ]);

  let database: 'ok' | 'error' = 'error';
  let databaseError: string | null = null;
  let prismaCode: string | null = null;
  let eventCount: number | null = null;

  try {
    eventCount = await prisma.event.count();
    database = 'ok';
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    const code =
      err && typeof err === 'object' && 'code' in err && typeof (err as { code: unknown }).code === 'string'
        ? (err as { code: string }).code
        : null;
    prismaCode = code || (message.match(/\bP\d{4}\b/)?.[0] ?? null);

    const scrubbed = message
      .replace(/postgresql:\/\/[^\s'"]+/gi, 'postgresql://[redacted]')
      .replace(/postgres:\/\/[^\s'"]+/gi, 'postgres://[redacted]')
      .replace(/:[^:@/\s]+@/g, ':[redacted]@')
      .split('\n')[0]
      .slice(0, 180);

    if (/P1001|Can't reach|ECONNREFUSED|ENOTFOUND|timeout/i.test(message)) {
      databaseError = 'unreachable';
    } else if (/P1000|Authentication failed|credentials|Tenant or user not found/i.test(message)) {
      databaseError = 'auth_failed';
    } else if (/P1011|SSL|TLS/i.test(message)) {
      databaseError = 'ssl_error';
    } else if (/P2021|does not exist|relation/i.test(message)) {
      databaseError = 'missing_tables';
    } else if (/prepared statement|PgBouncer|42P05/i.test(message)) {
      databaseError = 'pooler_prepared_statements';
    } else {
      databaseError = 'query_failed';
    }

    if (scrubbed && databaseError !== 'unreachable') {
      databaseError = `${databaseError}:${scrubbed}`;
    }
  }

  const ok = database === 'ok' && env.SUPABASE_URL && env.SUPABASE_KEY;

  let hint: string | null = null;
  if (db.parseError === 'not_postgres_uri' || db.parseError === 'invalid_url' || db.parseError === 'empty_after_clean') {
    hint =
      'DATABASE_URL is set but is not a usable Postgres URI (often wrapped in quotes, includes DATABASE_URL=, or is a flag like true). Paste the raw Transaction pooler URI only — no quotes.';
  } else if (db.quoteWrapped || db.hadKeyPrefix) {
    hint =
      'DATABASE_URL looks quote-wrapped or includes a KEY= prefix. In Hostinger, set the value to the URI only (no quotes, no DATABASE_URL=).';
  } else if (db.usesDirectHost || direct.usesDirectHost) {
    hint =
      'Direct/dedicated endpoints are IPv6-only by default. On Hostinger use Shared pooler: Transaction :6543?pgbouncer=true for DATABASE_URL and Session :5432 for DIRECT_URL (aws-*.pooler.supabase.com).';
  } else if (!db.usesPooler && db.host) {
    hint =
      'DATABASE_URL host is not the Supabase shared pooler — on Hostinger use Transaction pooler :6543?pgbouncer=true.';
  } else if (tcpDatabase === 'timeout' || tcpDatabase === 'closed' || tcpDatabase === 'error') {
    hint =
      'Hostinger cannot open TCP to the pooler port. Use hPanel → Node app → Database → Connect → Supabase, or ask Hostinger to allow outbound 6543/5432.';
  } else if (db.usesPooler && db.usernameLooksLikePoolerTenant === false) {
    hint =
      'Pooler username must be postgres.<project-ref> (not plain postgres). Copy Transaction pooler URI from Supabase → Connect.';
  } else if (tcpDatabase === 'open' && databaseError === 'unreachable') {
    hint =
      'TCP to pooler works, but Prisma still fails — usually bad password encoding, missing ?pgbouncer=true, or circuit-breaker after bad auth. Re-copy URIs from Supabase Connect and redeploy.';
  }

  const connection = {
    databaseHost: db.host,
    databasePort: db.port,
    databaseUsesPooler: db.usesPooler,
    databaseUsesDirectHost: db.usesDirectHost,
    databaseHasPgBouncer: db.hasPgBouncerFlag,
    databaseUserLooksLikePoolerTenant: db.usernameLooksLikePoolerTenant,
    databaseTcp: tcpDatabase,
    databaseUrlLength: db.length,
    databaseLooksLikePostgresUri: db.looksLikePostgresUri,
    databaseQuoteWrapped: db.quoteWrapped,
    databaseHadKeyPrefix: db.hadKeyPrefix,
    databaseParseError: db.parseError,
    directHost: direct.host,
    directPort: direct.port,
    directUsesPooler: direct.usesPooler,
    directUsesDirectHost: direct.usesDirectHost,
    directTcp: tcpDirect,
    directParseError: direct.parseError,
    directLooksLikePostgresUri: direct.looksLikePostgresUri,
    hint,
  };

  return NextResponse.json(
    {
      ok,
      database,
      databaseError,
      prismaCode,
      eventCount,
      env,
      connection,
    },
    { status: ok ? 200 : 503 }
  );
}
