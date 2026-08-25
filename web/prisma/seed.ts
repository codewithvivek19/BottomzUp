import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'manager@bottomzup.local').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'BottomzUp2026!';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name: 'Restaurant Manager' },
    create: { email, passwordHash, name: 'Restaurant Manager' },
  });

  const couponCount = await prisma.couponSetting.count();
  if (couponCount === 0) {
    await prisma.couponSetting.create({
      data: {
        code: 'ZUP10',
        discountLabel: '10%',
        headline: 'In-house only',
        note: 'Valid on food. Not stackable with other offers. Ask your server.',
        active: true,
      },
    });
  }

  const count = await prisma.event.count();
  if (count === 0) {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const mk = (day: number, hour: number) => new Date(y, m, Math.min(day, 28), hour, 0);

    await prisma.event.createMany({
      data: [
        {
          title: 'Wing Wednesday',
          description:
            'Bone-in wings, 10 house sauces. Half-price baskets 5-7pm. Full bar.',
          startsAt: mk(now.getDate() + 1, 17),
          endsAt: new Date(mk(now.getDate() + 1, 17).getTime() + 3 * 60 * 60 * 1000),
          imageUrl: '/legacy/assets/images/venue/venue-9.jpg',
          published: true,
        },
        {
          title: 'Trivia Thursday',
          description:
            'Teams of up to 6. Prizes for top scores. Full bar and wing specials all night. Walk-ins welcome - grab a table early.',
          startsAt: mk(now.getDate() + 3, 19),
          endsAt: new Date(mk(now.getDate() + 3, 19).getTime() + 2 * 60 * 60 * 1000),
          imageUrl: '/legacy/assets/images/venue/venue-6.jpg',
          published: true,
        },
        {
          title: 'Friday Night Smash',
          description:
            'Back Alley Burgers flying off the grill. Walk-ins welcome. Patio open weather permitting.',
          startsAt: mk(now.getDate() + 5, 18),
          endsAt: new Date(mk(now.getDate() + 5, 18).getTime() + 4 * 60 * 60 * 1000),
          imageUrl: '/legacy/assets/images/venue/venue-4.jpg',
          published: true,
        },
        {
          title: 'Live Local Night',
          description:
            'Acoustic sets on the floor, smash burgers on the grill. No cover. Call ahead for larger groups.',
          startsAt: mk(now.getDate() + 10, 17),
          endsAt: new Date(mk(now.getDate() + 10, 17).getTime() + 3 * 60 * 60 * 1000),
          imageUrl: '/legacy/assets/images/venue/venue-2.jpg',
          published: true,
        },
      ],
    });
  }

  console.log('Seeded admin:', email);
  console.log('Active coupon:', (await prisma.couponSetting.findFirst({ where: { active: true } }))?.code);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
