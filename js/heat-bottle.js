/**
 * Bottomz Up — Interactive Heat Bottle
 * Spring physics · haptics · live sauce filtering
 * Shared by homepage + menu page
 */
(function () {
  'use strict';

  const HEATS = ['mild', 'medium', 'hot', 'xtra'];
  const LABELS = {
    mild: 'Mild',
    medium: 'Medium',
    hot: 'Hot',
    xtra: 'Xtra Hot',
  };
  const COLORS = {
    mild: '#a6ca1d',
    medium: '#e8ae0e',
    hot: '#f48315',
    xtra: '#b22223',
  };
  // Fill % of bottle body (visual liquid height)
  const FILL = { mild: 28, medium: 48, hot: 68, xtra: 88 };
  // Thumb position as % from top of bottle-body (0–100)
  const THUMB = { mild: 72, medium: 52, hot: 32, xtra: 14 };

  const SAUCES = [
    { name: 'BBQ', heat: 'mild' },
    { name: 'Garlic Parmesan', heat: 'mild' },
    { name: 'Lemon Pepper', heat: 'mild' },
    { name: 'Sweet Chili Buffalo', heat: 'medium' },
    { name: 'Sweet Chili Gochujang', heat: 'medium' },
    { name: 'Red Hot Mild', heat: 'medium' },
    { name: 'Mango Habanero', heat: 'hot' },
    { name: 'Garlic Buffalo', heat: 'hot' },
    { name: 'Red Hot Buffalo', heat: 'hot' },
    { name: 'Xtra Hot Buffalo', heat: 'xtra' },
  ];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Spring ----------
  function createSpring(opts) {
    const stiffness = opts.stiffness || 180;
    const damping = opts.damping || 22;
    const mass = opts.mass || 1;
    let value = opts.value || 0;
    let target = value;
    let velocity = 0;
    let raf = null;
    const onUpdate = opts.onUpdate || function () {};
    const onRest = opts.onRest || function () {};

    function step() {
      const displacement = value - target;
      const springForce = -stiffness * displacement;
      const dampForce = -damping * velocity;
      const accel = (springForce + dampForce) / mass;
      velocity += accel * (1 / 60);
      value += velocity * (1 / 60);

      onUpdate(value, velocity);

      if (Math.abs(velocity) < 0.05 && Math.abs(value - target) < 0.05) {
        value = target;
        velocity = 0;
        onUpdate(value, 0);
        onRest(value);
        raf = null;
        return;
      }
      raf = requestAnimationFrame(step);
    }

    return {
      set(t, immediate) {
        target = t;
        if (immediate || reduceMotion) {
          value = t;
          velocity = 0;
          onUpdate(value, 0);
          onRest(value);
          if (raf) cancelAnimationFrame(raf);
          raf = null;
          return;
        }
        if (!raf) raf = requestAnimationFrame(step);
      },
      get() {
        return value;
      },
      stop() {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
        velocity = 0;
      },
      setImmediate(v) {
        value = v;
        target = v;
        velocity = 0;
        if (raf) cancelAnimationFrame(raf);
        raf = null;
        onUpdate(value, 0);
      },
    };
  }

  function levelFromT(t) {
    // t: 0 (top/hot) → 1 (bottom/mild) for thumb position
    // We use fill progress 0 (mild) → 1 (xtra)
    if (t < 0.2) return 'mild';
    if (t < 0.45) return 'medium';
    if (t < 0.72) return 'hot';
    return 'xtra';
  }

  function progressFromLevel(level) {
    return HEATS.indexOf(level) / (HEATS.length - 1);
  }

  function haptic(pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (_) {}
  }

  function countFor(level) {
    return SAUCES.filter((s) => s.heat === level).length;
  }

  // ---------- Mount one lab ----------
  function mountSauceLab(root) {
    if (!root || root.dataset.mounted === '1') return null;
    root.dataset.mounted = '1';

    const isMenu = root.dataset.context === 'menu';
    let level = root.dataset.heat || 'mild';
    let dragging = false;
    let lastSnap = level;
    let tilt = 0;

    // Build DOM if empty shell
    if (!root.querySelector('.bottle-track')) {
      root.innerHTML = buildLabHTML(level, isMenu);
    }

    const els = {
      lab: root,
      track: root.querySelector('.bottle-track'),
      bottle: root.querySelector('.bottle'),
      liquid: root.querySelector('.bottle-liquid'),
      thumb: root.querySelector('.bottle-thumb'),
      thumbLabel: root.querySelector('.bottle-thumb-label'),
      levelLabel: root.querySelector('[data-readout-level]'),
      countLabel: root.querySelector('[data-readout-count]'),
      grid: root.querySelector('[data-sauce-grid]'),
      drip: root.querySelector('.bottle-drip'),
      flash: root.querySelector('.sauce-lab-flash'),
      cta: root.querySelector('[data-heat-cta]'),
      note: root.querySelector('[data-heat-note]'),
    };

    // Continuous progress 0–1 for liquid/thumb interpolation
    const spring = createSpring({
      value: progressFromLevel(level),
      stiffness: 220,
      damping: 24,
      mass: 1,
      onUpdate(v, vel) {
        applyVisual(v, vel);
      },
      onRest(v) {
        const snapped = levelFromT(v);
        if (snapped !== lastSnap) {
          commitLevel(snapped, { fromSpring: true });
        } else {
          // ensure exact snap positions
          applyLevelExact(snapped);
        }
      },
    });

    function applyVisual(progress, velocity) {
      // progress 0 mild → 1 xtra
      const fill = FILL.mild + (FILL.xtra - FILL.mild) * progress;
      // thumb: mild low (high %), xtra high (low %)
      const thumbTop = THUMB.mild + (THUMB.xtra - THUMB.mild) * progress;

      // interpolate color
      const color = colorAtProgress(progress);
      root.style.setProperty('--heat-current', color);
      root.style.setProperty('--heat-glow', hexToRgba(color, 0.35));
      root.style.setProperty('--fill', fill + '%');

      if (els.thumb) els.thumb.style.setProperty('--thumb-top', thumbTop + '%');

      // tilt from velocity
      if (!reduceMotion && els.bottle) {
        tilt = Math.max(-6, Math.min(6, (velocity || 0) * 0.08));
        if (!dragging) {
          // ease tilt back when springing
          tilt *= 0.85;
        }
        const dragTilt = dragging ? tilt : tilt * 0.5;
        els.bottle.style.transform = `rotate(${dragTilt}deg)`;
      }

      // live preview level label while dragging
      const preview = levelFromT(progress);
      if (els.thumbLabel) els.thumbLabel.textContent = LABELS[preview];
      if (dragging && els.levelLabel) {
        els.levelLabel.textContent = LABELS[preview];
      }
    }

    function applyLevelExact(lv) {
      root.style.setProperty('--heat-current', COLORS[lv]);
      root.style.setProperty('--heat-glow', hexToRgba(COLORS[lv], 0.35));
      root.style.setProperty('--fill', FILL[lv] + '%');
      if (els.thumb) els.thumb.style.setProperty('--thumb-top', THUMB[lv] + '%');
      if (els.thumbLabel) els.thumbLabel.textContent = LABELS[lv];
      if (els.bottle) els.bottle.style.transform = 'rotate(0deg)';
    }

    function commitLevel(lv, opts) {
      opts = opts || {};
      const changed = lv !== level;
      level = lv;
      lastSnap = lv;
      root.dataset.heat = lv;
      root.setAttribute('data-heat', lv);

      // ARIA
      if (els.track) {
        els.track.setAttribute('aria-valuenow', String(HEATS.indexOf(lv)));
        els.track.setAttribute('aria-valuetext', LABELS[lv]);
      }

      // Chips + ticks
      root.querySelectorAll('[data-heat]').forEach((el) => {
        if (el.classList.contains('sauce-card')) return;
        el.classList.toggle('is-active', el.dataset.heat === lv);
      });

      // Readout
      if (els.levelLabel) {
        els.levelLabel.textContent = LABELS[lv];
        if (changed) {
          els.levelLabel.classList.remove('is-pop');
          void els.levelLabel.offsetWidth;
          els.levelLabel.classList.add('is-pop');
        }
      }
      if (els.countLabel) {
        const n = countFor(lv);
        els.countLabel.textContent =
          n === 1 ? '1 sauce at this heat' : `${n} sauces at this heat`;
      }

      if (els.note) {
        els.note.textContent = noteFor(lv);
      }

      if (els.cta) {
        if (isMenu) {
          els.cta.href = '#wing-sizes';
          els.cta.textContent = `${LABELS[lv]} · pick 6 / 12 / 24 pc ↑`;
          els.cta.onclick = (e) => {
            e.preventDefault();
            const sizes = document.getElementById('wing-sizes') || document.querySelector('.wings-sizes');
            if (sizes) {
              sizes.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
            }
          };
        } else {
          const base = 'pages/menu.html';
          els.cta.href = `${base}?heat=${lv}#sec-wings`;
          els.cta.textContent = `See ${LABELS[lv]} wings on full menu →`;
          els.cta.onclick = null;
        }
      }

      // Filter sauces
      filterSauces(lv, { animate: changed && !opts.silent });

      // Sync menu page flavor grid if present
      if (typeof window.__setMenuHeat === 'function' && isMenu) {
        window.__setMenuHeat(lv, { fromBottle: true });
      }

      // Haptics + flair on change
      if (changed && !opts.silent) {
        haptic(lv === 'xtra' ? [12, 40, 18] : lv === 'hot' ? [10, 30, 10] : 10);
        if (els.drip) {
          els.drip.classList.remove('is-pour');
          void els.drip.offsetWidth;
          els.drip.classList.add('is-pour');
        }
        if (els.flash) {
          els.flash.classList.remove('is-on');
          void els.flash.offsetWidth;
          els.flash.classList.add('is-on');
        }
      }

      applyLevelExact(lv);

      // Dispatch for other modules
      root.dispatchEvent(
        new CustomEvent('heatchange', {
          bubbles: true,
          detail: { level: lv, sauces: SAUCES.filter((s) => s.heat === lv) },
        })
      );
    }

    function filterSauces(lv, opts) {
      opts = opts || {};
      if (!els.grid) return;
      const cards = els.grid.querySelectorAll('.sauce-card');
      let delay = 0;
      cards.forEach((card) => {
        const match = card.dataset.heat === lv;
        const wasHidden = card.classList.contains('is-hidden');
        card.classList.toggle('is-hidden', !match);
        card.classList.toggle('is-active-heat', match);
        if (match && opts.animate && wasHidden) {
          card.classList.remove('is-enter');
          void card.offsetWidth;
          card.style.animationDelay = `${delay}ms`;
          card.classList.add('is-enter');
          delay += 50;
        }
      });
    }

    // Pointer interaction on track
    function progressFromClientY(clientY) {
      const body = root.querySelector('.bottle-body');
      if (!body) return progressFromLevel(level);
      const rect = body.getBoundingClientRect();
      // top of body = hot (progress 1), bottom = mild (progress 0)
      const t = (clientY - rect.top) / rect.height;
      return 1 - Math.min(1, Math.max(0, t));
    }

    function onPointerDown(e) {
      if (e.button != null && e.button !== 0) return;
      // Don't steal clicks from tick / chip buttons
      if (e.target.closest('button')) return;
      dragging = true;
      spring.stop();
      root.classList.add('is-dragging');
      if (els.bottle) els.bottle.classList.add('is-dragging');
      if (els.track) els.track.classList.add('is-dragging');
      els.track.setPointerCapture(e.pointerId);
      const p = progressFromClientY(e.clientY);
      spring.setImmediate(p);
      haptic(5);
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const p = progressFromClientY(e.clientY);
      const prev = spring.get();
      spring.setImmediate(p);
      // micro haptic when crossing thresholds
      const a = levelFromT(prev);
      const b = levelFromT(p);
      if (a !== b) haptic(8);
    }

    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;
      root.classList.remove('is-dragging');
      if (els.bottle) els.bottle.classList.remove('is-dragging');
      if (els.track) els.track.classList.remove('is-dragging');

      const p = spring.get();
      const snap = levelFromT(p);
      // spring to exact level progress
      spring.set(progressFromLevel(snap));
      commitLevel(snap);
    }

    if (els.track) {
      els.track.addEventListener('pointerdown', onPointerDown);
      els.track.addEventListener('pointermove', onPointerMove);
      els.track.addEventListener('pointerup', onPointerUp);
      els.track.addEventListener('pointercancel', onPointerUp);

      els.track.addEventListener('keydown', (e) => {
        let idx = HEATS.indexOf(level);
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
          e.preventDefault();
          idx = Math.min(HEATS.length - 1, idx + 1);
          goTo(HEATS[idx]);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
          e.preventDefault();
          idx = Math.max(0, idx - 1);
          goTo(HEATS[idx]);
        } else if (e.key === 'Home') {
          e.preventDefault();
          goTo('mild');
        } else if (e.key === 'End') {
          e.preventDefault();
          goTo('xtra');
        }
      });
    }

    function goTo(lv, immediate) {
      spring.set(progressFromLevel(lv), immediate);
      commitLevel(lv);
    }

    // Tick + chip buttons
    root.querySelectorAll('[data-heat-set]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lv = btn.getAttribute('data-heat-set') || btn.dataset.heat;
        if (HEATS.includes(lv)) goTo(lv);
      });
    });

    // Also support data-heat on level buttons
    root.querySelectorAll('.heat-level-btn, .bottle-tick').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lv = btn.dataset.heat;
        if (HEATS.includes(lv)) goTo(lv);
      });
    });

    // Sauce cards: tap to select + dial bottle to that heat
    if (els.grid) {
      els.grid.addEventListener('click', (e) => {
        const card = e.target.closest('.sauce-card');
        if (!card || card.classList.contains('is-hidden')) return;
        const lv = card.dataset.heat;
        if (HEATS.includes(lv)) goTo(lv);
        els.grid.querySelectorAll('.sauce-card').forEach((c) => {
          c.classList.toggle('is-selected', c === card);
        });
        haptic(8);
      });
    }

    // Initial state — respect URL ?heat= on menu
    const params = new URLSearchParams(window.location.search);
    const urlHeat = params.get('heat');
    if (urlHeat && HEATS.includes(urlHeat)) {
      level = urlHeat;
    }

    goTo(level, true);

    return {
      setLevel: goTo,
      getLevel: () => level,
      root,
    };
  }

  function noteFor(lv) {
    const map = {
      mild: 'Flavor-first. BBQ, garlic parm, lemon pepper.',
      medium: 'Sweet heat zone. Chili, gochujang, red hot mild.',
      hot: 'Bring the burn. Mango habanero & buffalo heat.',
      xtra: 'Only the brave. Xtra Hot Buffalo — no mercy.',
    };
    return map[lv] || '';
  }

  function colorAtProgress(p) {
    // sample gradient stops
    const stops = [
      { t: 0, c: COLORS.mild },
      { t: 0.33, c: COLORS.medium },
      { t: 0.66, c: COLORS.hot },
      { t: 1, c: COLORS.xtra },
    ];
    for (let i = 0; i < stops.length - 1; i++) {
      if (p <= stops[i + 1].t) {
        const local = (p - stops[i].t) / (stops[i + 1].t - stops[i].t);
        return lerpHex(stops[i].c, stops[i + 1].c, local);
      }
    }
    return COLORS.xtra;
  }

  function lerpHex(a, b, t) {
    const pa = hexToRgb(a);
    const pb = hexToRgb(b);
    const r = Math.round(pa.r + (pb.r - pa.r) * t);
    const g = Math.round(pa.g + (pb.g - pa.g) * t);
    const bl = Math.round(pa.b + (pb.b - pa.b) * t);
    return `rgb(${r},${g},${bl})`;
  }

  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  function hexToRgba(hex, a) {
    if (hex.startsWith('rgb')) {
      return hex.replace('rgb', 'rgba').replace(')', `,${a})`);
    }
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  }

  function buildLabHTML(level, isMenu) {
    const sauces = SAUCES.map(
      (s) => `
      <article class="sauce-card" data-heat="${s.heat}" data-name="${s.name.toLowerCase()}">
        <span class="sauce-card-name">${s.name}</span>
        <span class="sauce-card-heat">${LABELS[s.heat]}</span>
      </article>`
    ).join('');

    const bubbles = Array.from({ length: 7 })
      .map((_, i) => {
        const x = 18 + ((i * 11) % 60);
        const s = 4 + (i % 4);
        const d = 1.8 + (i % 5) * 0.35;
        const delay = (i * 0.35).toFixed(2);
        return `<span class="bottle-bubble" style="--x:${x}%;--s:${s}px;--d:${d}s;--delay:${delay}s"></span>`;
      })
      .join('');

    const ctaHref = isMenu
      ? `#wing-sizes`
      : `pages/menu.html?heat=${level}#sec-wings`;
    const ctaLabel = isMenu
      ? `${LABELS[level]} · pick 6 / 12 / 24 pc ↑`
      : `See ${LABELS[level]} wings on full menu →`;

    return `
      <div class="sauce-lab-flash" aria-hidden="true"></div>
      <div class="sauce-lab-head">
        <div>
          <p class="sauce-lab-kicker">Tossed in sauce</p>
          <p class="sauce-lab-title">Dial your heat.</p>
        </div>
        <div class="sauce-lab-readout">
          <div class="sauce-lab-level" data-readout-level>${LABELS[level]}</div>
          <p class="sauce-lab-count" data-readout-count></p>
        </div>
      </div>
      <div class="sauce-lab-body">
        <div class="bottle-stage">
          <div
            class="bottle-track"
            role="slider"
            tabindex="0"
            aria-label="Wing heat level"
            aria-valuemin="0"
            aria-valuemax="3"
            aria-valuenow="0"
            aria-valuetext="${LABELS[level]}"
            aria-orientation="vertical"
          >
            <div class="bottle-ticks" aria-hidden="false">
              <button type="button" class="bottle-tick" data-heat="xtra" data-heat-set="xtra" style="order:0">Xtra</button>
              <button type="button" class="bottle-tick" data-heat="hot" data-heat-set="hot" style="order:1">Hot</button>
              <button type="button" class="bottle-tick" data-heat="medium" data-heat-set="medium" style="order:2">Med</button>
              <button type="button" class="bottle-tick" data-heat="mild" data-heat-set="mild" style="order:3">Mild</button>
            </div>
            <div class="bottle" aria-hidden="true">
              <span class="bottle-cap"></span>
              <span class="bottle-drip"></span>
              <span class="bottle-neck"></span>
              <div class="bottle-body">
                <div class="bottle-liquid" style="--fill:${FILL[level]}%"></div>
                <div class="bottle-bubbles">${bubbles}</div>
                <span class="bottle-scale"></span>
                <span class="bottle-sheen"></span>
                <div class="bottle-thumb" style="--thumb-top:${THUMB[level]}%">
                  <span class="bottle-thumb-knob"></span>
                  <span class="bottle-thumb-label">${LABELS[level]}</span>
                </div>
              </div>
            </div>
          </div>
          <p class="bottle-hint">Drag the bottle · tap a level · <strong>↑↓</strong> keys</p>
          <div class="heat-level-row" role="group" aria-label="Heat levels">
            <button type="button" class="heat-level-btn" data-heat="mild" data-heat-set="mild">Mild</button>
            <button type="button" class="heat-level-btn" data-heat="medium" data-heat-set="medium">Med</button>
            <button type="button" class="heat-level-btn" data-heat="hot" data-heat-set="hot">Hot</button>
            <button type="button" class="heat-level-btn" data-heat="xtra" data-heat-set="xtra">Xtra</button>
          </div>
        </div>
        <div class="sauce-results">
          <div class="sauce-results-head">
            <h3>Sauces for you</h3>
            <p class="sauce-results-sub" data-heat-note></p>
          </div>
          <div class="sauce-grid" data-sauce-grid>
            ${sauces}
          </div>
          <div class="sauce-lab-cta">
            <a class="btn btn-amber-outline" data-heat-cta href="${ctaHref}">${ctaLabel}</a>
          </div>
        </div>
      </div>
    `;
  }

  // ---------- Init all labs ----------
  function initAll() {
    // Allow re-mount after menu.js re-renders by clearing flag on empty shells
    document.querySelectorAll('[data-sauce-lab]').forEach((lab) => {
      if (!lab.querySelector('.bottle-track')) {
        delete lab.dataset.mounted;
      }
    });

    const labs = document.querySelectorAll('[data-sauce-lab]');
    const instances = [];
    labs.forEach((lab) => {
      const inst = mountSauceLab(lab);
      if (inst) instances.push(inst);
    });
    // Keep previously mounted instances that weren't recreated
    window.__sauceLabs = instances.length
      ? instances
      : window.__sauceLabs || [];
    return window.__sauceLabs;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Expose for menu.js re-render
  window.__initSauceLabs = initAll;
  window.__SAUCE_HEATS = { HEATS, LABELS, SAUCES };
})();
