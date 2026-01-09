'server-only';

import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';


declare global {
  var systemDb: PrismaClient | undefined;
}

const libsql = createClient({
  url: process.env.SYSTEM_MODULE_DB_URL!,
});

const adapter = new PrismaLibSQL(libsql);

export const systemDb =
  global.systemDb ||
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.systemDb = systemDb;
}
