
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { cif, type, customerName, customerPhone, details } = await req.json();

        if (!cif || !type) {
            return NextResponse.json({ message: 'CIF and approval type are required' }, { status: 400 });
        }
        
        let customer = await db.customer.findFirst({ where: { phone: customerPhone } });
        
        if (!customer) {
             customer = await db.customer.create({
                 data: {
                    name: customerName,
                    phone: customerPhone,
                    status: 'Active', // Assume active if they exist
                 }
             });
        }

        const finalDetails = JSON.stringify({
            cif: cif,
            ...(details || {})
        });
        
        await db.pendingApproval.create({
            data: {
                customerId: customer.id,
                type: type, 
                customerName: customerName, 
                customerPhone: customerPhone, 
                details: finalDetails
            }
        });

        return NextResponse.json({ success: true, message: 'Request submitted for approval' });

    } catch (error: any) {
        console.error('Failed to create approval request:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
