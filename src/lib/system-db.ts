// src/lib/system-db.ts
'server-only';

import { PrismaClient } from '@prisma/client-system';

// This file is for the second database connection (SYSTEM_MODULE)
// It uses the Prisma client generated into the '@prisma/client-system' directory.

declare global {
  // eslint-disable-next-line no-var
  var systemDb: PrismaClient | undefined;
}

export const systemDb =
  global.systemDb ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.systemDb = systemDb;
}
