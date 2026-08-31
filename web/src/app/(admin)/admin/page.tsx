import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { parseJsonArray } from '@/lib/lead-schema';
import { getAdminUser } from '@/lib/admin-auth';
import { prisma, safeAdminQuery } from '@/lib/admin-data';

export const metadata: Metadata = {
  title: 'Admin dashboard',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const admin = await getAdminUser();
  if (!admin) redirect('/admin/login');

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const bundle = await safeAdminQuery(
    'dashboard',
    async () => {
      const [newLeads, weekLeads, liveEvents, upcoming, recentLeads, coupon] = await Promise.all([
        prisma.lead.count({ where: { status: 'new' } }),
        prisma.lead.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.event.count({ where: { published: true } }),
        prisma.event.findMany({
          where: { published: true, startsAt: { gte: now } },
          orderBy: { startsAt: 'asc' },
          take: 5,
        }),
        prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
        prisma.couponSetting.findFirst({ where: { active: true }, orderBy: { updatedAt: 'desc' } }),
      ]);
      return { newLeads, weekLeads, liveEvents, upcoming, recentLeads, coupon };
    },
    {
      newLeads: 0,
      weekLeads: 0,
      liveEvents: 0,
      upcoming: [] as Awaited<ReturnType<typeof prisma.event.findMany>>,
      recentLeads: [] as Awaited<ReturnType<typeof prisma.lead.findMany>>,
      coupon: null as Awaited<ReturnType<typeof prisma.couponSetting.findFirst>>,
    }
  );

  const { newLeads, weekLeads, liveEvents, upcoming, recentLeads, coupon } = bundle.data;
  const dbError = bundle.error;

  return (
    <div className="adm-dash">
      {dbError ? (
        <div className="adm-panel" style={{ marginBottom: '1rem', borderColor: 'rgba(180,60,40,0.35)' }}>
          <h2 style={{ marginBottom: '0.35rem' }}>Database unavailable</h2>
          <p style={{ color: '#5c5650', lineHeight: 1.45 }}>{dbError}</p>
          <p style={{ color: '#5c5650', lineHeight: 1.45, marginTop: '0.5rem' }}>
            Signed in as <strong>{admin.email}</strong>. Fix Hostinger env + redeploy, then refresh.
          </p>
        </div>
      ) : null}
      <div className="adm-stats">
        <Link href="/admin/leads?status=new" className="adm-stat adm-stat-link">
          <span className="adm-stat-label">New leads</span>
          <strong className="adm-stat-value">{newLeads}</strong>
          <span className="adm-stat-hint">Needs a reply</span>
        </Link>
        <div className="adm-stat">
          <span className="adm-stat-label">This week</span>
          <strong className="adm-stat-value">{weekLeads}</strong>
          <span className="adm-stat-hint">Form submissions</span>
        </div>
        <Link href="/admin/events" className="adm-stat adm-stat-link">
          <span className="adm-stat-label">Live events</span>
          <strong className="adm-stat-value">{liveEvents}</strong>
          <span className="adm-stat-hint">On the public calendar</span>
        </Link>
        <Link href="/admin/coupon" className="adm-stat adm-stat-link">
          <span className="adm-stat-label">Scratch code</span>
          <strong className="adm-stat-value adm-stat-code">{coupon?.code || 'Off'}</strong>
          <span className="adm-stat-hint">{coupon?.active ? coupon.discountLabel + ' off' : 'Hidden on home'}</span>
        </Link>
      </div>

      <div className="adm-dash-grid">
        <section className="adm-panel">
          <div className="adm-panel-head">
            <h2>Inbox</h2>
            <Link href="/admin/leads">Open leads</Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="adm-empty">No contact or catering requests yet.</p>
          ) : (
            <ul className="adm-feed">
              {recentLeads.map((lead) => {
                const bundles = parseJsonArray(lead.bundlesJson);
                const items = parseJsonArray(lead.itemsJson);
                const summary =
                  lead.type === 'catering'
                    ? [
                        lead.guests ? `${lead.guests} guests` : null,
                        lead.eventDate || null,
                        bundles.length ? `${bundles.length} packages` : null,
                        items.length ? `${items.length} items` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')
                    : lead.topic || (lead.message ? lead.message.slice(0, 72) : 'Contact');
                return (
                  <li key={lead.id}>
                    <Link href={`/admin/leads?focus=${lead.id}`} className="adm-feed-row">
                      <span className={`adm-type-badge is-${lead.type}`}>
                        {lead.type === 'catering' ? 'Catering' : 'Contact'}
                      </span>
                      <span className="adm-feed-body">
                        <strong>{lead.name}</strong>
                        <span>{summary}</span>
                      </span>
                      <span className="adm-feed-meta">
                        <span className={`adm-status is-${lead.status}`}>{lead.status}</span>
                        <span>{format(lead.createdAt, 'MMM d')}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="adm-panel">
          <div className="adm-panel-head">
            <h2>Coming up</h2>
            <Link href="/admin/events">Edit events</Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="adm-empty">No upcoming published nights. Add one in Events.</p>
          ) : (
            <ul className="adm-feed">
              {upcoming.map((ev) => (
                <li key={ev.id}>
                  <div className="adm-feed-row">
                    <span className="adm-feed-datepill" aria-hidden="true">
                      <span>{format(ev.startsAt, 'MMM')}</span>
                      <strong>{format(ev.startsAt, 'd')}</strong>
                    </span>
                    <span className="adm-feed-body">
                      <strong>{ev.title}</strong>
                      <span>{format(ev.startsAt, 'EEE · h:mm a')}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
