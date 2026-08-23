'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  addDays,
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

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toLocalDateTimeValue(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toLocalDateValue(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseLocalInput(value: string | undefined | null): Date | null {
  if (!value) return null;
  // Prefer YYYY-MM-DD as local date (avoid UTC shift)
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (value.includes('T')) {
      const tm = /T(\d{2}):(\d{2})/.exec(value);
      if (tm) d.setHours(Number(tm[1]), Number(tm[2]), 0, 0);
    }
    return Number.isNaN(+d) ? null : d;
  }
  const d = new Date(value);
  return Number.isNaN(+d) ? null : d;
}

type Mode = 'date' | 'datetime';

type Props = {
  name: string;
  label: string;
  mode?: Mode;
  required?: boolean;
  defaultValue?: string;
  optional?: boolean;
  /** Disallow dates before this day. Use 'tomorrow' for public booking forms. */
  minDate?: Date | 'tomorrow';
};

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function DatePickerField({
  name,
  label,
  mode = 'datetime',
  required,
  defaultValue,
  optional,
  minDate,
}: Props) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const today = useMemo(() => startOfDay(new Date()), []);
  const minDay = useMemo(() => {
    if (!minDate) return null;
    if (minDate === 'tomorrow') return addDays(today, 1);
    return startOfDay(minDate);
  }, [minDate, today]);

  const initial = parseLocalInput(defaultValue);
  const initialSafe =
    initial && minDay && isBefore(startOfDay(initial), minDay) ? null : initial;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | null>(initialSafe);
  const [cursor, setCursor] = useState(() => startOfMonth(initialSafe || minDay || new Date()));
  const [time, setTime] = useState(() =>
    initialSafe ? `${pad(initialSafe.getHours())}:${pad(initialSafe.getMinutes())}` : '18:00'
  );

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const hiddenValue = useMemo(() => {
    if (!selected) return '';
    if (mode === 'date') return toLocalDateValue(selected);
    const [hh, mm] = time.split(':').map((n) => Number(n) || 0);
    const d = new Date(selected);
    d.setHours(hh, mm, 0, 0);
    return toLocalDateTimeValue(d);
  }, [selected, time, mode]);

  const display = useMemo(() => {
    if (!selected) return optional ? 'Select date' : 'Pick a date';
    if (mode === 'date') return format(selected, 'EEE, MMM d, yyyy');
    const [hh, mm] = time.split(':').map((n) => Number(n) || 0);
    const d = new Date(selected);
    d.setHours(hh, mm, 0, 0);
    return format(d, 'EEE, MMM d · h:mm a');
  }, [selected, time, mode, optional]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    const next = parseLocalInput(defaultValue);
    const safe = next && minDay && isBefore(startOfDay(next), minDay) ? null : next;
    setSelected(safe);
    setCursor(startOfMonth(safe || minDay || new Date()));
    setTime(safe ? `${pad(safe.getHours())}:${pad(safe.getMinutes())}` : '18:00');
  }, [defaultValue, minDay]);

  function isDisabled(day: Date) {
    if (!minDay) return false;
    return isBefore(startOfDay(day), minDay);
  }

  function pickDay(day: Date) {
    if (isDisabled(day)) return;
    setSelected(day);
    setCursor(startOfMonth(day));
    if (mode === 'date') setOpen(false);
  }

  function goEarliest() {
    const t = minDay || today;
    setSelected(t);
    setCursor(startOfMonth(t));
    if (!minDay) {
      setTime(`${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`);
    }
    if (mode === 'date') setOpen(false);
  }

  return (
    <div className="dp-field" ref={rootRef}>
      <span className="dp-label" id={`${id}-label`}>
        {label}
      </span>
      <input
        type="hidden"
        name={name}
        value={hiddenValue}
        required={Boolean(required && !optional)}
      />
      <button
        type="button"
        className={`dp-trigger${open ? ' is-open' : ''}${!selected ? ' is-empty' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${id}-label`}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{display}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.7" />
          <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <div className="dp-popover" role="dialog" aria-label={label}>
          <div className="dp-cal">
            <div className="dp-cal-head">
              <button
                type="button"
                className="dp-nav"
                aria-label="Previous month"
                onClick={() => setCursor((c) => addMonths(c, -1))}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <p className="dp-month">{format(cursor, 'MMMM yyyy')}</p>
              <button
                type="button"
                className="dp-nav"
                aria-label="Next month"
                onClick={() => setCursor((c) => addMonths(c, 1))}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="dp-weekdays" aria-hidden="true">
              {WEEKDAYS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="dp-grid" role="grid">
              {days.map((day) => {
                const inMonth = isSameMonth(day, cursor);
                const isSelected = selected ? isSameDay(day, selected) : false;
                const isToday = isSameDay(day, today);
                const disabled = isDisabled(day);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    role="gridcell"
                    disabled={disabled}
                    className={[
                      'dp-day',
                      inMonth ? '' : 'is-outside',
                      isSelected ? 'is-selected' : '',
                      isToday && !isSelected ? 'is-today' : '',
                      disabled ? 'is-disabled' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => pickDay(day)}
                    aria-label={format(day, 'EEEE, MMMM d, yyyy')}
                    aria-pressed={isSelected}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            {mode === 'datetime' ? (
              <label className="dp-time">
                <span>Time</span>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value || '18:00')}
                />
              </label>
            ) : null}

            <div className="dp-footer">
              <button type="button" className="dp-today" onClick={goEarliest}>
                {minDay ? 'Earliest' : 'Today'}
              </button>
              {optional ? (
                <button
                  type="button"
                  className="dp-clear"
                  onClick={() => {
                    setSelected(null);
                    setOpen(false);
                  }}
                >
                  Clear
                </button>
              ) : (
                <button type="button" className="dp-done" onClick={() => setOpen(false)}>
                  Done
                </button>
              )}
            </div>
            {minDay ? (
              <p className="dp-hint">Available from {format(minDay, 'MMM d, yyyy')} onward.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
