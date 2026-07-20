'use server-only';

/**
 * db.ts — Oracle-backed database client (replaces Prisma)
 *
 * Exposes a `db` object with the same interface that Prisma used,
 * so existing API routes work without changes.
 *
 * Uses TypeORM Repository pattern under the hood.
 */

import 'reflect-metadata';
import { AppDataSource } from './data-source';
import type { DataSource, Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { randomUUID } from 'crypto';

// ─── Singleton DataSource initializer ───────────────────────────────────────

let _ds: DataSource | null = null;

async function getDS(): Promise<DataSource> {
  if (_ds && _ds.isInitialized) return _ds;
  if (_ds && !_ds.isInitialized) {
    _ds = await _ds.initialize();
    return _ds;
  }
  _ds = await AppDataSource.initialize();
  return _ds;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Oracle stores NUMBER(1) as 0/1; Prisma returns true/false.
 * Normalize booleans when reading from Oracle.
 */
function normalizeBooleans<T extends object>(obj: T): T {
  const result: any = { ...obj };
  for (const key of Object.keys(result)) {
    if (result[key] === 0) result[key] = false;
    else if (result[key] === 1 && typeof result[key] === 'number') {
      // Only flip to boolean if the column is known to be boolean
      // We'll leave numbers as-is and let callers handle it
    }
  }
  return result as T;
}

import { MoreThanOrEqual, LessThanOrEqual, MoreThan, LessThan, In } from 'typeorm';

/** Map Prisma-style `where` to TypeORM `FindOptionsWhere` */
function mapWhere(where: Record<string, any>): FindOptionsWhere<any> {
  const mapped: any = {};
  for (const [key, val] of Object.entries(where)) {
    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      if ('gte' in val) {
        mapped[key] = MoreThanOrEqual(val.gte);
      } else if ('gt' in val) {
        mapped[key] = MoreThan(val.gt);
      } else if ('lte' in val) {
        mapped[key] = LessThanOrEqual(val.lte);
      } else if ('lt' in val) {
        mapped[key] = LessThan(val.lt);
      } else if ('in' in val) {
        mapped[key] = In(val.in);
      } else {
        mapped[key] = val;
      }
    } else {
      mapped[key] = val;
    }
  }
  return mapped;
}

/** Build a generic repository-backed model accessor */
function makeModel<T extends object>(entityName: string) {
  async function repo(): Promise<Repository<T>> {
    const ds = await getDS();
    return ds.getRepository<T>(entityName);
  }

  return {
    async findUnique(args: { where: Record<string, any>; select?: Record<string, boolean> }): Promise<T | null> {
      const r = await repo();
      return r.findOne({ where: mapWhere(args.where) }) ?? null;
    },

    async findFirst(args: { where?: Record<string, any> } = {}): Promise<T | null> {
      const r = await repo();
      return r.findOne({ where: args.where ? mapWhere(args.where) : {} }) ?? null;
    },

    async findMany(args: {
      where?: Record<string, any>;
      orderBy?: Record<string, 'asc' | 'desc'>;
      take?: number;
      skip?: number;
      select?: Record<string, boolean>;
    } = {}): Promise<T[]> {
      const r = await repo();
      const options: FindManyOptions<T> = {};
      if (args.where)   options.where   = mapWhere(args.where) as any;
      if (args.take)    options.take    = args.take;
      if (args.skip)    options.skip    = args.skip;
      if (args.orderBy) {
        const order: any = {};
        for (const [col, dir] of Object.entries(args.orderBy)) {
          order[col] = dir.toUpperCase();
        }
        options.order = order;
      }
      return r.find(options);
    },

    async create(args: { data: Partial<T> }): Promise<T> {
      const r = await repo();
      const entity = r.create(args.data as T);
      return r.save(entity);
    },

    async update(args: { where: Record<string, any>; data: Partial<T> }): Promise<T> {
      const r = await repo();
      const existing = await r.findOne({ where: mapWhere(args.where) });
      if (!existing) throw new Error(`${entityName}: record not found for update`);
      
      // Handle Prisma { increment: 1 } syntax
      const dataToApply: any = { ...args.data };
      for (const key of Object.keys(dataToApply)) {
        if (dataToApply[key] && typeof dataToApply[key] === 'object' && 'increment' in dataToApply[key]) {
          dataToApply[key] = Number((existing as any)[key] || 0) + dataToApply[key].increment;
        }
      }

      const merged = r.merge(existing, dataToApply as T);
      return r.save(merged);
    },

    async delete(args: { where: Record<string, any> }): Promise<T> {
      const r = await repo();
      const existing = await r.findOne({ where: mapWhere(args.where) });
      if (!existing) throw new Error(`${entityName}: record not found for delete`);
      await r.remove(existing);
      return existing;
    },

    async deleteMany(args: { where: Record<string, any> }): Promise<{ count: number }> {
      const r = await repo();
      const result = await r.delete(mapWhere(args.where) as any);
      return { count: result.affected ?? 0 };
    },

    async upsert(args: {
      where: Record<string, any>;
      update: Partial<T>;
      create: Partial<T>;
    }): Promise<T> {
      const r = await repo();
      const existing = await r.findOne({ where: mapWhere(args.where) });
      if (existing) {
        const merged = r.merge(existing, args.update as T);
        return r.save(merged);
      } else {
        const entity = r.create(args.create as T);
        return r.save(entity);
      }
    },

    async count(args: { where?: Record<string, any> } = {}): Promise<number> {
      const r = await repo();
      return r.count({ where: args.where ? mapWhere(args.where) : {} } as FindManyOptions<T>);
    },
  };
}

// ─── Audit middleware ─────────────────────────────────────────────────────────

const MUTATION_OPS = new Set(['create', 'update', 'delete', 'deleteMany', 'upsert']);

function withAudit<M extends ReturnType<typeof makeModel>>(model: M, modelName: string): M {
  const wrapped: any = {};

  for (const [op, fn] of Object.entries(model) as [string, Function][]) {
    if (MUTATION_OPS.has(op) && modelName !== 'SystemActivityLog') {
      wrapped[op] = async (args: any) => {
        const start = Date.now();
        try {
          const result = await (fn as Function)(args);
          const elapsed = Date.now() - start;
          // Fire-and-forget audit log
          model;
          db.systemActivityLog.create({
            data: {
              userEmail: 'system',
              action: 'DB_MUTATION',
              status: 'Success',
              details: `${modelName}.${op} (${elapsed}ms)`,
            } as any,
          }).catch(() => {});
          return result;
        } catch (err: any) {
          db.systemActivityLog.create({
            data: {
              userEmail: 'system',
              action: 'DB_MUTATION',
              status: 'Failure',
              details: `${modelName}.${op} failed: ${err.message}`,
            } as any,
          }).catch(() => {});
          throw err;
        }
      };
    } else {
      wrapped[op] = fn;
    }
  }

  return wrapped as M;
}

// ─── The `db` export — drop-in replacement for Prisma's `db` ─────────────────

export const db = {
  user:               withAudit(makeModel('User'),               'User'),
  role:               makeModel('Role'),
  branch:             makeModel('Branch'),
  department:         makeModel('Department'),
  customer:           withAudit(makeModel('Customer'),           'Customer'),
  pendingApproval:    withAudit(makeModel('PendingApproval'),    'PendingApproval'),
  transaction:        makeModel('Transaction'),
  systemActivityLog:  makeModel('SystemActivityLog'),
  passwordHistory:    withAudit(makeModel('PasswordHistory'),    'PasswordHistory'),
  securityPolicy:     withAudit(makeModel('SecurityPolicy'),     'SecurityPolicy'),
  ipWhitelist:        withAudit(makeModel('IpWhitelist'),        'IpWhitelist'),
  otpCode:            withAudit(makeModel('OtpCode'),            'OtpCode'),
  iPSBank:            withAudit(makeModel('IPSBank'),            'IPSBank'),
  iPSWallet:          withAudit(makeModel('IPSWallet'),          'IPSWallet'),
  configBackup:       withAudit(makeModel('ConfigBackup'),       'ConfigBackup'),

  /** Raw query escape hatch — use sparingly */
  async $queryRaw(sql: string, ...params: any[]): Promise<any[]> {
    const ds = await getDS();
    return ds.query(sql, params);
  },
};

// Named alias used by some files
export const prisma = db;
