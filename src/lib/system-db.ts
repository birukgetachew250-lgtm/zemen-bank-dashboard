'server-only';

import { PrismaClient as SystemPrismaClient } from '@prisma/client/system';

const systemPrismaClientSingleton = () => {
  return new SystemPrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
};

declare global {
  var systemDb: undefined | ReturnType<typeof systemPrismaClientSingleton>;
}

export const systemDb = globalThis.systemDb ?? systemPrismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.systemDb = systemDb;
}
