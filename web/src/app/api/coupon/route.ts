import { NextResponse } from 'next/server';
import { getActiveCoupon } from '@/lib/data/store';

/** Public: active scratch coupon for the home page. */
export async function GET() {
  try {
    const coupon = await getActiveCoupon();

    if (!coupon) {
      return NextResponse.json({ coupon: null });
    }

    return NextResponse.json({
      coupon: {
        code: coupon.code,
        discountLabel: coupon.discountLabel,
        headline: coupon.headline,
        note: coupon.note,
      },
    });
  } catch (err) {
    console.error('[api/coupon] database unavailable', err);
    return NextResponse.json({ coupon: null, error: 'unavailable' }, { status: 503 });
  }
}
