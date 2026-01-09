
import { NextResponse } from 'next/server';
import { systemDb } from '@/lib/system-db';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (!type) {
        return NextResponse.json({ message: 'Approval type is required' }, { status: 400 });
    }

    try {
        const rows = await systemDb.pendingApproval.findMany({
            where: { 
                type: type,
                status: 'pending'
            },
            orderBy: { requestedAt: 'desc' }
        });
        return NextResponse.json(rows);
    } catch (error) {
        console.error(`Failed to fetch pending approvals for type ${type}:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
