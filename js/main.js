/**
 * Bottomz Up — Core Interactions
 * Sticky CTA, heat bottle, reserve panel, tonight's pick, nav
 */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const assetBase = document.body.classList.contains('menu-page') ? '../assets' : './assets';

  // ---------- Lifestyle section: inview stagger + image parallax ----------
  (function lifestyleMotion() {
    const section = document.querySelector('[data-lifestyle]');
    if (!section) return;

    const imgs = section.querySelectorAll('[data-life-img]');

    if (reduceMotion) {
      section.classList.add('is-inview');
      return;
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              section.classList.add('is-inview');
            }
          });
        },
        { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
      );
      io.observe(section);
    } else {
      section.classList.add('is-inview');
    }

    // Soft scroll parallax on card images (C)
    let ticking = false;
    function updateParallax() {
      ticking = false;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      if (rect.bottom < 0 || rect.top > vh) return;
      const mid = rect.top + rect.height / 2;
      const offset = ((mid - vh / 2) / vh) * -24; // px
      imgs.forEach((img, i) => {
        const bias = i === 0 ? 1 : i === 1 ? 0.7 : 0.85;
        img.style.setProperty('--pz', String(offset * bias));
      });
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateParallax();
  })();

  // ---------- Impact footer: light scroll parallax on burgers ----------
  (function footerParallax() {
    const footer = document.querySelector('.site-footer--impact');
    if (!footer || reduceMotion) return;
    const left = footer.querySelector('.footer-burger--left');
    const right = footer.querySelector('.footer-burger--right');
    if (!left || !right) return;

    let ticking = false;
    function update() {
      ticking = false;
      const rect = footer.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 when footer enters bottom, 1 when near center
      const progress = Math.min(1, Math.max(0, 1 - rect.top / vh));
      const shift = (progress - 0.5) * 28;
      left.style.setProperty('--fy', String(-shift));
      right.style.setProperty('--fy', String(shift * 0.85));
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  })();

  // ---------- Marquee pause helpers (CSS anim; touch pause) ----------
  document.querySelectorAll('[data-marquee]').forEach((root) => {
    const track = root.querySelector('[data-marquee-track]');
    if (!track) return;
    const pause = () => root.classList.add('is-paused');
    const resume = () => root.classList.remove('is-paused');
    root.addEventListener('mouseenter', pause);
    root.addEventListener('mouseleave', resume);
    root.addEventListener('focusin', pause);
    root.addEventListener('focusout', (e) => {
      if (!root.contains(e.relatedTarget)) resume();
    });
    root.addEventListener('touchstart', pause, { passive: true });
    root.addEventListener('touchend', () => window.setTimeout(resume, 1200), { passive: true });
  });

  // ---------- Mobile Nav (Freshbox cream panel drawer) ----------
  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('navMobile');
  const header = document.getElementById('header');
  const navPanel = document.getElementById('navPanel');

  if (toggle && mobileNav) {
    const setOpen = (isOpen) => {
      mobileNav.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      mobileNav.setAttribute('aria-hidden', String(!isOpen));
      document.body.classList.toggle('nav-open', isOpen);
      if (header) header.classList.toggle('nav-open', isOpen);
      if (navPanel) navPanel.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    };

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(!mobileNav.classList.contains('is-open'));
    });

    mobileNav.querySelectorAll('a, button').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Close on resize to desktop
    window.addEventListener(
      'resize',
      () => {
        if (window.innerWidth >= 900 && mobileNav.classList.contains('is-open')) {
          setOpen(false);
        }
      },
      { passive: true }
    );
  }

  // ---------- Header + sticky CTA on scroll ----------
  const stickyCta = document.getElementById('stickyCta');
  const hero = document.getElementById('hero');
  const reserve = document.getElementById('reserve');

  function updateChrome() {
    const y = window.scrollY;
    if (header) {
      header.classList.toggle('is-scrolled', y > 20);
    }

    if (stickyCta && hero) {
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      const pastHero = y > heroBottom - 120;
      let nearReserve = false;

      if (reserve) {
        const reserveTop = reserve.getBoundingClientRect().top;
        nearReserve = reserveTop < window.innerHeight * 0.85;
      }

      // Hide sticky when reserve panel open
      const panelOpen = document.body.classList.contains('reserve-open');
      const show = pastHero && !nearReserve && !panelOpen;
      stickyCta.classList.toggle('is-visible', show);
      stickyCta.setAttribute('aria-hidden', String(!show));
    }
  }

  window.addEventListener('scroll', updateChrome, { passive: true });
  window.addEventListener('resize', updateChrome, { passive: true });
  updateChrome();

  // ---------- Reveal on scroll ----------
  const reveals = document.querySelectorAll('.reveal');

  if (reduceMotion) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  requestAnimationFrame(() => {
    document.querySelectorAll('.hero .reveal').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('is-visible');
      }
    });
  });

  // ---------- Smooth scroll ----------
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id && id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const headerOffset = 80;
          const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      }
    });
  });

  // ---------- Tonight's pick ----------
  // House icons first — Bottomz-specific, not random tourist picks
  const TONIGHT_PICKS = [
    {
      name: 'Garbage Burger',
      desc: 'Cheese, chili, jalapeños, fries & coleslaw. Ordered by the bold.',
      price: 16,
      img: 'burger-double.jpg',
      heroImg: 'burger-double.jpg',
      weight: 3,
    },
    {
      name: 'Double Decker Burger',
      desc: 'Two patties, cheddar, pulled pork BBQ & slaw. No half measures.',
      price: 18,
      img: 'burger-double.jpg',
      heroImg: 'burger-double.jpg',
      weight: 3,
    },
    {
      name: 'Classic House Burger',
      desc: 'Juicy beef, lettuce, tomato, onion, pickles & mayo. Served with fries.',
      price: 14,
      img: 'burger-classic.jpg',
      heroImg: 'hero-burger.jpg',
      weight: 2,
    },
    {
      name: 'Bacon Cheeseburger',
      desc: 'Cheddar, crumbled bacon, the works — mayo, onion, fries on the side.',
      price: 16,
      img: 'burger-bacon.jpg',
      heroImg: 'burger-bacon.jpg',
      weight: 2,
    },
    {
      name: 'Buffalo Chicken Burger',
      desc: 'Tossed buffalo, ranch on the side. Onion rings or fries.',
      price: 13,
      img: 'burger-buffalo.jpg',
      heroImg: 'burger-buffalo.jpg',
      weight: 2,
    },
    {
      name: 'Ribeye Steak',
      desc: 'Hand-cut, chargrilled, butter-lemon baste. Mash + side salad.',
      price: 30,
      img: 'burger-classic.jpg',
      heroImg: 'hero-burger.jpg',
      weight: 1,
    },
  ];

  function pickTonight(excludeName) {
    const pool = TONIGHT_PICKS.filter((p) => p.name !== excludeName);
    const weighted = [];
    pool.forEach((p) => {
      const w = p.weight || 1;
      for (let i = 0; i < w; i++) weighted.push(p);
    });
    return weighted[Math.floor(Math.random() * weighted.length)];
  }

  function applyTonightPick(pick, opts) {
    opts = opts || {};
    const imgPath = `${assetBase}/images/${opts.hero ? pick.heroImg || pick.img : pick.img}`;

    const nameEl = document.getElementById(opts.nameId || 'heroPickName');
    const descEl = document.getElementById(opts.descId || 'heroPickDesc');
    const priceEl = document.getElementById(opts.priceId || 'heroPickPrice');
    const imgEl = document.getElementById(opts.imgId || 'heroPickImg');
    const stampEl = document.getElementById(opts.stampId || 'heroStamp');

    if (nameEl) nameEl.textContent = pick.name;
    if (descEl) descEl.textContent = pick.desc;
    if (priceEl) priceEl.textContent = `$${pick.price}`;
    if (stampEl) stampEl.textContent = `$${pick.price}`;
    if (imgEl) {
      imgEl.src = imgPath;
      imgEl.alt = pick.name;
    }

    // Menu page card
    const mName = document.getElementById('tonightName');
    const mDesc = document.getElementById('tonightDesc');
    const mPrice = document.getElementById('tonightPrice');
    if (mName) mName.textContent = pick.name;
    if (mDesc) mDesc.textContent = pick.desc;
    if (mPrice) mPrice.textContent = `$${pick.price}`;
  }

  // Ensure Freshbox hero title reveal gets is-visible (parent .reveal on h1)
  requestAnimationFrame(() => {
    document.querySelectorAll('.fb-hero .reveal').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('is-visible');
      }
    });
  });

  let currentPick = pickTonight();
  applyTonightPick(currentPick, { hero: true });

  document.querySelectorAll('.js-tonight-refresh').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentPick = pickTonight(currentPick.name);
      applyTonightPick(currentPick, { hero: true });
    });
  });

  // ---------- Reserve panel ----------
  const backdrop = document.getElementById('reserveBackdrop');
  const panel = document.getElementById('reservePanel');
  const closeBtn = document.getElementById('reserveClose');
  const noteEl = document.getElementById('reserveNote');
  const smsBtn = document.getElementById('reserveSmsBtn');
  const callBtn = document.getElementById('reserveCallBtn');
  let partySize = '2';
  let lastFocus = null;

  const partyCopy = {
    '2': 'Table for 2 — walk-ins welcome; large groups should give a heads up.',
    '4': 'Table for 4 — great for a weeknight hang.',
    '6': 'Table for 6 — worth a heads up when you can.',
    '8': 'Party of 8+ — definitely give us a heads up.',
    group: 'Large group — tell us headcount when you reach out. We’ll make it work.',
  };

  function focusableIn(el) {
    return Array.from(
      el.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((n) => !n.hasAttribute('disabled') && n.offsetParent !== null);
  }

  function openReserve() {
    if (!panel || !backdrop) return;
    lastFocus = document.activeElement;
    backdrop.hidden = false;
    panel.hidden = false;
    void panel.offsetWidth;
    backdrop.classList.add('is-open');
    panel.classList.add('is-open');
    document.body.classList.add('reserve-open');
    updateChrome();
    if (typeof window.__bottomzApplyContact === 'function') {
      window.__bottomzApplyContact();
    }
    updateParty(partySize);
    const focusables = focusableIn(panel);
    (closeBtn || focusables[0] || panel).focus();
  }

  function closeReserve() {
    if (!panel || !backdrop) return;
    backdrop.classList.remove('is-open');
    panel.classList.remove('is-open');
    document.body.classList.remove('reserve-open');
    setTimeout(() => {
      if (!panel.classList.contains('is-open')) {
        backdrop.hidden = true;
        panel.hidden = true;
      }
    }, 320);
    updateChrome();
    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus();
    }
  }

  function updateParty(size) {
    partySize = size;
    document.querySelectorAll('.party-chip').forEach((chip) => {
      chip.classList.toggle('is-active', chip.dataset.size === size);
    });
    if (noteEl) noteEl.textContent = partyCopy[size] || partyCopy['2'];

    const C = window.BOTTOMZ_CONTACT;
    const label =
      size === 'group' ? 'a large group' : size === '8' ? '8+' : size;
    const body =
      typeof window.__bottomzSmsBody === 'function'
        ? window.__bottomzSmsBody(label)
        : `Hi Bottomz Up — I'd like to reserve a table for ${label}.`;

    if (smsBtn && C && C.hasPhone()) {
      smsBtn.hidden = false;
      smsBtn.href = C.smsHref(body);
    } else if (smsBtn) {
      smsBtn.hidden = true;
    }

    if (callBtn && C && C.hasPhone()) {
      callBtn.href = C.telHref();
    }
  }

  // Event delegation — works for dynamically injected bar CTAs
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-open-reserve');
    if (!btn) return;
    e.preventDefault();
    openReserve();
  });
  document.body.addEventListener('bottomz:open-reserve', openReserve);

  if (closeBtn) closeBtn.addEventListener('click', closeReserve);
  if (backdrop) backdrop.addEventListener('click', closeReserve);

  document.addEventListener('keydown', (e) => {
    if (!document.body.classList.contains('reserve-open') || !panel) return;
    if (e.key === 'Escape') {
      closeReserve();
      return;
    }
    // Basic focus trap
    if (e.key === 'Tab') {
      const nodes = focusableIn(panel);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  document.querySelectorAll('.party-chip').forEach((chip) => {
    chip.addEventListener('click', () => updateParty(chip.dataset.size));
  });

  // Tonight's pick: prefer house icons
  if (typeof pickTonight === 'function') {
    /* defined above in same IIFE when TONIGHT_PICKS exists */
  }

  // Heat bottle background mesh sync
  document.addEventListener('heatchange', (e) => {
    const section = document.querySelector('.wings-beer');
    if (section && e.detail && e.detail.level) {
      section.classList.remove('is-heat-mild', 'is-heat-medium', 'is-heat-hot', 'is-heat-xtra');
      section.classList.add(`is-heat-${e.detail.level}`);
    }
  });

  // ---------- Footer scroll-reveal (sizzle.css animations) ----------
  (function footerScrollReveal() {
    const footer = document.querySelector('.site-footer--impact');
    const footerHero = footer && footer.querySelector('.footer-hero');
    const footerCtaBlock = footer && footer.querySelector('.footer-cta-block');
    const footerHeadline = footer && footer.querySelector('.footer-headline');

    if (!footer || reduceMotion) {
      // Skip reveal — make everything visible immediately
      if (footerHero) footerHero.classList.add('is-revealed');
      if (footerCtaBlock) footerCtaBlock.classList.add('is-revealed');
      if (footerHeadline) footerHeadline.classList.add('is-revealed');
      if (footer) footer.classList.add('footer-entered');
      return;
    }

    if ('IntersectionObserver' in window) {
      // Marquee: enters first as footer scrolls into view
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

      // Hero band: burgers + CTA fire when mid-section visible
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
          { threshold: 0.15 }
        );
        heroIo.observe(footerHero);
      }

      // CTA block: headline lines, subhead, button
      if (footerCtaBlock) {
        const ctaIo = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                footerCtaBlock.classList.add('is-revealed');
                if (footerHeadline) footerHeadline.classList.add('is-revealed');
                ctaIo.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.3 }
        );
        ctaIo.observe(footerCtaBlock);
      }
    } else {
      // No IntersectionObserver fallback
      if (footerHero) footerHero.classList.add('is-revealed');
      if (footerCtaBlock) footerCtaBlock.classList.add('is-revealed');
      if (footerHeadline) footerHeadline.classList.add('is-revealed');
      if (footer) footer.classList.add('footer-entered');
    }
  })();

  // ---------- Burger sizzle: ensure .burger-card--featured z-index stacks ----------
  (function burgerSizzleInit() {
    const featured = document.querySelector('.burger-card--featured');
    if (featured) {
      featured.style.isolation = 'isolate';
    }
  })();


  // ---------- Home wing size chips ----------
  (function homeSizeChips() {
    const row = document.querySelector('.home-size-row');
    if (!row) return;
    row.addEventListener('click', (e) => {
      const chip = e.target.closest('.home-size-chip');
      if (!chip) return;
      row.querySelectorAll('.home-size-chip').forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
    });
  })();

  // Heat bottle: see js/heat-bottle.js
})();


