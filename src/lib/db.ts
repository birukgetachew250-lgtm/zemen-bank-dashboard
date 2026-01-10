
'server-only';

import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const databaseUrl = process.env.IS_PRODUCTION_DB === 'true' 
    ? process.env.DASH_MODULE_PROD_DATABASE_URL 
    : process.env.DASH_MODULE_DEV_DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('Database URL is not set. Please check your .env file for DASH_MODULE_PROD_DATABASE_URL or DASH_MODULE_DEV_DATABASE_URL');
  }

  console.log(`[db.ts] Initializing Prisma Client for ${process.env.IS_PRODUCTION_DB === 'true' ? 'Production' : 'Development'}...`);

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
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
