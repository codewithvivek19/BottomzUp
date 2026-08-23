'use client';

import { FormEvent, useMemo, useState } from 'react';
import { format } from 'date-fns';
import type { RestaurantEvent } from '@/types/event';
import { DatePickerField } from '@/components/ui/DatePickerField';

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function apiErrorMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== 'object') return fallback;
  const err = (data as { error?: unknown }).error;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'fieldErrors' in err) {
    const fields = (err as { fieldErrors?: Record<string, string[] | undefined> }).fieldErrors || {};
    const first = Object.values(fields).flat().find(Boolean);
    if (first) return first;
  }
  return fallback;
}

type Filter = 'all' | 'live' | 'draft';

export function AdminEventsClient({ initialEvents }: { initialEvents: RestaurantEvent[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [editing, setEditing] = useState<RestaurantEvent | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (filter === 'live' && !e.published) return false;
      if (filter === 'draft' && e.published) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      );
    });
  }, [events, filter, query]);

  async function refresh() {
    const res = await fetch('/api/events?all=1', { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) throw new Error(apiErrorMessage(data, 'Could not refresh events'));
    if (Array.isArray(data.events)) {
      setEvents(
        data.events.map((e: RestaurantEvent) => ({
          ...e,
          startsAt: new Date(e.startsAt).toISOString(),
          endsAt: e.endsAt ? new Date(e.endsAt).toISOString() : null,
        }))
      );
    }
  }

  async function uploadImage(file: File) {
    const fd = new FormData();
    fd.set('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(apiErrorMessage(data, 'Upload failed'));
    return data.url as string;
  }

  function startCreate() {
    setEditing(null);
    setPreviewUrl(null);
    setMessage(null);
  }

  function startEdit(e: RestaurantEvent) {
    setEditing(e);
    setPreviewUrl(e.imageUrl);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const wasEditing = Boolean(editing);
    const editingId = editing?.id;
    setBusy(true);
    setMessage(null);
    try {
      const fd = new FormData(form);
      let imageUrl = String(fd.get('imageUrl') || '').trim() || null;
      const file = fd.get('file');
      if (file instanceof File && file.size > 0) {
        imageUrl = await uploadImage(file);
      }

      const startsRaw = String(fd.get('startsAt') || '');
      const endsRaw = String(fd.get('endsAt') || '');
      const payload = {
        title: String(fd.get('title') || '').trim(),
        description: String(fd.get('description') || '').trim(),
        startsAt: new Date(startsRaw).toISOString(),
        endsAt: endsRaw ? new Date(endsRaw).toISOString() : null,
        imageUrl,
        published: fd.get('published') === 'on',
      };

      if (Number.isNaN(Date.parse(payload.startsAt))) {
        throw new Error('Start time is invalid');
      }
      if (payload.endsAt && Date.parse(payload.endsAt) <= Date.parse(payload.startsAt)) {
        throw new Error('End must be after start');
      }

      const url = wasEditing ? `/api/events/${editingId}` : '/api/events';
      const method = wasEditing ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(apiErrorMessage(data, 'Save failed'));

      setEditing(null);
      setPreviewUrl(null);
      form.reset();
      await refresh();
      setMessage({
        type: 'ok',
        text: wasEditing ? 'Event updated.' : 'Event created.',
      });
    } catch (err) {
      setMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Error saving event',
      });
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string, title: string) {
    if (!confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(apiErrorMessage(data, 'Delete failed'));
      if (editing?.id === id) {
        setEditing(null);
        setPreviewUrl(null);
      }
      await refresh();
      setMessage({ type: 'ok', text: 'Event deleted.' });
    } catch (err) {
      setMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Delete failed',
      });
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(e: RestaurantEvent) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/events/${e.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !e.published }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(apiErrorMessage(data, 'Could not update status'));
      await refresh();
      setMessage({
        type: 'ok',
        text: !e.published ? 'Published to public calendar.' : 'Moved to draft.',
      });
    } catch (err) {
      setMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Status update failed',
      });
    } finally {
      setBusy(false);
    }
  }

  async function duplicateEvent(e: RestaurantEvent) {
    setBusy(true);
    setMessage(null);
    try {
      const start = new Date(e.startsAt);
      start.setDate(start.getDate() + 7);
      const end = e.endsAt ? new Date(e.endsAt) : null;
      if (end) end.setDate(end.getDate() + 7);
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${e.title} (copy)`,
          description: e.description,
          startsAt: start.toISOString(),
          endsAt: end ? end.toISOString() : null,
          imageUrl: e.imageUrl,
          published: false,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(apiErrorMessage(data, 'Duplicate failed'));
      await refresh();
      setMessage({ type: 'ok', text: 'Draft copy created (+7 days).' });
    } catch (err) {
      setMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Duplicate failed',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-events">
      <div className="adm-actions" style={{ marginBottom: '1rem' }}>
        <a className="adm-btn-ghost" href="/events" target="_blank" rel="noreferrer">
          Public calendar ↗
        </a>
        {editing ? (
          <button type="button" className="adm-btn-ghost" onClick={startCreate}>
            New event
          </button>
        ) : null}
      </div>

      {message ? (
        <p className={`adm-alert ${message.type === 'ok' ? 'is-ok' : 'is-err'}`} role="status">
          {message.text}
        </p>
      ) : null}

      <div className="adm-panel" style={{ marginBottom: '1rem' }}>
        <h2>{editing ? 'Edit event' : 'Add event'}</h2>
        <form onSubmit={onSubmit} key={editing?.id || 'new'}>
          <label className="adm-field">
            Title
            <input name="title" required maxLength={120} defaultValue={editing?.title || ''} />
          </label>
          <label className="adm-field">
            Description
            <textarea
              name="description"
              rows={4}
              required
              maxLength={5000}
              defaultValue={editing?.description || ''}
            />
          </label>
          <div className="adm-field-row">
            <DatePickerField
              name="startsAt"
              label="Starts"
              mode="datetime"
              required
              defaultValue={editing ? toLocalInput(editing.startsAt) : ''}
            />
            <DatePickerField
              name="endsAt"
              label="Ends (optional)"
              mode="datetime"
              optional
              defaultValue={editing?.endsAt ? toLocalInput(editing.endsAt) : ''}
            />
          </div>
          <label className="adm-field">
            Image URL
            <input
              name="imageUrl"
              defaultValue={editing?.imageUrl || ''}
              placeholder="/uploads/events/... or https://..."
              onChange={(ev) => setPreviewUrl(ev.target.value.trim() || null)}
            />
          </label>
          <p className="adm-hint">
            Upload below for local hosting, or paste an https image URL for production deploys.
          </p>
          <label className="adm-field">
            Upload image
            <input
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(ev) => {
                const file = ev.target.files?.[0];
                if (file) setPreviewUrl(URL.createObjectURL(file));
              }}
            />
          </label>
          {previewUrl ? (
            <div className="adm-preview">
              <img src={previewUrl} alt="" />
            </div>
          ) : null}
          <label className="adm-field adm-check">
            <input
              name="published"
              type="checkbox"
              defaultChecked={editing ? editing.published : true}
            />
            Published on public calendar
          </label>
          <div className="adm-actions">
            <button className="adm-btn-primary" type="submit" disabled={busy}>
              <span className="btn-hover-fill" aria-hidden="true" />
              <span className="btn-label">
                {busy ? 'Saving…' : editing ? 'Update event' : 'Create event'}
              </span>
            </button>
            {editing ? (
              <button type="button" className="adm-btn-ghost" onClick={startCreate} disabled={busy}>
                <span className="btn-hover-fill" aria-hidden="true" />
                <span className="btn-label">Cancel edit</span>
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="adm-panel">
        <h2>All events ({events.length})</h2>
        <div className="adm-toolbar">
          <input
            type="search"
            placeholder="Search title or description"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search events"
          />
          <div className="adm-chips" role="group" aria-label="Filter by status">
            {(
              [
                ['all', 'All'],
                ['live', 'Live'],
                ['draft', 'Drafts'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`adm-chip${filter === id ? ' is-on' : ''}`}
                onClick={() => setFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="adm-empty">
            <p>No events match this filter.</p>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>When</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div className="adm-event-cell">
                        {e.imageUrl ? (
                          <img className="adm-thumb" src={e.imageUrl} alt="" />
                        ) : (
                          <span className="adm-thumb is-empty">No img</span>
                        )}
                        <span>
                          <span className="adm-event-title">{e.title}</span>
                          <span className="adm-event-desc">{e.description}</span>
                        </span>
                      </div>
                    </td>
                    <td>
                      {format(new Date(e.startsAt), 'MMM d, yyyy · h:mm a')}
                      {e.endsAt ? (
                        <>
                          <br />
                          <span style={{ color: '#6b6560', fontSize: '0.8rem' }}>
                            to {format(new Date(e.endsAt), 'h:mm a')}
                          </span>
                        </>
                      ) : null}
                    </td>
                    <td>
                      <span className={`adm-badge ${e.published ? 'is-live' : 'is-draft'}`}>
                        {e.published ? 'Live' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="adm-actions">
                        <button
                          type="button"
                          className="adm-btn-ghost"
                          onClick={() => startEdit(e)}
                          disabled={busy}
                        >
                          <span className="btn-label">Edit</span>
                        </button>
                        <button
                          type="button"
                          className="adm-btn-ghost"
                          onClick={() => togglePublished(e)}
                          disabled={busy}
                        >
                          <span className="btn-label">{e.published ? 'Unpublish' : 'Publish'}</span>
                        </button>
                        <button
                          type="button"
                          className="adm-btn-ghost"
                          onClick={() => duplicateEvent(e)}
                          disabled={busy}
                        >
                          <span className="btn-label">Duplicate</span>
                        </button>
                        <button
                          type="button"
                          className="adm-btn-ghost"
                          onClick={() => onDelete(e.id, e.title)}
                          disabled={busy}
                        >
                          <span className="btn-label">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
