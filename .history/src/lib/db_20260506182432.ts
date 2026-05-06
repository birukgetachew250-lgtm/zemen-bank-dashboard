
'use server-only';

import { PrismaClient } from '@prisma/client';

const MUTATION_ACTIONS = new Set([
  'create',
  'createMany',
  'update',
  'updateMany',
  'delete',
  'deleteMany',
  'upsert',
]);

const safeStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return '[unserializable-args]';
  }
};

const prismaClientSingleton = () => {
  return new PrismaClient({
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

db.$use(async (params, next) => {
  const model = params.model;
  const action = params.action;
  const isMutation = MUTATION_ACTIONS.has(action);
  const shouldAudit = Boolean(isMutation && model && model !== 'SystemActivityLog');

  if (!shouldAudit) {
    return next(params);
  }

  const startedAt = Date.now();

  try {
    const result = await next(params);
    const elapsedMs = Date.now() - startedAt;

    await db.systemActivityLog.create({
      data: {
        userEmail: 'system',
        action: 'DB_MUTATION',
        status: 'Success',
        details: `${model}.${action} (${elapsedMs}ms) args=${safeStringify(params.args)}`,
      },
    });

    return result;
  } catch (error: any) {
    const elapsedMs = Date.now() - startedAt;

    await db.systemActivityLog.create({
      data: {
        userEmail: 'system',
        action: 'DB_MUTATION',
        status: 'Failure',
        details: `${model}.${action} failed (${elapsedMs}ms): ${error?.message || 'Unknown error'} args=${safeStringify(params.args)}`,
      },
    });

    throw error;
  }
});

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;

export { db };
