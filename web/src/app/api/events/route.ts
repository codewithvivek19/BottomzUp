import { NextRequest, NextResponse } from 'next/server';
import { createEvent, listEvents } from '@/lib/data/store';
import { eventCreateSchema, normalizeImageUrl } from '@/lib/event-schema';
import { getAdminUser, requireAdmin } from '@/lib/require-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const all = searchParams.get('all') === '1';

    let isAdmin = false;
    try {
      const admin = await getAdminUser();
      isAdmin = Boolean(admin);
    } catch (err) {
      console.error('[api/events] admin lookup failed', err);
    }

    const events = await listEvents({
      publishedOnly: !(isAdmin && all),
      asAdmin: Boolean(isAdmin && all),
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });

    return NextResponse.json({ events });
  } catch (err) {
    console.error('[api/events] GET failed', err);
    return NextResponse.json({ events: [], error: 'unavailable' }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = eventCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  try {
    const event = await createEvent({
      title: data.title,
      description: data.description,
      startsAt: new Date(data.startsAt),
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      imageUrl: normalizeImageUrl(data.imageUrl),
      published: data.published ?? true,
    });
    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    console.error('[api/events] POST failed', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Create failed' },
      { status: 503 }
    );
  }
}
