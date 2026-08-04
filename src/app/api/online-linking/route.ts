
'use server';

import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requireAnyPermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import { db } from '@/lib/db';

const DB = process.env.APP_CONTROL_DB_CONNECTION_STRING;

/** Get the branch of the calling admin user */
async function getCallerBranch(email: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { email }, select: { role: true, branch: true } as any });
  return (user as any)?.branch ?? null;
}

function isSuperAdmin(session: any): boolean {
  return session?.user?.role === 'Super Admin' || session?.permissions?.includes('all');
}

export async function GET(req: Request) {
  const session = await requireAnyPermission([
    PERMISSIONS.ONLINE_LINKING_READ,
    PERMISSIONS.ONLINE_LINKING_REVIEW,
    PERMISSIONS.ONLINE_LINKING_APPROVE,
  ]);
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';
  const page   = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit  = Math.min(100, parseInt(searchParams.get('limit') || '20', 10));
  const offset = (page - 1) * limit;

  const email = session.user?.email || '';
  const callerBranch = isSuperAdmin(session) ? null : await getCallerBranch(email);

  try {
    // Build WHERE clause
    const conditions: string[] = [];
    const binds: Record<string, any> = { rowLimit: limit, rowOffset: offset };

    if (status) {
      conditions.push('"Status" = :status');
      binds.status = status;
    }
    if (search) {
      conditions.push('(UPPER("FullName") LIKE UPPER(:search) OR "Cif" LIKE :searchCif OR "Phone" LIKE :searchPhone)');
      binds.search = `%${search}%`;
      binds.searchCif = `%${search}%`;
      binds.searchPhone = `%${search}%`;
    }
    if (callerBranch) {
      conditions.push('"HomeBranch" = :branch');
      binds.branch = callerBranch;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const listQuery = `
      SELECT
        "Id", "Cif", "FullName", "Phone", "Email", "HomeBranch",
        "AccountNumber", "AccountType",
        "FaydaVerified", "LivenessCheckPassed", "SimilarityScore", "IsMatch",
        "Status", "SubmittedAt", "ReviewedAt", "ApprovedAt", "RejectedAt", "RejectionReason",
        "VideoWord", "VideoDurationSeconds", "VideoSizeBytes",
        "SignatureUrl"
      FROM "APP_CONTROL_MODULE"."OnlineLinking"
      ${where}
      ORDER BY "SubmittedAt" DESC
      OFFSET :rowOffset ROWS FETCH NEXT :rowLimit ROWS ONLY
    `;

    const countQuery = `
      SELECT COUNT(*) AS "total"
      FROM "APP_CONTROL_MODULE"."OnlineLinking"
      ${where}
    `;

    const { rowLimit, rowOffset, ...countBinds } = binds;

    const [listResult, countResult] = await Promise.all([
      executeQuery(DB, listQuery, binds),
      executeQuery(DB, countQuery, countBinds),
    ]);

    return NextResponse.json({
      data:  listResult.rows,
      total: (countResult.rows[0] as any)?.total ?? 0,
      page,
      limit,
    });
  } catch (err: any) {
    console.error('[OnlineLinking:GET]', err);
    return NextResponse.json({ message: 'Failed to fetch linking requests' }, { status: 500 });
  }
}
