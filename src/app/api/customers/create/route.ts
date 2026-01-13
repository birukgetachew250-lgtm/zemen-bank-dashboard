
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { customer, accounts, onboardingData } = await req.json();

        if (!customer || !customer.customer_number || !accounts || !onboardingData) {
            return NextResponse.json({ message: 'Incomplete customer, account, or onboarding data' }, { status: 400 });
        }

        // Find or create a "legacy" customer record to link the approval to.
        // This is a simplified representation in the dashboard DB.
        let legacyCustomer = await db.customer.findFirst({
            where: { phone: customer.mobile_number },
        });

        if (!legacyCustomer) {
            legacyCustomer = await db.customer.create({
                data: {
                    name: customer.full_name,
                    phone: customer.mobile_number,
                    status: 'Pending',
                },
            });
        }
        
        const detailsForApproval = { 
            cif: customer.customer_number, 
            customerData: customer, 
            linkedAccounts: accounts, 
            onboardingData: onboardingData 
        };

        // Create the approval request in the dashboard's database.
        await db.pendingApproval.create({
            data: {
                customerId: legacyCustomer.id,
                type: 'new-customer',
                customerName: customer.full_name,
                customerPhone: customer.mobile_number,
                details: JSON.stringify(detailsForApproval),
                status: 'pending',
            }
        });

        return NextResponse.json({ success: true, message: 'Customer registration submitted for approval' });

    } catch (error: any) {
        console.error('Failed to create approval request:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
