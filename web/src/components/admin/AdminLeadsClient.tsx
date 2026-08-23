'use client';

import { useMemo, useState } from 'react';
import {
  format,
  isBefore,
  isToday,
  isTomorrow,
  isValid,
  parseISO,
  startOfDay,
} from 'date-fns';
import { useSearchParams } from 'next/navigation';

export type AdminLead = {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  topic: string | null;
  preferred: string | null;
  message: string | null;
  eventDate: string | null;
  guests: string | null;
  eventType: string | null;
  notes: string | null;
  items: string[];
  bundles: string[];
  status: string;
  source: string | null;
  createdAt: string;
};

type KindFilter = 'all' | 'private' | 'catering' | 'contact';
type FilterStatus = 'all' | 'new' | 'contacted' | 'closed';
type DateBucket = 'upcoming' | 'undated' | 'past';

function leadKind(l: AdminLead): 'private' | 'catering' | 'contact' {
  if (l.type === 'catering') return 'catering';
  if (l.source === 'events-private' || l.topic === 'Private event') return 'private';
  return 'contact';
}

function kindLabel(kind: 'private' | 'catering' | 'contact') {
  if (kind === 'private') return 'Private event';
  if (kind === 'catering') return 'Catering';
  return 'Contact';
}

function occasionOf(l: AdminLead) {
  if (l.eventType) return l.eventType;
  const m = l.message?.match(/Occasion:\s*([^\n]+)/i);
  return m?.[1]?.trim() || null;
}

function parseEventDay(raw: string | null): Date | null {
  if (!raw) return null;
  const iso = raw.length === 10 ? `${raw}T12:00:00` : raw;
  const d = parseISO(iso);
  if (!isValid(d)) {
    const fallback = new Date(raw);
    return Number.isNaN(+fallback) ? null : startOfDay(fallback);
  }
  return startOfDay(d);
}

function eventDayLabel(d: Date) {
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'EEE, MMM d');
}

function bucketFor(l: AdminLead, today: Date): DateBucket {
  const d = parseEventDay(l.eventDate);
  if (!d) return 'undated';
  if (isBefore(d, today)) return 'past';
  return 'upcoming';
}

