
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import { logActivity, type ActivityLogAction } from '@/lib/activity-log';

const buildApprovalDetails = ({
    cif,
    details,
    requesterBranch,
    requesterEmail,
}: {
    cif: string;
    details?: Record<string, any>;
    requesterBranch?: string | null;
    requesterEmail?: string;
}) => {
    return JSON.stringify({
        cif,
        ...(details || {}),
        requestContext: {
            requesterBranch: requesterBranch || null,
            requesterEmail: requesterEmail || null,
        },
    });
};

// Mapping of approval types to specific log actions
const typeToActionMap: Record<string, ActivityLogAction> = {
    'new-customer': 'CUSTOMER_CREATE_REQUESTED',
    'updated-customer': 'CUSTOMER_UPDATE_REQUESTED',
    'suspend-customer': 'CUSTOMER_SUSPEND_REQUESTED',
    'unsuspend-customer': 'CUSTOMER_UNSUSPEND_REQUESTED',
    'resend-activation-code': 'CUSTOMER_RESEND_ACTIVATION_REQUESTED',
    'pin-reset': 'PIN_RESET_REQUESTED',
    'customer-account': 'ACCOUNT_LINK_REQUESTED',
    'unlink-account': 'ACCOUNT_UNLINK_REQUESTED',
    'reset-security-questions': 'SECURITY_RESET_REQUESTED',
};


export async function POST(req: Request) {
    const session = await requirePermission(PERMISSIONS.APPROVALS_REQUEST);
    if (session instanceof NextResponse) return session;

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    let body: any;

    try {
        body = await req.json();
        const { cif, type, customerName, customerPhone, details } = body;

        if (!cif || !type) {
            return NextResponse.json({ message: 'CIF and approval type are required' }, { status: 400 });
        }

        const sessionEmail = session?.user?.email;

        const requester = await db.user.findUnique({
            where: { email: sessionEmail },
            select: { branch: true, email: true },
        });

        if (!requester) {
            return NextResponse.json({ message: 'Requester account not found' }, { status: 403 });
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

        const finalDetails = buildApprovalDetails({
            cif,
            details,
            requesterBranch: requester.branch,
            requesterEmail: requester.email,
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
        
        const logAction = typeToActionMap[type];
        if (logAction) {
            await logActivity({
                userEmail: session?.user?.email || 'system',
                action: logAction,
                status: 'Success',
                details: `Submitted request for ${type} for customer ${customerName} (CIF: ${cif}).`,
                ipAddress: typeof ip === 'string' ? ip : undefined,
            });
        }

        return NextResponse.json({ success: true, message: 'Request submitted for approval' });

    } catch (error: any) {
        console.error('Failed to create approval request:', error);
        
        const type = body?.type || 'unknown_request';
        // Use a generic request type if the specific one isn't in our map
        const logAction = typeToActionMap[type] || 'CUSTOMER_UPDATE_REQUESTED'; 
        
        await logActivity({
            userEmail: session?.user?.email || 'system',
            action: logAction, 
            status: 'Failure',
            details: `Failed to submit request of type '${type}'. Error: ${error.message}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
