import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

function toBool(val: any, fallback = false): boolean {
  if (val === undefined || val === null) return fallback;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val !== 0;
  const s = String(val).trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'y' || s === 'yes';
}

function getField(row: any, key: string): any {
  if (!row) return undefined;
  if (row[key] !== undefined) return row[key];
  const upper = key.toUpperCase();
  const lower = key.toLowerCase();
  for (const k of Object.keys(row)) {
    if (k === key || k.toUpperCase() === upper || k.toLowerCase() === lower) {
      return row[k];
    }
  }
  return undefined;
}

function normalizeRow(row: any) {
  return {
    id: String(getField(row, 'Id') ?? ''),
    accountClass: String(getField(row, 'AccountClass') ?? ''),
    description: String(getField(row, 'Description') ?? ''),
    accountCode: String(getField(row, 'AccountCode') ?? ''),
    canView: toBool(getField(row, 'CanView'), true),
    canDebit: toBool(getField(row, 'CanDebit'), false),
    isActive: toBool(getField(row, 'IsActive'), true),
    insertDate: getField(row, 'InsertDate')
      ? new Date(getField(row, 'InsertDate')).toISOString()
      : null,
    updateDate: getField(row, 'UpdateDate')
      ? new Date(getField(row, 'UpdateDate')).toISOString()
      : null,
    insertUser: String(getField(row, 'InsertUser') ?? 'system'),
    updateUser: String(getField(row, 'UpdateUser') ?? 'system'),
    linkedAccountsCount: Number(getField(row, 'LinkedAccountsCount') ?? 0),
  };
}

