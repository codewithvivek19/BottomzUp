'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (!cancelled && data.user) {
          router.replace('/admin');
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error && /Missing NEXT_PUBLIC_SUPABASE/i.test(err.message)
              ? 'Supabase env vars are missing on this deploy. Set NEXT_PUBLIC_SUPABASE_URL and the anon/publishable key on Hostinger, then redeploy.'
              : 'Could not start auth client. Check Supabase env on Hostinger.'
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') || '').trim().toLowerCase();
    const password = String(fd.get('password') || '');

    try {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);
      if (signError) {
        setError('Login failed. Check email and password.');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setLoading(false);
      setError(
        err instanceof Error && /Missing NEXT_PUBLIC_SUPABASE/i.test(err.message)
          ? 'Supabase env vars are missing on this deploy. Set them on Hostinger and redeploy.'
          : 'Login could not start. Check Hostinger env + Supabase Auth user.'
      );
    }
  }

  return (
    <div className="adm-signin">
      <div className="adm-signin-card">
        <aside className="adm-signin-brand" aria-hidden="false">
          <div className="adm-signin-brand-glow" aria-hidden="true" />

          <div className="adm-signin-brand-top">
            <img
              src="/legacy/assets/images/logo-horizontal.png"
              alt="Bottomz Up"
              width={132}
              height={38}
            />
            <span className="adm-signin-pill">Manager</span>
          </div>

          <h2 className="adm-signin-brand-title">
            Tools for the floor, calendar, and leads.
          </h2>

          <ul className="adm-signin-proof">
            <li>Events calendar</li>
            <li>Scratch coupon</li>
            <li>Contact & catering leads</li>
          </ul>

          <p className="adm-signin-brand-foot">South Boston, VA · Secured with Supabase Auth</p>
        </aside>

        <div className="adm-signin-panel">
          <div className="adm-signin-mobile-logo">
            <img
              src="/legacy/assets/images/logo-horizontal.png"
              alt="Bottomz Up"
              width={120}
              height={34}
            />
          </div>

          <header className="adm-signin-head">
            <h1>Welcome back</h1>
            <p>Sign in to the manager workspace.</p>
          </header>

          <form className="adm-signin-form" onSubmit={onSubmit} noValidate>
            <label className="adm-signin-field" htmlFor="adm-email">
              <span>Email</span>
              <input
                id="adm-email"
                name="email"
                type="email"
                required
                autoComplete="username"
                placeholder="Manager@bottomzupbargrill.com"
                defaultValue={isDev ? process.env.NEXT_PUBLIC_ADMIN_EMAIL_HINT || '' : ''}
              />
            </label>

            <label className="adm-signin-field" htmlFor="adm-password">
              <span>Password</span>
              <input
                id="adm-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </label>

            {error ? (
              <p className="adm-alert is-err" role="alert">
                {error}
              </p>
            ) : null}

            <button className="adm-signin-submit" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="adm-signin-note">
            Staff access only. Create the manager in the Supabase Auth dashboard, then add the email
            to <code>ADMIN_EMAILS</code> (e.g. <code>Manager@bottomzupbargrill.com</code>).
          </p>
        </div>
      </div>
    </div>
  );
}
