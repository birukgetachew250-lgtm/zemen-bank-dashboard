import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { decrypt } from '@/lib/crypto';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function safeQuery(cs: string | undefined, sql: string, binds: Record<string, any> = {}) {
  if (!cs) return { rows: [], isLive: false };
  try {
    const res: any = await executeQuery(cs, sql, binds);
    return { rows: res?.rows || [], isLive: true };
  } catch {
    return { rows: [], isLive: false };
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dataset = (searchParams.get('dataset') || 'transactions').toLowerCase();
  const days = Math.min(Math.max(parseInt(searchParams.get('days') || '30', 10), 1), 365);

  const userCs = process.env.USER_MODULE_DB_CONNECTION_STRING;
  const limitCs = process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING;
  const wso2Cs = process.env.WSO2_MODULE_DB_CONNECTION_STRING;
  const deviceCs = process.env.DEVICE_CONTROL_MODULE_DB_CONNECTION_STRING;
  const migrationCs = process.env.MIGRATION_MODULE_DB_CONNECTION_STRING;

  try {
    if (dataset === 'customers' || dataset === 'users') {
      const { rows, isLive } = await safeQuery(
        userCs,
        `SELECT * FROM (
          SELECT "CIFNumber", "FirstName", "LastName", "Email", "PhoneNumber",
                 "BranchName", "BranchCode", "Nationality", "MobileStatus", "UssdStatus",
                 "Channel", "SignUpMainAuth", "SignUp2FA", "InsertDate"
          FROM "USER_MODULE"."AppUsers"
          WHERE "InsertDate" >= SYSDATE - :days
          ORDER BY "InsertDate" DESC
        ) WHERE ROWNUM <= 1000`,
        { days }
      );
      const formatted = rows.map((r: any) => ({
        CIFNumber: r.CIFNumber,
        FullName: [decrypt(r.FirstName), decrypt(r.LastName)].filter(Boolean).join(' '),
        Email: decrypt(r.Email),
        PhoneNumber: decrypt(r.PhoneNumber),
        BranchName: r.BranchName,
        BranchCode: r.BranchCode,
        Nationality: r.Nationality,
        MobileStatus: r.MobileStatus,
        UssdStatus: r.UssdStatus,
        Channel: r.Channel,
        MFA: r.SignUp2FA || 'None',
        RegisteredAt: r.InsertDate,
      }));
      return NextResponse.json({ dataset, isLive, count: formatted.length, rows: formatted });
    }

    if (dataset === 'accounts') {
      const { rows, isLive } = await safeQuery(
        userCs,
        `SELECT * FROM (
          SELECT "CIFNumber", "AccountNumber", "AccountType", "Currency", "BranchName", "Status", "InsertDate"
          FROM "USER_MODULE"."Accounts"
          ORDER BY "InsertDate" DESC
        ) WHERE ROWNUM <= 1000`
      );
      const formatted = rows.map((r: any) => ({
        CIFNumber: r.CIFNumber,
        AccountNumber: decrypt(r.AccountNumber),
        AccountType: r.AccountType,
        Currency: r.Currency,
        BranchName: r.BranchName,
        Status: r.Status,
        LinkedAt: r.InsertDate,
      }));
      return NextResponse.json({ dataset, isLive, count: formatted.length, rows: formatted });
    }

    if (dataset === 'wso2_logs' || dataset === 'wso2') {
      const clampedDays = Math.min(days, 15);
      const { rows, isLive } = await safeQuery(
        wso2Cs,
        `SELECT * FROM (
          SELECT REQUEST_ID, SERVICE_NAME, HTTP_METHOD, ENDPOINT_URL, HTTP_STATUS_CODE,
                 STATUS, ERROR_CODE, EXECUTION_TIME_MS, INITIATED_BY, REMARKS, CREATED_DATE
          FROM "WSO2_MODULE"."WSO2_REQUEST_LOGS"
          WHERE CREATED_DATE >= SYSTIMESTAMP - NUMTODSINTERVAL(:days, 'DAY')
          ORDER BY CREATED_DATE DESC
        ) WHERE ROWNUM <= 1000`,
        { days: clampedDays }
      );
      return NextResponse.json({ dataset, isLive, count: rows.length, rows });
    }

    if (dataset === 'devices') {
      const { rows, isLive } = await safeQuery(
        deviceCs,
        `SELECT * FROM (
          SELECT "Cif", "DeviceId", "DeviceName", "DeviceModel", "DeviceOs", "DeviceOsVersion",
                 "DeviceType", "AppVersion", "Status", "LastSeenAt", "CreatedAt"
          FROM "DEVICE_CONTROL_MODULE"."CustomerDevices"
          ORDER BY "CreatedAt" DESC
        ) WHERE ROWNUM <= 1000`
      );
      return NextResponse.json({ dataset, isLive, count: rows.length, rows });
    }

    if (dataset === 'ratings' || dataset === 'feedback') {
      const { rows, isLive } = await safeQuery(
        deviceCs,
        `SELECT * FROM (
          SELECT "Cif", "PhoneNumber", "RatingScore", "Comment", "AppVersion",
                 "DeviceOs", "DeviceModel", "Status", "CreatedAt"
          FROM "DEVICE_CONTROL_MODULE"."AppRatings"
          ORDER BY "CreatedAt" DESC
        ) WHERE ROWNUM <= 1000`
      );
      return NextResponse.json({ dataset, isLive, count: rows.length, rows });
    }

    if (dataset === 'migration') {
      const { rows, isLive } = await safeQuery(
        migrationCs,
        `SELECT * FROM (
          SELECT "HostAccountId", "BankworldUsername", "CIFNumber", "FullName",
                 "PhoneNumber", "Email", "BranchCode", "IsMigrated", "MigratedAt", "CreatedAt"
          FROM "MIGRATION_MODULE"."MigrationWhitelists"
          ORDER BY "CreatedAt" DESC
        ) WHERE ROWNUM <= 1000`
      );
      return NextResponse.json({ dataset, isLive, count: rows.length, rows });
    }

    if (dataset === 'approvals' || dataset === 'workflows') {
      const approvals = await db.pendingApproval.findMany({
        orderBy: { requestedAt: 'desc' },
        take: 1000,
      });
      const rows = approvals.map((a: any) => ({
        ID: a.id,
        RequestType: a.type,
        CustomerName: a.customerName,
        CustomerPhone: a.customerPhone,
        Status: a.status,
        SubmittedBy: a.requestedByEmail || 'system',
        CheckerRemarks: a.checkerRemarks || '',
        SubmittedAt: a.requestedAt,
      }));
      return NextResponse.json({ dataset, isLive: true, count: rows.length, rows });
    }

    if (dataset === 'audit_logs' || dataset === 'audit') {
      const logs = await db.systemActivityLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 1000,
      });
      return NextResponse.json({ dataset, isLive: true, count: logs.length, rows: logs });
    }

    // Default: transactions
    const { rows, isLive } = await safeQuery(
      limitCs,
      `SELECT * FROM (
        SELECT t."Id" AS TransactionId, t."CIFNumber", t."CustomerName",
               NVL(tt."Name", t."ServiceName") AS TransactionType,
               t."Amount", t."Currency", NVL(t."TotalCharge", t."FeeAmount") AS Fee,
               t."TransactionStatus" AS Status, t."Channel",
               t."FlexcubeReference", t."ExternalReference", t."TransactionDate"
        FROM "LIMIT_CHARGE_MODULE"."CustomerTransactions" t
        LEFT JOIN "LIMIT_CHARGE_MODULE"."TransactionTypes" tt ON t."TransactionTypeId" = tt."Id"
        WHERE t."TransactionDate" >= SYSDATE - :days
        ORDER BY t."TransactionDate" DESC
      ) WHERE ROWNUM <= 1000`,
      { days }
    );
    return NextResponse.json({ dataset: 'transactions', isLive, count: rows.length, rows });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'Failed to generate export dataset' },
      { status: 500 }
    );
  }
}
