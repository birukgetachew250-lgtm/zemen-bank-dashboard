
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
    const session = await requirePermission(PERMISSIONS.USERS_READ);
    if (session instanceof NextResponse) return session;

    try {
        const employeeId = params.id;
        if (!employeeId) {
            return NextResponse.json({ message: 'Employee ID is required' }, { status: 400 });
        }
        
        const user = await db.user.findUnique({
            where: { employeeId },
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        const { password, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);

    } catch (error) {
        console.error('Failed to fetch user by employee ID:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
