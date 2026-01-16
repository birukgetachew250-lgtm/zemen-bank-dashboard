
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { logActivity } from '@/lib/activity-log';


// GET a single user
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
        }
        
        const user = await db.user.findUnique({
            where: { id },
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        const { password, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);

    } catch (error) {
        console.error('Failed to fetch user:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


// UPDATE a user
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

    try {
        const id = parseInt(params.id, 10);
         if (isNaN(id)) {
            return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
        }
        const { employeeId, name, email, password, role, branch, department } = await req.json();

        const dataToUpdate: any = { employeeId, name, email, role, branch, department };

        if (password) {
            dataToUpdate.password = password; 
        }

        const updatedUser = await db.user.update({
            where: { id },
            data: dataToUpdate,
        });

         await logActivity({
            userEmail: session?.user?.email || 'system',
            action: 'USER_UPDATED',
            status: 'Success',
            details: `Updated user: ${email}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });


        const { password: _, ...userWithoutPassword } = updatedUser;
        return NextResponse.json(userWithoutPassword);

    } catch (error: any) {
        await logActivity({
            userEmail: session?.user?.email || 'system',
            action: 'USER_UPDATED',
            status: 'Failure',
            details: `Failed to update user ID ${params.id}. Error: ${error.message}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });

         if (error.code === 'P2025') {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
             return NextResponse.json({ message: 'Another user with this email already exists.' }, { status: 409 });
        }
        if (error.code === 'P2002' && error.meta?.target?.includes('employeeId')) {
             return NextResponse.json({ message: 'Another user with this Employee ID already exists.' }, { status: 409 });
        }
        console.error('Failed to update user:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
