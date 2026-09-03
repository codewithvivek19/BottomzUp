import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminCouponClient } from '@/components/admin/AdminCouponClient';
import { getAdminUser } from '@/lib/admin-auth';
import { safeAdminQuery } from '@/lib/admin-data';
import { createCoupon, getLatestCoupon } from '@/lib/data/store';

export const metadata: Metadata = {
  title: 'Coupon admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminCouponPage() {
  const admin = await getAdminUser();
  if (!admin) redirect('/admin/login');

  const { data: coupon, error } = await safeAdminQuery(
    'coupon',
    async () => {
      let row = await getLatestCoupon();
      if (!row) {
        row = await createCoupon({
          code: 'ZUP10',
          discountLabel: '10%',
          headline: 'In-house only',
          note: 'Valid on food. Not stackable with other offers. Ask your server.',
          active: true,
        });
      }
      return row;
    },
    null
  );

  if (!coupon) {
    return (
      <div className="adm-panel">
        <h2>Database unavailable</h2>
        <p>{error || 'Could not load coupon settings.'}</p>
      </div>
    );
  }

  return (
    <AdminCouponClient
      initial={{
        id: coupon.id,
        code: coupon.code,
        discountLabel: coupon.discountLabel,
        headline: coupon.headline,
        note: coupon.note,
        active: coupon.active,
      }}
    />
  );
}
