import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

function getDemoApp(id: string) {
  const isPending = id === 'app_lk_1';
  const isReview = id === 'app_lk_2';
  return {
    id,
    fullName: isPending ? 'Abebe Kebede' : isReview ? 'Sara Tadesse' : 'Dawit Mekonnen',
    dateOfBirth: '1990-05-12',
    nationalId: 'Fayda-123456789',
    phone: isPending ? '+251911223344' : isReview ? '+251922334455' : '+251933445566',
    email: isPending ? 'abebe@example.com' : 'sara@example.com',
    homeBranch: isPending ? 'Addis Ababa' : 'Hawassa',
    faydaVerified: true,
    faydaData: JSON.stringify({ fullName: 'Abebe Kebede', gender: 'M', nationality: 'ET' }),
    livenessCheckPassed: true,
    videoUrl: 'https://example.com/demo-video.mp4',
    videoWord: 'Bank',
    signatureUrl: null,
    accountNumber: '1000123456789',
    accountType: 'Savings',
    status: isPending ? 'Pending' : isReview ? 'UnderReview' : 'Approved',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    rejectionReason: null,
    reviews: [
      { id: 'rev_1', reviewerName: 'System Verification', reviewerEmail: 'system', action: 'KYC Validated', notes: 'Automated Fayda and Liveness check passed', reviewedAt: new Date(Date.now() - 86000000).toISOString() }
    ]
  };
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await requirePermission(PERMISSIONS.APPROVALS_ACTION);
  if (session instanceof NextResponse) return session;

  try {
    // Proceed to Oracle DB

    const cs = process.env.APP_CONTROL_DB_CONNECTION_STRING;
    
    const result = await executeQuery(cs, `
      SELECT "Id" AS "id", "FullName" AS "fullName", "DateOfBirth" AS "dateOfBirth", "NationalId" AS "nationalId", 
             "Phone" AS "phone", "Email" AS "email", "HomeBranch" AS "homeBranch",
             "FaydaVerified" AS "faydaVerified", "FaydaData" AS "faydaData",
             "LivenessCheckPassed" AS "livenessCheckPassed", "VideoUrl" AS "videoUrl", "VideoWord" AS "videoWord",
             "SignatureUrl" AS "signatureUrl", "AccountNumber" AS "accountNumber", "AccountType" AS "accountType",
             "Status" AS "status", "SubmittedAt" AS "submittedAt", "RejectionReason" AS "rejectionReason"
      FROM "APP_CONTROL_MODULE"."OnlineLinking"
      WHERE "Id" = :id
    `, { id: params.id });

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    const app = result.rows[0];
    
    const reviewsResult = await executeQuery(cs, `
      SELECT "Id" AS "id", "ReviewerName" AS "reviewerName", "ReviewerEmail" AS "reviewerEmail",
             "Action" AS "action", "Notes" AS "notes", "ReviewedAt" AS "reviewedAt"
      FROM "APP_CONTROL_MODULE"."LinkingReview"
      WHERE "LinkingId" = :id
      ORDER BY "ReviewedAt" ASC
    `, { id: params.id });

    app.faydaVerified = app.faydaVerified === 1 || app.faydaVerified === true || app.faydaVerified === 'Y';
    app.livenessCheckPassed = app.livenessCheckPassed === 1 || app.livenessCheckPassed === true || app.livenessCheckPassed === 'Y';
    app.reviews = reviewsResult.rows || [];

    return NextResponse.json(app, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Failed to fetch linking application:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
