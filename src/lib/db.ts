'server-only';

import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  console.log(`[db.ts] Initializing Prisma Client. DATABASE_URL: ${process.env.DATABASE_URL}`);
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const db = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;

export { db };
