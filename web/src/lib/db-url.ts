/**
 * Hostinger / dashboard env UIs often store values with wrapping quotes,
 * a leading `DATABASE_URL=`, or stray whitespace. Unencoded password chars
 * like `#` also break URL()/Prisma and surface as "unreachable".
 */

export type NormalizedDbUrl = {
  raw: string | undefined;
  cleaned: string | undefined;
  length: number;
  quoteWrapped: boolean;
  hadKeyPrefix: boolean;
  passwordRepaired: boolean;
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
  for (let i = 0; i < 2; i++) {
    if (
      (s.startsWith('"') && s.endsWith('"') && s.length >= 2) ||
      (s.startsWith("'") && s.endsWith("'") && s.length >= 2)
    ) {
      s = s.slice(1, -1).trim();
      quoteWrapped = true;
    }
  }
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

function encodeDbPassword(password: string): string {
  try {
    return encodeURIComponent(decodeURIComponent(password));
  } catch {
    return encodeURIComponent(password);
  }
}

/**
 * If URL() cannot parse the URI (common when password contains `#`, `@`, etc.),
 * rebuild with a properly encoded password.
 */
export function repairPostgresUrl(url: string): { url: string; repaired: boolean } {
  try {
    // eslint-disable-next-line no-new
    new URL(url.replace(/^postgresql:/i, 'http:').replace(/^postgres:/i, 'http:'));
    return { url, repaired: false };
  } catch {
    // user:password@rest — password may include # which breaks URL() before @
    const match = url.match(/^(postgres(?:ql)?:\/\/)([^:/?#]+):([^@]*)@(.+)$/i);
    if (!match) return { url, repaired: false };
    const [, scheme, user, password, rest] = match;
    const encoded = encodeDbPassword(password);
    if (encoded === password) return { url, repaired: false };
    return { url: `${scheme}${user}:${encoded}@${rest}`, repaired: true };
  }
}

function basicClean(raw: string): string {
  let s = raw.replace(/^\uFEFF/, '').trim();
  s = stripKeyPrefix(s).value;
  s = stripWrappingQuotes(s).value;
  s = stripKeyPrefix(s).value;
  s = stripWrappingQuotes(s).value;
  return s;
}

function appendQueryParam(url: string, key: string, value: string): string {
  if (new RegExp(`(?:^|[?&])${key}=`, 'i').test(url)) return url;
  return url.includes('?') ? `${url}&${key}=${value}` : `${url}?${key}=${value}`;
}

/**
 * Supabase transaction pooler (:6543) rejects Prisma prepared statements unless
 * `pgbouncer=true` is present. Hostinger/Supabase "URI" copies sometimes omit it.
 */
export function ensurePrismaPoolerParams(url: string): string {
  let out = url;
  try {
    const u = new URL(out.replace(/^postgresql:/i, 'http:').replace(/^postgres:/i, 'http:'));
    const isPooler = /pooler\.supabase\.com$/i.test(u.hostname);
    const isTransactionPort = u.port === '6543';
    if (isPooler && isTransactionPort) {
      out = appendQueryParam(out, 'pgbouncer', 'true');
    }
    if (isPooler || /\.supabase\.co$/i.test(u.hostname)) {
      out = appendQueryParam(out, 'sslmode', 'require');
    }
  } catch {
    // If URL still can't parse, leave as-is; caller may have repaired already.
  }
  return out;
}

/** Return a cleaned (+ password-repaired + pooler flags) Postgres URI, or undefined if empty. */
export function cleanDatabaseUrl(raw: string | undefined | null): string | undefined {
  if (raw == null) return undefined;
  const s = basicClean(raw);
  if (!s) return undefined;
  if (!/^(postgresql|postgres):\/\//i.test(s)) return s;
  const repaired = repairPostgresUrl(s).url;
  return ensurePrismaPoolerParams(repaired);
}

export function inspectDatabaseUrl(raw: string | undefined | null): NormalizedDbUrl {
  const original = raw ?? undefined;
  const base: NormalizedDbUrl = {
    raw: original,
    cleaned: undefined,
    length: 0,
    quoteWrapped: false,
    hadKeyPrefix: false,
    passwordRepaired: false,
    looksLikePostgresUri: false,
    host: null,
    port: null,
    usesPooler: false,
    usesDirectHost: false,
    hasPgBouncerFlag: false,
    usernameLooksLikePoolerTenant: null,
    hasSslMode: false,
    parseError: original?.trim() ? 'empty_after_clean' : 'missing',
  };

  if (!original?.trim()) return base;

  const trimmed = original.replace(/^\uFEFF/, '').trim();
  base.hadKeyPrefix = /^(?:DATABASE_URL|DIRECT_URL|POSTGRES_URL|DATABASE_URI)\s*=/i.test(trimmed);
  base.quoteWrapped = /^["']/.test(trimmed) || /^\\"/i.test(trimmed);

  const preliminary = basicClean(original);
  if (!preliminary) return base;

  base.looksLikePostgresUri = /^(postgresql|postgres):\/\//i.test(preliminary);
  base.hasPgBouncerFlag = /(?:^|[?&])pgbouncer=true(?:&|$)/i.test(preliminary);
  base.hasSslMode = /(?:^|[?&])sslmode=/i.test(preliminary);
  base.quoteWrapped =
    base.quoteWrapped || (trimmed !== preliminary && /["']/.test(trimmed));

  if (!base.looksLikePostgresUri) {
    base.cleaned = preliminary;
    base.length = preliminary.length;
    base.parseError = 'not_postgres_uri';
    return base;
  }

  const repaired = repairPostgresUrl(preliminary);
  base.passwordRepaired = repaired.repaired;
  const cleaned = ensurePrismaPoolerParams(repaired.url);
  base.cleaned = cleaned;
  base.length = cleaned.length;
  base.hasPgBouncerFlag = /(?:^|[?&])pgbouncer=true(?:&|$)/i.test(cleaned);
  base.hasSslMode = /(?:^|[?&])sslmode=/i.test(cleaned);

  try {
    const u = new URL(
      cleaned.replace(/^postgresql:/i, 'http:').replace(/^postgres:/i, 'http:')
    );
    base.host = u.hostname || null;
    base.port = u.port || null;
    base.usesPooler = Boolean(base.host && /pooler\.supabase\.com$/i.test(base.host));
    base.usesDirectHost = Boolean(base.host && /^db\.[a-z0-9]+\.supabase\.co$/i.test(base.host));
    const user = decodeURIComponent(u.username || '');
    base.usernameLooksLikePoolerTenant = user ? /^postgres\.[a-z0-9]+$/i.test(user) : null;
    base.parseError = base.host ? null : 'missing_host';
  } catch {
    base.parseError = 'invalid_url';
  }

  return base;
}
