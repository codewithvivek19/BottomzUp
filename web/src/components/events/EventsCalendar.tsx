'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import type { RestaurantEvent } from '@/types/event';
import { EventPopup } from './EventPopup';

function toDayKey(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

function prefersHover() {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function EventsCalendar({ initialEvents }: { initialEvents: RestaurantEvent[] }) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(false);
  const [peekDay, setPeekDay] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [monthDir, setMonthDir] = useState<'next' | 'prev' | 'jump'>('jump');
  const gridRef = useRef<HTMLDivElement>(null);
  const peekTimer = useRef<number | null>(null);

  useEffect(() => {
    const from = startOfWeek(startOfMonth(cursor)).toISOString();
    const to = endOfWeek(endOfMonth(cursor)).toISOString();
    let cancelled = false;
    setLoading(true);
    fetch(`/api/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data.events)) return;
        setEvents(
          data.events.map((e: RestaurantEvent & { startsAt: string | Date }) => ({
            ...e,
            startsAt: new Date(e.startsAt).toISOString(),
            endsAt: e.endsAt ? new Date(e.endsAt).toISOString() : null,
          }))
        );
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cursor]);

  const deepLinked = useRef(false);
  useEffect(() => {
    if (deepLinked.current) return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get('event');
    if (!id) return;
    const match = events.find((e) => e.id === id);
    if (!match) return;
    deepLinked.current = true;
    const day = new Date(match.startsAt);
    setMonthDir('jump');
    setCursor(startOfMonth(day));
    setActiveDay(toDayKey(day));
    setActiveEventId(match.id);
  }, [events]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const byDay = useMemo(() => {
    const map = new Map<string, RestaurantEvent[]>();
    for (const e of events) {
      const key = toDayKey(new Date(e.startsAt));
      const list = map.get(key) || [];
      list.push(e);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
    }
    return map;
  }, [events]);

  const upcoming = useMemo(() => {
    return [...events]
      .filter((e) => !isBefore(new Date(e.startsAt), today))
      .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
      .slice(0, 6);
  }, [events, today]);

  const modalEvents = activeDay ? byDay.get(activeDay) || [] : [];
  const selected =
    modalEvents.find((e) => e.id === activeEventId) || modalEvents[0] || null;

  const peekEvents = peekDay && !activeDay ? byDay.get(peekDay) || [] : [];

  const goMonth = useCallback((delta: number) => {
    setMonthDir(delta >= 0 ? 'next' : 'prev');
    setPeekDay(null);
    setCursor((c) => addMonths(c, delta));
  }, []);

  const goToday = useCallback(() => {
    setMonthDir('jump');
    setPeekDay(null);
    setCursor(startOfMonth(today));
  }, [today]);

  function openDay(day: Date) {
    const key = toDayKey(day);
    const list = byDay.get(key) || [];
    if (!list.length) return;
    if (!isSameMonth(day, cursor)) {
      setMonthDir(day > cursor ? 'next' : 'prev');
      setCursor(startOfMonth(day));
    }
    setPeekDay(null);
    setActiveDay(key);
    setActiveEventId(list[0].id);
    const url = new URL(window.location.href);
    url.searchParams.set('event', list[0].id);
    window.history.replaceState({}, '', url.toString());
  }

  function closePopup() {
    setActiveDay(null);
    setActiveEventId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('event');
    window.history.replaceState({}, '', url.pathname);
  }

  function schedulePeek(key: string | null) {
    if (peekTimer.current) window.clearTimeout(peekTimer.current);
    if (!prefersHover() || activeDay) {
      setPeekDay(null);
      return;
    }
    if (!key) {
      peekTimer.current = window.setTimeout(() => setPeekDay(null), 120);
      return;
    }
    peekTimer.current = window.setTimeout(() => setPeekDay(key), 80);
  }

  useEffect(() => {
    return () => {
      if (peekTimer.current) window.clearTimeout(peekTimer.current);
    };
  }, []);

  const monthLabel = format(cursor, 'MMMM yyyy');
  const isCurrentMonth = isSameMonth(cursor, today);

  return (
    <div className="ev-shell">
      <div className={`ev-calendar${loading ? ' is-loading' : ''}`}>
        <div className="ev-cal-toolbar">
          <div className="ev-cal-toolbar-left">
            <h2 className="ev-cal-month" aria-live="polite">
              <span key={monthLabel} className={`ev-cal-month-text is-${monthDir}`}>
                {monthLabel}
              </span>
            </h2>
            {!isCurrentMonth ? (
              <button type="button" className="ev-today-btn" onClick={goToday}>
                Today
              </button>
            ) : (
              <span className="ev-today-pill" aria-hidden="true">
                This month
              </span>
            )}
          </div>
          <div className="ev-cal-toolbar-nav">
            <button
              type="button"
              className="ev-nav-btn"
              onClick={() => goMonth(-1)}
              aria-label="Previous month"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className="ev-nav-btn"
              onClick={() => goMonth(1)}
              aria-label="Next month"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="ev-cal-weekdays" aria-hidden="true">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div
          ref={gridRef}
          className="ev-cal-grid"
          role="grid"
          aria-label={`Events calendar for ${monthLabel}`}
        >
          {days.map((day) => {
            const key = toDayKey(day);
            const list = byDay.get(key) || [];
            const has = list.length > 0;
            const inMonth = isSameMonth(day, cursor);
            const isToday = isSameDay(day, today);
            const isActive = activeDay === key;
            const isPeek = peekDay === key && !activeDay;

            return (
              <button
                key={key}
                type="button"
                role="gridcell"
                className={[
                  'ev-day',
                  inMonth ? '' : 'is-outside',
                  has ? 'has-event' : '',
                  isToday ? 'is-today' : '',
                  isActive ? 'is-active' : '',
                  isPeek ? 'is-peek' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={!has}
                onMouseEnter={() => {
                  if (has) schedulePeek(key);
                }}
                onMouseLeave={() => schedulePeek(null)}
                onFocus={() => {
                  if (has) schedulePeek(key);
                }}
                onBlur={() => schedulePeek(null)}
                onClick={() => openDay(day)}
                aria-label={
                  has
                    ? `${format(day, 'EEEE, MMMM d')}: ${list.length} event${list.length > 1 ? 's' : ''}. ${list.map((e) => e.title).join(', ')}`
                    : format(day, 'EEEE, MMMM d')
                }
              >
                <span className={`ev-day-num${isToday ? ' is-today-num' : ''}`}>
                  {format(day, 'd')}
                </span>
                {has ? (
                  <span className="ev-day-dots" aria-hidden="true">
                    {list.slice(0, 3).map((e) => (
                      <span key={e.id} className="ev-day-dot" />
                    ))}
                  </span>
                ) : null}
                {has ? (
                  <span className="ev-day-preview">
                    {list[0].title}
                    {list.length > 1 ? ` +${list.length - 1}` : ''}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {peekEvents.length && peekDay ? (
          <div
            className="ev-peek"
            role="status"
            onMouseEnter={() => schedulePeek(peekDay)}
            onMouseLeave={() => schedulePeek(null)}
          >
            <p className="ev-peek-date">{format(new Date(peekDay + 'T12:00:00'), 'EEEE, MMM d')}</p>
            <ul className="ev-peek-list">
              {peekEvents.slice(0, 3).map((e) => (
                <li key={e.id}>
                  <button type="button" onClick={() => openDay(new Date(e.startsAt))}>
                    <span className="ev-peek-time">{format(new Date(e.startsAt), 'h:mm a')}</span>
                    <span className="ev-peek-title">{e.title}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="ev-peek-hint">Click a date for full details</p>
          </div>
        ) : null}
      </div>

      <aside className="ev-upcoming" aria-label="Upcoming events">
        <div className="ev-upcoming-head">
          <h3>Coming up</h3>
          <p>Tap a night for details</p>
        </div>
        {upcoming.length ? (
          <ul className="ev-upcoming-list">
            {upcoming.map((e) => {
              const start = new Date(e.startsAt);
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    className="ev-upcoming-card"
                    onClick={() => openDay(start)}
                  >
                    <span className="ev-upcoming-date">
                      <span className="ev-upcoming-dow">{format(start, 'EEE')}</span>
                      <span className="ev-upcoming-dom">{format(start, 'd')}</span>
                    </span>
                    <span className="ev-upcoming-body">
                      <span className="ev-upcoming-title">{e.title}</span>
                      <span className="ev-upcoming-meta">{format(start, 'h:mm a')}</span>
                    </span>
                    <span className="ev-upcoming-chev" aria-hidden="true">
                      →
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="ev-upcoming-empty">
            <p>No published nights in this window yet.</p>
            <p>Check back soon, or call the house.</p>
            <a className="btn-ticket" href="tel:+14345755753">
              <span className="btn-hover-fill" aria-hidden="true" />
              <span className="btn-label">Call (434) 575-5753</span>
            </a>
          </div>
        )}
      </aside>

      {selected && activeDay ? (
        <EventPopup
          events={modalEvents}
          selected={selected}
          onSelect={(id) => {
            setActiveEventId(id);
            const url = new URL(window.location.href);
            url.searchParams.set('event', id);
            window.history.replaceState({}, '', url.toString());
          }}
          onClose={closePopup}
        />
      ) : null}
    </div>
  );
}
