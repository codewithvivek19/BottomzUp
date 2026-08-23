'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import type { RestaurantEvent } from '@/types/event';

type Props = {
  events: RestaurantEvent[];
  selected: RestaurantEvent;
  onSelect: (id: string) => void;
  onClose: () => void;
};

function buildIcs(event: RestaurantEvent) {
  const start = new Date(event.startsAt);
  const end = event.endsAt
    ? new Date(event.endsAt)
    : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const stamp = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, 'Z');
  const escape = (s: string) =>
    s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bottomz Up//Events//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id}@bottomzup`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(event.title)}`,
    `DESCRIPTION:${escape(event.description)}`,
    'LOCATION:2001 Seymour Dr\\, South Boston\\, VA 24592',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

export function EventPopup({ events, selected, onSelect, onClose }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const start = new Date(selected.startsAt);
  const end = selected.endsAt ? new Date(selected.endsAt) : null;
  const whenLabel = end
    ? `${format(start, 'EEEE, MMM d')} · ${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`
    : `${format(start, 'EEEE, MMM d')} · ${format(start, 'h:mm a')}`;

  if (!mounted) return null;

  return createPortal(
    <div className="ev-modal-root" role="presentation">
      <button
        type="button"
        className="ev-modal-backdrop"
        aria-label="Close event details"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className="ev-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          ref={closeRef}
          type="button"
          className="ev-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {events.length > 1 ? (
          <div className="ev-modal-tabs" role="tablist" aria-label="Events this day">
            {events.map((e) => (
              <button
                key={e.id}
                type="button"
                role="tab"
                aria-selected={e.id === selected.id}
                className={e.id === selected.id ? 'is-on' : ''}
                onClick={() => onSelect(e.id)}
              >
                {e.title}
              </button>
            ))}
          </div>
        ) : null}

        <div className={`ev-modal-media${selected.imageUrl ? '' : ' is-empty'}`}>
          {selected.imageUrl ? (
            <img src={selected.imageUrl} alt="" width={800} height={450} />
          ) : (
            <div className="ev-modal-media-fallback" aria-hidden="true">
              <span>Bottomz Up</span>
            </div>
          )}
        </div>

        <div className="ev-modal-body">
          <p className="ev-modal-when">{whenLabel}</p>
          <h3 id={titleId} className="ev-modal-title">
            {selected.title}
          </h3>
          <p className="ev-modal-desc">{selected.description}</p>
          <div className="ev-modal-actions">
            <a className="btn-ticket" href="tel:+14345755753">
              <span className="btn-hover-fill" aria-hidden="true" />
              <span className="btn-label">Call the house</span>
              <span className="btn-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
            <a className="btn-ticket btn-ticket-light" href={buildIcs(selected)} download={`${selected.title}.ics`}>
              <span className="btn-hover-fill" aria-hidden="true" />
              <span className="btn-label">Add to calendar</span>
            </a>
            <a
              className="btn-ticket btn-ticket-light"
              href="https://maps.google.com/?q=2001+Seymour+Dr,+South+Boston,+VA+24592"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="btn-hover-fill" aria-hidden="true" />
              <span className="btn-label">Directions</span>
              <span className="btn-arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
