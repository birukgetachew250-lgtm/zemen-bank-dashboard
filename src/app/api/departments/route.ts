
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { name, branchId } = await req.json();

        if (!name || !branchId) {
            return NextResponse.json({ message: 'Department name and branch are required' }, { status: 400 });
        }

        const id = `dep_${crypto.randomUUID()}`;
        
        await db.department.create({
            data: { id, name, branchId }
        });

        return NextResponse.json({ success: true, message: 'Department added successfully', id });
    } catch (error) {
        console.error('Failed to add department:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ message: 'Department ID is required' }, { status: 400 });
        }
        
        const department = await db.department.findUnique({
            where: { id },
        });

        if (!department) {
            return NextResponse.json({ message: 'Department not found' }, { status: 404 });
        }

        const userCount = await db.user.count({
            where: { department: department.name },
        });

        if (userCount > 0) {
            return NextResponse.json({ message: `Cannot delete department. It is currently assigned to ${userCount} user(s).` }, { status: 409 });
        }

        await db.department.delete({ where: { id }});

        return NextResponse.json({ success: true, message: 'Department deleted successfully' });
    } catch (error: any) {
        if (error.code === 'P2025') {
             return NextResponse.json({ message: 'Department not found' }, { status: 404 });
        }
        console.error('Failed to delete department:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
