'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * Exact chrome from vanilla site (nav.css + footer-impact).
 * Used only on React surfaces (/events) so they match legacy design.
 *
 * Footer note: sizzle.css hides burgers / CTA until `.is-revealed`.
 * Vanilla pages get that from main.js; we mirror that here.
 */
export function LegacyChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(true);
  const footerRef = useRef<HTMLElement>(null);

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

  // Match vanilla js/main.js: close on Escape + desktop resize
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 900) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Mirror js/main.js footerScrollReveal so sizzle.css animations actually fire.
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const footerHero = footer.querySelector('.footer-hero');
    const footerCtaBlock = footer.querySelector('.footer-cta-block');
    const footerHeadline = footer.querySelector('.footer-headline');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealAll = () => {
      footer.classList.add('footer-entered');
      footerHero?.classList.add('is-revealed');
      footerCtaBlock?.classList.add('is-revealed');
      footerHeadline?.classList.add('is-revealed');
    };

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealAll();
      return;
    }

    const observers: IntersectionObserver[] = [];

    const footerIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            footer.classList.add('footer-entered');
            footerIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 }
    );
    footerIo.observe(footer);
    observers.push(footerIo);

    if (footerHero) {
      const heroIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              footerHero.classList.add('is-revealed');
              heroIo.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      heroIo.observe(footerHero);
      observers.push(heroIo);
    }

    if (footerCtaBlock) {
      const ctaIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              footerCtaBlock.classList.add('is-revealed');
              footerHeadline?.classList.add('is-revealed');
              ctaIo.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      ctaIo.observe(footerCtaBlock);
      observers.push(ctaIo);
    }

    // If footer is already on screen (short viewport / deep link), reveal now.
    const rect = footer.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      revealAll();
    }

    return () => observers.forEach((io) => io.disconnect());
  }, [pathname]);

  const current = (href: string) => (pathname === href || pathname.startsWith(href + '/') ? 'page' : undefined);

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${open ? 'nav-open' : ''}`} id="header">
        <div className="nav-shell">
          <div className={`nav-panel${open ? ' is-open' : ''}`} id="navPanel">
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
                <a
                  href="https://order.toasttab.com/online/bottomz-up-2001-seymour-dr"
                  className="btn-ticket btn-nav-cta"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="btn-hover-fill" aria-hidden="true" />
                  <span className="btn-label">Order Online</span>
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
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((v) => !v);
                }}
              >
                <span />
                <span />
              </button>
            </div>

            {/* is-open is required by nav.css (.nav-drawer.is-open) — same as js/main.js */}
            <nav
              className={`nav-drawer${open ? ' is-open' : ''}`}
              id="navMobile"
              aria-hidden={!open}
              aria-label="Mobile"
            >
              <div className="nav-drawer-inner">
                <Link href="/menu" className="nav-link" onClick={() => setOpen(false)}>
                  Menu
                </Link>
                <Link href="/catering" className="nav-link" onClick={() => setOpen(false)}>
                  Catering
                </Link>
                <Link href="/events" className="nav-link" onClick={() => setOpen(false)}>
                  Events
                </Link>
                <Link href="/about" className="nav-link" onClick={() => setOpen(false)}>
                  About Us
                </Link>
                <Link href="/contact" className="nav-link" onClick={() => setOpen(false)}>
                  Contact Us
                </Link>
                <a
                  href="https://order.toasttab.com/online/bottomz-up-2001-seymour-dr"
                  className="btn-ticket"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                >
                  <span className="btn-hover-fill" aria-hidden="true" />
                  <span className="btn-label">Order Online</span>
                  <span className="btn-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
                <a href="tel:+14345755753" className="nav-link" onClick={() => setOpen(false)}>
                  Call for Order
                </a>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {children}

      <footer ref={footerRef} className="site-footer site-footer--impact">
        <div className="footer-marquee" aria-hidden="true">
          <div className="footer-marquee-track">
            <div className="footer-marquee-group">
              <span>
                ORDER NOW · SMASHED FRESH DAILY · ORDER NOW · SMASHED FRESH DAILY · ORDER NOW ·
                SMASHED FRESH DAILY · ORDER NOW · SMASHED FRESH DAILY ·
              </span>
            </div>
            <div className="footer-marquee-group" aria-hidden="true">
              <span>
                ORDER NOW · SMASHED FRESH DAILY · ORDER NOW · SMASHED FRESH DAILY · ORDER NOW ·
                SMASHED FRESH DAILY · ORDER NOW · SMASHED FRESH DAILY ·
              </span>
            </div>
          </div>
        </div>

        <div className="footer-hero">
          <div className="footer-burger footer-burger--left">
            <img
              src="/legacy/assets/images/float-bacon.png"
              alt=""
              width={400}
              height={400}
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="footer-cta-block">
            <h2 className="footer-headline">
              <span className="footer-line">
                <span className="footer-line-inner">Hungry?</span>
              </span>
              <span className="footer-line">
                <span className="footer-line-inner">Get here.</span>
              </span>
            </h2>
            <div className="footer-headline-underline" aria-hidden="true" />
            <p className="footer-subhead">Smashed fresh · full bar · right now</p>
            <Link href="/menu" className="footer-order-btn">
              Order now
            </Link>
          </div>

          <div className="footer-burger footer-burger--right">
            <img
              src="/legacy/assets/images/burger-straight.png"
              alt=""
              width={400}
              height={400}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div className="footer-contact-bar">
          <a className="footer-phone" href="tel:+14345755753">
            <span className="footer-phone-label">Call</span>
            <span className="footer-phone-num">(434) 575-5753</span>
          </a>
          <div className="footer-delivery-block">
            <span className="footer-delivery-label">Delivery</span>
            <div className="footer-partners" aria-label="Delivery partners">
              <a
                className="footer-partner footer-partner--grubhub"
                href="https://www.grubhub.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Order on Grubhub"
              >
                <span className="footer-partner-logo" aria-hidden="true">
                  GH
                </span>
                <span className="footer-partner-name">Grubhub</span>
              </a>
              <a
                className="footer-partner footer-partner--doordash"
                href="https://www.doordash.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Order on DoorDash"
              >
                <span className="footer-partner-logo" aria-hidden="true">
                  DD
                </span>
                <span className="footer-partner-name">DoorDash</span>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-utility">
          <nav className="footer-social" aria-label="Social">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.3.4.6.2 1 .5 1.5 1 .4.4.7.9 1 1.5.2.4.4 1.1.4 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.4 2.3-.2.6-.5 1-1 1.5-.4.4-.9.7-1.5 1-.4.2-1.1.4-2.3.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.3-.4-.6-.2-1-.5-1.5-1-.4-.4-.7-.9-1-1.5-.2-.4-.4-1.1-.4-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.9.4-2.3.2-.6.5-1 1-1.5.4-.4.9-.7 1.5-1 .4-.2 1.1-.4 2.3-.4C8.4 2.2 8.8 2.2 12 2.2m0-2.2C8.7 0 8.3 0 7 0 5.7.1 4.8.3 4 .6c-.9.3-1.6.8-2.3 1.5C1 2.8.5 3.5.2 4.4.1 5.2 0 6.1 0 7.4 0 8.7 0 9.1 0 12s0 3.3.1 4.6c.1 1.3.3 2.2.6 3 .3.9.8 1.6 1.5 2.3.7.7 1.4 1.2 2.3 1.5.8.3 1.7.5 3 .6 1.3.1 1.7.1 4.6.1s3.3 0 4.6-.1c1.3-.1 2.2-.3 3-.6.9-.3 1.6-.8 2.3-1.5.7-.7 1.2-1.4 1.5-2.3.3-.8.5-1.7.6-3 .1-1.3.1-1.7.1-4.6s0-3.3-.1-4.6c-.1-1.3-.3-2.2-.6-3-.3-.9-.8-1.6-1.5-2.3C20.5.8 19.8.3 18.9.1 18.1 0 17.2 0 15.9 0 14.6 0 14.2 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.5-10.7a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z" />
              </svg>
            </a>
            <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.6 6.2a5.5 5.5 0 0 1-3.2-1.1v7.2a6.3 6.3 0 1 1-5.4-6.2v3.1a3.2 3.2 0 1 0 2.3 3.1V1.5h3a5.5 5.5 0 0 0 3.3 4.7z" />
              </svg>
            </a>
            <a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="X">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.2 2H21l-6.5 7.4L22 22h-6.2l-4.3-5.6L6 22H3.2l7-8L2 2h6.3l3.9 5.2L18.2 2zm-1.1 18h1.7L7 3.9H5.2L17.1 20z" />
              </svg>
            </a>
          </nav>
          <Link href="/" className="footer-brand-mark">
            Bottomz Up
          </Link>
          <div className="footer-utility-end">
            <span className="footer-copy-pill">2026 Copyright</span>
            <span className="footer-credit">South Boston, VA</span>
          </div>
        </div>

        <p className="footer-legal">
          Consuming raw or undercooked meats, poultry, seafood, shellfish, or eggs may increase your
          risk of foodborne illness, especially if you have certain medical conditions. Please advise
          your server of any allergies.
        </p>
      </footer>
    </>
  );
}
