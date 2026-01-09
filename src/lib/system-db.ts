'server-only';

import { PrismaClient } from '@prisma/client/system';


declare global {
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
