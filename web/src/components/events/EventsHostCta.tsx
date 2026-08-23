'use client';

import { FormEvent, useId, useState } from 'react';
import { DatePickerField } from '@/components/ui/DatePickerField';

const OCCASIONS = [
  'Birthday',
  'Private dinner',
  'Celebration',
  'Other',
] as const;

type Status = 'idle' | 'sending' | 'ok' | 'err';

export function EventsHostCta() {
  const formId = useId();
  const [occasion, setOccasion] = useState<(typeof OCCASIONS)[number]>('Birthday');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    if (String(fd.get('website') || '').trim()) {
      setStatus('ok');
      return;
    }

    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    const eventDate = String(fd.get('eventDate') || '').trim();
    const guests = String(fd.get('guests') || '').trim();
    const details = String(fd.get('details') || '').trim();

    if (!name || !email || !phone) {
      setStatus('err');
      setError('Name, email, and phone are required.');
      return;
    }
    if (!eventDate) {
      setStatus('err');
      setError('Pick a preferred date (tomorrow or later).');
      return;
    }

    const messageParts = [
      `Occasion: ${occasion}`,
      `Date: ${eventDate}`,
      guests ? `Guests: ${guests}` : null,
      details || 'Looking to host a private event at Bottomz Up.',
    ].filter(Boolean);

    setStatus('sending');
    setError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          name,
          email,
          phone,
          topic: 'Private event',
          preferred: 'Phone',
          message: messageParts.join('\n'),
          eventDate,
          guests: guests || undefined,
          eventType: occasion,
          source: 'events-private',
          website: '',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ? 'Could not send. Check the fields and try again.' : 'Something went wrong.');
      }

      setStatus('ok');
      form.reset();
      setOccasion('Birthday');
    } catch (err) {
      setStatus('err');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <section className="ev-host" aria-labelledby={`${formId}-title`}>
      <div className="ev-host-inner">
        <div className="ev-host-copy">
          <h2 id={`${formId}-title`}>Host a birthday or private event</h2>
          <p>
            Birthdays, dinners, and closed gatherings. Tell us the date and headcount. We will follow up with options that fit the room.
          </p>
          <ul className="ev-host-points">
            <li>Private and semi-private setups</li>
            <li>House menu or catering packages</li>
            <li>South Boston, VA. Easy to find.</li>
          </ul>
        </div>

        <div className={`ev-host-card${status === 'ok' ? ' is-success' : ''}`}>
          {status === 'ok' ? (
            <div className="ev-host-success" role="status">
              <p className="ev-host-success-title">Got it. We will be in touch.</p>
              <p>Usually same day during open hours. Prefer a call? <a href="tel:+14345755753">(434) 575-5753</a></p>
              <button
                type="button"
                className="ev-host-reset"
                onClick={() => setStatus('idle')}
              >
                Send another
              </button>
            </div>
          ) : (
            <form className="ev-host-form" onSubmit={onSubmit} noValidate>
              <fieldset className="ev-host-field">
                <legend>Occasion</legend>
                <div className="ev-host-chips" role="group" aria-label="Occasion">
                  {OCCASIONS.map((item) => (
                    <label key={item} className={`ev-host-chip${occasion === item ? ' is-on' : ''}`}>
                      <input
                        type="radio"
                        name="occasion"
                        value={item}
                        checked={occasion === item}
                        onChange={() => setOccasion(item)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="ev-host-row">
                <DatePickerField
                  name="eventDate"
                  label="Preferred date"
                  mode="date"
                  required
                  minDate="tomorrow"
                />
                <label className="ev-host-field">
                  <span>Guests</span>
                  <input
                    type="text"
                    name="guests"
                    inputMode="numeric"
                    placeholder="e.g. 24"
                    autoComplete="off"
                  />
                </label>
              </div>

              <label className="ev-host-field">
                <span>Name</span>
                <input type="text" name="name" autoComplete="name" required />
              </label>

              <div className="ev-host-row">
                <label className="ev-host-field">
                  <span>Phone</span>
                  <input type="tel" name="phone" autoComplete="tel" required />
                </label>
                <label className="ev-host-field">
                  <span>Email</span>
                  <input type="email" name="email" autoComplete="email" required />
                </label>
              </div>

              <label className="ev-host-field">
                <span>Anything we should know?</span>
                <textarea
                  name="details"
                  rows={3}
                  placeholder="Cake, dietary needs, timing…"
                />
              </label>

              {/* honeypot */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="ev-host-hp"
                aria-hidden="true"
              />

              {status === 'err' && error ? (
                <p className="ev-host-error" role="alert">{error}</p>
              ) : null}

              <button type="submit" className="ev-host-submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Request a date'}
              </button>
              <p className="ev-host-note">No deposit online. We confirm by phone or text.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
