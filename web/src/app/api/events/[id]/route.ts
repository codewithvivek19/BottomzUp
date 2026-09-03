import { NextRequest, NextResponse } from 'next/server';
import { deleteEvent, getEvent, listEvents, updateEvent } from '@/lib/data/store';
import { eventUpdateSchema, normalizeImageUrl } from '@/lib/event-schema';
import { getAdminUser, requireAdmin } from '@/lib/require-admin';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    let event = await getEvent(id);
    if (!event || !event.published) {
      const admin = await getAdminUser();
      if (!admin) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      // Unpublished rows are only visible with the authenticated client + RLS.
      const adminRows = await listEvents({ asAdmin: true });
      event = adminRows.find((e) => e.id === id) || null;
      if (!event) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }
    return NextResponse.json({ event });
  } catch (err) {
    console.error('[api/events/id] GET failed', err);
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = eventUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  try {
    const event = await updateEvent(id, {
      ...(d.title !== undefined ? { title: d.title } : {}),
      ...(d.description !== undefined ? { description: d.description } : {}),
      ...(d.startsAt !== undefined ? { startsAt: new Date(d.startsAt) } : {}),
      ...(d.endsAt !== undefined
        ? { endsAt: d.endsAt ? new Date(d.endsAt) : null }
        : {}),
      ...(d.imageUrl !== undefined ? { imageUrl: normalizeImageUrl(d.imageUrl) } : {}),
      ...(d.published !== undefined ? { published: d.published } : {}),
    });
    return NextResponse.json({ event });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    if (/0 rows|not found|PGRST116/i.test(message)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error('[api/events/id] PATCH failed', err);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await ctx.params;
  try {
    await deleteEvent(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed';
    if (/0 rows|not found|PGRST116/i.test(message)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error('[api/events/id] DELETE failed', err);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