export async function GET() {
  const connStr = process.env.USER_MODULE_DB_CONNECTION_STRING;
  if (!connStr) {
    return NextResponse.json(
      { message: 'USER_MODULE_DB_CONNECTION_STRING is not configured.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }

  try {
    let result: any;
    try {
      const queryWithCount = `
        SELECT
          p."Id",
          p."AccountClass",
          p."Description",
          p."AccountCode",
          p."CanView",
          p."CanDebit",
          p."IsActive",
          p."InsertDate",
          p."UpdateDate",
          p."InsertUser",
          p."UpdateUser",
          (SELECT COUNT(*) FROM "USER_MODULE"."Accounts" a WHERE a."AccountClass" = p."AccountClass") AS "LinkedAccountsCount"
        FROM "USER_MODULE"."AccountClassPermissions" p
        ORDER BY p."AccountClass" ASC
      `;
      result = await executeQuery(connStr, queryWithCount);
    } catch {
      const basicQuery = `
        SELECT
          "Id",
          "AccountClass",
          "Description",
          "AccountCode",
          "CanView",
          "CanDebit",
          "IsActive",
          "InsertDate",
          "UpdateDate",
          "InsertUser",
          "UpdateUser"
        FROM "USER_MODULE"."AccountClassPermissions"
        ORDER BY "AccountClass" ASC
      `;
      result = await executeQuery(connStr, basicQuery);
    }

    const rows = Array.isArray(result?.rows) ? result.rows.map(normalizeRow) : [];
    return NextResponse.json({ data: rows }, { headers: NO_STORE_HEADERS });
  } catch (error: any) {
    console.error('[ACCOUNT_CLASS_PERMISSIONS_GET] Error:', error);
    return NextResponse.json(
      { message: error?.message || 'Failed to fetch Account Class Permissions.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  const connStr = process.env.USER_MODULE_DB_CONNECTION_STRING;
  if (!connStr) {
    return NextResponse.json(
      { message: 'USER_MODULE_DB_CONNECTION_STRING is not configured.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const body = await req.json();
    const accountClass = String(body.accountClass ?? body.AccountClass ?? '')
      .trim()
      .toUpperCase();
    const description = String(body.description ?? body.Description ?? '').trim();
    const accountCode = String(body.accountCode ?? body.AccountCode ?? '').trim();
    const canView = toBool(body.canView ?? body.CanView, true);
    const canDebit = toBool(body.canDebit ?? body.CanDebit, false);
    const isActive = toBool(body.isActive ?? body.IsActive, true);

    if (!accountClass || accountClass.length > 20) {
      return NextResponse.json(
        { message: 'Account Class is required (max 20 characters, e.g. CESB, SPRI, FCCA).' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    if (!description || description.length > 250) {
      return NextResponse.json(
        { message: 'Description is required (max 250 characters).' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    if (!accountCode || accountCode.length > 20) {
      return NextResponse.json(
        { message: 'Account Code is required (max 20 characters, e.g. 117, 11, 79).' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    // Check duplicate AccountClass
    const dupCheck: any = await executeQuery(
      connStr,
      `SELECT COUNT(*) AS "cnt" FROM "USER_MODULE"."AccountClassPermissions" WHERE UPPER("AccountClass") = :AccountClass`,
      { AccountClass: accountClass }
    );
    const dupCount = Number(getField(dupCheck?.rows?.[0], 'cnt') ?? 0);
    if (dupCount > 0) {
      return NextResponse.json(
        { message: `Account Class "${accountClass}" already exists.` },
        { status: 409, headers: NO_STORE_HEADERS }
      );
    }

    const session = await getServerSession(authOptions);
    const actor = String(session?.user?.email || session?.user?.name || 'system').slice(0, 50);
    const id = crypto.randomUUID();

    const insertQuery = `
      INSERT INTO "USER_MODULE"."AccountClassPermissions" (
        "Id",
        "AccountClass",
        "Description",
        "AccountCode",
        "CanView",
        "CanDebit",
        "IsActive",
        "InsertDate",
        "UpdateDate",
        "InsertUser",
        "UpdateUser",
        "Version"
      ) VALUES (
        :Id,
        :AccountClass,
        :Description,
        :AccountCode,
        :CanView,
        :CanDebit,
        :IsActive,
        SYSTIMESTAMP,
        SYSTIMESTAMP,
        :InsertUser,
        :UpdateUser,
        SYS_GUID()
      )
    `;

    await executeQuery(connStr, insertQuery, {
      Id: id,
      AccountClass: accountClass,
      Description: description,
      AccountCode: accountCode,
      CanView: canView ? 1 : 0,
      CanDebit: canDebit ? 1 : 0,
      IsActive: isActive ? 1 : 0,
      InsertUser: actor,
      UpdateUser: actor,
    });

    return NextResponse.json(
      {
        message: `Account Class "${accountClass}" created successfully.`,
        data: {
          id,
          accountClass,
          description,
          accountCode,
          canView,
          canDebit,
          isActive,
          insertUser: actor,
          updateUser: actor,
          insertDate: new Date().toISOString(),
          updateDate: new Date().toISOString(),
          linkedAccountsCount: 0,
        },
      },
      { status: 201, headers: NO_STORE_HEADERS }
    );
  } catch (error: any) {
    console.error('[ACCOUNT_CLASS_PERMISSIONS_POST] Error:', error);
    return NextResponse.json(
      { message: error?.message || 'Failed to create Account Class Permission.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PUT(req: NextRequest) {
  const connStr = process.env.USER_MODULE_DB_CONNECTION_STRING;
  if (!connStr) {
    return NextResponse.json(
      { message: 'USER_MODULE_DB_CONNECTION_STRING is not configured.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const body = await req.json();
    const id = String(body.id ?? body.Id ?? '').trim();
    const accountClass = String(body.accountClass ?? body.AccountClass ?? '')
      .trim()
      .toUpperCase();
    const description = String(body.description ?? body.Description ?? '').trim();
    const accountCode = String(body.accountCode ?? body.AccountCode ?? '').trim();
    const canView = toBool(body.canView ?? body.CanView, true);
    const canDebit = toBool(body.canDebit ?? body.CanDebit, false);
    const isActive = toBool(body.isActive ?? body.IsActive, true);

    if (!id) {
      return NextResponse.json(
        { message: 'Permission record Id is required.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    if (!accountClass || accountClass.length > 20) {
      return NextResponse.json(
        { message: 'Account Class is required (max 20 characters).' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    if (!description || description.length > 250) {
      return NextResponse.json(
        { message: 'Description is required (max 250 characters).' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    if (!accountCode || accountCode.length > 20) {
      return NextResponse.json(
        { message: 'Account Code is required (max 20 characters).' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    // Check duplicate AccountClass on another record
    const dupCheck: any = await executeQuery(
      connStr,
      `SELECT COUNT(*) AS "cnt" FROM "USER_MODULE"."AccountClassPermissions" WHERE UPPER("AccountClass") = :AccountClass AND "Id" <> :Id`,
      { AccountClass: accountClass, Id: id }
    );
    const dupCount = Number(getField(dupCheck?.rows?.[0], 'cnt') ?? 0);
    if (dupCount > 0) {
      return NextResponse.json(
        { message: `Another record with Account Class "${accountClass}" already exists.` },
        { status: 409, headers: NO_STORE_HEADERS }
      );
    }

    const session = await getServerSession(authOptions);
    const actor = String(session?.user?.email || session?.user?.name || 'system').slice(0, 50);

    const updateQuery = `
      UPDATE "USER_MODULE"."AccountClassPermissions"
      SET
        "AccountClass" = :AccountClass,
        "Description" = :Description,
        "AccountCode" = :AccountCode,
        "CanView" = :CanView,
        "CanDebit" = :CanDebit,
        "IsActive" = :IsActive,
        "UpdateDate" = SYSTIMESTAMP,
        "UpdateUser" = :UpdateUser,
        "Version" = SYS_GUID()
      WHERE "Id" = :Id
    `;

    await executeQuery(connStr, updateQuery, {
      AccountClass: accountClass,
      Description: description,
      AccountCode: accountCode,
      CanView: canView ? 1 : 0,
      CanDebit: canDebit ? 1 : 0,
      IsActive: isActive ? 1 : 0,
      UpdateUser: actor,
      Id: id,
    });

    return NextResponse.json(
      {
        message: `Account Class "${accountClass}" updated successfully.`,
        data: {
          id,
          accountClass,
          description,
          accountCode,
          canView,
          canDebit,
          isActive,
          updateUser: actor,
          updateDate: new Date().toISOString(),
        },
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error: any) {
    console.error('[ACCOUNT_CLASS_PERMISSIONS_PUT] Error:', error);
    return NextResponse.json(
      { message: error?.message || 'Failed to update Account Class Permission.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const connStr = process.env.USER_MODULE_DB_CONNECTION_STRING;
  if (!connStr) {
    return NextResponse.json(
      { message: 'USER_MODULE_DB_CONNECTION_STRING is not configured.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id') || '';
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = String(body.id ?? body.Id ?? '').trim();
    }

    if (!id) {
      return NextResponse.json(
        { message: 'Permission record Id is required to delete.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    await executeQuery(
      connStr,
      `DELETE FROM "USER_MODULE"."AccountClassPermissions" WHERE "Id" = :Id`,
      { Id: id }
    );

    return NextResponse.json(
      { message: 'Account Class Permission deleted successfully.' },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error: any) {
    console.error('[ACCOUNT_CLASS_PERMISSIONS_DELETE] Error:', error);
    const isFkError = String(error?.message || '').includes('ORA-02292');
    return NextResponse.json(
      {
        message: isFkError
          ? 'Cannot delete this Account Class because existing customer accounts in USER_MODULE.Accounts reference it. Mark it as Inactive instead.'
          : error?.message || 'Failed to delete Account Class Permission.',
      },
      { status: isFkError ? 409 : 500, headers: NO_STORE_HEADERS }
    );
  }
}
