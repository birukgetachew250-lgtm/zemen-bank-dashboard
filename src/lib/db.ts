
'server-only';

import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const databaseUrl = process.env.IS_PRODUCTION_DB === 'true' 
    ? process.env.DASH_MODULE_PROD_DATABASE_URL 
    : process.env.DASH_MODULE_DEV_DATABASE_URL;
  
  const source = databaseUrl ? { url: databaseUrl } : undefined;

  return new PrismaClient({
    datasources: source ? { db: source } : undefined,
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
