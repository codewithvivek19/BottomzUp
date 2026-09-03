import { NextRequest, NextResponse } from 'next/server';
import { createLead, listLeads } from '@/lib/data/store';
import { leadCreateSchema, parseJsonArray } from '@/lib/lead-schema';
import { requireAdmin } from '@/lib/require-admin';

function serializeLead(lead: {
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
  itemsJson: string;
  bundlesJson: string;
  status: string;
  source: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: lead.id,
    type: lead.type,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    topic: lead.topic,
    preferred: lead.preferred,
    message: lead.message,
    eventDate: lead.eventDate,
    guests: lead.guests,
    eventType: lead.eventType,
    notes: lead.notes,
    items: parseJsonArray(lead.itemsJson),
    bundles: parseJsonArray(lead.bundlesJson),
    status: lead.status,
    source: lead.source,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}

/** Public submit + admin list */
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const status = searchParams.get('status');

  try {
    let leads = await listLeads(200);
    if (type === 'contact' || type === 'catering') {
      leads = leads.filter((l) => l.type === type);
    }
    if (status === 'new' || status === 'contacted' || status === 'closed') {
      leads = leads.filter((l) => l.status === status);
    }
    return NextResponse.json({ leads: leads.map(serializeLead) });
  } catch (err) {
    console.error('[api/leads] GET failed', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'unavailable' },
      { status: 503 }
    );
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (
    body &&
    typeof body === 'object' &&
    'website' in body &&
    String((body as { website?: string }).website || '')
  ) {
    return NextResponse.json({ ok: true });
  }

  const parsed = leadCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const ua = req.headers.get('user-agent')?.slice(0, 300) || null;

  try {
    if (data.type === 'catering') {
      const items = data.items || [];
      const bundles = data.bundles || [];
      if (!items.length && !bundles.length) {
        return NextResponse.json(
          { error: 'Select at least one package or menu item' },
          { status: 400 }
        );
      }

      const lead = await createLead({
        type: 'catering',
        name: data.name,
        email: data.email,
        phone: data.phone,
        topic: null,
        preferred: null,
        message: null,
        eventDate: data.eventDate || null,
        guests: data.guests || null,
        eventType: data.eventType || null,
        notes: data.notes || null,
        itemsJson: JSON.stringify(items),
        bundlesJson: JSON.stringify(bundles),
        status: 'new',
        source: 'catering',
        userAgent: ua,
      });
      return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
    }

    const lead = await createLead({
      type: 'contact',
      name: data.name,
      email: data.email,
      phone: data.phone,
      topic: data.topic || null,
      preferred: data.preferred || null,
      message: data.message || null,
      eventDate: data.eventDate || null,
      guests: data.guests || null,
      eventType: data.eventType || null,
      notes: null,
      itemsJson: '[]',
      bundlesJson: '[]',
      status: 'new',
      source: data.source || 'contact',
      userAgent: ua,
    });

    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch (err) {
    console.error('[api/leads] POST failed', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'unavailable' },
      { status: 503 }
    );
  }
}
