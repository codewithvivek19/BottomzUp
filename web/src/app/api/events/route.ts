import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { eventCreateSchema, normalizeImageUrl } from '@/lib/event-schema';
import { requireAdmin } from '@/lib/require-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const all = searchParams.get('all') === '1';

    let isAdmin = false;
    try {
      const session = await getServerSession(authOptions);
      isAdmin = Boolean(session?.user);
    } catch (err) {
      // Public calendar must still work if auth session lookup fails.
      console.error('[api/events] session lookup failed', err);
    }

    const where: {
      published?: boolean;
      startsAt?: { gte?: Date; lte?: Date };
    } = {};

    if (!isAdmin || !all) where.published = true;
    if (from || to) {
      where.startsAt = {};
      if (from) where.startsAt.gte = new Date(from);
      if (to) where.startsAt.lte = new Date(to);
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startsAt: 'asc' },
    });

    return NextResponse.json({ events });
  } catch (err) {
    console.error('[api/events] GET failed', err);
    // Soft-fail for the public calendar: empty list beats a hard 500.
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
  const event = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      startsAt: new Date(data.startsAt),
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      imageUrl: normalizeImageUrl(data.imageUrl),
      published: data.published ?? true,
    },
  });

  return NextResponse.json({ event }, { status: 201 });
}
