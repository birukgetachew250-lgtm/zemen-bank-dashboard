
'use server';

import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requireAnyPermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import { db } from '@/lib/db';

const DB = process.env.APP_CONTROL_DB_CONNECTION_STRING;

function isSuperAdmin(session: any): boolean {
  return session?.user?.role === 'Super Admin' || session?.permissions?.includes('all');
}

async function getCallerBranch(email: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { email }, select: { role: true, branch: true } as any });
  return (user as any)?.branch ?? null;
}

export async function GET(req: Request) {
  const session = await requireAnyPermission([
    PERMISSIONS.ONLINE_LINKING_READ,
    PERMISSIONS.ONLINE_LINKING_REVIEW,
    PERMISSIONS.ONLINE_LINKING_APPROVE,
  ]);
  if (session instanceof NextResponse) return session;

  const email = session.user?.email || '';
  const callerBranch = isSuperAdmin(session) ? null : await getCallerBranch(email);

  try {
    const branchFilter = callerBranch ? `WHERE "HomeBranch" = '${callerBranch.replace(/'/g, "''")}'` : '';

    const query = `
      SELECT
        "Status",
        COUNT(*) AS "count"
      FROM "APP_CONTROL_MODULE"."OnlineLinking"
      ${branchFilter}
      GROUP BY "Status"
    `;

    const result = await executeQuery(DB, query);

    const stats: Record<string, number> = {
      Pending:  0,
      Reviewed: 0,
      Approved: 0,
      Rejected: 0,
      total:    0,
    };

    for (const row of (result.rows as any[])) {
      const s = row.Status || row.STATUS;
      const c = Number(row.count || row.COUNT || 0);
      if (s in stats) stats[s] = c;
      stats.total += c;
    }

    return NextResponse.json(stats);
  } catch (err: any) {
    console.error('[OnlineLinking:stats]', err);
    return NextResponse.json({ message: 'Failed to fetch stats' }, { status: 500 });
  }
}
