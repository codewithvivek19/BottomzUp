import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminEventsClient } from '@/components/admin/AdminEventsClient';
import { getAdminUser } from '@/lib/admin-auth';
import { prisma, safeAdminQuery } from '@/lib/admin-data';

export const metadata: Metadata = {
  title: 'Events admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
  const admin = await getAdminUser();
  if (!admin) redirect('/admin/login');

  const { data: events, error } = await safeAdminQuery(
    'events',
    () => prisma.event.findMany({ orderBy: { startsAt: 'desc' } }),
    []
  );

  return (
    <>
      {error ? (
        <div className="adm-panel" style={{ marginBottom: '1rem' }}>
          <h2>Database unavailable</h2>
          <p>{error}</p>
        </div>
      ) : null}
      <AdminEventsClient
        initialEvents={events.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          startsAt: e.startsAt.toISOString(),
          endsAt: e.endsAt ? e.endsAt.toISOString() : null,
          imageUrl: e.imageUrl,
          published: e.published,
        }))}
      />
    </>
  );
}
