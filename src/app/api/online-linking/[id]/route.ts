
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

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAnyPermission([
    PERMISSIONS.ONLINE_LINKING_READ,
    PERMISSIONS.ONLINE_LINKING_REVIEW,
    PERMISSIONS.ONLINE_LINKING_APPROVE,
  ]);
  if (session instanceof NextResponse) return session;

  const { id } = params;
  const email = session.user?.email || '';
  const callerBranch = isSuperAdmin(session) ? null : await getCallerBranch(email);

  try {
    // Fetch main record (no BLOBs — use separate /media endpoint)
    const detailQuery = `
      SELECT
        "Id", "Cif", "FullName", "DateOfBirth", "NationalId",
        "Phone", "Email", "HomeBranch",
        "FaydaVerified", "FaydaData",
        "LivenessCheckPassed", "SimilarityScore", "IsMatch",
        "VideoWord", "VideoDurationSeconds", "VideoSizeBytes",
        "SignatureUrl",
        "AccountNumber", "AccountType",
        "Status", "SubmittedAt", "ReviewedAt", "ApprovedAt", "RejectedAt", "RejectionReason",
        "UpdatedAt"
      FROM "APP_CONTROL_MODULE"."OnlineLinking"
      WHERE "Id" = :id
    `;

    const detailResult = await executeQuery(DB, detailQuery, { id });

    if (!detailResult.rows || detailResult.rows.length === 0) {
      return NextResponse.json({ message: 'Request not found' }, { status: 404 });
    }

    const record = detailResult.rows[0] as any;

    // Branch access check
    if (callerBranch && record.HomeBranch !== callerBranch) {
      return NextResponse.json({ message: 'Access denied: different branch' }, { status: 403 });
    }

    // Fetch review history from LinkingReview
    const reviewQuery = `
      SELECT "Id", "ReviewerName", "ReviewerEmail", "Action", "Notes", "ReviewedAt"
      FROM "APP_CONTROL_MODULE"."LinkingReview"
      WHERE "LinkingId" = :id
      ORDER BY "ReviewedAt" ASC
    `;
    const reviewResult = await executeQuery(DB, reviewQuery, { id });

    // Parse FaydaData CLOB if present
    let faydaData: any = null;
    if (record.FaydaData) {
      try { faydaData = JSON.parse(record.FaydaData); } catch { faydaData = record.FaydaData; }
    }

    return NextResponse.json({
      ...record,
      FaydaData: faydaData,
      reviews: reviewResult.rows,
      // Flags for whether media exists (client uses these to show/hide media tabs)
      hasVideo:          Number(record.VideoSizeBytes) > 0,
      hasReferenceImage: true, // assume always present if record exists
      hasProbeImage:     true,
    });
  } catch (err: any) {
    console.error('[OnlineLinking:GET/:id]', err);
    return NextResponse.json({ message: 'Failed to fetch linking request' }, { status: 500 });
  }
}