export function AdminLeadsClient({ initialLeads }: { initialLeads: AdminLead[] }) {
  const params = useSearchParams();
  const focus = params.get('focus');
  const [leads, setLeads] = useState(initialLeads);
  const [selectedId, setSelectedId] = useState<string | null>(focus || initialLeads[0]?.id || null);
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const today = useMemo(() => startOfDay(new Date()), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      const kind = leadKind(l);
      if (kindFilter !== 'all' && kind !== kindFilter) return false;
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        l.name,
        l.email,
        l.phone,
        l.topic,
        l.message,
        l.eventType,
        l.eventDate,
        l.source,
        ...(l.items || []),
        ...(l.bundles || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [leads, kindFilter, statusFilter, query]);

  const grouped = useMemo(() => {
    const upcoming: AdminLead[] = [];
    const undated: AdminLead[] = [];
    const past: AdminLead[] = [];
    for (const l of filtered) {
      const b = bucketFor(l, today);
      if (b === 'upcoming') upcoming.push(l);
      else if (b === 'past') past.push(l);
      else undated.push(l);
    }
    upcoming.sort((a, b) => {
      const da = parseEventDay(a.eventDate)?.getTime() || 0;
      const db = parseEventDay(b.eventDate)?.getTime() || 0;
      if (da !== db) return da - db;
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
    undated.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    past.sort((a, b) => {
      const da = parseEventDay(a.eventDate)?.getTime() || 0;
      const db = parseEventDay(b.eventDate)?.getTime() || 0;
      return db - da;
    });
    return { upcoming, undated, past };
  }, [filtered, today]);

  const flat = useMemo(
    () => [...grouped.upcoming, ...grouped.undated, ...grouped.past],
    [grouped]
  );
  const selected = flat.find((l) => l.id === selectedId) || flat[0] || null;

  const counts = useMemo(() => {
    const c = { all: leads.length, private: 0, catering: 0, contact: 0, new: 0 };
    for (const l of leads) {
      c[leadKind(l)] += 1;
      if (l.status === 'new') c.new += 1;
    }
    return c;
  }, [leads]);

  async function setStatus(id: string, status: 'new' | 'contacted' | 'closed') {
    setBusy(true);
    setFlash(null);
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Update failed');
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      setFlash(
        status === 'new'
          ? 'Marked as new'
          : status === 'contacted'
            ? 'Marked as contacted'
            : 'Marked as closed'
      );
      window.setTimeout(() => setFlash(null), 2200);
    } catch {
      setFlash('Could not save status. Try again.');
    } finally {
      setBusy(false);
    }
  }

  function renderRow(l: AdminLead) {
    const kind = leadKind(l);
    const day = parseEventDay(l.eventDate);
    const summaryBits =
      kind === 'catering'
        ? [
            day ? eventDayLabel(day) : null,
            l.guests ? `${l.guests} guests` : null,
            l.eventType || null,
            l.bundles.length ? `${l.bundles.length} pkg` : null,
          ]
        : kind === 'private'
          ? [
              day ? eventDayLabel(day) : null,
              occasionOf(l) || 'Private event',
              l.guests ? `${l.guests} guests` : null,
            ]
          : [l.topic || 'General inquiry'];

    return (
      <li key={l.id}>
        <button
          type="button"
          className={`adm-lead-row${selected?.id === l.id ? ' is-active' : ''}`}
          onClick={() => setSelectedId(l.id)}
        >
          <span className={`adm-type-badge is-${kind}`}>{kindLabel(kind)}</span>
          <span className="adm-lead-row-body">
            <strong>{l.name}</strong>
            <span>{summaryBits.filter(Boolean).join(' · ')}</span>
          </span>
          {day ? <span className="adm-lead-datepill">{format(day, 'MMM d')}</span> : null}
          <span className={`adm-status is-${l.status}`}>{l.status}</span>
        </button>
      </li>
    );
  }

  function renderGroup(title: string, rows: AdminLead[], hint?: string) {
    if (!rows.length) return null;
    return (
      <div className="adm-lead-group">
        <div className="adm-lead-group-head">
          <h3>{title}</h3>
          <span>{rows.length}</span>
        </div>
        {hint ? <p className="adm-lead-group-hint">{hint}</p> : null}
        <ul className="adm-lead-rows">{rows.map(renderRow)}</ul>
      </div>
    );
  }

  const selectedKind = selected ? leadKind(selected) : null;
  const selectedDay = selected ? parseEventDay(selected.eventDate) : null;

  return (
    <div className="adm-leads">
      <div className="adm-leads-stats">
        <div className="adm-leads-stat">
          <span>New</span>
          <strong>{counts.new}</strong>
        </div>
        <div className="adm-leads-stat">
          <span>Private events</span>
          <strong>{counts.private}</strong>
        </div>
        <div className="adm-leads-stat">
          <span>Catering</span>
          <strong>{counts.catering}</strong>
        </div>
        <div className="adm-leads-stat">
          <span>Contact</span>
          <strong>{counts.contact}</strong>
        </div>
      </div>

      <div className="adm-toolbar">
        <input
          type="search"
          placeholder="Search name, phone, date, package…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search leads"
        />
        <div className="adm-chips" role="group" aria-label="Lead type">
          {(
            [
              ['all', `All (${counts.all})`],
              ['private', 'Private events'],
              ['catering', 'Catering'],
              ['contact', 'Contact'],
            ] as const
          ).map(([t, label]) => (
            <button
              key={t}
              type="button"
              className={`adm-chip${kindFilter === t ? ' is-on' : ''}`}
              onClick={() => setKindFilter(t)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="adm-chips" role="group" aria-label="Status">
          {(['all', 'new', 'contacted', 'closed'] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`adm-chip${statusFilter === s ? ' is-on' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'All status' : s}
            </button>
          ))}
        </div>
      </div>

      {flash ? <p className="adm-alert is-ok">{flash}</p> : null}

      <div className="adm-leads-layout">
        <div className="adm-panel adm-leads-list">
          <h2>Inbox ({filtered.length})</h2>
          {filtered.length === 0 ? (
            <p className="adm-empty">No leads match.</p>
          ) : (
            <>
              {renderGroup('Upcoming by event date', grouped.upcoming, 'Sorted soonest first for floor planning.')}
              {renderGroup('No event date yet', grouped.undated)}
              {renderGroup('Past event dates', grouped.past)}
            </>
          )}
        </div>

        <div className="adm-panel adm-lead-detail">
          {!selected || !selectedKind ? (
            <p className="adm-empty">Select a lead to view details.</p>
          ) : (
            <article className="adm-order-ticket">
              <header>
                <div>
                  <p className="adm-kicker">{kindLabel(selectedKind)}</p>
                  <h2>{selected.name}</h2>
                  <p className="adm-sub">
                    Received {format(new Date(selected.createdAt), 'EEE, MMM d · h:mm a')}
                  </p>
                </div>
                <span className={`adm-status is-${selected.status}`}>{selected.status}</span>
              </header>

              {selectedDay ? (
                <div className="adm-lead-eventbanner">
                  <span>Event date</span>
                  <strong>{format(selectedDay, 'EEEE, MMMM d, yyyy')}</strong>
                  <em>{eventDayLabel(selectedDay)}</em>
                </div>
              ) : (
                <div className="adm-lead-eventbanner is-muted">
                  <span>Event date</span>
                  <strong>Not provided</strong>
                </div>
              )}

              <div className="adm-order-meta">
                <div>
                  <span>Phone</span>
                  <a href={`tel:${selected.phone}`}>{selected.phone}</a>
                </div>
                <div>
                  <span>Email</span>
                  <a href={`mailto:${selected.email}`}>{selected.email}</a>
                </div>
                <div>
                  <span>Guests</span>
                  <strong>{selected.guests || '—'}</strong>
                </div>
                <div>
                  <span>{selectedKind === 'private' ? 'Occasion' : 'Event type'}</span>
                  <strong>
                    {occasionOf(selected) ||
                      (selectedKind === 'private' ? 'Private event' : selected.topic || '—')}
                  </strong>
                </div>
                {selectedKind === 'contact' ? (
                  <div>
                    <span>Preferred</span>
                    <strong>{selected.preferred || '—'}</strong>
                  </div>
                ) : null}
                <div>
                  <span>Source</span>
                  <strong>{selected.source || selected.type}</strong>
                </div>
              </div>

              {selectedKind === 'catering' && selected.bundles.length ? (
                <section>
                  <h3>Packages</h3>
                  <ul className="adm-chip-list">
                    {selected.bundles.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {selectedKind === 'catering' && selected.items.length ? (
                <section>
                  <h3>À la carte</h3>
                  <ul className="adm-chip-list">
                    {selected.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {(selected.message || selected.notes) && (
                <section>
                  <h3>{selectedKind === 'catering' ? 'Notes' : 'Message'}</h3>
                  <p className="adm-notes">{selected.message || selected.notes}</p>
                </section>
              )}

              <div className="adm-lead-statusbar" role="group" aria-label="Lead status">
                <span className="adm-lead-statuslabel">Status</span>
                <div className="adm-lead-statusactions">
                  <button
                    type="button"
                    className={`adm-status-btn${selected.status === 'new' ? ' is-on' : ''}`}
                    disabled={busy}
                    onClick={() => setStatus(selected.id, 'new')}
                  >
                    New
                  </button>
                  <button
                    type="button"
                    className={`adm-status-btn${selected.status === 'contacted' ? ' is-on' : ''}`}
                    disabled={busy}
                    onClick={() => setStatus(selected.id, 'contacted')}
                  >
                    Contacted
                  </button>
                  <button
                    type="button"
                    className={`adm-status-btn${selected.status === 'closed' ? ' is-on' : ''}`}
                    disabled={busy}
                    onClick={() => setStatus(selected.id, 'closed')}
                  >
                    Closed
                  </button>
                </div>
                <a className="adm-btn-ghost" href={`tel:${selected.phone}`}>
                  Call
                </a>
                <a className="adm-btn-ghost" href={`mailto:${selected.email}`}>
                  Email
                </a>
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
