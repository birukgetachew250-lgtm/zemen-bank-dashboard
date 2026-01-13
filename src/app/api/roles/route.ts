
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { name, description, permissions } = await req.json();

        if (!name) {
            return NextResponse.json({ message: 'Role name is required' }, { status: 400 });
        }

        // Combine description and permissions for storage in the description field.
        // In a real application, you might have a separate table for permissions.
        const detailedDescription = JSON.stringify({
            main: description,
            permissions: permissions || [],
        });

        const newRole = await db.role.create({
            data: {
                name,
                description: detailedDescription,
            },
        });

        return NextResponse.json(newRole, { status: 201 });
    } catch (error) {
        console.error('Failed to create role:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
