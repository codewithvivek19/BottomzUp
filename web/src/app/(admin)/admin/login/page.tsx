'use client';

import { FormEvent, useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const isDev = process.env.NODE_ENV === 'development';

export default function AdminLoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') router.replace('/admin');
  }, [status, router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      email: String(fd.get('email') || '').trim().toLowerCase(),
      password: String(fd.get('password') || ''),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError('Login failed. Check email and password.');
      return;
    }
    router.push('/admin');
    router.refresh();
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

          <p className="adm-signin-brand-foot">South Boston, VA · Not linked from the public site</p>
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
                placeholder="manager@bottomzup.local"
                defaultValue={isDev ? 'manager@bottomzup.local' : ''}
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

          <p className="adm-signin-note">Staff access only. Ask the house manager if you need an account.</p>
        </div>
      </div>
    </div>
  );
}
