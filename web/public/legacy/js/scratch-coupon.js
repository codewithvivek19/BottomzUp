/**
 * Scratch coupon — adapted from Framer ImageScratch mechanics
 * destination-out brush on canvas foil · reveal 10% off code
 * Promo: ZUP10 (Bottomz Up · 10% off)
 */
(function () {
  'use strict';

  let CODE = 'ZUP10';
  let STORAGE_KEY = 'bottomz-scratch-zup10';
  const REVEAL_AT = 0.42; // % transparent pixels to auto-complete
  const BRUSH = 42;

  const section = document.querySelector('.scratch-section') || document.getElementById('promo');
  const root = document.querySelector('[data-scratch]');
  if (!root) return;

  const canvas = root.querySelector('.scratch-foil');
  const codeEl = root.querySelector('[data-scratch-code]');
  const copyBtn = root.querySelector('[data-scratch-copy]');
  const hint = root.querySelector('.scratch-hint');
  if (!canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  let drawing = false;
  let last = null;
  let revealed = false;
  let dpr = 1;

  if (codeEl) codeEl.textContent = CODE;

  function sizeCanvas() {
    const rect = root.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }

  /** Brand foil: deep amber → cream metallic feel */
  function paintFoil(w, h) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#C67A12');
    g.addColorStop(0.35, '#E7931E');
    g.addColorStop(0.55, '#F19F0F');
    g.addColorStop(0.78, '#E8A54B');
    g.addColorStop(1, '#C67A12');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Soft sheen bands
    const sheen = ctx.createLinearGradient(0, 0, w, 0);
    sheen.addColorStop(0, 'rgba(251,246,227,0)');
    sheen.addColorStop(0.45, 'rgba(251,246,227,0.28)');
    sheen.addColorStop(0.55, 'rgba(251,246,227,0.08)');
    sheen.addColorStop(1, 'rgba(251,246,227,0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h);

    // Noise speckles
    ctx.fillStyle = 'rgba(255,253,246,0.07)';
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.fillRect(x, y, 1.2, 1.2);
    }

    // Center label only — never paint the real coupon code on the foil
    ctx.fillStyle = 'rgba(26,25,25,0.22)';
    ctx.font = '600 13px Poppins, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCRATCH TO REVEAL', w / 2, h / 2 - 10);
    ctx.font = '700 22px "Lemon Milk", Impact, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,253,246,0.88)';
    ctx.fillText('••••••', w / 2, h / 2 + 16);
  }

  function resetFoil() {
    const { w, h } = sizeCanvas();
    paintFoil(w, h);
    revealed = false;
    root.classList.remove('is-revealed', 'is-scratching');
    if (hint) hint.hidden = false;
  }

  function pointFromEvent(e) {
    const rect = root.getBoundingClientRect();
    const src = e.touches && e.touches[0] ? e.touches[0] : e;
    return {
      x: src.clientX - rect.left,
      y: src.clientY - rect.top,
    };
  }

  function scratchAt(x, y) {
    const r = Math.max(8, BRUSH / 2);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function scratchLine(from, to) {
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const step = Math.max(4, BRUSH * 0.2);
    const steps = Math.max(1, Math.ceil(dist / step));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      scratchAt(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
    }
  }

  function scratchedRatio() {
    try {
      const { width, height } = canvas;
      if (width < 4 || height < 4) return 0;
      // Sample every Nth pixel for perf
      const data = ctx.getImageData(0, 0, width, height).data;
      let clear = 0;
      let total = 0;
      const stride = 16; // sample alpha every 4px in each dim ≈ every 16th pixel index step 4*4
      for (let i = 3; i < data.length; i += 4 * stride) {
        total++;
        if (data[i] < 24) clear++;
      }
      return total ? clear / total : 0;
    } catch (_) {
      return 0;
    }
  }

  function updateFoot(showCode) {
    const foot = section && section.querySelector('.scratch-foot');
    if (!foot) return;
    const pct = discountPercent(
      (root.querySelector('.scratch-prize-off em') || {}).textContent || '10'
    );
    if (showCode) {
      foot.innerHTML =
        'Code <strong>' +
        CODE +
        '</strong> · ' +
        pct +
        '% off food · show staff · not with other offers';
    } else {
      foot.textContent =
        'Scratch the foil to reveal your code · ' +
        pct +
        '% off food · show staff · not with other offers';
    }
  }

  function completeReveal() {
    if (revealed) return;
    revealed = true;
    root.classList.add('is-revealed');
    root.classList.remove('is-scratching');
    if (hint) hint.hidden = true;
    if (codeEl) codeEl.textContent = CODE;
    updateFoot(true);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (_) {}
    // Clear remaining foil
    const { w, h } = sizeCanvas();
    ctx.clearRect(0, 0, w, h);
  }

  function onDown(e) {
    if (revealed) return;
    e.preventDefault();
    drawing = true;
    root.classList.add('is-scratching');
    last = pointFromEvent(e);
    scratchAt(last.x, last.y);
    if (e.pointerId != null && e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (_) {}
    }
  }

  function onMove(e) {
    if (!drawing || revealed) return;
    e.preventDefault();
    const pt = pointFromEvent(e);
    if (last) scratchLine(last, pt);
    else scratchAt(pt.x, pt.y);
    last = pt;
  }

  function onUp() {
    if (!drawing) return;
    drawing = false;
    last = null;
    if (scratchedRatio() >= REVEAL_AT) completeReveal();
  }

  // Copy code
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(CODE);
      } catch (_) {
        const ta = document.createElement('textarea');
        ta.value = CODE;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      copyBtn.classList.add('is-copied');
      copyBtn.textContent = 'Copied';
      window.setTimeout(() => {
        copyBtn.classList.remove('is-copied');
        copyBtn.textContent = 'Copy';
      }, 1800);
    });
  }

  // Pointer + touch
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('pointerleave', onUp);

  function discountPercent(label) {
    const n = String(label || '10').replace(/%/g, '').replace(/off/gi, '').trim();
    return n || '10';
  }

  function applyCoupon(coupon) {
    CODE = String(coupon.code || 'ZUP10').toUpperCase();
    STORAGE_KEY = 'bottomz-scratch-' + CODE.toLowerCase();
    const pct = discountPercent(coupon.discountLabel);

    // Keep real code out of the DOM until the foil is cleared
    if (codeEl) codeEl.textContent = '••••••';

    // Prize amount on the card (always show "N% OFF")
    const off = root.querySelector('.scratch-prize-off');
    if (off) {
      off.innerHTML = '<em>' + pct + '%</em> OFF';
    }

    // Section heading + accessibility mirror the admin discount
    const title = section && section.querySelector('[data-scratch-title], .scratch-head h2');
    if (title) {
      title.textContent = 'Scratch. Save ' + pct + '%.';
    }
    if (section) {
      section.setAttribute('aria-label', 'Scratch for ' + pct + ' percent off');
    }

    const kicker = root.querySelector('.scratch-prize-kicker');
    if (kicker && coupon.headline) kicker.textContent = coupon.headline;

    const note = root.querySelector('.scratch-prize-note');
    if (note && coupon.note) note.textContent = coupon.note;

    const lede = section && section.querySelector('[data-scratch-lede], .scratch-lede');
    if (lede) {
      lede.textContent =
        'Dig through the foil for a one-time ' +
        pct +
        '% code. Show it when you order.';
    }

    updateFoot(false);
  }

  function startScratch() {
    let already = false;
    try {
      already = localStorage.getItem(STORAGE_KEY) === '1';
    } catch (_) {}

    if (already || reduceMotion) {
      sizeCanvas();
      completeReveal();
    } else {
      resetFoil();
    }
  }

  // Load active coupon from admin-managed API (fallback to ZUP10)
  fetch('/api/coupon')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data || !data.coupon) {
        if (section) section.hidden = true;
        return;
      }
      applyCoupon(data.coupon);
      startScratch();
    })
    .catch(function () {
      applyCoupon({ code: CODE, discountLabel: '10%', headline: 'In-house only', note: '' });
      startScratch();
    });

  window.addEventListener(
    'resize',
    () => {
      if (revealed) {
        sizeCanvas();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else if (!root.closest('[hidden]')) {
        resetFoil();
      }
    },
    { passive: true }
  );
})();
