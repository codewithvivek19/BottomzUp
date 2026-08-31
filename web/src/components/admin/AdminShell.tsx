'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const NAV = [
  {
    href: '/admin',
    label: 'Home',
    exact: true,
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 3.2 3.8 10.2c-.3.3-.3.8 0 1.1.3.3.8.3 1.1 0L6 10.4V19c0 .6.4 1 1 1h3.2v-5.2h3.6V20H18c.6 0 1-.4 1-1v-8.6l1.1.9c.3.3.8.3 1.1 0 .3-.3.3-.8 0-1.1L12 3.2Z"
        />
      </svg>
    ),
  },
  {
    href: '/admin/events',
    label: 'Events',
    exact: false,
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          fill="currentColor"
          d="M7 3.5c.6 0 1 .4 1 1V5h8v-.5c0-.6.4-1 1-1s1 .4 1 1V5h.5c1.4 0 2.5 1.1 2.5 2.5v11c0 1.4-1.1 2.5-2.5 2.5h-13C4.1 21 3 19.9 3 18.5v-11C3 6.1 4.1 5 5.5 5H6v-.5c0-.6.4-1 1-1Zm11.5 7.5h-13v7.5c0 .3.2.5.5.5h12c.3 0 .5-.2.5-.5V11Zm0-4H5.5c-.3 0-.5.2-.5.5V9h14V7.5c0-.3-.2-.5-.5-.5Z"
        />
      </svg>
    ),
  },
  {
    href: '/admin/coupon',
    label: 'Coupon',
    exact: false,
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          fill="currentColor"
          d="M3.5 7.5A2.5 2.5 0 0 1 6 5h12a2.5 2.5 0 0 1 2.5 2.5v2.1a2 2 0 1 0 0 3.8v2.1A2.5 2.5 0 0 1 18 18H6a2.5 2.5 0 0 1-2.5-2.5v-2.1a2 2 0 1 0 0-3.8V7.5ZM6 7a.5.5 0 0 0-.5.5v1.4a3.5 3.5 0 0 1 0 6.2v1.4c0 .3.2.5.5.5h12a.5.5 0 0 0 .5-.5v-1.4a3.5 3.5 0 0 1 0-6.2V7.5A.5.5 0 0 0 18 7H6Zm5 2.8h2v1.5h-2V9.8Zm0 3h2V16h-2v-3.2Z"
        />
      </svg>
    ),
  },
  {
    href: '/admin/leads',
    label: 'Leads',
    exact: false,
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 3.5a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 12 5.5ZM5.5 18.2c.4-2.7 3-4.2 6.5-4.2s6.1 1.5 6.5 4.2c.1.5-.3 1-.8 1H6.3c-.5 0-.9-.5-.8-1Zm2.1-.5h8.8c-.5-1.5-2.2-2.2-4.4-2.2s-3.9.7-4.4 2.2Z"
        />
      </svg>
    ),
  },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

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
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (!cancelled && data.user?.email) setEmail(data.user.email);
      } catch {
        /* missing env — keep placeholder */
      }
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

  const activeNav = NAV.find((n) => isActive(pathname, n.href, n.exact));
  const pageTitle =
    title ||
    (activeNav?.href === '/admin' ? 'Dashboard' : activeNav?.label) ||
    'Admin';

  async function signOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <div className={`adm-app${navOpen ? ' is-nav-open' : ''}`}>
      {/* Mobile top bar — compact Apple-style */}
      <header className="adm-mobile-bar">
        <div className="adm-mobile-bar-inner">
          <div className="adm-mobile-brand">
            <img
              src="/legacy/assets/images/logo-horizontal.png"
              alt="Bottomz Up"
              width={102}
              height={29}
            />
            <span className="adm-mobile-pill">Manager</span>
          </div>
          <button type="button" className="adm-mobile-more" onClick={() => setNavOpen(true)} aria-label="More">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <circle cx="5" cy="12" r="1.7" fill="currentColor" />
              <circle cx="12" cy="12" r="1.7" fill="currentColor" />
              <circle cx="19" cy="12" r="1.7" fill="currentColor" />
            </svg>
          </button>
        </div>
        <h1 className="adm-mobile-large-title">{pageTitle}</h1>
        <p className="adm-mobile-subtitle">{email}</p>
      </header>

      <div
        className="adm-nav-backdrop"
        hidden={!navOpen}
        onClick={() => setNavOpen(false)}
        aria-hidden="true"
      />

      {/* Desktop sidebar + mobile sheet for sign out */}
      <aside className="adm-sidebar" id={navId} aria-label="Admin">
        <div className="adm-brand">
          <img
            src="/legacy/assets/images/logo-horizontal.png"
            alt="Bottomz Up"
            width={120}
            height={34}
          />
          <span>Manager</span>
        </div>
        <nav className="adm-nav">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`adm-nav-link${active ? ' is-active' : ''}`}
                onClick={() => setNavOpen(false)}
              >
                <span className="adm-nav-ico">{item.icon}</span>
                <span>{item.label === 'Home' ? 'Dashboard' : item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="adm-sidebar-foot">
          <p className="adm-sidebar-email">{email}</p>
          <button type="button" className="adm-signout" onClick={signOut}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="adm-main">
        <header className="adm-topbar">
          <div>
            <h1>{pageTitle === 'Home' ? 'Dashboard' : pageTitle}</h1>
            <p className="adm-user">{email}</p>
          </div>
        </header>
        <div className="adm-content">{children}</div>
      </div>

      {/* Mobile bottom tabs — Apple HIG pattern */}
      <nav className="adm-tabbar" aria-label="Primary">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`adm-tab${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="adm-tab-ico">{item.icon}</span>
              <span className="adm-tab-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
