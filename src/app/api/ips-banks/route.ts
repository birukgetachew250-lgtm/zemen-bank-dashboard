
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const banks = await db.iPSBank.findMany({
            orderBy: { rank: 'asc' }
        });
        return NextResponse.json(banks);
    } catch (error) {
        console.error("Failed to fetch IPS banks:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { bankName, bankCode, reconciliationAccount, bankLogo, status, rank } = await req.json();
        
        if (!bankName || !bankCode || !reconciliationAccount || !rank) {
            return NextResponse.json({ message: 'Bank Name, Code, Reconciliation Account, and Rank are required' }, { status: 400 });
        }

        const newBank = await db.iPSBank.create({
            data: { 
                bankName, 
                bankCode, 
                reconciliationAccount, 
                bankLogo, 
                status, 
                rank: parseInt(rank, 10) 
            }
        });

        return NextResponse.json(newBank, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ message: 'A bank with this name or code already exists.' }, { status: 409 });
        }
        console.error("Failed to create IPS Bank:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, bankName, bankCode, reconciliationAccount, bankLogo, status, rank } = await req.json();

        if (!id) {
            return NextResponse.json({ message: 'Bank ID is required for update' }, { status: 400 });
        }
        
        const updatedBank = await db.iPSBank.update({
            where: { id },
            data: { 
                bankName, 
                bankCode, 
                reconciliationAccount, 
                bankLogo, 
                status, 
                rank: parseInt(rank, 10) 
            }
        });

        return NextResponse.json(updatedBank);
    } catch (error: any) {
        if (error.code === 'P2025') { 
            return NextResponse.json({ message: 'Bank not found' }, { status: 404 });
        }
        console.error("Failed to update IPS Bank:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ message: 'Bank ID is required' }, { status: 400 });
        }

        await db.iPSBank.delete({
            where: { id }
        });

        return new Response(null, { status: 204 });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json({ message: 'Bank not found' }, { status: 404 });
        }
        console.error("Failed to delete IPS Bank:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
