import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

const TABLE = '"LIMIT_CHARGE_MODULE"."LimitRules"';
const INTERVAL_TABLE = '"LIMIT_CHARGE_MODULE"."LimitRuleIntervals"';
const CATEGORY_MAP_TABLE = '"LIMIT_CHARGE_MODULE"."LimitRuleCustomerCategories"';
const SERVICE_MAP_TABLE = '"LIMIT_CHARGE_MODULE"."LimitRuleServices"';

function normalizeCategoryIds(rawCategoryIds: unknown, rawCategoryId: unknown): string[] {
  const fromArray = Array.isArray(rawCategoryIds)
    ? rawCategoryIds
        .map((value) => String(value || '').trim())
        .filter((value) => value.length > 0)
    : [];

  if (fromArray.length > 0) {
    return Array.from(new Set(fromArray));
  }

  const fallback = String(rawCategoryId || '').trim();
  return fallback ? [fallback] : [];
}

function normalizeServiceNames(rawServiceNames: unknown): string[] {
  const fromArray = Array.isArray(rawServiceNames)
    ? rawServiceNames
        .map((value) => String(value || '').trim())
        .filter((value) => value.length > 0)
    : [];

  return Array.from(new Set(fromArray));
}

function parseDateTime(value: unknown): string | null {
  const normalized = String(value || '').trim();
  return normalized ? normalized : null;
}

