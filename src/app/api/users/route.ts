
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { employeeId, name, email, password, role, branch, department } = await req.json();

        if (!employeeId || !name || !email || !password || !role || !department) {
            return NextResponse.json({ message: 'All fields except branch are required' }, { status: 400 });
        }
        
        // Custom validation for email
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

        // In a real app, password should be securely hashed. Storing as is for this context.
        const newUser = await db.user.create({
            data: {
                employeeId,
                name,
                email,
                password,
                role,
                branch,
                department
            }
        });
        
        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json({ success: true, message: 'User created successfully', user: userWithoutPassword }, { status: 201 });

    } catch (error) {
        console.error('Failed to create user:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }
        
        const user = await db.user.findUnique({ where: { id: parseInt(id, 10) } });
        // Prevent deleting the main admin user (assuming employeeId is stable)
        if (user?.employeeId === 'admin001') {
            return NextResponse.json({ message: 'Cannot delete the default admin user' }, { status: 403 });
        }

        await db.user.delete({ where: { id: parseInt(id, 10) } });

        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('Failed to delete user:', error);
        // Handle case where user is not found
        if (error.code === 'P2025') {
             return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
