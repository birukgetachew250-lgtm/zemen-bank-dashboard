
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

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

    try {
        const requester = await db.user.findUnique({
            where: { email: sessionEmail },
            select: { role: true, branch: true },
        });

        if (!requester) {
            return NextResponse.json({ message: 'User account not found' }, { status: 403 });
        }

        const statusParam = searchParams.get('status') || 'pending';

        const whereClause: any = { type: type };
        if (statusParam !== 'all') {
            whereClause.status = statusParam;
        }

        const rows = await db.pendingApproval.findMany({
            where: whereClause,
            orderBy: { requestedAt: 'desc' }
        });

        if (requester.role === 'Super Admin') {
            return NextResponse.json(rows);
        }

        if (!requester.branch) {
            return NextResponse.json([]);
        }

        const filteredRows = rows.filter((row) => extractRequesterBranch(row.details) === requester.branch);
        return NextResponse.json(filteredRows);
    } catch (error) {
        console.error(`Failed to fetch pending approvals for type ${type}:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
