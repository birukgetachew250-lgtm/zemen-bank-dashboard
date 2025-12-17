
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { customer, accounts, manualData } = await req.json();

        // `customer` is from Flexcube query
        // `accounts` is the list of selected accounts
        // `manualData` contains fields like signUp2FA, signUpMainAuth
        if (!customer || !customer.customer_number || !accounts || !manualData) {
            return NextResponse.json({ message: 'Incomplete customer, account, or manual data' }, { status: 400 });
        }

        const customerId = `cust_${crypto.randomUUID()}`;
        const approvalId = `appr_${crypto.randomUUID()}`;
        
        const transaction = db.transaction(() => {
            // 1. Insert the customer with a 'registered' status.
            db.prepare(
                'INSERT INTO customers (id, name, phone, status, registeredAt) VALUES (?, ?, ?, ?, ?)'
            ).run(customerId, customer.full_name, customer.mobile_number, 'registered', new Date().toISOString());

            // 2. Create a pending approval request for this new customer registration.
            const approvalDetails = {
                customerData: customer, 
                linkedAccounts: accounts,
                onboardingData: manualData, // Include the manually entered data
            };

            db.prepare(
                'INSERT INTO pending_approvals (id, customerId, type, requestedAt, customerName, customerPhone, status, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            ).run(
                approvalId, 
                customerId, 
                'new-customer', 
                new Date().toISOString(), 
                customer.full_name, 
                customer.mobile_number, 
                'pending', 
                JSON.stringify(approvalDetails)
            );
        });

        transaction();

        return NextResponse.json({ success: true, message: 'Customer registration submitted for approval', customerId });

    } catch (error) {
        console.error('Failed to create customer for approval:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
