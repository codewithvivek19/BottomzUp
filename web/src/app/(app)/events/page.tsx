import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { EventsCalendar } from '@/components/events/EventsCalendar';
import { EventsHostCta } from '@/components/events/EventsHostCta';
import type { RestaurantEvent } from '@/types/event';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Upcoming nights at Bottomz Up. Tap a highlighted date for details. Host a birthday or private event.',
};

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const rows = await prisma.event.findMany({
    where: { published: true },
    orderBy: { startsAt: 'asc' },
  });

  const initialEvents: RestaurantEvent[] = rows.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    startsAt: e.startsAt.toISOString(),
    endsAt: e.endsAt ? e.endsAt.toISOString() : null,
    imageUrl: e.imageUrl,
    published: e.published,
  }));

  return (
    <section className="ev-page">
      <header className="ev-hero">
        <p className="ev-hero-kicker">Live calendar</p>
        <h1>What&apos;s on at the house</h1>
        <p>Highlighted nights are booked. Tap a date for times, details, and directions.</p>
      </header>
      <EventsCalendar initialEvents={initialEvents} />
      <EventsHostCta />
    </section>
  );
}
