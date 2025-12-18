
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { employeeId, name, email, password, role, branch, department } = await req.json();

        if (!employeeId || !name || !email || !password || !role || !department) {
            return NextResponse.json({ message: 'All fields except branch are required' }, { status: 400 });
        }
        
        if (department === 'Branch Operations' && !branch) {
             return NextResponse.json({ message: 'Branch is required for users in Branch Operations' }, { status: 400 });
        }

        const existingUserByEmail = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (existingUserByEmail) {
            return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
        }

        const existingUserByEmployeeId = db.prepare('SELECT * FROM users WHERE employeeId = ?').get(employeeId);
        if (existingUserByEmployeeId) {
            return NextResponse.json({ message: 'User with this Employee ID already exists' }, { status: 409 });
        }

        const id = `user_${crypto.randomUUID()}`;

        // In a real app, password should be hashed before storing
        db.prepare(
            'INSERT INTO users (id, employeeId, name, email, password, role, branch, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(id, employeeId, name, email, password, role, branch, department);

        const newUser: any = { id, employeeId, name, email, role, branch, department };

        return NextResponse.json({ success: true, message: 'User created successfully', user: newUser }, { status: 201 });

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
        
        // Prevent deleting the main admin user
        if (id === 'user_ck_admin_001') {
            return NextResponse.json({ message: 'Cannot delete the default admin user' }, { status: 403 });
        }

        const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);

        if (result.changes === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Failed to delete user:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
