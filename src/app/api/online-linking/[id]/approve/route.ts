
'use server';

import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { encrypt } from '@/lib/crypto';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';
import { randomUUID } from 'crypto';
import crypto from 'crypto';

const DB      = process.env.APP_CONTROL_DB_CONNECTION_STRING;
const USER_DB = process.env.USER_MODULE_DB_CONNECTION_STRING;

function isSuperAdmin(session: any): boolean {
  return session?.user?.role === 'Super Admin' || session?.permissions?.includes('all');
}

async function getCallerBranch(email: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { email }, select: { role: true, branch: true } as any });
  return (user as any)?.branch ?? null;
}

const hashSha256 = (value: string): string => {
  return crypto.createHash('sha256').update(value.trim()).digest('hex');
};

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requirePermission(PERMISSIONS.ONLINE_LINKING_APPROVE);
  if (session instanceof NextResponse) return session;

  const { id } = params;
  const email  = session.user?.email || '';
  const ip     = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
  const callerBranch = isSuperAdmin(session) ? null : await getCallerBranch(email);

  let reqAction = 'action';
  try {
    const body = await req.json();
    reqAction = body.action; // 'approve' | 'reject'
    const notes           = (body.notes || '').trim();
    const rejectionReason = (body.rejectionReason || '').trim();

    if (!reqAction || !['approve', 'reject'].includes(reqAction)) {
      return NextResponse.json({ message: 'Invalid action. Must be "approve" or "reject".' }, { status: 400 });
    }

    // 1. Fetch request
    const fetchQuery = `
      SELECT "Id", "Cif", "FullName", "Phone", "Email", "HomeBranch",
             "AccountNumber", "AccountType",
             "Status"
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

    // 3. Status must be Reviewed
    if (record.Status !== 'Reviewed') {
      return NextResponse.json({
        message: `Cannot ${reqAction}: request status is "${record.Status}". Only Reviewed requests can be actioned.`,
      }, { status: 409 });
    }

    // 4. Maker-checker: approver must NOT be the reviewer
    const reviewQuery = `
      SELECT "ReviewerEmail"
      FROM "APP_CONTROL_MODULE"."LinkingReview"
      WHERE "LinkingId" = :id AND "Action" = 'Reviewed'
      ORDER BY "ReviewedAt" DESC
      FETCH FIRST 1 ROW ONLY
    `;
    const reviewResult = await executeQuery(DB, reviewQuery, { id });
    const reviewerEmail = (reviewResult.rows?.[0] as any)?.ReviewerEmail;

    if (reviewerEmail && reviewerEmail === email) {
      return NextResponse.json({
        message: 'Maker-Checker violation: the reviewer and approver must be different users.',
      }, { status: 403 });
    }

    // ── REJECT ──
    if (reqAction === 'reject') {
      const rejectUpdate = `
        UPDATE "APP_CONTROL_MODULE"."OnlineLinking"
        SET "Status" = 'Rejected',
            "RejectedAt" = CURRENT_TIMESTAMP,
            "RejectionReason" = :reason,
            "UpdatedAt" = CURRENT_TIMESTAMP
        WHERE "Id" = :id
      `;
      await executeQuery(DB, rejectUpdate, { id, reason: rejectionReason || notes || 'Rejected by approver' });

      // Audit record
      const reviewId = randomUUID();
      await executeQuery(DB, `
        INSERT INTO "APP_CONTROL_MODULE"."LinkingReview"
          ("Id", "LinkingId", "ReviewerName", "ReviewerEmail", "Action", "Notes", "ReviewedAt")
        VALUES (:id, :linkingId, :reviewerName, :reviewerEmail, :action, :notes, CURRENT_TIMESTAMP)
      `, {
        id: reviewId,
        linkingId: id,
        reviewerName: session.user?.name || email,
        reviewerEmail: email,
        action: 'Rejected',
        notes: rejectionReason || notes || null,
      });

      await logActivity({
        userEmail: email,
        action: 'ONLINE_LINKING_REJECTED' as any,
        status: 'Success',
        details: `Rejected online linking request ${id} for CIF ${record.Cif}. Reason: ${rejectionReason || notes}`,
        ipAddress: typeof ip === 'string' ? ip : undefined,
      });

      return NextResponse.json({ success: true, message: 'Request has been rejected.' });
    }

    // ── APPROVE ──
    // Execute account linking — same logic as `customer-account` in approvals/action/route.ts
    const cif = record.Cif;
    const fullName = (record.FullName || '').trim();
    const nameParts = fullName.split(' ').filter(Boolean);

    if (nameParts.length === 0) {
      return NextResponse.json({ message: 'Invalid customer name for account linking.' }, { status: 400 });
    }

    let firstName: string, secondName = '', lastName: string;
    if (nameParts.length === 1) {
      firstName = nameParts[0];
      lastName  = nameParts[0];
    } else if (nameParts.length === 2) {
      firstName = nameParts[0];
      lastName  = nameParts[1];
    } else {
      firstName  = nameParts[0];
      secondName = nameParts.slice(1, -1).join(' ');
      lastName   = nameParts[nameParts.length - 1];
    }

    const accountNumber = (record.AccountNumber || '').trim();
    const accountType   = (record.AccountType || 'Unknown').trim();

    if (!accountNumber) {
      return NextResponse.json({ message: 'No account number found on this request.' }, { status: 400 });
    }

    // Insert into USER_MODULE.Accounts
    const accountInsert = `
      INSERT INTO "USER_MODULE"."Accounts"
        ("Id", "CIFNumber", "AccountNumber", "HashedAccountNumber",
         "FirstName", "SecondName", "LastName",
         "AccountType", "Currency", "Status", "BranchCode", "BranchName")
      VALUES
        (SYS_GUID(), :CIFNumber, :AccountNumber, :HashedAccountNumber,
         :FirstName, :SecondName, :LastName,
         :AccountType, :Currency, :Status, :BranchCode, :BranchName)
    `;

    await executeQuery(USER_DB, accountInsert, {
      CIFNumber:           cif,
      AccountNumber:       encrypt(accountNumber)!,
      HashedAccountNumber: hashSha256(accountNumber),
      FirstName:           encrypt(firstName)!,
      SecondName:          encrypt(secondName)!,
      LastName:            encrypt(lastName)!,
      AccountType:         encrypt(accountType)!,
      Currency:            encrypt('ETB')!,
      Status:              'Active',
      BranchCode:          record.HomeBranch || '',
      BranchName:          record.HomeBranch || '',
    });

    // Update OnlineLinking status
    const approveUpdate = `
      UPDATE "APP_CONTROL_MODULE"."OnlineLinking"
      SET "Status" = 'Approved',
          "ApprovedAt" = CURRENT_TIMESTAMP,
          "UpdatedAt" = CURRENT_TIMESTAMP
      WHERE "Id" = :id
    `;
    await executeQuery(DB, approveUpdate, { id });

    // Audit record
    const reviewId = randomUUID();
    await executeQuery(DB, `
      INSERT INTO "APP_CONTROL_MODULE"."LinkingReview"
        ("Id", "LinkingId", "ReviewerName", "ReviewerEmail", "Action", "Notes", "ReviewedAt")
      VALUES (:id, :linkingId, :reviewerName, :reviewerEmail, :action, :notes, CURRENT_TIMESTAMP)
    `, {
      id: reviewId,
      linkingId: id,
      reviewerName: session.user?.name || email,
      reviewerEmail: email,
      action: 'Approved',
      notes: notes || null,
    });

    await logActivity({
      userEmail: email,
      action: 'ONLINE_LINKING_APPROVED' as any,
      status: 'Success',
      details: `Approved online linking request ${id}. CIF: ${cif}, Account: ${accountNumber}`,
      ipAddress: typeof ip === 'string' ? ip : undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Account ${accountNumber} has been successfully linked for CIF ${cif}.`,
    });
  } catch (err: any) {
    console.error('[OnlineLinking:approve]', err);
    await logActivity({
      userEmail: email,
      action: 'ONLINE_LINKING_APPROVED' as any,
      status: 'Failure',
      details: `Failed to process online linking ${reqAction} for request ${id}: ${err.message}`,
      ipAddress: typeof ip === 'string' ? ip : undefined,
    }).catch(() => {});
    return NextResponse.json({ message: err.message || 'Failed to process action' }, { status: 500 });
  }
}
