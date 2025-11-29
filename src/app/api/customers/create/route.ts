import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { name, phone } = await req.json();

        if (!name || !phone) {
            return NextResponse.json({ message: 'Name and phone are required' }, { status: 400 });
        }

        const customerId = `cust_${crypto.randomUUID()}`;
        const approvalId = `appr_${crypto.randomUUID()}`;
        
        const transaction = db.transaction(() => {
            // Insert customer with a status that indicates it's not yet active
            db.prepare(
                'INSERT INTO customers (id, name, phone, status, registeredAt) VALUES (?, ?, ?, ?, ?)'
            ).run(customerId, name, phone, 'registered', new Date().toISOString());

            // Create a pending approval request for the new customer
            db.prepare(
                'INSERT INTO pending_approvals (id, customerId, type, requestedAt, customerName, customerPhone, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
            ).run(approvalId, customerId, 'new-customer', new Date().toISOString(), name, phone, 'pending');
        });

        transaction();

        return NextResponse.json({ success: true, message: 'Customer created and awaiting approval', customerId });

    } catch (error) {
        console.error('Failed to create customer:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
