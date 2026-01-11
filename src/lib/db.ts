'server-only';

import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  // The primary DB connection is now determined by whether
  // the production-specific URL is provided.
  const isProd = !!process.env.DASH_MODULE_PROD_DATABASE_URL;

  return new PrismaClient({
    datasources: {
      db: {
        url: isProd 
          ? process.env.DASH_MODULE_PROD_DATABASE_URL 
          : process.env.DATABASE_URL
      }
    },
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
