
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { name, industry, logo_url } = await req.json();

        if (!name || !industry) {
            return NextResponse.json({ message: 'Name and industry are required' }, { status: 400 });
        }

        const id = `corp_${crypto.randomUUID()}`;
        const status = 'Active';
        const internet_banking_status = 'Pending';
        const final_logo_url = logo_url || `https://picsum.photos/seed/${id}/40/40`;

        await db.corporate.create({
            data: {
              id,
              name,
              industry,
              status,
              internet_banking_status,
              logo_url: final_logo_url,
            },
        });

        return NextResponse.json({ success: true, message: 'Corporate created successfully', id }, { status: 201 });
    } catch (error) {
        console.error('Failed to create corporate:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
