
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

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
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (!type) {
        return NextResponse.json({ message: 'Approval type is required' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email;
    if (!sessionEmail) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const requester = await db.user.findUnique({
            where: { email: sessionEmail },
            select: { role: true, branch: true },
        });

        if (!requester) {
            return NextResponse.json({ message: 'User account not found' }, { status: 403 });
        }

        const rows = await db.pendingApproval.findMany({
            where: { 
                type: type,
                status: 'pending'
            },
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
