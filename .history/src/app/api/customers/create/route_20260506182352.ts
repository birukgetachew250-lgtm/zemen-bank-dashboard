
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { logActivity } from '@/lib/activity-log';

export async function POST(req: Request) {
    try {
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
        const session = await getServerSession(authOptions);
        const sessionEmail = session?.user?.email;
        if (!sessionEmail) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const requester = await db.user.findUnique({
            where: { email: sessionEmail },
            select: { branch: true, email: true },
        });

        if (!requester) {
            return NextResponse.json({ message: 'Requester account not found' }, { status: 403 });
        }

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
            onboardingData: onboardingData,
            requestContext: {
                requesterBranch: requester.branch || null,
                requesterEmail: requester.email,
            },
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

        await logActivity({
            userEmail: sessionEmail,
            action: 'CUSTOMER_CREATE_REQUESTED',
            status: 'Success',
            details: `Submitted new customer onboarding approval for CIF ${customer.customer_number} (${customer.full_name}).`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });

        return NextResponse.json({ success: true, message: 'Customer registration submitted for approval' });

    } catch (error: any) {
        console.error('Failed to create approval request:', error);

        const session = await getServerSession(authOptions);
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
        await logActivity({
            userEmail: session?.user?.email || 'system',
            action: 'CUSTOMER_CREATE_REQUESTED',
            status: 'Failure',
            details: `Failed to submit new customer onboarding approval. Error: ${error?.message || 'Unknown error'}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });

        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
