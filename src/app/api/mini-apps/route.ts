
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

        const id = `mapp_${crypto.randomUUID()}`;
        db.prepare(
            'INSERT INTO mini_apps (id, name, url, logo_url, username, password, encryption_key) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(id, name, url, logo_url, username, password, encryption_key);

        return NextResponse.json({ success: true, message: 'Mini App created successfully', id }, { status: 201 });
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

        const result = db.prepare(
            'UPDATE mini_apps SET name = ?, url = ?, logo_url = ?, username = ?, password = ?, encryption_key = ? WHERE id = ?'
        ).run(name, url, logo_url, username, password, encryption_key, id);

        if (result.changes === 0) {
            return NextResponse.json({ message: 'Mini App not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Mini App updated successfully' });
    } catch (error) {
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

        const result = db.prepare('DELETE FROM mini_apps WHERE id = ?').run(id);

        if (result.changes === 0) {
            return NextResponse.json({ message: 'Mini App not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Mini App deleted successfully' });
    } catch (error) {
        console.error('Failed to delete mini app:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
