
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { faker } from '@faker-js/faker';

export async function POST(req: Request) {
    try {
        const { name, email, password, branch, department } = await req.json();

        if (!name || !email || !password || !branch || !department) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
        }

        const id = `user_${crypto.randomUUID()}`;
        const avatar_url = faker.image.avatar();

        // In a real app, password should be hashed before storing
        db.prepare(
            'INSERT INTO users (id, name, email, password, avatar_url, branch, department) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(id, name, email, password, avatar_url, branch, department);

        const newUser = { id, name, email, avatar_url, branch, department };

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
