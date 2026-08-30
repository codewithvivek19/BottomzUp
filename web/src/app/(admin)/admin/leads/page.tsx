import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { parseJsonArray } from '@/lib/lead-schema';
import { AdminLeadsClient } from '@/components/admin/AdminLeadsClient';
import { getAdminUser } from '@/lib/admin-auth';

export const metadata: Metadata = {
  title: 'Leads admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage() {
  const admin = await getAdminUser();
  if (!admin) redirect('/admin/login');

  const rows = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  const initialLeads = rows.map((l) => ({
    id: l.id,
    type: l.type,
    name: l.name,
    email: l.email,
    phone: l.phone,
    topic: l.topic,
    preferred: l.preferred,
    message: l.message,
    eventDate: l.eventDate,
    guests: l.guests,
    eventType: l.eventType,
    notes: l.notes,
    items: parseJsonArray(l.itemsJson),
    bundles: parseJsonArray(l.bundlesJson),
    status: l.status,
    source: l.source,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <Suspense fallback={<p className="adm-empty">Loading leads…</p>}>
      <AdminLeadsClient initialLeads={initialLeads} />
    </Suspense>
  );
}
