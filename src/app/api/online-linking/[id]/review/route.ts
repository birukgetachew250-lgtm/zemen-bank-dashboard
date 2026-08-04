
'use server';

import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

const DB = process.env.APP_CONTROL_DB_CONNECTION_STRING;

function isSuperAdmin(session: any): boolean {
  return session?.user?.role === 'Super Admin' || session?.permissions?.includes('all');
}

async function getCallerBranch(email: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { email }, select: { role: true, branch: true } as any });
  return (user as any)?.branch ?? null;
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requirePermission(PERMISSIONS.ONLINE_LINKING_REVIEW);
  if (session instanceof NextResponse) return session;

  const { id } = params;
  const email = session.user?.email || '';
  const callerBranch = isSuperAdmin(session) ? null : await getCallerBranch(email);

  try {
    const body = await req.json();
    const notes = (body.notes || '').trim();

    // 1. Fetch the request
    const fetchQuery = `
      SELECT "Id", "Status", "HomeBranch"
      FROM "APP_CONTROL_MODULE"."OnlineLinking"
      WHERE "Id" = :id
    `;
    const fetchResult = await executeQuery(DB, fetchQuery, { id });

    if (!fetchResult.rows || fetchResult.rows.length === 0) {
      return NextResponse.json({ message: 'Request not found' }, { status: 404 });
    }

    const record = fetchResult.rows[0] as any;

    // 2. Branch check
    if (callerBranch && record.HomeBranch !== callerBranch) {
      return NextResponse.json({ message: 'Access denied: different branch' }, { status: 403 });
    }

    // 3. Status must be Pending
    if (record.Status !== 'Pending') {
      return NextResponse.json({
        message: `Cannot review: request status is "${record.Status}". Only Pending requests can be reviewed.`,
      }, { status: 409 });
    }

    // 4. Update status to Reviewed
    const updateQuery = `
      UPDATE "APP_CONTROL_MODULE"."OnlineLinking"
      SET "Status" = 'Reviewed', "ReviewedAt" = CURRENT_TIMESTAMP, "UpdatedAt" = CURRENT_TIMESTAMP
      WHERE "Id" = :id
    `;
    await executeQuery(DB, updateQuery, { id });

    // 5. Create audit record in LinkingReview
    const reviewId = randomUUID();
    const reviewerName = session.user?.name || email;
    const insertReview = `
      INSERT INTO "APP_CONTROL_MODULE"."LinkingReview"
        ("Id", "LinkingId", "ReviewerName", "ReviewerEmail", "Action", "Notes", "ReviewedAt")
      VALUES (:id, :linkingId, :reviewerName, :reviewerEmail, :action, :notes, CURRENT_TIMESTAMP)
    `;
    await executeQuery(DB, insertReview, {
      id: reviewId,
      linkingId: id,
      reviewerName,
      reviewerEmail: email,
      action: 'Reviewed',
      notes: notes || null,
    });

    return NextResponse.json({
      success: true,
      message: 'Request has been reviewed and moved to the approval queue.',
    });
  } catch (err: any) {
    console.error('[OnlineLinking:review]', err);
    return NextResponse.json({ message: err.message || 'Failed to submit review' }, { status: 500 });
  }
}
