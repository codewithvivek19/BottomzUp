import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

  const where: { type?: string; status?: string } = {};
  if (type === 'contact' || type === 'catering') where.type = type;
  if (status === 'new' || status === 'contacted' || status === 'closed') where.status = status;

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return NextResponse.json({ leads: leads.map(serializeLead) });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Honeypot: bots fill "website"
  if (body && typeof body === 'object' && 'website' in body && String((body as { website?: string }).website || '')) {
    return NextResponse.json({ ok: true }); // silent success
  }

  const parsed = leadCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  if (data.type === 'catering') {
    const items = data.items || [];
    const bundles = data.bundles || [];
    if (!items.length && !bundles.length) {
      return NextResponse.json(
        { error: 'Select at least one package or menu item' },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        type: 'catering',
        name: data.name,
        email: data.email,
        phone: data.phone,
        eventDate: data.eventDate || null,
        guests: data.guests || null,
        eventType: data.eventType || null,
        notes: data.notes || null,
        itemsJson: JSON.stringify(items),
        bundlesJson: JSON.stringify(bundles),
        status: 'new',
        source: 'catering',
        userAgent: req.headers.get('user-agent')?.slice(0, 300) || null,
      },
    });
    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  }

  const lead = await prisma.lead.create({
    data: {
      type: 'contact',
      name: data.name,
      email: data.email,
      phone: data.phone,
      topic: data.topic || null,
      preferred: data.preferred || null,
      message: data.message,
      eventDate: data.eventDate || null,
      guests: data.guests || null,
      eventType: data.eventType || null,
      status: 'new',
      source: data.source || 'contact',
      userAgent: req.headers.get('user-agent')?.slice(0, 300) || null,
    },
  });

  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}
