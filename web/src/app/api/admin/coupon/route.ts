import { NextRequest, NextResponse } from 'next/server';
import {
  createCoupon,
  deactivateOtherCoupons,
  getLatestCoupon,
  updateCoupon,
} from '@/lib/data/store';
import { requireAdmin } from '@/lib/require-admin';
import { couponUpdateSchema } from '@/lib/coupon-schema';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    let coupon = await getLatestCoupon();
    if (!coupon) {
      coupon = await createCoupon({
        code: 'ZUP10',
        discountLabel: '10%',
        headline: 'In-house only',
        note: 'Valid on food. Not stackable with other offers. Ask your server.',
        active: true,
      });
    }
    return NextResponse.json({ coupon });
  } catch (err) {
    console.error('[api/admin/coupon] GET failed', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'unavailable' },
      { status: 503 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = couponUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  try {
    let coupon = await getLatestCoupon();

    if (!coupon) {
      coupon = await createCoupon({
        code: data.code.toUpperCase(),
        discountLabel: data.discountLabel,
        headline: data.headline,
        note: data.note,
        active: data.active,
      });
    } else {
      if (data.active) {
        await deactivateOtherCoupons(coupon.id);
      }
      coupon = await updateCoupon(coupon.id, {
        code: data.code.toUpperCase(),
        discountLabel: data.discountLabel,
        headline: data.headline,
        note: data.note,
        active: data.active,
      });
    }

    return NextResponse.json({ coupon });
  } catch (err) {
    console.error('[api/admin/coupon] PATCH failed', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'unavailable' },
      { status: 503 }
    );
  }
}
