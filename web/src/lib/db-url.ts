/**
 * Hostinger / dashboard env UIs often store values with wrapping quotes,
 * a leading `DATABASE_URL=`, or stray whitespace. Prisma and URL() both fail
 * on those, which surfaces as "unreachable" with a null parsed host.
 */

export type NormalizedDbUrl = {
  raw: string | undefined;
  cleaned: string | undefined;
  length: number;
  quoteWrapped: boolean;
  hadKeyPrefix: boolean;
  looksLikePostgresUri: boolean;
  host: string | null;
  port: string | null;
  usesPooler: boolean;
  usesDirectHost: boolean;
  hasPgBouncerFlag: boolean;
  usernameLooksLikePoolerTenant: boolean | null;
  hasSslMode: boolean;
  parseError: string | null;
};

function stripWrappingQuotes(value: string): { value: string; quoteWrapped: boolean } {
  let s = value.trim();
  let quoteWrapped = false;
  // Repeated pass for \"...\" or nested dashboard quoting.
  for (let i = 0; i < 2; i++) {
    if (
      (s.startsWith('"') && s.endsWith('"') && s.length >= 2) ||
      (s.startsWith("'") && s.endsWith("'") && s.length >= 2)
    ) {
      s = s.slice(1, -1).trim();
      quoteWrapped = true;
    }
  }
  // Escaped quotes from some paste paths: \"postgresql://...\"
  if (s.startsWith('\\"') && s.endsWith('\\"') && s.length >= 4) {
    s = s.slice(2, -2).trim();
    quoteWrapped = true;
  }
  return { value: s, quoteWrapped };
}

function stripKeyPrefix(value: string): { value: string; hadKeyPrefix: boolean } {
  const match = value.match(/^(?:DATABASE_URL|DIRECT_URL|POSTGRES_URL|DATABASE_URI)\s*=\s*/i);
  if (!match) return { value, hadKeyPrefix: false };
  return { value: value.slice(match[0].length).trim(), hadKeyPrefix: true };
}

/** Return a cleaned Postgres URI, or undefined if empty after cleaning. */
export function cleanDatabaseUrl(raw: string | undefined | null): string | undefined {
  if (raw == null) return undefined;
  let s = raw.replace(/^\uFEFF/, '').trim();
  if (!s) return undefined;
  const prefixed = stripKeyPrefix(s);
  s = prefixed.value;
  const quoted = stripWrappingQuotes(s);
  s = quoted.value;
  // One more prefix strip if someone pasted KEY="postgres://..."
  const prefixedAgain = stripKeyPrefix(s);
  s = prefixedAgain.value;
  const quotedAgain = stripWrappingQuotes(s);
  s = quotedAgain.value;
  return s || undefined;
}

export function inspectDatabaseUrl(raw: string | undefined | null): NormalizedDbUrl {
  const original = raw ?? undefined;
  const cleaned = cleanDatabaseUrl(original);
  const base: NormalizedDbUrl = {
    raw: original,
    cleaned,
    length: cleaned?.length ?? 0,
    quoteWrapped: false,
    hadKeyPrefix: false,
    looksLikePostgresUri: false,
    host: null,
    port: null,
    usesPooler: false,
    usesDirectHost: false,
    hasPgBouncerFlag: false,
    usernameLooksLikePoolerTenant: null,
    hasSslMode: false,
    parseError: cleaned ? null : original?.trim() ? 'empty_after_clean' : 'missing',
  };

  if (!original?.trim()) return base;

  // Detect quoting / key prefix on the raw value for diagnostics.
  const trimmed = original.replace(/^\uFEFF/, '').trim();
  base.hadKeyPrefix = /^(?:DATABASE_URL|DIRECT_URL|POSTGRES_URL|DATABASE_URI)\s*=/i.test(trimmed);
  base.quoteWrapped =
    /^["']/.test(trimmed) ||
    /^\\"/i.test(trimmed) ||
    (Boolean(cleaned) && trimmed !== cleaned && /["']/.test(trimmed));

  if (!cleaned) return base;

  base.looksLikePostgresUri = /^(postgresql|postgres):\/\//i.test(cleaned);
  base.hasPgBouncerFlag = /(?:^|[?&])pgbouncer=true(?:&|$)/i.test(cleaned);
  base.hasSslMode = /(?:^|[?&])sslmode=/i.test(cleaned);

  if (!base.looksLikePostgresUri) {
    base.parseError = 'not_postgres_uri';
    return base;
  }

  try {
    const u = new URL(cleaned.replace(/^postgresql:/i, 'http:').replace(/^postgres:/i, 'http:'));
    base.host = u.hostname || null;
    base.port = u.port || null;
    base.usesPooler = Boolean(base.host && /pooler\.supabase\.com$/i.test(base.host));
    base.usesDirectHost = Boolean(base.host && /^db\.[a-z0-9]+\.supabase\.co$/i.test(base.host));
    const user = decodeURIComponent(u.username || '');
    base.usernameLooksLikePoolerTenant = user ? /^postgres\.[a-z0-9]+$/i.test(user) : null;
    if (!base.host) base.parseError = 'missing_host';
  } catch {
    base.parseError = 'invalid_url';
  }

  return base;
}
