import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  /**
   * Auth is Supabase Auth (not Prisma User passwords).
   * Create the manager in Supabase Dashboard → Authentication → Users,
   * then set ADMIN_EMAILS to that email (and optionally app_metadata.role=manager).
   */
  const adminEmail = (process.env.ADMIN_EMAIL || process.env.ADMIN_EMAILS || '').split(',')[0]?.trim();
  if (adminEmail) {
    console.log('Manager email allowlist expects:', adminEmail.toLowerCase());
    console.log('Create this user in Supabase Auth if it does not exist yet.');
  } else {
    console.log('Set ADMIN_EMAIL or ADMIN_EMAILS for the manager allowlist.');
  }

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

  console.log(
    'Active coupon:',
    (await prisma.couponSetting.findFirst({ where: { active: true } }))?.code
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
