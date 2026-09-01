/**
 * Bottomz Up — SVG Sauce Meter
 * Heat rainbow gauge · sauce select · beer pairing · sizes
 * Shared home + menu · mobile chip rail · keyboard
 */
(function () {
  'use strict';

  const SAUCES = {
    bbq: {
      name: 'BBQ',
      desc: 'Sweet, sticky, and smoky. Classic BBQ depth with a touch of molasses on the finish.',
      heatLabel: 'Mild',
      heat: 'mild',
      color: '#4a8d43',
      beer: 'Miller Lite',
      beerNote: 'Crisp light lager cuts the sweetness perfectly.',
    },
    'garlic-parmesan': {
      name: 'Garlic Parmesan',
      desc: 'Rich garlic butter tossed with aged parmesan. Indulgent, savoury, zero regrets.',
      heatLabel: 'Mild',
      heat: 'mild',
      color: '#94b93d',
      beer: 'Heineken',
      beerNote: 'European lager cuts through the buttery richness.',
    },
    'lemon-pepper': {
      name: 'Lemon Pepper',
      desc: 'Bright citrus zing with a cracked pepper finish. The crowd pleaser.',
      heatLabel: 'Mild',
      heat: 'mild',
      color: '#cdd02b',
      beer: 'Corona',
      beerNote: 'Citrusy lager complements the lemon pepper seasoning.',
    },
    'sweet-chilli-buffalo': {
      name: 'Sweet Chili Buffalo',
      desc: 'Thai-style sweet chili meets classic buffalo butter. Tangy, sweet, slight warmth.',
      heatLabel: 'Medium',
      heat: 'medium',
      color: '#f8ae1c',
      beer: 'Modelo',
      beerNote: 'Mexican lager dances perfectly with sweet and spicy buffalo.',
    },
    'sweet-chilli-gochujang': {
      name: 'Sweet Chili Gochujang',
      desc: 'Korean-inspired sticky heat. Deep umami flavor with a slow, creeping warmth.',
      heatLabel: 'Medium',
      heat: 'medium',
      color: '#f05329',
      beer: 'Heineken',
      beerNote: 'The crisp bitterness cuts through the rich gochujang.',
    },
    'red-hot-mild': {
      name: 'Red Hot Mild',
      desc: 'The gateway sauce. Classic vinegar-forward buffalo flavor dialed back to a gentle glow.',
      heatLabel: 'Medium',
      heat: 'medium',
      color: '#e14827',
      beer: 'Bud Light',
      beerNote: 'Easy-drinking alongside the mild kick.',
    },
    'mango-habanero': {
      name: 'Mango Habanero',
      desc: 'Tropical sweetness slammed into scorching habanero heat. A wild ride from the first bite.',
      heatLabel: 'Hot',
      heat: 'hot',
      color: '#bb2c24',
      beer: 'Corona',
      beerNote: 'Lime-friendly import lager balances the tropical habanero heat.',
    },
    // typo alias from older SVG builds
    'mango-habenaro': null,
    'garlic-buffalo': {
      name: 'Garlic Buffalo',
      desc: 'House buffalo sauce supercharged with roasted garlic. Punchy, buttery, hot.',
      heatLabel: 'Hot',
      heat: 'hot',
      color: '#ab2023',
      beer: 'Budweiser',
      beerNote: 'Full-flavored lager stands up to bold garlic buffalo.',
    },
    'red-hot-buffalo': {
      name: 'Red Hot Buffalo',
      desc: 'No messing around. Serious heat with that classic buffalo bite. Wipes out weak sauces.',
      heatLabel: 'Hot',
      heat: 'hot',
      color: '#9c151b',
      beer: 'Bud Light',
      beerNote: 'Standard buffalo pairing to quench the classic heat.',
    },
    'extra-hot-buffalo': {
      name: 'Xtra Hot Buffalo',
      desc: 'You asked for it. A lingering burn that will remind you of your life choices.',
      heatLabel: 'Xtra Hot',
      heat: 'xtra',
      color: '#7a0b12',
      beer: 'Coors Light',
      beerNote: 'Ice cold light lager for maximum relief from the heat.',
    },
  };

  // Resolve aliases
  SAUCES['mango-habenaro'] = SAUCES['mango-habanero'];

  const ORDER = [
    'bbq',
    'garlic-parmesan',
    'lemon-pepper',
    'sweet-chilli-buffalo',
    'sweet-chilli-gochujang',
    'red-hot-mild',
    'mango-habanero',
    'garlic-buffalo',
    'red-hot-buffalo',
    'extra-hot-buffalo',
  ];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function haptic(ms) {
    try {
      if (navigator.vibrate) navigator.vibrate(ms);
    } catch (_) {}
  }

  function resolveSauce(id) {
    if (!id) return null;
    const key = id === 'mango-habenaro' ? 'mango-habanero' : id;
    return SAUCES[key] ? { id: key, ...SAUCES[key] } : null;
  }

  async function ensureSvg(col) {
    if (col.querySelector('.sauce-meter-svg, .meter-sauce-btn')) return col.querySelector('svg') || col;
    const src = col.dataset.meterSrc;
    if (!src) return null;
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(String(res.status));
      const markup = await res.text();
      col.innerHTML = markup;
      return col.querySelector('svg');
    } catch (err) {
      console.warn('[sauce-meter] SVG load failed', err);
      return null;
    }
  }

  function buildMobileChips(section, host) {
    if (!host || host.dataset.built === '1') return;
    host.dataset.built = '1';
    host.setAttribute('role', 'listbox');
    host.setAttribute('aria-label', 'Wing sauces');
    host.innerHTML = ORDER.map((id, i) => {
      const s = SAUCES[id];
      return `<button type="button" class="wm-chip" role="option" data-sauce="${id}" data-index="${i}" style="--chip-color:${s.color}">
        <span class="wm-chip-label">${s.name}</span>
        <span class="wm-chip-heat">${s.heatLabel}</span>
      </button>`;
    }).join('');
  }

  function mountSection(section) {
    if (!section || section.dataset.meterMounted === '1') return null;
    section.dataset.meterMounted = '1';

    const isMenu = section.dataset.context === 'menu';
    const meterCol =
      section.querySelector('.wm-meter-col') ||
      section.querySelector('[data-meter-src]');
    const chipHost = section.querySelector('[data-wm-chips]');
    const detailsTarget = section.querySelector('[data-wm-details]') || section.querySelector('#wmDetailsTarget');
    const heatBadge = section.querySelector('[data-wm-heat]') || section.querySelector('#wmHeatBadge');
    const sauceName = section.querySelector('[data-wm-name]') || section.querySelector('#wmSauceName');
    const sauceDesc = section.querySelector('[data-wm-desc]') || section.querySelector('#wmSauceDesc');
    const pairingBeer = section.querySelector('[data-wm-beer]') || section.querySelector('#wmPairingBeer');
    const pairingNote = section.querySelector('[data-wm-note]') || section.querySelector('#wmPairingNote');
    const heatBar = section.querySelector('[data-wm-heat-bar]');
    const cta = section.querySelector('[data-wm-cta]');

    let currentId = null;
    let size = 'medium';
    let syncingKnob = false;
    const knobHost = section.querySelector('[data-heat-knob]');

    function indexToKnobValue(idx) {
      if (ORDER.length <= 1) return 0;
      return Math.round((idx / (ORDER.length - 1)) * 100);
    }

    function knobValueToIndex(value) {
      if (ORDER.length <= 1) return 0;
      return Math.round((Math.min(100, Math.max(0, value)) / 100) * (ORDER.length - 1));
    }

    function syncKnobToSauce(sauceId, opts) {
      opts = opts || {};
      if (!knobHost || syncingKnob) return;
      const idx = ORDER.indexOf(sauceId);
      if (idx < 0) return;
      const data = resolveSauce(sauceId);
      const knobs = window.__heatKnobs || [];
      const inst = knobs.find((k) => k.root === knobHost) || knobs[0];
      if (!inst) return;
      syncingKnob = true;
      inst.setValue(indexToKnobValue(idx), { immediate: opts.immediate, silent: true });
      if (inst.setHeatLabel && data) inst.setHeatLabel(data.heatLabel);
      // also set CSS accent on knob to sauce color
      knobHost.style.setProperty('--hk-accent', data ? data.color : '#e7931e');
      syncingKnob = false;
    }

    function setActiveUi(sauceId, opts) {
      opts = opts || {};
      const data = resolveSauce(sauceId);
      if (!data) return;

      section.style.setProperty('--wm-color', data.color);
      section.dataset.activeSauce = data.id;
      section.dataset.activeHeat = data.heat;

      // SVG buttons
      section.querySelectorAll('.meter-sauce-btn').forEach((btn) => {
        const id = btn.getAttribute('data-sauce');
        const on = id === data.id || (id === 'mango-habenaro' && data.id === 'mango-habanero');
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-pressed', String(on));
      });

      // Mobile chips — never scrollIntoView on boot (silent). That was yanking
      // the homepage to the wings section on first paint.
      section.querySelectorAll('.wm-chip').forEach((chip) => {
        const on = chip.dataset.sauce === data.id;
        chip.classList.toggle('is-active', on);
        chip.setAttribute('aria-selected', String(on));
        if (on && !opts.silent) {
          chip.scrollIntoView({
            behavior: reduceMotion ? 'auto' : 'smooth',
            inline: 'center',
            block: 'nearest',
          });
        }
      });

      // Heat band glow on meter index
      const idx = ORDER.indexOf(data.id);
      section.querySelectorAll('.meter-band').forEach((band) => {
        band.classList.toggle('is-lit', Number(band.dataset.band) === idx);
      });

      // Heat progress 0–1
      if (heatBar) {
        const p = idx < 0 ? 0 : (idx + 1) / ORDER.length;
        heatBar.style.setProperty('--wm-heat-p', String(p));
        heatBar.dataset.heat = data.heat;
      }

      // Detail card crossfade
      const runUpdate = () => {
        if (heatBadge) heatBadge.textContent = data.heatLabel;
        if (sauceName) sauceName.textContent = data.name;
        if (sauceDesc) sauceDesc.textContent = data.desc;
        if (pairingBeer) pairingBeer.textContent = 'Pairs with ' + data.beer;
        if (pairingNote) pairingNote.textContent = data.beerNote;
        if (detailsTarget) detailsTarget.classList.remove('is-changing');
      };

      if (detailsTarget && !reduceMotion) {
        detailsTarget.classList.add('is-changing');
        setTimeout(runUpdate, 180);
      } else {
        runUpdate();
      }

      // CTA
      if (cta) {
        if (isMenu) {
          cta.href = '#wing-sizes';
          cta.textContent = `${data.heatLabel} · pick a size ↓`;
          cta.classList.add('wm-vp-link');
          cta.classList.remove('btn-ticket');
        } else {
          cta.href = `pages/menu.html?heat=${data.heat}&sauce=${data.id}#sec-wings`;
          cta.textContent = `See ${data.name} on menu →`;
          cta.classList.add('wm-vp-link');
          cta.classList.remove('btn-ticket');
        }
      }

      // Bridge menu heat filter when on menu page
      if (isMenu && typeof window.__setMenuHeat === 'function') {
        window.__setMenuHeat(data.heat, { fromBottle: true });
      }

      section.dispatchEvent(
        new CustomEvent('saucechange', {
          bubbles: true,
          detail: { id: data.id, heat: data.heat, size, sauce: data },
        })
      );
    }

    function selectSauce(sauceId, opts) {
      opts = opts || {};
      const data = resolveSauce(sauceId);
      if (!data) return;
      const changed = data.id !== currentId;
      currentId = data.id;
      setActiveUi(data.id, opts);
      // Keep heat motor knob in sync (unless change came from the knob)
      if (!opts.fromKnob) {
        syncKnobToSauce(data.id, { immediate: opts.silent });
      } else if (knobHost) {
        const inst = (window.__heatKnobs || []).find((k) => k.root === knobHost);
        if (inst && inst.setHeatLabel) inst.setHeatLabel(data.heatLabel);
        knobHost.style.setProperty('--hk-accent', data.color);
      }
      if (changed && !opts.silent) {
        haptic(data.heat === 'xtra' ? [10, 30, 12] : 8);
        section.classList.remove('is-pulse');
        void section.offsetWidth;
        section.classList.add('is-pulse');
      }
    }

    // Heat motor knob → sauce index
    if (knobHost) {
      const onKnob = (e) => {
        if (syncingKnob) return;
        const value = e.detail && typeof e.detail.value === 'number' ? e.detail.value : 0;
        const idx = knobValueToIndex(value);
        const id = ORDER[idx];
        if (id) selectSauce(id, { fromKnob: true, silent: e.type === 'heatknobchange' });
      };
      knobHost.addEventListener('heatknobchange', onKnob);
      knobHost.addEventListener('heatknobcommit', onKnob);
    }

    function onActivate(e) {
      const btn = e.target.closest('[data-sauce]');
      if (!btn || !section.contains(btn)) return;
      e.preventDefault();
      selectSauce(btn.getAttribute('data-sauce'));
    }

    section.addEventListener('click', onActivate);
    section.addEventListener('keydown', (e) => {
      const btn = e.target.closest('.meter-sauce-btn, .wm-chip');
      if (!btn) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectSauce(btn.getAttribute('data-sauce'));
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const id = btn.getAttribute('data-sauce') === 'mango-habenaro' ? 'mango-habanero' : btn.getAttribute('data-sauce');
        let idx = ORDER.indexOf(id);
        if (idx < 0) idx = 0;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') idx = Math.min(ORDER.length - 1, idx + 1);
        else idx = Math.max(0, idx - 1);
        selectSauce(ORDER[idx]);
        const next = section.querySelector(`[data-sauce="${ORDER[idx]}"], [data-sauce="mango-habenaro"]`);
        if (next && next.focus) next.focus();
      }
    });

    // Size boxes
    section.querySelectorAll('.wm-size-box').forEach((box) => {
      box.setAttribute('role', 'button');
      box.setAttribute('tabindex', '0');
      box.addEventListener('click', () => {
        section.querySelectorAll('.wm-size-box').forEach((b) => b.classList.remove('is-active'));
        box.classList.add('is-active');
        size = (box.dataset.size || box.querySelector('.wm-size-name')?.textContent || 'medium').toLowerCase();
        haptic(5);
      });
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          box.click();
        }
      });
    });

    // Init after SVG ready
    const boot = async () => {
      if (meterCol) await ensureSvg(meterCol);
      buildMobileChips(section, chipHost);

      // Ensure heat knobs mounted (after DOM for this section exists)
      if (typeof window.__initHeatKnobs === 'function') {
        window.__initHeatKnobs();
      }

      // URL deep-link
      const params = new URLSearchParams(window.location.search);
      const wantSauce = params.get('sauce');
      const wantHeat = params.get('heat');
      let start = 'bbq';
      if (wantSauce && resolveSauce(wantSauce)) start = resolveSauce(wantSauce).id;
      else if (wantHeat) {
        const match = ORDER.find((id) => SAUCES[id].heat === wantHeat);
        if (match) start = match;
      }
      selectSauce(start, { silent: true });
    };

    boot();

    return {
      select: selectSauce,
      get: () => currentId,
      root: section,
    };
  }

  function initAll() {
    const nodes = document.querySelectorAll('[data-sauce-meter], .wings-meter-section');
    const instances = [];
    nodes.forEach((el) => {
      const inst = mountSection(el);
      if (inst) instances.push(inst);
    });
    window.__sauceMeters = instances;
    return instances;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Menu re-render hook
  window.__initSauceMeters = initAll;
  window.__SAUCE_METER_DATA = { ORDER, SAUCES };
})();
