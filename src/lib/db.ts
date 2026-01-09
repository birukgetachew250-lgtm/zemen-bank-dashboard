'server-only';

import { PrismaClient } from '@prisma/client';

// =================================================================
// DATABASE (Prisma)
// =================================================================
// Prisma is used for ALL database interactions in this application.
// It connects to the database specified by DASH_MODULE_DATABASE_URL (for dev)
// or DASH_PROD_MODULE_DATABASE_URL (for prod) in .env.
// This single client manages all models: User, Role, etc.
// The main dashboard data (customers, transactions) is assumed to come from a
// separate local SQLite DB for demo purposes.

// This prevents us from making too many connections to the database in development.
declare global {
  // eslint-disable-next-line no-var
  var db: PrismaClient | undefined;
}

export const db =
  global.db ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.db = db;
}

// For backward compatibility with any raw query code that might still exist,
// we can export prisma client with its original name.
export const prisma = db;
