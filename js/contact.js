/**
 * Bottomz Up — Contact / conversion endpoints
 * Set phone to E.164 digits when ready, e.g. "14345550100"
 * Empty phone = honest UI (no tel:+1 dead ends)
 */
window.BOTTOMZ_CONTACT = {
  phone: '', // e.g. '14345551234' — leave empty until real
  phoneDisplay: '', // e.g. '(434) 555-1234'
  mapsUrl: 'https://maps.google.com/?q=2001+Seymour+Dr,+South+Boston,+VA+24592',
  mapsLabel: 'Get Directions',
  addressLine1: '2001 Seymour Dr',
  addressLine2: 'South Boston, VA 24592',
  hoursNote: 'Call for current hours — we’re open when South Boston is hungry.',
  walkIns: true,
};

window.BOTTOMZ_CONTACT.hasPhone = function () {
  return Boolean(this.phone && String(this.phone).replace(/\D/g, '').length >= 10);
};

window.BOTTOMZ_CONTACT.telHref = function () {
  if (!this.hasPhone()) return null;
  const digits = String(this.phone).replace(/\D/g, '');
  return 'tel:+' + digits;
};

window.BOTTOMZ_CONTACT.smsHref = function (body) {
  if (!this.hasPhone()) return null;
  const digits = String(this.phone).replace(/\D/g, '');
  const q = body ? '?&body=' + encodeURIComponent(body) : '';
  return 'sms:+' + digits + q;
};
