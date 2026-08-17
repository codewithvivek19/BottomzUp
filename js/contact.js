/**
 * Bottomz Up — Contact / conversion endpoints
 * Official brochure details (trifold)
 */
window.BOTTOMZ_CONTACT = {
  phone: '14345755753',
  phoneDisplay: '(434) 575-5753',
  website: 'https://www.bottomzupbargrill.com',
  websiteDisplay: 'www.bottomzupbargrill.com',
  mapsUrl: 'https://maps.google.com/?q=2001+Seymour+Dr,+South+Boston,+VA+24592',
  mapsLabel: 'Get Directions',
  addressLine1: '2001 Seymour Dr',
  addressLine2: 'South Boston, VA 24592',
  delivery: 'Delivery available via Grubhub & DoorDash',
  /** Primary order-online URL (DoorDash / Grubhub store link when available) */
  orderOnline: 'https://www.doordash.com',
  orderOnlineLabel: 'Order Online',
  hoursNote:
    'Mon–Thu 11:00 AM – 10:00 PM · Fri–Sat 11:00 AM – 12:30 AM · Sun 11:00 AM – 8:00 PM',
  hoursLines: [
    'Monday – Thursday: 11:00 AM – 10:00 PM',
    'Friday – Saturday: 11:00 AM – 12:30 AM',
    'Sunday: 11:00 AM – 8:00 PM',
  ],
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
