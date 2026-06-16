import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

const TABLE = '"LIMIT_CHARGE_MODULE"."CustomerLimitUsages"';

const toNumberOrNull = (value: any) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toIntOrNull = (value: any) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const mapUsageRow = (row: any) => ({
  id: row.id,
  cifNumber: row.cifNumber,
  customerCategoryId: row.customerCategoryId,
  customerCategoryName: row.customerCategoryName || null,
  transactionTypeId: row.transactionTypeId,
  transactionTypeName: row.transactionTypeName || null,
  serviceName: row.serviceName,
  currency: row.currency || 'ETB',
  dailyPeriodStart: row.dailyPeriodStart,
  dailyPeriodEnd: row.dailyPeriodEnd,
  dailyAmountUsed: Number(row.dailyAmountUsed || 0),
  dailyTransactionCount: Number(row.dailyTransactionCount || 0),
  weeklyPeriodStart: row.weeklyPeriodStart,
  weeklyPeriodEnd: row.weeklyPeriodEnd,
  weeklyAmountUsed: Number(row.weeklyAmountUsed || 0),
  weeklyTransactionCount: Number(row.weeklyTransactionCount || 0),
  monthlyPeriodStart: row.monthlyPeriodStart,
  monthlyPeriodEnd: row.monthlyPeriodEnd,
  monthlyAmountUsed: Number(row.monthlyAmountUsed || 0),
  monthlyTransactionCount: Number(row.monthlyTransactionCount || 0),
  appliedLimitRuleId: row.appliedLimitRuleId,
  appliedExceptionId: row.appliedExceptionId,
  isActive: row.isActive === 1,
  lastTransactionDate: row.lastTransactionDate,
  lastDailyReset: row.lastDailyReset,
  lastWeeklyReset: row.lastWeeklyReset,
  lastMonthlyReset: row.lastMonthlyReset,
  insertDate: row.insertDate,
  updateDate: row.updateDate,
});

