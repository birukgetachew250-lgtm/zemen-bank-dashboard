import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import { logActivity, type ActivityLogAction } from '@/lib/activity-log';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export const dynamic = 'force-dynamic';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Canonical DB type values and their accepted query parameter aliases
 * so both Maker and Checker queues filter consistently without desync.
 * Note: reset-security-questions has been decommissioned and removed.
 */
const TYPE_SYNONYMS: Record<string, string[]> = {
  'new-customer': ['new-customer'],
  'updated-customer': ['updated-customer', 'update-customer'],
  'update-customer': ['updated-customer', 'update-customer'],
  'customer-account': ['customer-account', 'link-account'],
  'link-account': ['customer-account', 'link-account'],
  'unlink-account': ['unlink-account'],
  'suspend-customer': ['suspend-customer'],
  'unsuspend-customer': ['unsuspend-customer'],
  'unlock-customer': ['unlock-customer'],
  'resend-activation-code': ['resend-activation-code', 'resend-activation'],
  'resend-activation': ['resend-activation-code', 'resend-activation'],
  'pin-reset': ['pin-reset'],
};

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role'); // 'maker' | 'checker' | 'all'
  const statusParam = searchParams.get('status')?.trim(); // 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'all' | null
  const typeParam = searchParams.get('type')?.trim();
  const windowParam = searchParams.get('window')?.trim() || 'active'; // 'active' (default: pending <= 7d) | 'expired' (pending > 7d) | 'archive' | 'all'

  try {
    const where: any = {};

    if (role === 'maker') {
      where.requestedByEmail = session.user.email;
    }

    if (statusParam && statusParam.toLowerCase() !== 'all') {
      where.status = statusParam.toLowerCase();
    }

    const records = await db.pendingApproval.findMany({
      where,
      orderBy: { requestedAt: 'desc' },
      take: 500,
    });

    const allowedTypes =
      typeParam && typeParam !== 'all'
        ? TYPE_SYNONYMS[typeParam] || [typeParam]
        : null;

    const nowMs = Date.now();

    const filteredRecords = records.filter((r: any) => {
      // Exclude decommissioned security question reset requests
      if (
        r.type === 'reset-security-questions' ||
        r.type === 'security-reset'
      ) {
        return false;
      }

      if (allowedTypes && !allowedTypes.includes(r.type)) {
        return false;
      }

      const statusUpper = String(r.status || 'pending').toUpperCase();
      const requestedAtMs = r.requestedAt ? new Date(r.requestedAt).getTime() : nowMs;
      const ageMs = nowMs - requestedAtMs;
      const isOlderThanWeek = ageMs > SEVEN_DAYS_MS;

      if (windowParam === 'expired') {
        // Only unapproved (PENDING) requests older than 7 days
        return statusUpper === 'PENDING' && isOlderThanWeek;
      }

      if (windowParam === 'archive' || windowParam === 'all') {
        // Return all requests (both >7d unapproved and all historical statuses)
        return true;
      }

      // Default 'active' window:
      // Unapproved (PENDING) requests are only visible for 1 week (7 days).
      // Approved, Rejected, and Cancelled requests remain visible in their respective tabs.
      if (statusUpper === 'PENDING' && isOlderThanWeek) {
        return false;
      }
      return true;
    });

    const mapped = filteredRecords.map((r: any) => {
      let parsedDetails: any = {};
      try {
        if (r.details) parsedDetails = JSON.parse(r.details);
      } catch {}

      const statusUpper = (r.status || 'pending').toUpperCase() as
        | 'PENDING'
        | 'APPROVED'
        | 'REJECTED'
        | 'CANCELLED';
      const requestedAtMs = r.requestedAt ? new Date(r.requestedAt).getTime() : nowMs;
      const isExpiredPending =
        statusUpper === 'PENDING' && nowMs - requestedAtMs > SEVEN_DAYS_MS;

      return {
        id: String(r.id),
        type: r.type,
        cif:
          parsedDetails?.cif ||
          parsedDetails?.customerData?.customer_number ||
          parsedDetails?.requestContext?.cif ||
          r.customerName,
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        branchCode:
          parsedDetails?.requestContext?.requesterBranch ||
          parsedDetails?.customerData?.branch ||
          null,
        submittedBy:
          r.requestedByEmail ||
          parsedDetails?.requestContext?.requesterEmail ||
          null,
        submittedAt: r.requestedAt,
        status: statusUpper,
        isExpiredPending,
        rejectedBy:
          parsedDetails?.rejectedBy ||
          parsedDetails?.rejectedByEmail ||
          null,
        rejectedAt: parsedDetails?.rejectedAt || null,
        rejectionReason:
          parsedDetails?.rejectionReason ||
          r.checkerRemarks ||
          parsedDetails?.checkerRemarks ||
          null,
        approvedBy: parsedDetails?.approvedBy || null,
        approvedAt: parsedDetails?.approvedAt || null,
        documents:
          parsedDetails?.documents ||
          parsedDetails?.onboardingData?.documents ||
          [],
        details: parsedDetails,
        attachmentUrl: r.attachmentUrl || null,
      };
    });

    return NextResponse.json(mapped, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error: any) {
    console.error('Failed to fetch approvals:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

const buildApprovalDetails = ({
  cif,
  details,
  requesterBranch,
  requesterEmail,
}: {
  cif: string;
  details?: Record<string, any>;
  requesterBranch?: string | null;
  requesterEmail?: string;
}) => {
  return JSON.stringify({
    cif,
    ...(details || {}),
    requestContext: {
      requesterBranch: requesterBranch || null,
      requesterEmail: requesterEmail || null,
    },
  });
};

const typeToActionMap: Record<string, ActivityLogAction> = {
  'new-customer': 'CUSTOMER_CREATE_REQUESTED',
  'updated-customer': 'CUSTOMER_UPDATE_REQUESTED',
  'suspend-customer': 'CUSTOMER_SUSPEND_REQUESTED',
  'unsuspend-customer': 'CUSTOMER_UNSUSPEND_REQUESTED',
  'unlock-customer': 'CUSTOMER_UNSUSPEND_REQUESTED',
  'resend-activation-code': 'CUSTOMER_RESEND_ACTIVATION_REQUESTED',
  'pin-reset': 'PIN_RESET_REQUESTED',
  'customer-account': 'ACCOUNT_LINK_REQUESTED',
  'unlink-account': 'ACCOUNT_UNLINK_REQUESTED',
};

export async function POST(req: Request) {
  const session = await requirePermission(PERMISSIONS.APPROVALS_REQUEST);
  if (session instanceof NextResponse) return session;

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
  let body: any;

  try {
    body = await req.json();
    const { cif, type, customerName, customerPhone, details } = body;

    if (!cif || !type) {
      return NextResponse.json(
        { message: 'CIF and approval type are required' },
        { status: 400 }
      );
    }

    if (type === 'reset-security-questions' || type === 'security-reset') {
      return NextResponse.json(
        { message: 'Security Question Reset service has been removed.' },
        { status: 410 }
      );
    }

    const sessionEmail = session.user?.email as string;

    const requester = await db.user.findUnique({
      where: { email: sessionEmail },
      select: { branch: true, email: true },
    });

    if (!requester) {
      return NextResponse.json(
        { message: 'Requester account not found' },
        { status: 403 }
      );
    }

    let customer = await db.customer.findFirst({ where: { phone: customerPhone } });

    if (!customer) {
      customer = await db.customer.create({
        data: {
          name: customerName,
          phone: customerPhone,
          status: 'Active',
        },
      });
    }

    const finalDetails = buildApprovalDetails({
      cif,
      details,
      requesterBranch: requester.branch,
      requesterEmail: requester.email,
    });

    await db.pendingApproval.create({
      data: {
        customerId: customer.id,
        type,
        customerName,
        customerPhone,
        details: finalDetails,
        status: 'pending',
        requestedByEmail: session.user?.email || null,
      },
    });

    const logAction = typeToActionMap[type];
    if (logAction) {
      await logActivity({
        userEmail: session?.user?.email || 'system',
        action: logAction,
        status: 'Success',
        details: `Submitted request for ${type} for customer ${customerName} (CIF: ${cif}).`,
        ipAddress: typeof ip === 'string' ? ip : undefined,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Request submitted for approval',
    });
  } catch (error: any) {
    console.error('Failed to create approval request:', error);

    const type = body?.type || 'unknown_request';
    const logAction = typeToActionMap[type] || 'CUSTOMER_UPDATE_REQUESTED';

    await logActivity({
      userEmail: session?.user?.email || 'system',
      action: logAction,
      status: 'Failure',
      details: `Failed to submit request of type '${type}'. Error: ${error.message}`,
      ipAddress: typeof ip === 'string' ? ip : undefined,
    });
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