export async function GET() {
  const session = await requirePermission(PERMISSIONS.LIMITS_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const query = `
      SELECT
        lr."Id" as "id",
        lr."CustomerCategoryId" as "customerCategoryId",
        lr."TransactionTypeId" as "transactionTypeId",
        cc."Name" as "category",
        (
          SELECT LISTAGG(map."CustomerCategoryId", ',') WITHIN GROUP (ORDER BY map."CustomerCategoryId")
          FROM ${CATEGORY_MAP_TABLE} map
          WHERE map."LimitRuleId" = lr."Id"
        ) as "categoryIdsCsv",
        (
          SELECT LISTAGG(cat."Name", ', ') WITHIN GROUP (ORDER BY cat."Name")
          FROM ${CATEGORY_MAP_TABLE} map
          JOIN "LIMIT_CHARGE_MODULE"."CustomerCategories" cat ON map."CustomerCategoryId" = cat."Id"
          WHERE map."LimitRuleId" = lr."Id"
        ) as "categories",
        tt."Name" as "transactionType",
        lr."ServiceName" as "serviceName",
        lr."LimitAggregationType" as "limitAggregationType",
        (
          SELECT LISTAGG(svc."ServiceName", ',') WITHIN GROUP (ORDER BY svc."ServiceName")
          FROM ${SERVICE_MAP_TABLE} svc
          WHERE svc."LimitRuleId" = lr."Id"
        ) as "serviceNamesCsv",
        (
          SELECT LISTAGG(svc."ServiceName", ', ') WITHIN GROUP (ORDER BY svc."ServiceName")
          FROM ${SERVICE_MAP_TABLE} svc
          WHERE svc."LimitRuleId" = lr."Id"
        ) as "serviceGroupDisplay",
        lr."IsGlobal" as "isGlobal",
        lr."Currency" as "currency",
        lr."EffectiveFrom" as "effectiveFrom",
        lr."EffectiveTo" as "effectiveTo",
        lr."PerTransactionLimit" as "perTransactionLimit",
        (SELECT li."LimitAmount" FROM "LIMIT_CHARGE_MODULE"."LimitRuleIntervals" li JOIN "LIMIT_CHARGE_MODULE"."PeriodIntervals" pi ON li."PeriodIntervalId" = pi."Id" WHERE li."LimitRuleId" = lr."Id" AND pi."Name" = 'Daily') as "dailyLimit",
        (SELECT li."LimitAmount" FROM "LIMIT_CHARGE_MODULE"."LimitRuleIntervals" li JOIN "LIMIT_CHARGE_MODULE"."PeriodIntervals" pi ON li."PeriodIntervalId" = pi."Id" WHERE li."LimitRuleId" = lr."Id" AND pi."Name" = 'Weekly') as "weeklyLimit",
        (SELECT li."LimitAmount" FROM "LIMIT_CHARGE_MODULE"."LimitRuleIntervals" li JOIN "LIMIT_CHARGE_MODULE"."PeriodIntervals" pi ON li."PeriodIntervalId" = pi."Id" WHERE li."LimitRuleId" = lr."Id" AND pi."Name" = 'Monthly') as "monthlyLimit"
      FROM ${TABLE} lr
      LEFT JOIN "LIMIT_CHARGE_MODULE"."CustomerCategories" cc ON lr."CustomerCategoryId" = cc."Id"
      LEFT JOIN "LIMIT_CHARGE_MODULE"."TransactionTypes" tt ON lr."TransactionTypeId" = tt."Id"
      WHERE lr."IsActive" = 1
      ORDER BY cc."Name", tt."Name"`;

    const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);

    if (!result.rows) return NextResponse.json([]);

    return NextResponse.json(
      result.rows.map((row: any) => {
        const categoryIds = row.categoryIdsCsv
          ? String(row.categoryIdsCsv)
              .split(',')
              .map((value: string) => value.trim())
              .filter(Boolean)
          : row.customerCategoryId
            ? [String(row.customerCategoryId)]
            : [];

        const serviceNames = row.serviceNamesCsv
          ? String(row.serviceNamesCsv)
              .split(',')
              .map((value: string) => value.trim())
              .filter(Boolean)
          : [];

        const limitAggregationType = row.limitAggregationType || 'PER_SERVICE';

        return {
          id: row.id,
          customerCategoryId: row.customerCategoryId,
          customerCategoryIds: categoryIds,
          categories: categoryIds.length > 0 ? row.categories || row.category || 'All Categories' : 'All Categories',
          transactionTypeId: row.transactionTypeId,
          transactionType: row.transactionType || 'All Types',
          serviceName: row.serviceName,
          limitAggregationType,
          serviceNames,
          serviceGroupDisplay:
            limitAggregationType === 'SERVICE_GROUP'
              ? row.serviceGroupDisplay || '-'
              : row.serviceName || '-',
          isGlobal: row.isGlobal === 1,
          currency: row.currency || 'ETB',
          effectiveFrom: row.effectiveFrom,
          effectiveTo: row.effectiveTo,
          perTransactionLimit: row.perTransactionLimit ?? null,
          dailyLimit: row.dailyLimit || 0,
          weeklyLimit: row.weeklyLimit || 0,
          monthlyLimit: row.monthlyLimit || 0,
        };
      })
    );
  } catch (error) {
    console.error('Failed to fetch limit rules:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await requirePermission(PERMISSIONS.LIMITS_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const {
      categoryIds,
      categoryId,
      transactionTypeId,
      serviceName,
      serviceNames,
      limitAggregationType,
      isGlobal,
      currency,
      effectiveFrom,
      effectiveTo,
      limits,
      perTransactionLimit,
    } = await req.json();

    const resolvedCategoryIds = normalizeCategoryIds(categoryIds, categoryId);
    const resolvedAggregationType = limitAggregationType === 'SERVICE_GROUP' ? 'SERVICE_GROUP' : 'PER_SERVICE';
    const resolvedServiceNames = resolvedAggregationType === 'SERVICE_GROUP' ? normalizeServiceNames(serviceNames) : [];
    const limitRuleId = crypto.randomUUID();

    const ruleQuery = `
      INSERT INTO ${TABLE} (
        "Id", "CustomerCategoryId", "TransactionTypeId", "ServiceName", "LimitAggregationType", "IsGlobal", "Currency", "EffectiveFrom", "EffectiveTo", "PerTransactionLimit", "IsActive", "InsertDate", "Version"
      )
      VALUES (
        :Id, :CustomerCategoryId, :TransactionTypeId, :ServiceName, :LimitAggregationType, :IsGlobal, :Currency,
        CASE WHEN :EffectiveFrom IS NOT NULL THEN TO_TIMESTAMP(:EffectiveFrom, 'YYYY-MM-DD"T"HH24:MI') ELSE NULL END,
        CASE WHEN :EffectiveTo IS NOT NULL THEN TO_TIMESTAMP(:EffectiveTo, 'YYYY-MM-DD"T"HH24:MI') ELSE NULL END,
        :PerTransactionLimit, 1, SYSTIMESTAMP, SUBSTR(RAWTOHEX(SYS_GUID()), 1, 8)
      )
    `;

    await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, ruleQuery, {
      Id: limitRuleId,
      CustomerCategoryId: resolvedCategoryIds[0] || null,
      TransactionTypeId: transactionTypeId || null,
      ServiceName: resolvedAggregationType === 'PER_SERVICE' ? serviceName || null : null,
      LimitAggregationType: resolvedAggregationType,
      IsGlobal: isGlobal ? 1 : 0,
      Currency: currency || 'ETB',
      EffectiveFrom: parseDateTime(effectiveFrom),
      EffectiveTo: parseDateTime(effectiveTo),
      PerTransactionLimit: perTransactionLimit ? parseFloat(perTransactionLimit) : null,
    });

    for (const customerCategoryId of resolvedCategoryIds) {
      const mapQuery = `
        INSERT INTO ${CATEGORY_MAP_TABLE} ("Id", "LimitRuleId", "CustomerCategoryId", "InsertDate", "UpdateDate", "InsertUser", "UpdateUser", "Version")
        VALUES (SYS_GUID(), :LimitRuleId, :CustomerCategoryId, SYSTIMESTAMP, SYSTIMESTAMP, 'system', 'system', SUBSTR(RAWTOHEX(SYS_GUID()), 1, 8))
      `;
      await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, mapQuery, {
        LimitRuleId: limitRuleId,
        CustomerCategoryId: customerCategoryId,
      });
    }

    if (resolvedAggregationType === 'SERVICE_GROUP') {
      for (const service of resolvedServiceNames) {
        const serviceQuery = `
          INSERT INTO ${SERVICE_MAP_TABLE} ("Id", "LimitRuleId", "ServiceName", "InsertDate", "UpdateDate", "InsertUser", "UpdateUser", "Version")
          VALUES (SYS_GUID(), :LimitRuleId, :ServiceName, SYSTIMESTAMP, SYSTIMESTAMP, 'system', 'system', SUBSTR(RAWTOHEX(SYS_GUID()), 1, 8))
        `;
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, serviceQuery, {
          LimitRuleId: limitRuleId,
          ServiceName: service,
        });
      }
    }

    for (const intervalId in limits) {
      if (Object.prototype.hasOwnProperty.call(limits, intervalId)) {
        const entry = limits[intervalId];
        const amount = typeof entry === 'object' ? entry.amount : entry;
        if (amount !== null && amount !== '') {
          const intervalQuery = `INSERT INTO ${INTERVAL_TABLE} ("Id", "LimitRuleId", "PeriodIntervalId", "LimitAmount", "Currency", "InsertDate", "Version") VALUES (SYS_GUID(), :LimitRuleId, :PeriodIntervalId, :LimitAmount, :Currency, SYSTIMESTAMP, SUBSTR(RAWTOHEX(SYS_GUID()), 1, 8))`;
          await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, intervalQuery, {
            LimitRuleId: limitRuleId,
            PeriodIntervalId: intervalId,
            LimitAmount: parseFloat(amount),
            Currency: currency || 'ETB',
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Limit rule created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Failed to create limit rule:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await requirePermission(PERMISSIONS.LIMITS_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const {
      id,
      categoryIds,
      categoryId,
      transactionTypeId,
      serviceName,
      serviceNames,
      limitAggregationType,
      isGlobal,
      currency,
      effectiveFrom,
      effectiveTo,
      limits,
      perTransactionLimit,
    } = await req.json();

    const resolvedCategoryIds = normalizeCategoryIds(categoryIds, categoryId);
    const resolvedAggregationType = limitAggregationType === 'SERVICE_GROUP' ? 'SERVICE_GROUP' : 'PER_SERVICE';
    const resolvedServiceNames = resolvedAggregationType === 'SERVICE_GROUP' ? normalizeServiceNames(serviceNames) : [];

    const ruleQuery = `
      UPDATE ${TABLE} SET
        "CustomerCategoryId" = :CustomerCategoryId,
        "TransactionTypeId" = :TransactionTypeId,
        "ServiceName" = :ServiceName,
        "LimitAggregationType" = :LimitAggregationType,
        "IsGlobal" = :IsGlobal,
        "Currency" = :Currency,
        "EffectiveFrom" = CASE WHEN :EffectiveFrom IS NOT NULL THEN TO_TIMESTAMP(:EffectiveFrom, 'YYYY-MM-DD"T"HH24:MI') ELSE NULL END,
        "EffectiveTo" = CASE WHEN :EffectiveTo IS NOT NULL THEN TO_TIMESTAMP(:EffectiveTo, 'YYYY-MM-DD"T"HH24:MI') ELSE NULL END,
        "PerTransactionLimit" = :PerTransactionLimit,
        "UpdateDate" = SYSTIMESTAMP
      WHERE "Id" = :Id
    `;
    await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, ruleQuery, {
      Id: id,
      CustomerCategoryId: resolvedCategoryIds[0] || null,
      TransactionTypeId: transactionTypeId || null,
      ServiceName: resolvedAggregationType === 'PER_SERVICE' ? serviceName || null : null,
      LimitAggregationType: resolvedAggregationType,
      IsGlobal: isGlobal ? 1 : 0,
      Currency: currency || 'ETB',
      EffectiveFrom: parseDateTime(effectiveFrom),
      EffectiveTo: parseDateTime(effectiveTo),
      PerTransactionLimit: perTransactionLimit ? parseFloat(perTransactionLimit) : null,
    });

    await executeQuery(
      process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
      `DELETE FROM ${CATEGORY_MAP_TABLE} WHERE "LimitRuleId" = :id`,
      { id }
    );
    for (const customerCategoryId of resolvedCategoryIds) {
      const mapQuery = `
        INSERT INTO ${CATEGORY_MAP_TABLE} ("Id", "LimitRuleId", "CustomerCategoryId", "InsertDate", "UpdateDate", "InsertUser", "UpdateUser", "Version")
        VALUES (SYS_GUID(), :LimitRuleId, :CustomerCategoryId, SYSTIMESTAMP, SYSTIMESTAMP, 'system', 'system', SUBSTR(RAWTOHEX(SYS_GUID()), 1, 8))
      `;
      await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, mapQuery, {
        LimitRuleId: id,
        CustomerCategoryId: customerCategoryId,
      });
    }

    await executeQuery(
      process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
      `DELETE FROM ${SERVICE_MAP_TABLE} WHERE "LimitRuleId" = :id`,
      { id }
    );
    if (resolvedAggregationType === 'SERVICE_GROUP') {
      for (const service of resolvedServiceNames) {
        const serviceQuery = `
          INSERT INTO ${SERVICE_MAP_TABLE} ("Id", "LimitRuleId", "ServiceName", "InsertDate", "UpdateDate", "InsertUser", "UpdateUser", "Version")
          VALUES (SYS_GUID(), :LimitRuleId, :ServiceName, SYSTIMESTAMP, SYSTIMESTAMP, 'system', 'system', SUBSTR(RAWTOHEX(SYS_GUID()), 1, 8))
        `;
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, serviceQuery, {
          LimitRuleId: id,
          ServiceName: service,
        });
      }
    }

    await executeQuery(
      process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
      `DELETE FROM ${INTERVAL_TABLE} WHERE "LimitRuleId" = :Id`,
      { Id: id }
    );

    for (const intervalId in limits) {
      if (Object.prototype.hasOwnProperty.call(limits, intervalId)) {
        const entry = limits[intervalId];
        const amount = typeof entry === 'object' ? entry.amount : entry;
        if (amount !== null && amount !== '') {
          const intervalQuery = `INSERT INTO ${INTERVAL_TABLE} ("Id", "LimitRuleId", "PeriodIntervalId", "LimitAmount", "Currency", "InsertDate", "Version") VALUES (SYS_GUID(), :LimitRuleId, :PeriodIntervalId, :LimitAmount, :Currency, SYSTIMESTAMP, SUBSTR(RAWTOHEX(SYS_GUID()), 1, 8))`;
          await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, intervalQuery, {
            LimitRuleId: id,
            PeriodIntervalId: intervalId,
            LimitAmount: parseFloat(amount),
            Currency: currency || 'ETB',
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Limit rule updated successfully' });
  } catch (error) {
    console.error('Failed to update limit rule:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await requirePermission(PERMISSIONS.LIMITS_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const { id } = await req.json();
    const query = `DELETE FROM ${TABLE} WHERE "Id" = :Id`;
    await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, { Id: id });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete limit rule:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}