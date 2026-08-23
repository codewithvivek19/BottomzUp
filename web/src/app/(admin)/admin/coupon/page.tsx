import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminCouponClient } from '@/components/admin/AdminCouponClient';

export const metadata: Metadata = {
  title: 'Coupon admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminCouponPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/admin/login');

  let coupon = await prisma.couponSetting.findFirst({ orderBy: { updatedAt: 'desc' } });
  if (!coupon) {
    coupon = await prisma.couponSetting.create({
      data: {
        code: 'ZUP10',
        discountLabel: '10%',
        headline: 'In-house only',
        note: 'Valid on food. Not stackable with other offers. Ask your server.',
        active: true,
      },
    });
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
