/**
 * Bottomz Up — interactive lead forms (Contact + Catering)
 * Client-side validation, selection UX, mailto + localStorage capture
 */
(function () {
  'use strict';

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

      const C = window.BOTTOMZ_CONTACT || {};
      const to = 'hello@bottomzupbargrill.com';
      const subject = 'Bottomz Up contact — ' + (payload.topic || 'General');
      const body = [
        'New website lead (Contact Us)',
        '----------------------------',
        'Name: ' + payload.name,
        'Email: ' + payload.email,
        'Phone: ' + payload.phone,
        'Topic: ' + payload.topic,
        'Preferred contact: ' + payload.preferred,
        '',
        'Message:',
        payload.message,
        '',
        'Site: ' + (C.website || 'bottomzupbargrill.com'),
      ].join('\n');

      form.classList.add('is-success');
      if (success) success.classList.add('is-visible');

      // Soft open mail client for real delivery without a backend
      window.setTimeout(() => openMailto(to, subject, body), 400);
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
  function selectedLabels(form, name) {
    return $all('input[name="' + name + '"]:checked', form).map((el) => {
      const card = el.closest('.cat-item, .bundle-card, .lead-chip');
      if (card) {
        const n = card.querySelector('.cat-item-name, h3, .lead-chip-text');
        if (n) return n.textContent.trim();
      }
      return el.value;
    });
  }

  function updateCateringSummary(form) {
    const box = $('#cateringSummary');
    if (!box) return;
    const items = selectedLabels(form, 'items');
    const bundles = selectedLabels(form, 'bundle');
    const guests = String(form.guests?.value || '').trim();
    const parts = [];
    if (bundles.length) parts.push('<strong>Bundle:</strong> ' + bundles.join(', '));
    if (items.length) parts.push('<strong>À la carte:</strong> ' + items.length + ' item' + (items.length === 1 ? '' : 's'));
    if (guests) parts.push('<strong>Guests:</strong> ' + guests);
    box.innerHTML = parts.length ? parts.join(' · ') : '';
  }

  function wireSelectableCards(form) {
    $all('.cat-item, .bundle-card', form).forEach((card) => {
      const input = card.querySelector('input');
      if (!input) return;

      const sync = () => {
        if (input.type === 'radio' && input.name) {
          $all('input[name="' + input.name + '"]', form).forEach((inp) => {
            const c = inp.closest('.cat-item, .bundle-card');
            if (c) c.classList.toggle('is-selected', inp.checked);
          });
        } else {
          card.classList.toggle('is-selected', input.checked);
        }
        updateCateringSummary(form);
      };

      card.addEventListener('click', (e) => {
        if (e.target === input) return;
        e.preventDefault();
        if (input.type === 'checkbox') {
          input.checked = !input.checked;
        } else {
          input.checked = true;
        }
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });

      input.addEventListener('change', sync);
      sync();
    });

    form.addEventListener('input', () => updateCateringSummary(form));
  }

  function initCateringForm() {
    const form = $('#cateringLeadForm');
    if (!form) return;

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
      const bundles = selectedLabels(form, 'bundle');
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

      const to = 'hello@bottomzupbargrill.com';
      const subject = 'Catering request — ' + (payload.eventType || 'Bottomz Up');
      const body = [
        'New catering request',
        '--------------------',
        'Name: ' + payload.name,
        'Email: ' + payload.email,
        'Phone: ' + payload.phone,
        'Event date: ' + payload.eventDate,
        'Guests: ' + payload.guests,
        'Event type: ' + payload.eventType,
        '',
        'Bundles:',
        bundles.length ? bundles.map((b) => '• ' + b).join('\n') : '• (none)',
        '',
        'À la carte items:',
        items.length ? items.map((i) => '• ' + i).join('\n') : '• (none)',
        '',
        'Notes:',
        payload.notes || '(none)',
      ].join('\n');

      form.hidden = true;
      const wrap = $('#cateringSuccessWrap');
      if (wrap) wrap.hidden = false;
      if (success) success.classList.add('is-visible');
      window.setTimeout(() => openMailto(to, subject, body), 400);
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
