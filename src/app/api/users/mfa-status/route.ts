
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

export async function GET() {
    const session = await requirePermission(PERMISSIONS.USERS_READ);
    if (session instanceof NextResponse) return session;

    try {
        const users = await db.user.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                mfaEnabled: true,
            }
        });

        const userStatuses = users.map((user) => ({
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            mfaStatus: user.mfaEnabled ? 'Enrolled' : 'Not Enrolled',
            method: user.mfaEnabled ? 'Email' : 'N/A',
        }));

        return NextResponse.json(userStatuses);

    } catch (error) {
        console.error('Failed to fetch user MFA statuses:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
