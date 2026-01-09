'server-only';

import { PrismaClient as SystemPrismaClient } from '@prisma/client';

declare global {
  var systemDb: SystemPrismaClient | undefined;
}

export const systemDb =
  global.systemDb ||
  new SystemPrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.systemDb = systemDb;
}
