
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { name, location } = await req.json();

        if (!name || !location) {
            return NextResponse.json({ message: 'Branch name and location are required' }, { status: 400 });
        }

        const id = `br_${crypto.randomUUID()}`;
        
        await db.branch.create({
            data: { id, name, location }
        });

        return NextResponse.json({ success: true, message: 'Branch added successfully', id });
    } catch (error) {
        console.error('Failed to add branch:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ message: 'Branch ID is required' }, { status: 400 });
        }

        await db.branch.delete({ where: { id }});

        return NextResponse.json({ success: true, message: 'Branch deleted successfully' });
    } catch (error: any) {
        if (error.code === 'P2025') {
             return NextResponse.json({ message: 'Branch not found' }, { status: 404 });
        }
        console.error('Failed to delete branch:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
