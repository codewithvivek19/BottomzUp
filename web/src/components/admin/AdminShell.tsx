'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const NAV = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/coupon', label: 'Coupon' },
  { href: '/admin/leads', label: 'Leads' },
];

export function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname.startsWith('/admin/login');
  const [navOpen, setNavOpen] = useState(false);
  const [email, setEmail] = useState<string>('Manager');
  const navId = useId();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!cancelled && data.user?.email) setEmail(data.user.email);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [navOpen]);

  if (isLogin) {
    return <div className="adm-login-wrap">{children}</div>;
  }

  const pageTitle =
    title ||
    NAV.find((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href)))?.label ||
    'Admin';

  return (
    <div className={`adm-app${navOpen ? ' is-nav-open' : ''}`}>
      <header className="adm-mobile-bar">
        <button
          type="button"
          className="adm-menu-btn"
          aria-expanded={navOpen}
          aria-controls={navId}
          onClick={() => setNavOpen((v) => !v)}
        >
          <span className="adm-menu-icon" aria-hidden="true" />
          <span className="sr-only">{navOpen ? 'Close menu' : 'Open menu'}</span>
        </button>
        <div className="adm-mobile-brand">
          <img src="/legacy/assets/images/logo-horizontal.png" alt="Bottomz Up" width={110} height={31} />
          <span>Manager</span>
        </div>
        <p className="adm-mobile-title">{pageTitle}</p>
      </header>

      <div
        className="adm-nav-backdrop"
        hidden={!navOpen}
        onClick={() => setNavOpen(false)}
        aria-hidden="true"
      />

      <aside className="adm-sidebar" id={navId} aria-label="Admin">
        <div className="adm-brand">
          <img src="/legacy/assets/images/logo-horizontal.png" alt="Bottomz Up" width={120} height={34} />
          <span>Manager</span>
        </div>
        <nav className="adm-nav">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`adm-nav-link${active ? ' is-active' : ''}`}
                onClick={() => setNavOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className="adm-signout"
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.replace('/admin/login');
            router.refresh();
          }}
        >
          Sign out
        </button>
      </aside>

      <div className="adm-main">
        <header className="adm-topbar">
          <h1>{pageTitle}</h1>
          <p className="adm-user">{email}</p>
        </header>
        <div className="adm-content">{children}</div>
      </div>
    </div>
  );
}
