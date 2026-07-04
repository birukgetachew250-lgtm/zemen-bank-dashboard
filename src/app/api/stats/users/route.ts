import { NextResponse } from 'next/server';
import { tryOracleQuery } from '@/lib/oracle-db-check';

export const dynamic = 'force-dynamic';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function generateDemoUserData() {
  let base = 38000;
  return MONTHS.map((month, i) => {
    const newUsers = Math.floor(800 + Math.random() * 1200 + i * 80);
    base += newUsers;
    return { month, newUsers, activeUsers: Math.floor(base * 0.72), totalUsers: base };
  });
}

export async function GET() {
  const CS = process.env.USER_MODULE_DB_CONNECTION_STRING;

  const { data, isLive } = await tryOracleQuery(CS,
    `SELECT TO_CHAR("CreatedAt", 'Mon') AS month,
            COUNT(*) AS "newUsers",
            SUM(COUNT(*)) OVER (ORDER BY TRUNC("CreatedAt",'MM')) AS "totalUsers"
     FROM "USER_MODULE"."AppUsers"
     WHERE "CreatedAt" >= ADD_MONTHS(SYSDATE, -12)
     GROUP BY TO_CHAR("CreatedAt", 'Mon'), TRUNC("CreatedAt",'MM')
     ORDER BY TRUNC("CreatedAt",'MM') ASC`
  );

  const result = isLive ? data : generateDemoUserData();

  return NextResponse.json({ isLive, data: result }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
