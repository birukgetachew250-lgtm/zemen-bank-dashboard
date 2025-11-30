
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { customer, accounts } = await req.json();

        if (!customer || !customer.cif || !customer.name || !accounts) {
            return NextResponse.json({ message: 'Incomplete customer or account data' }, { status: 400 });
        }

        const customerId = `cust_${crypto.randomUUID()}`;
        const approvalId = `appr_${crypto.randomUUID()}`;
        
        // This transaction ensures that both operations succeed or fail together.
        const transaction = db.transaction(() => {
            // 1. Insert the customer with a 'registered' status, which indicates they are in the approval pipeline.
            db.prepare(
                'INSERT INTO customers (id, name, phone, status, registeredAt) VALUES (?, ?, ?, ?, ?)'
            ).run(customerId, customer.name, customer.phoneNumber, 'registered', new Date().toISOString());

            // 2. Create a pending approval request for this new customer registration.
            // We serialize the accounts data to store it with the approval request.
            const approvalDetails = {
                cif: customer.cif,
                email: customer.email,
                linkedAccounts: accounts,
            };

            db.prepare(
                'INSERT INTO pending_approvals (id, customerId, type, requestedAt, customerName, customerPhone, status, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            ).run(approvalId, customerId, 'new-customer', new Date().toISOString(), customer.name, customer.phoneNumber, 'pending', JSON.stringify(approvalDetails));
        });

        transaction();

        return NextResponse.json({ success: true, message: 'Customer registration submitted for approval', customerId });

    } catch (error) {
        console.error('Failed to create customer for approval:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
