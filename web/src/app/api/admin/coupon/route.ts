import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import { couponUpdateSchema } from '@/lib/coupon-schema';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

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

  return NextResponse.json({ coupon });
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
  let coupon = await prisma.couponSetting.findFirst({ orderBy: { updatedAt: 'desc' } });

  if (!coupon) {
    coupon = await prisma.couponSetting.create({ data });
  } else {
    // Only one active promo for the scratch card: deactivate siblings when activating
    if (data.active) {
      await prisma.couponSetting.updateMany({
        where: { id: { not: coupon.id } },
        data: { active: false },
      });
    }
    coupon = await prisma.couponSetting.update({
      where: { id: coupon.id },
      data: {
        code: data.code.toUpperCase(),
        discountLabel: data.discountLabel,
        headline: data.headline,
        note: data.note,
        active: data.active,
      },
    });
  }

  return NextResponse.json({ coupon });
}
