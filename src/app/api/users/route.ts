
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { logActivity } from '@/lib/activity-log';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

    try {
        const { employeeId, name, email, password, role, branch, department } = await req.json();

        if (!employeeId || !name || !email || !password || !role || !department) {
            return NextResponse.json({ message: 'All fields except branch are required' }, { status: 400 });
        }
        
        if (!email.endsWith('@zemenbank.com')) {
            return NextResponse.json({ message: 'Email must be a @zemenbank.com address' }, { status: 400 });
        }

        const existingUserByEmail = await db.user.findUnique({ where: { email } });
        if (existingUserByEmail) {
            return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
        }

        const existingUserByEmployeeId = await db.user.findUnique({ where: { employeeId } });
        if (existingUserByEmployeeId) {
            return NextResponse.json({ message: 'User with this Employee ID already exists' }, { status: 409 });
        }

        const newUser = await db.user.create({
            data: {
                employeeId, name, email, password, role, branch, department
            }
        });
        
        await logActivity({
            userEmail: session?.user?.email || 'system',
            action: 'USER_CREATED',
            status: 'Success',
            details: `Created new user: ${email} (Role: ${role})`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });

        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json({ success: true, message: 'User created successfully', user: userWithoutPassword }, { status: 201 });

    } catch (error) {
        console.error('Failed to create user:', error);
         await logActivity({
            userEmail: session?.user?.email || 'system',
            action: 'USER_CREATED',
            status: 'Failure',
            details: `Failed to create user. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }
        
        const user = await db.user.findUnique({ where: { id: parseInt(id, 10) } });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        if (user?.employeeId === 'admin001') {
            return NextResponse.json({ message: 'Cannot delete the default admin user' }, { status: 403 });
        }

        await db.user.delete({ where: { id: parseInt(id, 10) } });

        await logActivity({
            userEmail: session?.user?.email || 'system',
            action: 'USER_DELETED',
            status: 'Success',
            details: `Deleted user: ${user.email}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });

        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('Failed to delete user:', error);
        await logActivity({
            userEmail: session?.user?.email || 'system',
            action: 'USER_DELETED',
            status: 'Failure',
            details: `Failed to delete user. Error: ${error.message || 'Unknown error'}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });

        if (error.code === 'P2025') {
             return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
