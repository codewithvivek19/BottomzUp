import net from 'node:net';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Public health probe for Hostinger debugging.
 * Does not expose secrets — only booleans + short status.
 */
function parseDbTarget(raw: string | undefined): {
  host: string | null;
  port: string | null;
  usesPooler: boolean;
  usesDirectHost: boolean;
  hasPgBouncerFlag: boolean;
  /** Pooler needs postgres.<projectRef>; never returns the actual username. */
  usernameLooksLikePoolerTenant: boolean | null;
  hasSslMode: boolean;
} {
  const empty = {
    host: null,
    port: null,
    usesPooler: false,
    usesDirectHost: false,
    hasPgBouncerFlag: false,
    usernameLooksLikePoolerTenant: null as boolean | null,
    hasSslMode: false,
  };
  if (!raw?.trim()) return empty;
  try {
    // Normalize postgres:// → http:// so URL() can parse host/port without leaking userinfo.
    const u = new URL(raw.trim().replace(/^postgresql:/i, 'http:').replace(/^postgres:/i, 'http:'));
    const host = u.hostname || null;
    const port = u.port || null;
    const user = decodeURIComponent(u.username || '');
    return {
      host,
      port,
      usesPooler: Boolean(host && /pooler\.supabase\.com$/i.test(host)),
      usesDirectHost: Boolean(host && /^db\.[a-z0-9]+\.supabase\.co$/i.test(host)),
      hasPgBouncerFlag: /(?:^|[?&])pgbouncer=true(?:&|$)/i.test(raw),
      usernameLooksLikePoolerTenant: user ? /^postgres\.[a-z0-9]+$/i.test(user) : null,
      hasSslMode: /(?:^|[?&])sslmode=/i.test(raw),
    };
  } catch {
    return empty;
  }
}

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
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  const dbTarget = parseDbTarget(databaseUrl);
  const directTarget = parseDbTarget(directUrl);

  const env = {
    DATABASE_URL: Boolean(databaseUrl?.trim()),
    DIRECT_URL: Boolean(directUrl?.trim()),
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
    tcpProbe(dbTarget.host, dbTarget.port),
    tcpProbe(directTarget.host, directTarget.port),
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

    // Sanitize: never return connection strings / passwords.
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

    // Attach short scrubbed detail for Hostinger debugging (still no secrets).
    if (scrubbed && databaseError !== 'unreachable') {
      databaseError = `${databaseError}:${scrubbed}`;
    }
  }

  const ok = database === 'ok' && env.SUPABASE_URL && env.SUPABASE_KEY;

  let hint: string | null = null;
  if (dbTarget.usesDirectHost || directTarget.usesDirectHost) {
    hint =
      'Hostinger is usually IPv4-only. Prefer aws-*.pooler.supabase.com (not db.*.supabase.co) for both DATABASE_URL and DIRECT_URL.';
  } else if (!dbTarget.usesPooler && dbTarget.host) {
    hint =
      'DATABASE_URL host is not the Supabase shared pooler — on Hostinger use Transaction pooler :6543?pgbouncer=true.';
  } else if (tcpDatabase === 'timeout' || tcpDatabase === 'closed' || tcpDatabase === 'error') {
    hint =
      'Hostinger cannot open TCP to the pooler port. Use hPanel → Node app → Database → Connect → Supabase (auto env), or ask Hostinger support to allow outbound 6543/5432.';
  } else if (
    dbTarget.usesPooler &&
    dbTarget.usernameLooksLikePoolerTenant === false
  ) {
    hint =
      'Pooler username must be postgres.<project-ref> (not plain postgres). Copy Transaction pooler URI from Supabase → Connect.';
  } else if (tcpDatabase === 'open' && databaseError === 'unreachable') {
    hint =
      'TCP to pooler works, but Prisma still fails — usually bad password encoding, missing ?pgbouncer=true, or circuit-breaker after bad auth. Re-copy URIs from Supabase Connect and redeploy.';
  }

  // Hint only — host/port, never user/password.
  const connection = {
    databaseHost: dbTarget.host,
    databasePort: dbTarget.port,
    databaseUsesPooler: dbTarget.usesPooler,
    databaseUsesDirectHost: dbTarget.usesDirectHost,
    databaseHasPgBouncer: dbTarget.hasPgBouncerFlag,
    databaseUserLooksLikePoolerTenant: dbTarget.usernameLooksLikePoolerTenant,
    databaseTcp: tcpDatabase,
    directHost: directTarget.host,
    directPort: directTarget.port,
    directUsesPooler: directTarget.usesPooler,
    directUsesDirectHost: directTarget.usesDirectHost,
    directTcp: tcpDirect,
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
