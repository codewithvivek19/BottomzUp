import { PrismaClient } from '@prisma/client';
import { cleanDatabaseUrl } from '@/lib/db-url';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  // Normalize Hostinger-pasted URIs (quotes, # in password, missing pgbouncer=true).
  const url = cleanDatabaseUrl(process.env.DATABASE_URL);
  const direct = cleanDatabaseUrl(process.env.DIRECT_URL);
  if (url) process.env.DATABASE_URL = url;
  if (direct) process.env.DIRECT_URL = direct;

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    ...(url
      ? {
          datasources: {
            db: { url },
          },
        }
      : {}),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
