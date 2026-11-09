import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const extractRequesterBranch = (details?: string | null): string | null => {
  if (!details) return null;

  try {
    const parsed = JSON.parse(details);
    return parsed?.requestContext?.requesterBranch || parsed?.customerData?.branch || null;
  } catch {
    return null;
  }
};

export async function GET(req: Request) {
  const session = await requirePermission(PERMISSIONS.APPROVALS_ACTION);
  if (session instanceof NextResponse) return session;
  const sessionEmail = session.user?.email || '';

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (!type) {
    return NextResponse.json({ message: 'Approval type is required' }, { status: 400 });
  }

  if (type === 'reset-security-questions' || type === 'security-reset') {
    return NextResponse.json([]);
  }

  try {
    const requester = await db.user.findUnique({
      where: { email: sessionEmail },
      select: { role: true, branch: true },
    });

    if (!requester) {
      return NextResponse.json({ message: 'User account not found' }, { status: 403 });
    }

    const statusParam = searchParams.get('status') || 'pending';
    const windowParam = searchParams.get('window') || 'active';

    const whereClause: any = { type };
    if (statusParam !== 'all') {
      whereClause.status = statusParam;
    }

    const rows = await db.pendingApproval.findMany({
      where: whereClause,
      orderBy: { requestedAt: 'desc' },
    });

    const nowMs = Date.now();
    const withinWindowRows = rows.filter((row: any) => {
      const statusLower = String(row.status || 'pending').toLowerCase();
      if (statusLower === 'pending' && windowParam === 'active') {
        const reqMs = row.requestedAt ? new Date(row.requestedAt).getTime() : nowMs;
        return nowMs - reqMs <= SEVEN_DAYS_MS;
      }
      return true;
    });

    const enrichRow = (row: any) => {
      let parsed: any = {};
      try {
        if (row.details) parsed = JSON.parse(row.details);
      } catch {}
      return {
        ...row,
        cif:
          parsed?.cif ||
          parsed?.customerData?.customer_number ||
          parsed?.requestContext?.cif ||
          null,
        rejectionReason:
          parsed?.rejectionReason ||
          row.checkerRemarks ||
          parsed?.checkerRemarks ||
          null,
        rejectedBy: parsed?.rejectedBy || parsed?.rejectedByEmail || null,
        rejectedAt: parsed?.rejectedAt || null,
        approvedBy: parsed?.approvedBy || null,
        approvedAt: parsed?.approvedAt || null,
      };
    };

    if (requester.role === 'Super Admin') {
      return NextResponse.json(withinWindowRows.map(enrichRow));
    }

    if (!requester.branch) {
      return NextResponse.json([]);
    }

    const filteredRows = withinWindowRows
      .filter((row: any) => extractRequesterBranch(row.details) === requester.branch)
      .map(enrichRow);

    return NextResponse.json(filteredRows);
  } catch (error) {
    console.error(`Failed to fetch pending approvals for type ${type}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
