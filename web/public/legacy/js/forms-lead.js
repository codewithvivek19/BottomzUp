/**
 * Bottomz Up — interactive lead forms (Contact + Catering)
 * Client-side validation, selection UX, mailto + localStorage capture
 */
(function () {
  'use strict';

  // Booking dates: disallow today and past (tomorrow onward)
  function setMinTomorrow(input) {
    if (!input) return;
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const pad = (n) => String(n).padStart(2, '0');
    const min = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    input.min = min;
    if (input.value && input.value < min) input.value = '';
  }
  document.querySelectorAll('input[type="date"][data-min-tomorrow], #catDate').forEach(setMinTomorrow);


  const STORAGE_KEY = 'bottomz_leads_v1';

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function saveLead(payload) {
    try {
      const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      prev.push(payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prev.slice(-100)));
    } catch (_) {
      /* private mode */
    }
  }


  function postLead(payload) {
    return fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) {
          var msg = (data && data.error) || 'Could not submit';
          if (typeof msg !== 'string') msg = 'Could not submit';
          throw new Error(msg);
        }
        return data;
      });
    });
  }

  function openMailto(to, subject, body) {
    const href =
      'mailto:' +
      encodeURIComponent(to) +
      '?subject=' +
      encodeURIComponent(subject) +
      '&body=' +
      encodeURIComponent(body);
    window.location.href = href;
  }

  function setInvalid(field, on) {
    if (!field) return;
    field.classList.toggle('is-invalid', Boolean(on));
  }

  function validateRequired(form) {
    let ok = true;
    let first = null;
    $all('[data-required]', form).forEach((input) => {
      const wrap = input.closest('.lead-field');
      const empty = !String(input.value || '').trim();
      setInvalid(wrap, empty);
      if (empty) {
        ok = false;
        if (!first) first = input;
      }
    });
    $all('input[type="email"][data-required]', form).forEach((input) => {
      const wrap = input.closest('.lead-field');
      const v = String(input.value || '').trim();
      const bad = v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (bad) {
        setInvalid(wrap, true);
        ok = false;
        if (!first) first = input;
      }
    });
    if (first) first.focus();
    return ok;
  }

  function wireLiveClear(form) {
    form.addEventListener('input', (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const wrap = t.closest('.lead-field');
      if (wrap && wrap.classList.contains('is-invalid')) {
        if (String(t.value || '').trim()) setInvalid(wrap, false);
      }
    });
  }

  function wireChips(root) {
    $all('.lead-chip', root).forEach((chip) => {
      const input = chip.querySelector('input');
      if (!input) return;
      const sync = () => chip.classList.toggle('is-on', input.checked);
      sync();
      input.addEventListener('change', () => {
        if (input.type === 'radio') {
          $all('.lead-chip', root).forEach((c) => {
            const i = c.querySelector('input');
            if (i && i.name === input.name) c.classList.toggle('is-on', i.checked);
          });
        } else {
          sync();
        }
      });
    });
  }

  /* ---------- Contact form ---------- */
  function initContactForm() {
    const form = $('#contactLeadForm');
    if (!form) return;

    wireLiveClear(form);
    wireChips(form);

    const success = $('#contactLeadSuccess');
    const resetBtn = $('#contactLeadReset');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateRequired(form)) return;

      const data = new FormData(form);
      const payload = {
        type: 'contact',
        at: new Date().toISOString(),
        name: String(data.get('name') || '').trim(),
        email: String(data.get('email') || '').trim(),
        phone: String(data.get('phone') || '').trim(),
        topic: String(data.get('topic') || '').trim(),
        preferred: String(data.get('preferred') || '').trim(),
        message: String(data.get('message') || '').trim(),
      };

            saveLead(payload);

      postLead(payload)
        .then(function () {
          form.classList.add('is-success');
          if (success) success.classList.add('is-visible');
        })
        .catch(function () {
          // Fallback: still show success + optional mailto if API unreachable
          form.classList.add('is-success');
          if (success) success.classList.add('is-visible');
          var to = 'hello@bottomzupbargrill.com';
          var subject = 'Bottomz Up contact - ' + (payload.topic || 'General');
          var body = [
            'New website lead (Contact Us)',
            'Name: ' + payload.name,
            'Email: ' + payload.email,
            'Phone: ' + payload.phone,
            'Topic: ' + payload.topic,
            'Message: ' + payload.message,
          ].join('\n');
          window.setTimeout(function () { openMailto(to, subject, body); }, 400);
        });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        form.classList.remove('is-success');
        if (success) success.classList.remove('is-visible');
        $all('.lead-field.is-invalid', form).forEach((el) => el.classList.remove('is-invalid'));
        wireChips(form);
      });
    }
  }

  /* ---------- Catering form ---------- */
  function selectedEntries(form, name) {
    return $all('input[name="' + name + '"]:checked', form).map((el) => {
      const card = el.closest('.cat-item, .bundle-card, .p-card, .lead-chip');
      let label = el.value;
      if (card) {
        const n = card.querySelector('.cat-item-name, .p-card-name, h3, .lead-chip-text');
        const badge = card.querySelector('.p-card-badge');
        if (n) {
          label = n.textContent.trim();
          if (badge && badge.textContent.trim()) {
            label = label + ' (' + badge.textContent.trim() + ')';
          }
        }
      }
      return { value: el.value, label: label, input: el };
    });
  }

  function selectedLabels(form, name) {
    return selectedEntries(form, name).map((e) => e.label);
  }

  function ensureOrderList(form) {
    let list = $('#catOrderList');
    if (list) return list;
    const summary = $('#cateringSummary');
    if (!summary || !summary.parentNode) return null;
    list = document.createElement('div');
    list.id = 'catOrderList';
    list.className = 'cat-order-list';
    list.hidden = true;
    list.innerHTML =
      '<div class="cat-order-list-head">' +
      '<strong>Your order</strong>' +
      '<button type="button" class="cat-order-clear" id="catOrderClearAll">Clear all</button>' +
      '</div>' +
      '<div class="cat-order-chips" id="catOrderChips"></div>' +
      '<p class="cat-order-empty" id="catOrderEmpty">Tap packages or menu items to add them here.</p>';
    summary.parentNode.insertBefore(list, summary);
    return list;
  }

  function updateCateringSummary(form) {
    const items = selectedEntries(form, 'items');
    const bundles = selectedEntries(form, 'bundles').concat(selectedEntries(form, 'bundle'));
    const guests = String(form.guests?.value || '').trim();

    const list = ensureOrderList(form);
    const chips = $('#catOrderChips');
    const empty = $('#catOrderEmpty');
    const all = bundles.concat(items);

    if (list) {
      list.hidden = false;
      if (chips) {
        chips.innerHTML = all
          .map((e) => {
            const safeVal = String(e.value).replace(/"/g, '&quot;');
            return (
              '<span class="cat-order-chip" data-value="' +
              safeVal +
              '"><span>' +
              e.label.replace(/</g, '&lt;') +
              '</span><button type="button" aria-label="Remove ' +
              e.label.replace(/"/g, '') +
              '">×</button></span>'
            );
          })
          .join('');
      }
      if (empty) empty.hidden = all.length > 0;
    }

    const box = $('#cateringSummary');
    if (box) {
      const parts = [];
      if (bundles.length) parts.push('<strong>' + bundles.length + ' package' + (bundles.length === 1 ? '' : 's') + '</strong>');
      if (items.length) parts.push('<strong>' + items.length + ' item' + (items.length === 1 ? '' : 's') + '</strong>');
      if (guests) parts.push('Guests: ' + guests);
      box.innerHTML = parts.length ? parts.join(' · ') : '';
    }

    const total = all.length;
    const sticky = $('#catSticky');
    const countEl = $('#catStickyCount');
    const sumEl = $('#catStickySum');
    if (sticky) sticky.hidden = total === 0;
    if (countEl) countEl.textContent = String(total);
    if (sumEl) {
      if (!total) sumEl.textContent = 'Nothing selected yet';
      else {
        const preview = all
          .slice(0, 3)
          .map((e) => e.label)
          .join(', ');
        sumEl.textContent =
          preview + (all.length > 3 ? ' +' + (all.length - 3) + ' more' : '');
      }
    }
  }

  function uncheckByValue(form, value) {
    $all('input[type="checkbox"], input[type="radio"]', form).forEach((inp) => {
      if (inp.value === value && inp.checked) {
        inp.checked = false;
        const c = inp.closest('.cat-item, .bundle-card, .p-card');
        if (c) c.classList.remove('is-selected');
        inp.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }

  function wireSelectableCards(form) {
    $all('.cat-item, .bundle-card, .p-card', form).forEach((card) => {
      const input = card.querySelector('input');
      if (!input) return;

      const sync = () => {
        card.classList.toggle('is-selected', input.checked);
        updateCateringSummary(form);
      };

      card.addEventListener('click', (e) => {
        if (e.target === input) return;
        if (e.target.closest && e.target.closest('button')) return;
        e.preventDefault();
        input.checked = !input.checked;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });

      input.addEventListener('change', sync);
      sync();
    });

    form.addEventListener('input', () => updateCateringSummary(form));

    form.addEventListener('click', (e) => {
      const btn = e.target.closest('.cat-order-chip button');
      if (btn) {
        const chip = btn.closest('.cat-order-chip');
        if (chip && chip.dataset.value) {
          uncheckByValue(form, chip.dataset.value);
          updateCateringSummary(form);
        }
      }
    });

    const clearBtn = $('#clearBundle');
    const clearSelections = (names) => {
      const sel = names.map((n) => `input[name="${n}"]`).join(', ');
      $all(sel, form).forEach((inp) => {
        inp.checked = false;
        const c = inp.closest('.bundle-card, .p-card, .cat-item');
        if (c) c.classList.remove('is-selected');
      });
      updateCateringSummary(form);
    };
    if (clearBtn) {
      clearBtn.addEventListener('click', () =>
        clearSelections(['bundles', 'bundle', 'items'])
      );
    }

    document.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'catOrderClearAll') {
        clearSelections(['bundles', 'bundle', 'items']);
      }
    });
  }

  function initCateringForm() {
    const form = $('#cateringLeadForm');
    if (!form) return;

    // Ensure menu product cards are mounted before wiring selection
    if (window.BOTTOMZ_CATERING && typeof window.BOTTOMZ_CATERING.mount === 'function') {
      window.BOTTOMZ_CATERING.mount();
    }

    wireLiveClear(form);
    wireChips(form);
    wireSelectableCards(form);
    updateCateringSummary(form);

    const success = $('#cateringLeadSuccess');
    const resetBtn = $('#cateringLeadReset');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateRequired(form)) return;

      const items = selectedLabels(form, 'items');
      const bundles = selectedLabels(form, 'bundles').concat(selectedLabels(form, 'bundle'));
      if (!items.length && !bundles.length) {
        const hint = $('#cateringSelectHint');
        if (hint) {
          hint.hidden = false;
          hint.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      const hint = $('#cateringSelectHint');
      if (hint) hint.hidden = true;

      const data = new FormData(form);
      const payload = {
        type: 'catering',
        at: new Date().toISOString(),
        name: String(data.get('name') || '').trim(),
        email: String(data.get('email') || '').trim(),
        phone: String(data.get('phone') || '').trim(),
        eventDate: String(data.get('eventDate') || '').trim(),
        guests: String(data.get('guests') || '').trim(),
        eventType: String(data.get('eventType') || '').trim(),
        notes: String(data.get('notes') || '').trim(),
        items,
        bundles,
      };

            saveLead(payload);

      postLead(payload)
        .then(function () {
          form.hidden = true;
          var wrap = $('#cateringSuccessWrap');
          if (wrap) wrap.hidden = false;
          if (success) success.classList.add('is-visible');
        })
        .catch(function () {
          form.hidden = true;
          var wrap = $('#cateringSuccessWrap');
          if (wrap) wrap.hidden = false;
          if (success) success.classList.add('is-visible');
          var to = 'hello@bottomzupbargrill.com';
          var subject = 'Catering request - ' + (payload.eventType || 'Bottomz Up');
          var body = [
            'New catering request',
            'Name: ' + payload.name,
            'Phone: ' + payload.phone,
            'Guests: ' + payload.guests,
            'Bundles: ' + (bundles.join(', ') || 'none'),
            'Items: ' + (items.join(', ') || 'none'),
          ].join('\n');
          window.setTimeout(function () { openMailto(to, subject, body); }, 400);
        });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        form.hidden = false;
        const wrap = $('#cateringSuccessWrap');
        if (wrap) wrap.hidden = true;
        if (success) success.classList.remove('is-visible');
        $all('.is-selected', form).forEach((el) => el.classList.remove('is-selected'));
        $all('.lead-field.is-invalid', form).forEach((el) => el.classList.remove('is-invalid'));
        const hint = $('#cateringSelectHint');
        if (hint) hint.hidden = true;
        wireChips(form);
        updateCateringSummary(form);
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  function boot() {
    initContactForm();
    initCateringForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
