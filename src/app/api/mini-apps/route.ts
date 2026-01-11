
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, url, logo_url, username, password, encryption_key } = body;

        if (!name || !url || !username || !password || !encryption_key) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        await db.miniApp.create({
            data: {
                name,
                url,
                logo_url: logo_url || `https://picsum.photos/seed/${name}/100/100`,
                username,
                password,
                encryption_key,
            }
        });

        return NextResponse.json({ success: true, message: 'Mini App created successfully' }, { status: 201 });
    } catch (error) {
        console.error('Failed to create mini app:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, name, url, logo_url, username, password, encryption_key } = body;

        if (!id || !name || !url || !username || !password || !encryption_key) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        await db.miniApp.update({
            where: { id },
            data: { name, url, logo_url, username, password, encryption_key },
        });

        return NextResponse.json({ success: true, message: 'Mini App updated successfully' });
    } catch (error: any) {
         if (error.code === 'P2025') {
            return NextResponse.json({ message: 'Mini App not found' }, { status: 404 });
        }
        console.error('Failed to update mini app:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ message: 'Mini App ID is required' }, { status: 400 });
        }
        
        await db.miniApp.delete({ where: { id }});

        return NextResponse.json({ success: true, message: 'Mini App deleted successfully' });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json({ message: 'Mini App not found' }, { status: 404 });
        }
        console.error('Failed to delete mini app:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
