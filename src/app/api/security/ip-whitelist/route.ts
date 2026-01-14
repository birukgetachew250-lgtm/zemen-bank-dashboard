
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const whitelist = await db.ipWhitelist.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(whitelist);
    } catch (error) {
        console.error("Failed to fetch IP whitelist:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { cidr, label } = await req.json();
        if (!cidr || !label) {
            return NextResponse.json({ message: 'CIDR range and label are required' }, { status: 400 });
        }
        const newEntry = await db.ipWhitelist.create({
            data: { cidr, label },
        });
        return NextResponse.json(newEntry, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ message: 'This IP range already exists in the whitelist.' }, { status: 409 });
        }
        console.error("Failed to add to IP whitelist:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ message: 'ID is required' }, { status: 400 });
        }
        await db.ipWhitelist.delete({
            where: { id: Number(id) },
        });
        return new Response(null, { status: 204 });
    } catch (error: any) {
         if (error.code === 'P2025') {
            return NextResponse.json({ message: 'Entry not found.' }, { status: 404 });
        }
        console.error("Failed to delete from IP whitelist:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
