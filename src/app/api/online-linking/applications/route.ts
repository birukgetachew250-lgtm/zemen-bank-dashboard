import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import { tryOracleQuery } from '@/lib/oracle-db-check';

export const dynamic = 'force-dynamic';

function generateDemoApps() {
  return [
    {
      id: 'app_lk_1', fullName: 'Abebe Kebede', phone: '+251911223344', homeBranch: 'Addis Ababa', 
      status: 'Pending', faydaVerified: true, livenessCheckPassed: true, submittedAt: new Date().toISOString()
    },
    {
      id: 'app_lk_2', fullName: 'Sara Tadesse', phone: '+251922334455', homeBranch: 'Hawassa', 
      status: 'UnderReview', faydaVerified: true, livenessCheckPassed: true, submittedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'app_lk_3', fullName: 'Dawit Mekonnen', phone: '+251933445566', homeBranch: 'Dire Dawa', 
      status: 'Approved', faydaVerified: true, livenessCheckPassed: true, submittedAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];
}

export async function GET(req: Request) {
  const session = await requirePermission(PERMISSIONS.APPROVALS_ACTION);
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status');

  try {
    const cs = process.env.APP_CONTROL_DB_CONNECTION_STRING;
    
    let query = `
      SELECT "Id" AS "id", "FullName" AS "fullName", "Phone" AS "phone", "HomeBranch" AS "homeBranch",
             "Status" AS "status", "FaydaVerified" AS "faydaVerified", "LivenessCheckPassed" AS "livenessCheckPassed",
             "SubmittedAt" AS "submittedAt"
      FROM "APP_CONTROL_MODULE"."OnlineLinking"
    `;
    const binds: any = {};
    
    if (statusFilter) {
      query += ` WHERE "Status" = :status`;
      binds.status = statusFilter;
    }
    query += ` ORDER BY "SubmittedAt" DESC`;

    const { data, isLive } = await tryOracleQuery(cs, query, binds);
    
    // Return demo data if Oracle fails or table doesn't exist
    if (!isLive) {
      let demo = generateDemoApps();
      if (statusFilter) demo = demo.filter(d => d.status === statusFilter);
      return NextResponse.json(demo, { headers: { 'Cache-Control': 'no-store' } });
    }

    // Convert numeric booleans (if Oracle stores them as 0/1) to actual booleans for UI compatibility
    const formattedData = (data || []).map((row: any) => ({
      ...row,
      faydaVerified: row.faydaVerified === 1 || row.faydaVerified === true || row.faydaVerified === 'Y',
      livenessCheckPassed: row.livenessCheckPassed === 1 || row.livenessCheckPassed === true || row.livenessCheckPassed === 'Y'
    }));

    return NextResponse.json(formattedData, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Failed to fetch online linking apps:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await requirePermission(PERMISSIONS.APPROVALS_ACTION);
  if (session instanceof NextResponse) return session;

  try {
    const body = await req.json();
    const cs = process.env.APP_CONTROL_DB_CONNECTION_STRING;
    
    const id = 'app_lk_' + Math.random().toString(36).substr(2, 9);
    
    // Since this is a new table, we attempt to insert. If table doesn't exist, it will throw.
    await executeQuery(cs, `
      INSERT INTO "APP_CONTROL_MODULE"."OnlineLinking" (
        "Id", "FullName", "Phone", "HomeBranch", "Status", "FaydaVerified", "LivenessCheckPassed", "SubmittedAt"
      ) VALUES (
        :id, :fullName, :phone, :homeBranch, :status, :faydaVerified, :livenessCheckPassed, SYSDATE
      )
    `, {
      id,
      fullName: body.fullName,
      phone: body.phone,
      homeBranch: body.homeBranch || 'Main Branch',
      status: 'Pending',
      faydaVerified: body.faydaVerified ? 1 : 0,
      livenessCheckPassed: body.livenessCheckPassed ? 1 : 0
    });

    return NextResponse.json({ id, status: 'Pending' }, { status: 201 });
  } catch (error) {
    console.error('Failed to create linking application:', error);
    return NextResponse.json({ message: 'Failed to save to Oracle. Ensure APP_CONTROL_MODULE.OnlineLinking exists.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await requirePermission(PERMISSIONS.APPROVALS_ACTION);
  if (session instanceof NextResponse) return session;

  try {
    const { id, action, notes, status } = await req.json();
    if (!id || !action || !status) return NextResponse.json({ message: 'id, action, and status are required' }, { status: 400 });

    const reviewer = (session as any).user;
    const reviewerName = reviewer?.name || 'System';
    const reviewerEmail = reviewer?.email || 'system';
    
    const cs = process.env.APP_CONTROL_DB_CONNECTION_STRING;
    
    // Proceed with Oracle update

    // Update status in OnlineLinking table
    let updateQuery = `UPDATE "APP_CONTROL_MODULE"."OnlineLinking" SET "Status" = :status, "UpdatedAt" = SYSDATE`;
    if (status === 'Verified') updateQuery += `, "ReviewedAt" = SYSDATE`;
    if (status === 'Approved') updateQuery += `, "ApprovedAt" = SYSDATE`;
    if (status === 'Rejected') updateQuery += `, "RejectedAt" = SYSDATE, "RejectionReason" = :notes`;
    
    updateQuery += ` WHERE "Id" = :id`;

    const binds: any = { status, id };
    if (status === 'Rejected') binds.notes = notes || null;

    // We can't do true distributed transactions without a stored procedure, but we can execute them sequentially
    await executeQuery(cs, updateQuery, binds);

    const reviewId = 'rev_' + Math.random().toString(36).substr(2, 9);
    await executeQuery(cs, `
      INSERT INTO "APP_CONTROL_MODULE"."LinkingReview" (
        "Id", "LinkingId", "ReviewerName", "ReviewerEmail", "Action", "Notes", "ReviewedAt"
      ) VALUES (
        :reviewId, :linkingId, :reviewerName, :reviewerEmail, :action, :notes, SYSDATE
      )
    `, { reviewId, linkingId: id, reviewerName, reviewerEmail, action, notes: notes || null });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update linking application in Oracle:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
