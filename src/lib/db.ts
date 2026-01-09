'server-only';

import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
};

declare global {
  var db: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const db = globalThis.db ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.db = db;

export const prisma = db;
