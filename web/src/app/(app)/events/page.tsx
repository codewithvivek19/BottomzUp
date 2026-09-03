import type { Metadata } from 'next';
import { listEvents } from '@/lib/data/store';
import { EventsCalendar } from '@/components/events/EventsCalendar';
import { EventsHostCta } from '@/components/events/EventsHostCta';
import type { RestaurantEvent } from '@/types/event';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Upcoming nights at Bottomz Up. Tap a highlighted date for details. Host a birthday or private event.',
};

export const dynamic = 'force-dynamic';

async function loadPublishedEvents(): Promise<RestaurantEvent[]> {
  try {
    const rows = await listEvents({ publishedOnly: true });
    return rows.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      startsAt: e.startsAt.toISOString(),
      endsAt: e.endsAt ? e.endsAt.toISOString() : null,
      imageUrl: e.imageUrl,
      published: e.published,
    }));
  } catch (err) {
    console.error('[events] failed to load published events', err);
    return [];
  }
}

export default async function EventsPage() {
  const initialEvents = await loadPublishedEvents();

  return (
    <main className="ev-page" id="main">
      <header className="ev-hero">
        <h1>What&apos;s on at the house</h1>
        <p>
          Highlighted nights are live. Tap a date for times and details, or request a private date below.
        </p>
      </header>
      <EventsCalendar initialEvents={initialEvents} />
      <EventsHostCta />
    </main>
  );
}
