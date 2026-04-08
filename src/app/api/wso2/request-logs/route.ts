import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

const CS = process.env.WSO2_MODULE_DB_CONNECTION_STRING;
const TABLE = '"WSO2_MODULE"."WSO2_REQUEST_LOGS"';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const serviceName = searchParams.get('service');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 1000);

    const conditions: string[] = [];
    const binds: any = {};

    if (status) { conditions.push('STATUS=:status'); binds.status = status; }
    if (serviceName) { conditions.push('SERVICE_NAME=:svcName'); binds.svcName = serviceName; }
    if (from) { conditions.push('CREATED_DATE >= TO_TIMESTAMP(:fromDate,\'YYYY-MM-DD\')'); binds.fromDate = from; }
    if (to) { conditions.push('CREATED_DATE < TO_TIMESTAMP(:toDate,\'YYYY-MM-DD\')+1'); binds.toDate = to; }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result: any = await executeQuery(
      CS,
      `SELECT * FROM (SELECT * FROM ${TABLE} ${where} ORDER BY CREATED_DATE DESC) WHERE ROWNUM <= :lim`,
      { ...binds, lim: limit }
    );

    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('Failed to fetch WSO2 request logs:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
