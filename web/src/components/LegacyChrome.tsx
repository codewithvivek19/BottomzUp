'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Exact chrome from vanilla site (nav.css + footer-impact).
 * Used only on React surfaces (/events, /admin) so they match legacy design.
 */
export function LegacyChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('nav-open', open);
    return () => document.body.classList.remove('nav-open');
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  const current = (href: string) => (pathname === href || pathname.startsWith(href + '/') ? 'page' : undefined);

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${open ? 'nav-open' : ''}`} id="header">
        <div className="nav-shell">
          <div className="nav-panel" id="navPanel">
            <div className="nav-bar">
              <Link href="/" className="nav-logo" aria-label="Bottomz Up Bar & Grill">
                <img
                  src="/legacy/assets/images/logo-horizontal.png"
                  alt="Bottomz Up Bar & Grill"
                  width={120}
                  height={34}
                  decoding="async"
                />
              </Link>

              <nav className="nav-links" aria-label="Main">
                <Link href="/menu" className="nav-link" aria-current={current('/menu')}>
                  Menu<span className="nav-link-line" aria-hidden="true" />
                </Link>
                <Link href="/catering" className="nav-link" aria-current={current('/catering')}>
                  Catering<span className="nav-link-line" aria-hidden="true" />
                </Link>
                <Link href="/events" className="nav-link" aria-current={current('/events')}>
                  Events<span className="nav-link-line" aria-hidden="true" />
                </Link>
                <Link href="/about" className="nav-link" aria-current={current('/about')}>
                  About Us<span className="nav-link-line" aria-hidden="true" />
                </Link>
                <Link href="/contact" className="nav-link" aria-current={current('/contact')}>
                  Contact Us<span className="nav-link-line" aria-hidden="true" />
                </Link>
              </nav>

              <div className="nav-actions">
                <a href="tel:+14345755753" className="btn-ticket btn-nav-cta">
                  <span className="btn-hover-fill" aria-hidden="true" />
                  <span className="btn-label">Call for delivery</span>
                  <span className="btn-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </div>

              <button
                type="button"
                className="nav-toggle"
                id="navToggle"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                aria-controls="navMobile"
                onClick={() => setOpen((v) => !v)}
              >
                <span />
                <span />
              </button>
            </div>

            <nav className="nav-drawer" id="navMobile" aria-hidden={!open} aria-label="Mobile">
              <div className="nav-drawer-inner">
                <Link href="/menu" className="nav-link">
                  Menu
                </Link>
                <Link href="/catering" className="nav-link">
                  Catering
                </Link>
                <Link href="/events" className="nav-link">
                  Events
                </Link>
                <Link href="/about" className="nav-link">
                  About Us
                </Link>
                <Link href="/contact" className="nav-link">
                  Contact Us
                </Link>
                <a href="tel:+14345755753" className="btn-ticket">
                  <span className="btn-hover-fill" aria-hidden="true" />
                  <span className="btn-label">Call for delivery</span>
                  <span className="btn-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {children}
    </>
  );
}
