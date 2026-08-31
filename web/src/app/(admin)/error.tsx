'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin]', error);
  }, [error]);

  return (
    <div className="adm-login-wrap" style={{ padding: '2rem' }}>
      <div
        className="adm-signin-card"
        style={{ maxWidth: 480, margin: '4rem auto', display: 'block', padding: '1.75rem' }}
      >
        <h1 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Admin hit a server error</h1>
        <p style={{ color: '#5c5650', lineHeight: 1.5, marginBottom: '1rem' }}>
          This is usually a database connection or missing env var on Hostinger
          (<code>DATABASE_URL</code>, <code>DIRECT_URL</code>, Supabase keys, or{' '}
          <code>ADMIN_EMAILS</code>).
        </p>
        {error.digest ? (
          <p style={{ fontSize: '0.85rem', color: '#7a736c', marginBottom: '1rem' }}>
            Digest: <code>{error.digest}</code>
          </p>
        ) : null}
        <button type="button" className="adm-signin-submit" onClick={reset}>
          Try again
        </button>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          <a href="/admin/login">Back to login</a>
        </p>
      </div>
    </div>
  );
}
