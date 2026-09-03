'use client';

import { FormEvent, useState } from 'react';
import { formatDiscountLabel } from '@/lib/coupon-schema';

type Coupon = {
  id: string;
  code: string;
  discountLabel: string;
  headline: string;
  note: string;
  active: boolean;
};

export function AdminCouponClient({ initial }: { initial: Coupon }) {
  const [coupon, setCoupon] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [draft, setDraft] = useState({
    ...initial,
    discountLabel: formatDiscountLabel(initial.discountLabel),
  });
  const discountPreview = formatDiscountLabel(draft.discountLabel);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/coupon', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: draft.code,
          discountLabel: draft.discountLabel,
          headline: draft.headline,
          note: draft.note,
          active: draft.active,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const err = data?.error?.fieldErrors
          ? Object.values(data.error.fieldErrors).flat().find(Boolean)
          : data?.error;
        throw new Error(typeof err === 'string' ? err : 'Save failed');
      }
      setCoupon(data.coupon);
      setDraft({
        ...data.coupon,
        discountLabel: formatDiscountLabel(data.coupon.discountLabel),
      });
      setMessage({ type: 'ok', text: 'Coupon updated. Home scratch card will use this code.' });
    } catch (err) {
      setMessage({ type: 'err', text: err instanceof Error ? err.message : 'Error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-coupon">
      <p className="adm-lede">
        Controls the home-page scratch card only. Guests still redeem in-house with staff.
      </p>

      {message ? (
        <p className={`adm-alert ${message.type === 'ok' ? 'is-ok' : 'is-err'}`}>{message.text}</p>
      ) : null}

      <div className="adm-coupon-grid">
        <form className="adm-panel" onSubmit={onSubmit}>
          <h2>Scratch coupon</h2>
          <label className="adm-field">
            Code
            <input
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
              required
              maxLength={32}
            />
          </label>
          <label className="adm-field">
            Discount label
            <input
              value={draft.discountLabel}
              onChange={(e) => setDraft({ ...draft, discountLabel: e.target.value })}
              required
              maxLength={24}
              placeholder="10%"
            />
          </label>
          <label className="adm-field">
            Headline
            <input
              value={draft.headline}
              onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
              required
              maxLength={80}
            />
          </label>
          <label className="adm-field">
            Note
            <textarea
              rows={3}
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              required
              maxLength={240}
            />
          </label>

          <button
            type="button"
            className={`adm-toggle${draft.active ? ' is-on' : ''}`}
            role="switch"
            aria-checked={draft.active}
            onClick={() => setDraft({ ...draft, active: !draft.active })}
          >
            <span className="adm-toggle-track" aria-hidden="true">
              <span className="adm-toggle-knob" />
            </span>
            <span className="adm-toggle-copy">
              <strong>{draft.active ? 'Active on home page' : 'Hidden on home page'}</strong>
              <span>
                {draft.active
                  ? 'Scratch card is live for guests'
                  : 'Scratch card stays off until you turn this on'}
              </span>
            </span>
          </button>

          <button className="adm-btn-primary" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save coupon'}
          </button>
        </form>

        <div className="adm-panel adm-coupon-preview" aria-label="Preview">
          <h2>Home card preview</h2>
          <div className={`adm-scratch-preview${!draft.active ? ' is-off' : ''}`}>
            <span className="adm-scratch-kicker">{draft.headline}</span>
            <p className="adm-scratch-off">
              <em>{discountPreview}</em> OFF
            </p>
            <p className="adm-hint" style={{ marginTop: '0.35rem' }}>
              Home heading becomes: Scratch. Save {discountPreview}.
            </p>
            <code>{draft.code || 'CODE'}</code>
            <p className="adm-scratch-note">{draft.note}</p>
            {!draft.active ? <p className="adm-scratch-disabled">Hidden on site while inactive</p> : null}
          </div>
          <p className="adm-hint">Live site reads this via GET /api/coupon.</p>
          <p className="adm-hint">Current saved code: <strong>{coupon.code}</strong></p>
        </div>
      </div>
    </div>
  );
}
