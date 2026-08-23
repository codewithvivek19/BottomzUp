/**
 * Bottomz Up — Menu Ticker Navigation
 * Builds a tab rail from menu sections.
 * Clicking a tab shows that section's panel instantly (no scroll).
 * Drinks panel gets the dark charcoal treatment.
 */
(function () {
  'use strict';

  // Wait for menu.js to finish rendering the menu data
  function initTicker() {
    const data = window.BOTTOMZ_MENU;
    if (!data || !data.sections) return;

    const gridView = document.getElementById('categoryGridView');
    const detailView = document.getElementById('menuDetailView');
    const panelHost = document.getElementById('menuPanelHost');
    const stickyNav = document.getElementById('stickyCategoryNav');
    const btnBack = document.getElementById('btnBackToGrid');

    if (!gridView || !detailView || !panelHost || !stickyNav || !btnBack) return;

    // Clear loading placeholder
    panelHost.innerHTML = '';
    gridView.innerHTML = '';
    stickyNav.innerHTML = '';

    // Map section IDs to human-readable tab labels
    const SECTION_LABELS = {
      starters: 'Starters',
      salads: 'Salads',
      burgers: 'Burgers',
      kitchen: 'Kitchen',
      wings: 'Wings',
      kids: 'Kids',
      desserts: 'Desserts',
      sides: 'Sides',
      drinks: 'The Bar',
    };

    // Build Category Grid Cards & Detail Panels
    const panels = [];
    const barCta = buildBarCta();

    data.sections.forEach(function (section) {
      const isBar = section.theme === 'bar';
      
      // 1. Build Detail Panel
      const panelEl = document.createElement('div');
      panelEl.className = 'menu-panel' + (isBar ? ' menu-panel--bar' : '');
      panelEl.id = 'panel-' + section.id;
      panelEl.setAttribute('role', 'tabpanel');

      const inner = document.createElement('div');
      inner.className = isBar ? 'container' : 'container menu-main';
      inner.innerHTML = buildSectionHTML(section);
      panelEl.appendChild(inner);

      if (isBar) {
        panelEl.appendChild(barCta.cloneNode(true));
      }
      panelHost.appendChild(panelEl);
      panels.push({ id: section.id, el: panelEl, isBar });

      // 2. Build Category Card for Grid View
      // Find category image
      let catImg = '';
      if (data.categories) {
        const cat = data.categories.find(c => c.id === section.id);
        if (cat && cat.image) catImg = cat.image;
      }

      const card = document.createElement('div');
      card.className = 'category-card';
      card.dataset.target = section.id;
      card.innerHTML = `
        <img src="${catImg}" alt="${section.title}" loading="lazy">
        <div class="category-card-overlay">
          <h3>${SECTION_LABELS[section.id] || section.title}</h3>
        </div>
      `;
      gridView.appendChild(card);

      // 3. Build Sticky Pill Nav for Detail View
      const pill = document.createElement('button');
      pill.className = 'nav-pill';
      pill.dataset.target = section.id;
      pill.textContent = SECTION_LABELS[section.id] || section.title;
      stickyNav.appendChild(pill);
    });

    // Add disclaimer at end of panel host
    const disc = document.createElement('p');
    disc.className = 'menu-disclaimer container';
    disc.textContent = 'Disclosure / Consumer Advisory: Consumption of undercooked meat, poultry, eggs, or seafood may increase the risk of foodborne illness. Inform your server of any dietary restrictions. * These items may be served undercooked.';
    panelHost.appendChild(disc);

    // --- Interaction Logic ---

    function openDetailView(sectionId) {
      // Hide grid, show detail
      gridView.hidden = true;
      detailView.hidden = false;
      
      // Update panels
      panels.forEach(p => {
        p.el.classList.toggle('is-active', p.id === sectionId);
      });
      
      // Update pills
      stickyNav.querySelectorAll('.nav-pill').forEach(pill => {
        const isActive = pill.dataset.target === sectionId;
        pill.classList.toggle('is-active', isActive);
        if (isActive) {
          pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
      
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Init wings UI if needed
      if (sectionId === 'wings' && typeof window.__initSauceLabs === 'function') {
        setTimeout(window.__initSauceLabs, 80);
      }
    }

    function showGridView() {
      detailView.hidden = true;
      gridView.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Event Listeners
    gridView.addEventListener('click', function (e) {
      const card = e.target.closest('.category-card');
      if (card) {
        openDetailView(card.dataset.target);
      }
    });

    stickyNav.addEventListener('click', function (e) {
      const pill = e.target.closest('.nav-pill');
      if (pill) {
        openDetailView(pill.dataset.target);
      }
    });

    btnBack.addEventListener('click', showGridView);

    // Search input (if still desired, though we removed from HTML)
    const searchInput = document.getElementById('menuSearch');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        const q = searchInput.value.trim().toLowerCase();
        if (q) {
          panels.forEach(function (p) { p.el.classList.add('is-active'); });
        } else {
          showGridView();
        }
      });
    }

    // Deep-link support: if URL has #sec-foo, open that tab directly
    const hash = window.location.hash;
    if (hash && hash.startsWith('#sec-')) {
      const secId = hash.replace('#sec-', '');
      const pill = stickyNav.querySelector('[data-target="' + secId + '"]');
      if (pill) {
        openDetailView(secId);
      }
    }
  }

  function getItemCount(section) {
    if (section.items) return section.items.length;
    if (section.flavors) return section.flavors.length;
    if (section.drinkGroups) {
      return section.drinkGroups.reduce(function (n, g) {
        if (g.beerLists) return n + g.beerLists.domestic.length + g.beerLists.import.length;
        return n + (g.items || []).length;
      }, 0);
    }
    return 0;
  }

  function buildBarCta() {
    const div = document.createElement('div');
    div.className = 'container';
    div.innerHTML = '<div class="bar-conversion reveal" id="barConversion">' +
      '<div class="bar-conversion-inner">' +
      '<div>' +
      '<p class="eyebrow">The bar is open</p>' +
      '<h3 class="display heading-md">Ready for a round?</h3>' +
      '<p class="body-md bar-conversion-copy">Walk-ins welcome. Large crew? Give us a heads up.</p>' +
      '</div>' +
      '<div class="bar-conversion-actions">' +
      '<button type="button" class="btn-ticket js-open-reserve">' +
      '<span class="btn-hover-fill" aria-hidden="true"></span>' +
      '<span class="btn-label" data-contact="call-label">Call for delivery</span>' +
      '<span class="btn-arrow" aria-hidden="true">↗</span>' +
      '</button>' +
      '</div>' +
      '</div></div>';
    return div;
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

  function buildSectionHTML(section) {
    const isBar = section.theme === 'bar';
    let body = '';

    if (section.isWings) {
      body = buildWings(section);
    } else if (section.isBar) {
      body = buildDrinks(section);
    } else {
      const gridClass = section.items.length > 4 ? 'menu-list--grid' : '';
      body = '<div class="menu-list ' + gridClass + '">' +
        section.items.map(function (item) { return buildItem(item, false); }).join('') +
        '</div>';
    }

    const eyebrow = isBar ? 'Full Bar' : 'Food';

    return '<section class="menu-section' + (isBar ? ' menu-section--bar' : '') + '" data-cat="' + escapeAttr(section.id) + '" data-theme="' + escapeAttr(section.theme || 'food') + '">' +
      '<div class="menu-section-head">' +
      '<p class="eyebrow">' + eyebrow + '</p>' +
      '<div class="menu-section-title">' +
      '<h2>' + escapeHTML(section.title) + '</h2>' +
      (section.subtitle ? '<span class="menu-section-sub">' + escapeHTML(section.subtitle) + '</span>' : '') +
      '</div>' +
      (section.intro ? '<p class="menu-section-intro body-md">' + escapeHTML(section.intro) + '</p>' : '') +
      '</div>' +
      body +
      '</section>';
  }

  function buildItem(item, isBar) {
    const price = item.price != null
      ? '<span class="menu-item-price">$' + item.price + '</span>'
      : (isBar ? '<span class="menu-item-price menu-item-price--ask">Ask</span>' : '');

    const badges = [];
    if (item.tags) {
      if (item.tags.includes('vegetarian')) badges.push('<span class="menu-badge menu-badge--v">V</span>');
      if (item.tags.includes('spicy')) badges.push('<span class="menu-badge menu-badge--spicy">Spicy</span>');
      if (item.tags.includes('signature')) badges.push('<span class="menu-badge menu-badge--sig">Signature</span>');
      if (item.tags.includes('undercooked')) badges.push('<span class="menu-badge menu-badge--star" title="May be served undercooked">*</span>');
    }
    if (item.featured && !(item.tags && item.tags.includes('signature'))) {
      badges.push('<span class="menu-badge menu-badge--sig">Featured</span>');
    }

    return '<article class="menu-item" data-search="' + escapeAttr([item.name, item.desc, ...(item.options || []), ...(item.tags || [])].filter(Boolean).join(' ').toLowerCase()) + '">' +
      '<div>' +
      '<div class="menu-item-top">' +
      '<span class="menu-item-name">' + escapeHTML(item.name) + '</span>' +
      badges.join('') +
      '</div>' +
      (item.desc ? '<p class="menu-item-desc">' + escapeHTML(item.desc) + '</p>' : '') +
      (item.add ? '<p class="menu-item-add">Add: ' + escapeHTML(item.add) + '</p>' : '') +
      '</div>' +
      price +
      '</article>';
  }

  function buildWings(section) {
    const sizes = section.sizes.map(function (s) {
      return '<div class="wings-size">' +
        '<span class="wings-size-label">' + escapeHTML(s.label) + '</span>' +
        '<span class="wings-size-count">' + escapeHTML(s.count) + '</span>' +
        '<span class="wings-size-price">$' + s.price + '</span>' +
        '</div>';
    }).join('');

    const flavors = section.flavors.map(function (f) {
      return '<div class="flavor-card" data-heat="' + escapeAttr(f.heat) + '">' +
        '<span class="flavor-name">' + escapeHTML(f.name) + '</span>' +
        '<span class="flavor-heat flavor-heat--' + escapeAttr(f.heat) + '">' + escapeHTML(f.heat === 'xtra' ? 'Xtra Hot' : f.heat) + '</span>' +
        '</div>';
    }).join('');

    return '<div class="wings-sizes" id="wing-sizes">' + sizes + '</div>' +
      '<div class="sauce-lab" data-sauce-lab data-context="menu" data-heat="mild" id="menuSauceLab"></div>' +
      '<div class="flavor-grid is-sr-mirror" id="flavorGrid" hidden aria-hidden="true">' + flavors + '</div>';
  }

  function buildDrinks(section) {
    const groups = section.drinkGroups.map(function (g) {
      const count = g.beerLists
        ? g.beerLists.domestic.length + g.beerLists.import.length
        : (g.items || []).length;

      let body;
      if (g.beerLists) {
        const dom = g.beerLists.domestic.map(function (b) { return '<li>' + escapeHTML(b) + '</li>'; }).join('');
        const imp = g.beerLists.import.map(function (b) { return '<li>' + escapeHTML(b) + '</li>'; }).join('');
        body = '<div class="beer-cols"><div><h4>Domestic</h4><ul>' + dom + '</ul></div>' +
               '<div><h4>Import</h4><ul>' + imp + '</ul></div></div>';
      } else {
        body = '<div class="menu-list">' + (g.items || []).map(function (item) { return buildItem(item, true); }).join('') + '</div>';
      }

      const panelId = 'drink-panel-' + escapeAttr(g.id);
      return '<div class="drink-group ' + (g.open ? 'is-open' : '') + '" data-group="' + escapeAttr(g.id) + '">' +
        '<button type="button" class="drink-group-toggle" aria-expanded="' + (g.open ? 'true' : 'false') + '" aria-controls="' + panelId + '" id="drink-btn-' + escapeAttr(g.id) + '">' +
        '<div><h3>' + escapeHTML(g.title) + '</h3>' +
        (g.subtitle ? '<p class="drink-group-sub">' + escapeHTML(g.subtitle) + '</p>' : '') +
        '</div>' +
        '<div class="drink-group-meta"><span class="drink-group-count">' + count + ' items</span><span class="drink-group-chevron" aria-hidden="true"></span></div>' +
        '</button>' +
        '<div class="drink-group-body" id="' + panelId + '" role="region" aria-labelledby="drink-btn-' + escapeAttr(g.id) + '">' + body + '</div>' +
        '</div>';
    }).join('');

    return '<div class="drink-groups">' + groups + '</div>';
  }

  // Run after DOM + menu data are ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      // Small delay to let menu-data.js set window.BOTTOMZ_MENU
      setTimeout(initTicker, 0);
    });
  } else {
    setTimeout(initTicker, 0);
  }

  // Bind drink group toggles (delegated, works with dynamic content)
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.drink-group-toggle');
    if (!btn) return;
    const group = btn.closest('.drink-group');
    if (!group) return;
    const open = group.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
  });

})();
