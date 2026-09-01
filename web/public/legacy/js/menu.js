/**
 * Bottomz Up — Interactive Menu Night
 * Filter, search, heat levels, collapsible drinks, scroll-spy
 */
(function () {
  'use strict';

  const data = window.BOTTOMZ_MENU;
  if (!data) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const els = {
    cats: document.getElementById('menuCats'),
    main: document.getElementById('menuMain'),
    search: document.getElementById('menuSearch'),
    searchClear: document.getElementById('menuSearchClear'),
    meta: document.getElementById('menuResultsMeta'),
    empty: document.getElementById('menuEmpty'),
  };

  let activeCat = 'all';
  let query = '';
  let heatFilter = 'all';

  // Distilled IA: mega-groups (Food / Wings / Burgers / Bar)
  const CAT_NAV = [
    { id: 'all', label: 'All', theme: 'food', match: null },
    { id: 'burgers', label: 'Burgers', theme: 'food', match: ['burgers'] },
    { id: 'wings', label: 'Wings', theme: 'food', match: ['wings'] },
    {
      id: 'food',
      label: 'Kitchen',
      theme: 'food',
      match: ['starters', 'salads', 'kitchen', 'kids', 'desserts', 'sides'],
    },
    { id: 'drinks', label: 'Bar', theme: 'bar', match: ['drinks'] },
  ];

  function catMatches(sectionCat) {
    if (activeCat === 'all') return true;
    const group = CAT_NAV.find((c) => c.id === activeCat);
    if (!group || !group.match) return sectionCat === activeCat;
    return group.match.includes(sectionCat);
  }

  function megaForSection(sectionCat) {
    if (sectionCat === 'burgers') return 'burgers';
    if (sectionCat === 'wings') return 'wings';
    if (sectionCat === 'drinks') return 'drinks';
    return 'food';
  }

  // ---------- Render ----------
  function badgeHTML(item) {
    const badges = [];
    if (item.tags) {
      if (item.tags.includes('vegetarian')) badges.push('<span class="menu-badge menu-badge--v">V</span>');
      if (item.tags.includes('spicy')) badges.push('<span class="menu-badge menu-badge--spicy">Spicy</span>');
      if (item.tags.includes('signature')) badges.push('<span class="menu-badge menu-badge--sig">Signature</span>');
      if (item.tags.includes('undercooked')) badges.push('<span class="menu-badge menu-badge--star" title="May be served undercooked">*</span>');
    }
    if (item.featured && !item.tags?.includes('signature')) {
      badges.push('<span class="menu-badge menu-badge--sig">Featured</span>');
    }
    return badges.join('');
  }

  function optionsHTML(item) {
    if (!item.options || !item.options.length) return '';
    const label = item.optionsLabel ? `<span class="menu-chip">${escapeHTML(item.optionsLabel)}</span>` : '';
    const chips = item.options.map((o) => `<span class="menu-chip">${escapeHTML(o)}</span>`).join('');
    return `<div class="menu-item-options">${label}${chips}</div>`;
  }

  function itemHTML(item, isBar) {
    const price =
      item.price != null
        ? `<span class="menu-item-price">$${item.price}</span>`
        : isBar
          ? `<span class="menu-item-price menu-item-price--ask">Ask</span>`
          : '';

    const searchBlob = [item.name, item.desc, item.add, ...(item.options || []), ...(item.tags || [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const featuredClass = item.featured || (item.tags && item.tags.includes('signature')) ? ' menu-item--featured' : '';

    return `
      <article class="menu-item${featuredClass}" data-search="${escapeAttr(searchBlob)}" data-name="${escapeAttr(item.name.toLowerCase())}">
        <div>
          <div class="menu-item-top">
            <span class="menu-item-name">${escapeHTML(item.name)}</span>
            ${badgeHTML(item)}
          </div>
          ${item.desc ? `<p class="menu-item-desc">${escapeHTML(item.desc)}</p>` : ''}
          ${item.add ? `<p class="menu-item-add">Add: ${escapeHTML(item.add)}</p>` : ''}
          ${optionsHTML(item)}
        </div>
        ${price}
      </article>
    `;
  }

  function wingsHTML(section) {
    const sizes = section.sizes
      .map(
        (s, i) => `
      <div class="wings-size${i === 1 ? ' is-active' : ''}" role="button" tabindex="0" data-size="${escapeAttr(s.label.toLowerCase())}">
        <span class="wings-size-label">${escapeHTML(s.label)}</span>
        <span class="wings-size-count">${escapeHTML(s.count)}</span>
        <span class="wings-size-price">$${s.price}</span>
      </div>`
      )
      .join('');

    const flavors = section.flavors
      .map((f) => {
        const search = `${f.name} ${f.heat} wings`.toLowerCase();
        return `
        <div class="flavor-card" data-heat="${escapeAttr(f.heat)}" data-search="${escapeAttr(search)}" data-name="${escapeAttr(f.name.toLowerCase())}">
          <span class="flavor-name">${escapeHTML(f.name)}</span>
          <span class="flavor-heat flavor-heat--${escapeAttr(f.heat)}">${escapeHTML(f.heat === 'xtra' ? 'Xtra Hot' : f.heat)}</span>
        </div>`;
      })
      .join('');

    // Same single-viewport sauce lab as homepage (all viewports)
    const meterSrc = '../assets/images/sauce-meter.svg';
    return `
      <section class="wings-meter-section wings-meter-section--viewport wings-meter-section--in-menu" data-sauce-meter data-context="menu" id="menuSauceMeter" aria-label="Wing sauces and heat">
        <div class="wm-shell wm-shell--viewport">
          <header class="wm-vp-head">
            <p class="wm-eyebrow">Bone-in wings</p>
            <h2 class="wm-title">Dial your heat.</h2>
          </header>

          <div class="wm-vp-stage">
            <div class="wm-vp-meter" data-meter-src="${meterSrc}" aria-label="Sauce heat meter"></div>
            <div class="wm-vp-knob">
              <div class="hk-stage" data-heat-knob data-value="0" aria-label="Heat control knob"></div>
            </div>
          </div>

          <div class="wm-vp-readout" data-wm-details id="wmDetailsTarget">
            <span class="wm-heat-badge" data-wm-heat id="wmHeatBadge">Mild</span>
            <span class="wm-vp-name" data-wm-name id="wmSauceName">BBQ</span>
            <span class="visually-hidden" data-wm-desc id="wmSauceDesc"></span>
            <span class="visually-hidden" data-wm-beer id="wmPairingBeer"></span>
            <span class="visually-hidden" data-wm-note id="wmPairingNote"></span>
            <a class="wm-vp-link" href="#wing-sizes" data-wm-cta>Pick a size ↓</a>
          </div>

          <div class="wm-vp-chips" data-wm-chips aria-label="Sauces"></div>
        </div>
      </section>

      <div class="wings-sizes" id="wing-sizes">${sizes}</div>
      <div class="flavor-grid is-sr-mirror" id="flavorGrid" hidden aria-hidden="true">${flavors}</div>
      <div class="heat-filter" id="heatFilter" hidden aria-hidden="true">
        <button type="button" class="heat-chip is-active" data-heat="all">All</button>
        <button type="button" class="heat-chip" data-heat="mild">Mild</button>
        <button type="button" class="heat-chip" data-heat="medium">Medium</button>
        <button type="button" class="heat-chip" data-heat="hot">Hot</button>
        <button type="button" class="heat-chip" data-heat="xtra">Xtra</button>
      </div>
    `;
  }

  function beerHTML(group) {
    if (!group.beerLists) return '';
    const dom = group.beerLists.domestic.map((b) => `<li data-search="${escapeAttr(b.toLowerCase() + ' beer domestic')}" data-name="${escapeAttr(b.toLowerCase())}">${escapeHTML(b)}</li>`).join('');
    const imp = group.beerLists.import.map((b) => `<li data-search="${escapeAttr(b.toLowerCase() + ' beer import')}" data-name="${escapeAttr(b.toLowerCase())}">${escapeHTML(b)}</li>`).join('');
    return `
      <div class="beer-cols">
        <div>
          <h4>Domestic</h4>
          <ul>${dom}</ul>
        </div>
        <div>
          <h4>Import</h4>
          <ul>${imp}</ul>
        </div>
      </div>
    `;
  }

  function drinksHTML(section) {
    return `
      <div class="drink-groups">
        ${section.drinkGroups
          .map((g) => {
            const count =
              g.beerLists
                ? g.beerLists.domestic.length + g.beerLists.import.length
                : (g.items || []).length;
            const body =
              g.beerLists
                ? beerHTML(g)
                : `<div class="menu-list">${(g.items || []).map((item) => itemHTML(item, true)).join('')}</div>`;

            const panelId = `drink-panel-${escapeAttr(g.id)}`;
            return `
            <div class="drink-group ${g.open ? 'is-open' : ''}" data-group="${escapeAttr(g.id)}">
              <button type="button" class="drink-group-toggle" aria-expanded="${g.open ? 'true' : 'false'}" aria-controls="${panelId}" id="drink-btn-${escapeAttr(g.id)}">
                <div>
                  <h3>${escapeHTML(g.title)}</h3>
                  ${g.subtitle ? `<p class="drink-group-sub">${escapeHTML(g.subtitle)}</p>` : ''}
                </div>
                <div class="drink-group-meta">
                  <span class="drink-group-count">${count} items</span>
                  <span class="drink-group-chevron" aria-hidden="true"></span>
                </div>
              </button>
              <div class="drink-group-body" id="${panelId}" role="region" aria-labelledby="drink-btn-${escapeAttr(g.id)}">${body}</div>
            </div>`;
          })
          .join('')}
      </div>
    `;
  }

  function sectionHTML(section) {
    const themeClass = section.theme === 'bar' ? 'menu-section--bar' : '';
    let body = '';

    if (section.isWings) {
      body = wingsHTML(section);
    } else if (section.isBar) {
      body = drinksHTML(section);
    } else {
      const gridClass = section.items.length > 4 ? 'menu-list--grid' : '';
      body = `<div class="menu-list ${gridClass}">${section.items.map((item) => itemHTML(item, false)).join('')}</div>`;
    }

    return `
      <section class="menu-section ${themeClass}" id="sec-${escapeAttr(section.id)}" data-cat="${escapeAttr(section.id)}" data-theme="${escapeAttr(section.theme)}">
        <div class="menu-section-head">
          <p class="eyebrow">${section.theme === 'bar' ? 'Full Bar' : 'Food'}</p>
          <div class="menu-section-title">
            <h2>${escapeHTML(section.title)}</h2>
            ${section.subtitle ? `<span class="menu-section-sub">${escapeHTML(section.subtitle)}</span>` : ''}
          </div>
          ${section.intro ? `<p class="menu-section-intro body-md">${escapeHTML(section.intro)}</p>` : ''}
        </div>
        ${body}
      </section>
    `;
  }

  function renderCats() {
    if (!els.cats) return;
    // Toolbar group — not fake tabs
    els.cats.removeAttribute('role');
    els.cats.setAttribute('role', 'toolbar');
    els.cats.setAttribute('aria-label', 'Menu categories');
    els.cats.innerHTML = CAT_NAV.map(
      (c, i) =>
        `<button type="button" class="menu-cat${i === 0 ? ' is-active' : ''}" data-cat="${escapeAttr(c.id)}" data-theme="${escapeAttr(c.theme)}" aria-pressed="${i === 0 ? 'true' : 'false'}">${escapeHTML(c.label)}</button>`
    ).join('');
  }

  function renderMenu() {
    if (!els.main) return;
    const legend = `
      <p class="menu-legend" id="menuLegend">
        <span><i class="menu-legend-dot menu-legend-dot--v"></i> V vegetarian</span>
        <span><i class="menu-legend-dot menu-legend-dot--spicy"></i> Spicy</span>
        <span><i class="menu-legend-dot menu-legend-dot--sig"></i> Signature / featured</span>
        <span><i class="menu-legend-dot menu-legend-dot--star"></i> * may be undercooked</span>
      </p>`;

    // Visible conversion band (no .reveal — was stuck opacity:0 without is-visible)
    const barCta = `
      <div class="bar-conversion" id="barConversion">
        <div class="bar-conversion-inner">
          <div>
            <p class="eyebrow">The bar is open</p>
            <h3 class="display heading-md">Ready for a round?</h3>
            <p class="body-md bar-conversion-copy">Walk-ins welcome. Large crew? Give us a heads up — or order delivery via DoorDash &amp; Grubhub.</p>
          </div>
          <div class="bar-conversion-actions">
            <button type="button" class="btn-ticket js-open-reserve">
              <span class="btn-hover-fill" aria-hidden="true"></span>
              <span class="btn-label" data-contact="call-label">Call for Order</span>
              <span class="btn-arrow" aria-hidden="true">↗</span>
            </button>
            <a class="btn-ticket btn-ticket-light" data-contact="maps" href="https://maps.google.com/?q=2001+Seymour+Dr,+South+Boston,+VA+24592">
              <span class="btn-hover-fill" aria-hidden="true"></span>
              <span class="btn-label">Get Directions</span>
              <span class="btn-arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>`;

    els.main.innerHTML =
      legend +
      data.sections.map(sectionHTML).join('') +
      barCta +
      `
      <div class="menu-empty" id="menuEmpty">
        <h3 class="heading-md">Nothing matched</h3>
        <p class="body-md">Try another search or clear filters — the kitchen’s still open.</p>
        <button type="button" class="btn-ticket" id="menuEmptyReset">
          <span class="btn-hover-fill" aria-hidden="true"></span>
          <span class="btn-label">Clear filters</span>
        </button>
      </div>
      <p class="menu-disclaimer">
        Disclosure / Consumer Advisory: Consuming raw or undercooked meats, poultry, seafood, shellfish, or eggs may increase your risk of foodborne illness, especially if you have certain medical conditions. Please advise your server of any allergies. * These items may be served undercooked.
      </p>
    `;

    // re-bind empty after re-render
    els.empty = document.getElementById('menuEmpty');
    const reset = document.getElementById('menuEmptyReset');
    if (reset) {
      reset.addEventListener('click', () => {
        activeCat = 'all';
        query = '';
        heatFilter = 'all';
        if (els.search) els.search.value = '';
        updateSearchClear();
        syncCatButtons();
        applyFilters();
        syncHeatButtons();
      });
    }

    bindDrinkToggles();
    bindHeatFilter();
    bindMenuHeatBottle();
    // Remount sauce meter + heat knobs after wings DOM is rebuilt
    document.querySelectorAll('[data-sauce-meter]').forEach((el) => {
      delete el.dataset.meterMounted;
    });
    document.querySelectorAll('[data-heat-knob]').forEach((el) => {
      delete el.dataset.hkMounted;
    });
    if (typeof window.__initSauceMeters === 'function') {
      window.__initSauceMeters();
    } else if (typeof window.__initHeatKnobs === 'function') {
      window.__initHeatKnobs();
    }
    if (typeof window.__initHeatKnobs === 'function') {
      window.__initHeatKnobs();
    }
  }

  // ---------- Filters ----------
  function applyFilters() {
    const q = query.trim().toLowerCase();
    let visibleItems = 0;
    let visibleSections = 0;

    document.querySelectorAll('.menu-section').forEach((section) => {
      const cat = section.dataset.cat;
      const catMatch = catMatches(cat);

      if (!catMatch && !q) {
        section.classList.add('is-hidden');
        return;
      }

      // Wings flavors
      if (section.id === 'sec-wings') {
        let wingVisible = 0;
        section.querySelectorAll('.flavor-card').forEach((card) => {
          const heat = card.dataset.heat;
          const search = card.dataset.search || '';
          const heatOk = heatFilter === 'all' || heat === heatFilter;
          const qOk = !q || search.includes(q) || 'wings'.includes(q);
          const show = catMatch && heatOk && qOk;
          card.classList.toggle('is-hidden', !show);
          if (show) wingVisible++;
        });

        // When searching from All, show wings if any match
        const showSection = (catMatch || q) && (wingVisible > 0 || (!q && catMatch));
        // If heat filtering with no query and category is wings/all
        const showByHeat = catMatch && !q && heatFilter !== 'all' ? wingVisible > 0 : true;
        const finalShow = showSection && (q ? wingVisible > 0 : catMatch);
        section.classList.toggle('is-hidden', !finalShow);
        if (finalShow) {
          visibleSections++;
          visibleItems += wingVisible || (catMatch && !q ? 10 : 0);
        }
        return;
      }

      // Drink / beer items
      if (section.dataset.theme === 'bar') {
        let anyVisible = false;

        section.querySelectorAll('.menu-item').forEach((item) => {
          const search = item.dataset.search || '';
          const qOk = !q || search.includes(q);
          item.classList.toggle('is-hidden', !qOk);
          if (qOk) {
            anyVisible = true;
            visibleItems++;
          }
        });

        section.querySelectorAll('.beer-cols li').forEach((li) => {
          const search = li.dataset.search || '';
          const qOk = !q || search.includes(q);
          li.style.display = qOk ? '' : 'none';
          if (qOk) {
            anyVisible = true;
            visibleItems++;
          }
        });

        // Auto-open groups with matches when searching
        if (q) {
          section.querySelectorAll('.drink-group').forEach((group) => {
            const has =
              group.querySelector('.menu-item:not(.is-hidden)') ||
              Array.from(group.querySelectorAll('.beer-cols li')).some((li) => li.style.display !== 'none');
            if (has) {
              group.classList.add('is-open');
              const btn = group.querySelector('.drink-group-toggle');
              if (btn) btn.setAttribute('aria-expanded', 'true');
            }
          });
        }

        const showSection = (catMatch || (q && anyVisible)) && (q ? anyVisible : catMatch);
        section.classList.toggle('is-hidden', !showSection);
        if (showSection) visibleSections++;
        return;
      }

      // Food items
      let itemVisible = 0;
      section.querySelectorAll('.menu-item').forEach((item) => {
        const search = item.dataset.search || '';
        const qOk = !q || search.includes(q);
        item.classList.toggle('is-hidden', !qOk);
        if (qOk) {
          itemVisible++;
          visibleItems++;
        }
      });

      const showSection = (catMatch || (q && itemVisible > 0)) && (q ? itemVisible > 0 : catMatch);
      section.classList.toggle('is-hidden', !showSection);
      if (showSection) visibleSections++;
    });

    // Empty state
    const empty = document.getElementById('menuEmpty');
    if (empty) {
      const showEmpty = visibleSections === 0 || (q && visibleItems === 0);
      empty.classList.toggle('is-visible', showEmpty);
    }

    if (els.meta) {
      if (q) {
        els.meta.textContent = visibleItems
          ? `${visibleItems} result${visibleItems === 1 ? '' : 's'} for “${query.trim()}”`
          : `No results for “${query.trim()}”`;
      } else if (activeCat !== 'all') {
        const label = CAT_NAV.find((c) => c.id === activeCat)?.label || activeCat;
        els.meta.textContent = `Showing ${label}`;
      } else {
        els.meta.textContent = 'Full menu · food & bar';
      }
    }

    // Bar conversion block visibility
    const barCta = document.getElementById('barConversion');
    if (barCta) {
      const showBar = activeCat === 'all' || activeCat === 'drinks' || Boolean(q);
      barCta.classList.toggle('is-hidden', !showBar);
    }
  }

  function syncCatButtons() {
    document.querySelectorAll('.menu-cat').forEach((btn) => {
      const on = btn.dataset.cat === activeCat;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
  }

  function syncHeatButtons() {
    document.querySelectorAll('#heatFilter .heat-chip').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.heat === heatFilter);
    });
  }

  function updateSearchClear() {
    if (els.searchClear) {
      const show = query.length > 0;
      els.searchClear.classList.toggle('is-visible', show);
      if (show) els.searchClear.removeAttribute('hidden');
      else els.searchClear.setAttribute('hidden', '');
    }
  }

  function bindJumpRail() {
    const rail = document.getElementById('menuJumpRail');
    if (!rail) return;
    rail.addEventListener('click', (e) => {
      const card = e.target.closest('[data-jump]');
      if (!card) return;
      e.preventDefault();
      const jump = card.dataset.jump;
      // Map jump targets to mega cats / sections
      if (jump === 'burgers' || jump === 'wings' || jump === 'drinks') {
        activeCat = jump;
      } else if (jump === 'food') {
        activeCat = 'food';
      } else {
        activeCat = 'all';
      }
      heatFilter = 'all';
      syncCatButtons();
      syncHeatButtons();
      applyFilters();
      const secId = card.getAttribute('href')?.replace('#', '') || `sec-${jump}`;
      const sec = document.getElementById(secId) || document.getElementById(`sec-${jump}`);
      if (sec) {
        const offset = 160;
        const top = sec.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
  }

  function applyDeepLink() {
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    const heat = params.get('heat');

    if (heat && ['mild', 'medium', 'hot', 'xtra'].includes(heat)) {
      activeCat = 'wings';
      heatFilter = heat;
      syncCatButtons();
      setHeatFilter(heat, { fromBottle: false });
      if (window.__sauceLabs) {
        window.__sauceLabs.forEach((lab) => {
          if (lab.setLevel) lab.setLevel(heat, true);
        });
      }
    }

    if (hash && hash.startsWith('#sec-')) {
      const secId = hash.slice(1);
      const cat = secId.replace('sec-', '');
      const mega = megaForSection(cat);
      if (mega === 'burgers' || mega === 'wings' || mega === 'drinks') {
        activeCat = mega;
      } else if (cat !== 'all') {
        activeCat = 'food';
      }
      syncCatButtons();
      applyFilters();
      requestAnimationFrame(() => {
        const sec = document.getElementById(secId);
        if (sec) {
          const offset = 160;
          const top = sec.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      });
    }
  }

  // ---------- Bindings ----------
  function bindCats() {
    if (!els.cats) return;
    els.cats.addEventListener('click', (e) => {
      const btn = e.target.closest('.menu-cat');
      if (!btn) return;
      activeCat = btn.dataset.cat;
      // reset heat when leaving wings unless all
      if (activeCat !== 'wings' && activeCat !== 'all') {
        heatFilter = 'all';
        syncHeatButtons();
      }
      syncCatButtons();
      applyFilters();

      // Scroll to section when specific cat
      if (activeCat !== 'all') {
        const sec = document.getElementById(`sec-${activeCat}`);
        if (sec) {
          const offset = 160;
          const top = sec.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      }
    });
  }

  function bindSearch() {
    if (!els.search) return;
    let t;
    els.search.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        query = els.search.value;
        updateSearchClear();
        // When searching, show all categories filtered
        if (query.trim()) {
          activeCat = 'all';
          heatFilter = 'all';
          syncCatButtons();
          syncHeatButtons();
        }
        applyFilters();
      }, 120);
    });

    if (els.searchClear) {
      els.searchClear.addEventListener('click', () => {
        els.search.value = '';
        query = '';
        updateSearchClear();
        applyFilters();
        els.search.focus();
      });
    }
  }

  function bindDrinkToggles() {
    document.querySelectorAll('.drink-group-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const group = btn.closest('.drink-group');
        if (!group) return;
        const open = group.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(open));
      });
    });
  }

  function setHeatFilter(level, opts) {
    opts = opts || {};
    heatFilter = level === 'all' ? 'all' : level;
    if (activeCat !== 'wings' && activeCat !== 'all' && level !== 'all') {
      activeCat = 'wings';
      syncCatButtons();
    }
    syncHeatButtons();
    applyFilters();

    // Keep sauce lab in sync when changed externally
    if (!opts.fromBottle && window.__sauceLabs) {
      window.__sauceLabs.forEach((lab) => {
        if (lab.root && lab.root.dataset.context === 'menu' && level !== 'all') {
          lab.setLevel(level, true);
        }
      });
    }
  }

  function bindHeatFilter() {
    const wrap = document.getElementById('heatFilter');
    if (!wrap) return;
    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.heat-chip');
      if (!btn) return;
      setHeatFilter(btn.dataset.heat);
    });
  }

  function bindMenuHeatBottle() {
    // Physics bottle lives in heat-bottle.js; bridge for menu filters
    window.__setMenuHeat = (level, opts) => {
      setHeatFilter(level, opts || {});
    };
  }

  // Scroll-spy: when All is selected, highlight mega-group for section in view
  function bindScrollSpy() {
    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (ticking || query.trim() || activeCat !== 'all') {
          return;
        }
        ticking = true;
        requestAnimationFrame(() => {
          const marker = window.scrollY + 220;
          let currentSec = null;
          document.querySelectorAll('.menu-section:not(.is-hidden)').forEach((sec) => {
            if (sec.offsetTop <= marker) currentSec = sec.dataset.cat;
          });
          if (currentSec) {
            const mega = megaForSection(currentSec);
            document.querySelectorAll('.menu-cat').forEach((btn) => {
              const on = btn.dataset.cat === mega || btn.dataset.cat === 'all';
              // Keep All as filter; pulse secondary highlight via data-spy
              btn.classList.toggle('is-spy', btn.dataset.cat === mega);
            });
          }
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(str) {
    return escapeHTML(str).replace(/'/g, '&#39;');
  }


  function bindWingSizes() {
    document.addEventListener('click', (e) => {
      const size = e.target.closest('.wings-size');
      if (!size) return;
      const wrap = size.closest('.wings-sizes');
      if (!wrap) return;
      wrap.querySelectorAll('.wings-size').forEach((s) => s.classList.remove('is-active'));
      size.classList.add('is-active');
    });
  }

  // ---------- Init ----------
  renderCats();
  renderMenu();
  bindCats();
  bindSearch();
  bindJumpRail();
  bindWingSizes();
  bindScrollSpy();
  applyFilters();
  updateSearchClear();
  applyDeepLink();
  if (typeof window.__bottomzApplyContact === 'function') {
    window.__bottomzApplyContact();
  }
})();
