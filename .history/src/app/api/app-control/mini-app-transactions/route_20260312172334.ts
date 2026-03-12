import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

const CS = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const TABLE = '"APP_CONTROL_MODULE"."MiniAppTransaction"';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const offset = (page - 1) * limit;

    let where = '1=1';
    const binds: any = {};
    if (search) { where += ` AND (t."PhoneNumber" LIKE :s OR t."CIFNumber" LIKE :s OR t."TransactionId" LIKE :s OR t."OriginatorId" LIKE :s)`; binds.s = `%${search}%`; }
    if (status) { where += ` AND t."Status" = :status`; binds.status = parseInt(status); }

    const countQ = `SELECT COUNT(*) AS "total" FROM ${TABLE} t WHERE ${where}`;
    const countR: any = await executeQuery(CS, countQ, binds);
    const total = countR.rows[0]?.total || 0;

    const query = `SELECT t.*, m."Name" AS "MiniAppName" FROM ${TABLE} t LEFT JOIN "APP_CONTROL_MODULE"."MiniApp" m ON t."MiniAppId"=m."Id" WHERE ${where} ORDER BY t."TransactionDate" DESC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
    const result: any = await executeQuery(CS, query, { ...binds, offset, limit });
    return NextResponse.json({ data: result.rows || [], total, page, limit });
  } catch (error) {
    console.error("Failed to fetch mini app transactions:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