export async function GET() {
  const _authSession = await requirePermission(PERMISSIONS.LIMITS_MANAGE);
  if (_authSession instanceof NextResponse) return _authSession;
  try {
    const query = `
      SELECT
        clu."Id" as "id",
        clu."CIFNumber" as "cifNumber",
        clu."CustomerCategoryId" as "customerCategoryId",
        cc."Name" as "customerCategoryName",
        clu."TransactionTypeId" as "transactionTypeId",
        tt."Name" as "transactionTypeName",
        clu."ServiceName" as "serviceName",
        clu."Currency" as "currency",
        clu."DailyPeriodStart" as "dailyPeriodStart",
        clu."DailyPeriodEnd" as "dailyPeriodEnd",
        clu."DailyAmountUsed" as "dailyAmountUsed",
        clu."DailyTransactionCount" as "dailyTransactionCount",
        clu."WeeklyPeriodStart" as "weeklyPeriodStart",
        clu."WeeklyPeriodEnd" as "weeklyPeriodEnd",
        clu."WeeklyAmountUsed" as "weeklyAmountUsed",
        clu."WeeklyTransactionCount" as "weeklyTransactionCount",
        clu."MonthlyPeriodStart" as "monthlyPeriodStart",
        clu."MonthlyPeriodEnd" as "monthlyPeriodEnd",
        clu."MonthlyAmountUsed" as "monthlyAmountUsed",
        clu."MonthlyTransactionCount" as "monthlyTransactionCount",
        clu."AppliedLimitRuleId" as "appliedLimitRuleId",
        clu."AppliedExceptionId" as "appliedExceptionId",
        clu."IsActive" as "isActive",
        clu."LastTransactionDate" as "lastTransactionDate",
        clu."LastDailyReset" as "lastDailyReset",
        clu."LastWeeklyReset" as "lastWeeklyReset",
        clu."LastMonthlyReset" as "lastMonthlyReset",
        clu."InsertDate" as "insertDate",
        clu."UpdateDate" as "updateDate"
      FROM ${TABLE} clu
      LEFT JOIN "LIMIT_CHARGE_MODULE"."CustomerCategories" cc ON clu."CustomerCategoryId" = cc."Id"
      LEFT JOIN "LIMIT_CHARGE_MODULE"."TransactionTypes" tt ON clu."TransactionTypeId" = tt."Id"
      ORDER BY clu."UpdateDate" DESC, clu."InsertDate" DESC
    `;

    const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
    if (!result.rows) return NextResponse.json([]);

    return NextResponse.json(result.rows.map(mapUsageRow));
  } catch (error) {
    console.error('Failed to fetch customer limit usages:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const _authSession = await requirePermission(PERMISSIONS.LIMITS_MANAGE);
  if (_authSession instanceof NextResponse) return _authSession;
  try {
    const {
      cifNumber,
      customerCategoryId,
      transactionTypeId,
      serviceName,
      currency,
      dailyPeriodStart,
      dailyPeriodEnd,
      dailyAmountUsed,
      dailyTransactionCount,
      weeklyPeriodStart,
      weeklyPeriodEnd,
      weeklyAmountUsed,
      weeklyTransactionCount,
      monthlyPeriodStart,
      monthlyPeriodEnd,
      monthlyAmountUsed,
      monthlyTransactionCount,
      appliedLimitRuleId,
      appliedExceptionId,
      isActive,
      lastTransactionDate,
      lastDailyReset,
      lastWeeklyReset,
      lastMonthlyReset,
    } = await req.json();

    if (!cifNumber || !serviceName || !dailyPeriodStart || !dailyPeriodEnd || !weeklyPeriodStart || !weeklyPeriodEnd || !monthlyPeriodStart || !monthlyPeriodEnd || !lastTransactionDate) {
      return NextResponse.json(
        { message: 'CIF Number, Service Name, period windows, and Last Transaction Date are required.' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const query = `
      INSERT INTO ${TABLE}
      (
        "Id", "CIFNumber", "CustomerCategoryId", "TransactionTypeId", "ServiceName", "Currency",
        "DailyPeriodStart", "DailyPeriodEnd", "DailyAmountUsed", "DailyTransactionCount",
        "WeeklyPeriodStart", "WeeklyPeriodEnd", "WeeklyAmountUsed", "WeeklyTransactionCount",
        "MonthlyPeriodStart", "MonthlyPeriodEnd", "MonthlyAmountUsed", "MonthlyTransactionCount",
        "AppliedLimitRuleId", "AppliedExceptionId", "IsActive",
        "LastTransactionDate", "LastDailyReset", "LastWeeklyReset", "LastMonthlyReset",
        "InsertDate", "UpdateDate", "InsertUser", "UpdateUser"
      )
      VALUES
      (
        :Id, :CIFNumber, :CustomerCategoryId, :TransactionTypeId, :ServiceName, :Currency,
        TO_TIMESTAMP(:DailyPeriodStart, 'YYYY-MM-DD"T"HH24:MI'), TO_TIMESTAMP(:DailyPeriodEnd, 'YYYY-MM-DD"T"HH24:MI'), :DailyAmountUsed, :DailyTransactionCount,
        TO_TIMESTAMP(:WeeklyPeriodStart, 'YYYY-MM-DD"T"HH24:MI'), TO_TIMESTAMP(:WeeklyPeriodEnd, 'YYYY-MM-DD"T"HH24:MI'), :WeeklyAmountUsed, :WeeklyTransactionCount,
        TO_TIMESTAMP(:MonthlyPeriodStart, 'YYYY-MM-DD"T"HH24:MI'), TO_TIMESTAMP(:MonthlyPeriodEnd, 'YYYY-MM-DD"T"HH24:MI'), :MonthlyAmountUsed, :MonthlyTransactionCount,
        :AppliedLimitRuleId, :AppliedExceptionId, :IsActive,
        TO_TIMESTAMP(:LastTransactionDate, 'YYYY-MM-DD"T"HH24:MI'),
        CASE WHEN :LastDailyReset IS NOT NULL THEN TO_TIMESTAMP(:LastDailyReset, 'YYYY-MM-DD"T"HH24:MI') ELSE NULL END,
        CASE WHEN :LastWeeklyReset IS NOT NULL THEN TO_TIMESTAMP(:LastWeeklyReset, 'YYYY-MM-DD"T"HH24:MI') ELSE NULL END,
        CASE WHEN :LastMonthlyReset IS NOT NULL THEN TO_TIMESTAMP(:LastMonthlyReset, 'YYYY-MM-DD"T"HH24:MI') ELSE NULL END,
        SYSTIMESTAMP, SYSTIMESTAMP, :InsertUser, :UpdateUser
      )
    `;

    const binds = {
      Id: id,
      CIFNumber: cifNumber,
      CustomerCategoryId: customerCategoryId || null,
      TransactionTypeId: transactionTypeId || null,
      ServiceName: serviceName,
      Currency: currency || 'ETB',
      DailyPeriodStart: dailyPeriodStart,
      DailyPeriodEnd: dailyPeriodEnd,
      DailyAmountUsed: toNumberOrNull(dailyAmountUsed) ?? 0,
      DailyTransactionCount: toIntOrNull(dailyTransactionCount) ?? 0,
      WeeklyPeriodStart: weeklyPeriodStart,
      WeeklyPeriodEnd: weeklyPeriodEnd,
      WeeklyAmountUsed: toNumberOrNull(weeklyAmountUsed) ?? 0,
      WeeklyTransactionCount: toIntOrNull(weeklyTransactionCount) ?? 0,
      MonthlyPeriodStart: monthlyPeriodStart,
      MonthlyPeriodEnd: monthlyPeriodEnd,
      MonthlyAmountUsed: toNumberOrNull(monthlyAmountUsed) ?? 0,
      MonthlyTransactionCount: toIntOrNull(monthlyTransactionCount) ?? 0,
      AppliedLimitRuleId: appliedLimitRuleId || null,
      AppliedExceptionId: appliedExceptionId || null,
      IsActive: isActive ? 1 : 0,
      LastTransactionDate: lastTransactionDate,
      LastDailyReset: lastDailyReset || null,
      LastWeeklyReset: lastWeeklyReset || null,
      LastMonthlyReset: lastMonthlyReset || null,
      InsertUser: 'system',
      UpdateUser: 'system',
    };

    await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, binds);

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('Failed to create customer limit usage:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const _authSession = await requirePermission(PERMISSIONS.LIMITS_MANAGE);
  if (_authSession instanceof NextResponse) return _authSession;
  try {
    const {
      id,
      cifNumber,
      customerCategoryId,
      transactionTypeId,
      serviceName,
      currency,
      dailyPeriodStart,
      dailyPeriodEnd,
      dailyAmountUsed,
      dailyTransactionCount,
      weeklyPeriodStart,
      weeklyPeriodEnd,
      weeklyAmountUsed,
      weeklyTransactionCount,
      monthlyPeriodStart,
      monthlyPeriodEnd,
      monthlyAmountUsed,
      monthlyTransactionCount,
      appliedLimitRuleId,
      appliedExceptionId,
      isActive,
      lastTransactionDate,
      lastDailyReset,
      lastWeeklyReset,
      lastMonthlyReset,
    } = await req.json();

    if (!id || !cifNumber || !serviceName || !dailyPeriodStart || !dailyPeriodEnd || !weeklyPeriodStart || !weeklyPeriodEnd || !monthlyPeriodStart || !monthlyPeriodEnd || !lastTransactionDate) {
      return NextResponse.json(
        { message: 'ID, CIF Number, Service Name, period windows, and Last Transaction Date are required.' },
        { status: 400 }
      );
    }

    const query = `
      UPDATE ${TABLE}
      SET
        "CIFNumber" = :CIFNumber,
        "CustomerCategoryId" = :CustomerCategoryId,
        "TransactionTypeId" = :TransactionTypeId,
        "ServiceName" = :ServiceName,
        "Currency" = :Currency,
        "DailyPeriodStart" = TO_TIMESTAMP(:DailyPeriodStart, 'YYYY-MM-DD"T"HH24:MI'),
        "DailyPeriodEnd" = TO_TIMESTAMP(:DailyPeriodEnd, 'YYYY-MM-DD"T"HH24:MI'),
        "DailyAmountUsed" = :DailyAmountUsed,
        "DailyTransactionCount" = :DailyTransactionCount,
        "WeeklyPeriodStart" = TO_TIMESTAMP(:WeeklyPeriodStart, 'YYYY-MM-DD"T"HH24:MI'),
        "WeeklyPeriodEnd" = TO_TIMESTAMP(:WeeklyPeriodEnd, 'YYYY-MM-DD"T"HH24:MI'),
        "WeeklyAmountUsed" = :WeeklyAmountUsed,
        "WeeklyTransactionCount" = :WeeklyTransactionCount,
        "MonthlyPeriodStart" = TO_TIMESTAMP(:MonthlyPeriodStart, 'YYYY-MM-DD"T"HH24:MI'),
        "MonthlyPeriodEnd" = TO_TIMESTAMP(:MonthlyPeriodEnd, 'YYYY-MM-DD"T"HH24:MI'),
        "MonthlyAmountUsed" = :MonthlyAmountUsed,
        "MonthlyTransactionCount" = :MonthlyTransactionCount,
        "AppliedLimitRuleId" = :AppliedLimitRuleId,
        "AppliedExceptionId" = :AppliedExceptionId,
        "IsActive" = :IsActive,
        "LastTransactionDate" = TO_TIMESTAMP(:LastTransactionDate, 'YYYY-MM-DD"T"HH24:MI'),
        "LastDailyReset" = CASE WHEN :LastDailyReset IS NOT NULL THEN TO_TIMESTAMP(:LastDailyReset, 'YYYY-MM-DD"T"HH24:MI') ELSE NULL END,
        "LastWeeklyReset" = CASE WHEN :LastWeeklyReset IS NOT NULL THEN TO_TIMESTAMP(:LastWeeklyReset, 'YYYY-MM-DD"T"HH24:MI') ELSE NULL END,
        "LastMonthlyReset" = CASE WHEN :LastMonthlyReset IS NOT NULL THEN TO_TIMESTAMP(:LastMonthlyReset, 'YYYY-MM-DD"T"HH24:MI') ELSE NULL END,
        "UpdateDate" = SYSTIMESTAMP,
        "UpdateUser" = :UpdateUser
      WHERE "Id" = :Id
    `;

    const binds = {
      Id: id,
      CIFNumber: cifNumber,
      CustomerCategoryId: customerCategoryId || null,
      TransactionTypeId: transactionTypeId || null,
      ServiceName: serviceName,
      Currency: currency || 'ETB',
      DailyPeriodStart: dailyPeriodStart,
      DailyPeriodEnd: dailyPeriodEnd,
      DailyAmountUsed: toNumberOrNull(dailyAmountUsed) ?? 0,
      DailyTransactionCount: toIntOrNull(dailyTransactionCount) ?? 0,
      WeeklyPeriodStart: weeklyPeriodStart,
      WeeklyPeriodEnd: weeklyPeriodEnd,
      WeeklyAmountUsed: toNumberOrNull(weeklyAmountUsed) ?? 0,
      WeeklyTransactionCount: toIntOrNull(weeklyTransactionCount) ?? 0,
      MonthlyPeriodStart: monthlyPeriodStart,
      MonthlyPeriodEnd: monthlyPeriodEnd,
      MonthlyAmountUsed: toNumberOrNull(monthlyAmountUsed) ?? 0,
      MonthlyTransactionCount: toIntOrNull(monthlyTransactionCount) ?? 0,
      AppliedLimitRuleId: appliedLimitRuleId || null,
      AppliedExceptionId: appliedExceptionId || null,
      IsActive: isActive ? 1 : 0,
      LastTransactionDate: lastTransactionDate,
      LastDailyReset: lastDailyReset || null,
      LastWeeklyReset: lastWeeklyReset || null,
      LastMonthlyReset: lastMonthlyReset || null,
      UpdateUser: 'system',
    };

    await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, binds);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Failed to update customer limit usage:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const _authSession = await requirePermission(PERMISSIONS.LIMITS_MANAGE);
  if (_authSession instanceof NextResponse) return _authSession;
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    const query = `DELETE FROM ${TABLE} WHERE "Id" = :Id`;
    await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, { Id: id });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete customer limit usage:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
