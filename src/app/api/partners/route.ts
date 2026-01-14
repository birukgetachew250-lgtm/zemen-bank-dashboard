
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const partners = await db.partner.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(partners);
    } catch (error) {
        console.error("Failed to fetch partners:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, type, status, logoUrl } = await req.json();
        
        if (!name || !type) {
            return NextResponse.json({ message: 'Partner name and type are required' }, { status: 400 });
        }

        const newPartner = await db.partner.create({
            data: { name, type, status, logoUrl: logoUrl || null }
        });

        return NextResponse.json(newPartner, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ message: 'A partner with this name already exists.' }, { status: 409 });
        }
        console.error("Failed to create partner:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, name, type, status, logoUrl } = await req.json();

        if (!id) {
            return NextResponse.json({ message: 'Partner ID is required for update' }, { status: 400 });
        }
        
        const updatedPartner = await db.partner.update({
            where: { id },
            data: { name, type, status, logoUrl: logoUrl || null }
        });

        return NextResponse.json(updatedPartner);
    } catch (error: any) {
        if (error.code === 'P2025') { // Prisma error code for record not found
            return NextResponse.json({ message: 'Partner not found' }, { status: 404 });
        }
        console.error("Failed to update partner:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ message: 'Partner ID is required' }, { status: 400 });
        }

        await db.partner.delete({
            where: { id }
        });

        return new Response(null, { status: 204 });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json({ message: 'Partner not found' }, { status: 404 });
        }
        console.error("Failed to delete partner:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
