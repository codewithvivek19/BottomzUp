/**
 * Wire honest call / SMS / directions across the site
 */
(function () {
  'use strict';

  const C = window.BOTTOMZ_CONTACT;
  if (!C) return;

  function applyContactUI() {
    const hasPhone = C.hasPhone();
    document.body.classList.toggle('has-phone', hasPhone);
    document.body.classList.toggle('no-phone', !hasPhone);

    // tel: links and call buttons
    document.querySelectorAll('[data-contact="call"]').forEach((el) => {
      const href = C.telHref();
      if (el.tagName === 'A') {
        if (href) {
          el.href = href;
          el.removeAttribute('aria-disabled');
          el.classList.remove('is-disabled');
        } else {
          el.href = '#reserve';
          el.setAttribute('aria-disabled', 'true');
          el.classList.add('is-disabled');
          el.addEventListener('click', (e) => {
            e.preventDefault();
            const open = document.querySelector('.js-open-reserve');
            if (open) open.click();
          });
        }
      }
    });

    // SMS
    document.querySelectorAll('[data-contact="sms"]').forEach((el) => {
      if (!hasPhone) {
        el.hidden = true;
        el.setAttribute('aria-hidden', 'true');
        return;
      }
      el.hidden = false;
      el.removeAttribute('aria-hidden');
      if (el.tagName === 'A') {
        const body = el.dataset.smsBody || "Hi Bottomz Up — I'd like to reserve a table.";
        el.href = C.smsHref(body);
      }
    });

    // Maps
    document.querySelectorAll('[data-contact="maps"]').forEach((el) => {
      if (el.tagName === 'A') {
        el.href = C.mapsUrl;
        el.target = '_blank';
        el.rel = 'noopener';
      }
    });

    // Phone display text
    document.querySelectorAll('[data-contact="phone-label"]').forEach((el) => {
      el.textContent = hasPhone
        ? C.phoneDisplay || C.phone
        : 'Walk-ins welcome · phone soon';
    });

    // Website links
    document.querySelectorAll('[data-contact="website"]').forEach((el) => {
      if (!C.website) return;
      if (el.tagName === 'A') {
        el.href = C.website;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
      }
      if (el.dataset.contactLabel !== 'keep') {
        el.textContent = C.websiteDisplay || C.website;
      }
    });

    // Delivery line
    document.querySelectorAll('[data-contact="delivery"]').forEach((el) => {
      if (C.delivery) el.textContent = C.delivery;
    });

    // Keep every delivery surface on the direct restaurant storefronts.
    const partners = C.deliveryPartners || {};
    document.querySelectorAll('.reserve-partner-btn, .footer-partner').forEach((el) => {
      const isDoorDash = el.classList.contains('footer-partner--doordash') || /doordash/i.test(el.textContent);
      const partner = isDoorDash ? partners.doorDash : partners.uberEats;
      if (!partner) return;
      el.href = partner.url;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
      el.setAttribute('aria-label', 'Order on ' + partner.label);
      const logo = el.querySelector('.footer-partner-logo');
      const name = el.querySelector('.footer-partner-name');
      if (logo) logo.textContent = partner.shortLabel;
      if (name) name.textContent = partner.label;
      if (!name && el.classList.contains('reserve-partner-btn')) el.textContent = partner.label;
    });

    // Order online CTAs
    document.querySelectorAll('[data-contact="order"]').forEach((el) => {
      if (!C.orderOnline || el.tagName !== 'A') return;
      el.href = C.orderOnline;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
      const label = el.querySelector('.btn-label');
      if (label && C.orderOnlineLabel) label.textContent = C.orderOnlineLabel;
    });

    // Hours (plain text or multi-line via data-hours-format)
    document.querySelectorAll('[data-contact="hours"]').forEach((el) => {
      if (el.dataset.hoursFormat === 'lines' && C.hoursLines && C.hoursLines.length) {
        el.innerHTML = C.hoursLines.map((line) => escapeHtml(line)).join('<br />');
      } else if (C.hoursNote) {
        el.textContent = C.hoursNote;
      }
    });

    // Call CTA labels when no phone
    document.querySelectorAll('[data-contact="call-label"]').forEach((el) => {
      el.textContent = 'Call for Order';
    });

    // Reserve panel honesty block
    const honesty = document.getElementById('reserveHonesty');
    if (honesty) {
      honesty.hidden = hasPhone;
    }
    const callBtn = document.getElementById('reserveCallBtn');
    if (callBtn) {
      if (hasPhone) {
        callBtn.href = C.telHref();
        callBtn.classList.remove('is-disabled');
        const label = callBtn.querySelector('.btn-label, [data-contact="call-label"]');
        if (label) label.textContent = 'Call for Order';
      } else {
        callBtn.removeAttribute('href');
        callBtn.classList.add('is-disabled');
        callBtn.setAttribute('role', 'button');
        callBtn.setAttribute('aria-disabled', 'true');
        const label = callBtn.querySelector('.btn-label');
        if (label) label.textContent = 'Phone number coming soon';
      }
    }

    const mapsBtn = document.getElementById('reserveMapsBtn');
    if (mapsBtn) {
      mapsBtn.href = C.mapsUrl;
      mapsBtn.hidden = false;
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Enhance SMS body on party change — hook after main.js
  window.__bottomzApplyContact = applyContactUI;
  window.__bottomzSmsBody = function (partyLabel) {
    return `Hi Bottomz Up — I'd like to reserve a table for ${partyLabel}.`;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyContactUI);
  } else {
    applyContactUI();
  }
})();
