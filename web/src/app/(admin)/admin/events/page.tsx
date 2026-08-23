import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminEventsClient } from '@/components/admin/AdminEventsClient';

export const metadata: Metadata = {
  title: 'Events admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/admin/login');

  const events = await prisma.event.findMany({ orderBy: { startsAt: 'desc' } });

  return (
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
  );
}
