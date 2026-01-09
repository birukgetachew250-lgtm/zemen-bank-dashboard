
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { cif, type, customerName, customerPhone } = await req.json();

        if (!cif || !type) {
            return NextResponse.json({ message: 'CIF and approval type are required' }, { status: 400 });
        }
        
        // Ensure legacy customer record exists for approvals page compatibility
        const legacyCustomerId = `cust_${cif}`;
        let customer = db.prepare('SELECT id FROM customers WHERE id = ?').get(legacyCustomerId);
        if (!customer) {
             db.prepare('INSERT INTO customers (id, name, phone, status) VALUES (?, ?, ?, ?)')
               .run(legacyCustomerId, customerName, customerPhone, 'active'); // Assume active if they exist
        }

        const approvalId = `appr_${crypto.randomUUID()}`;
        
        db.prepare(
            'INSERT INTO pending_approvals (id, customerId, type, customerName, customerPhone, details) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(
            approvalId, 
            legacyCustomerId, 
            type, 
            customerName, 
            customerPhone, 
            JSON.stringify({ requestedBy: 'admin' }) // Placeholder details
        );

        return NextResponse.json({ success: true, message: 'Request submitted for approval' });

    } catch (error: any) {
        console.error('Failed to create approval request:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
