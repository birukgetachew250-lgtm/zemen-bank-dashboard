'server-only';

import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

declare global {
  var db: PrismaClient | undefined;
}

const libsql = createClient({
  url: process.env.DASH_PROD_MODULE_DATABASE_URL!,
});

const adapter = new PrismaLibSQL(libsql);

export const db =
  global.db ||
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.db = db;
}

export const prisma = db;
