
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import { logActivity, type ActivityLogAction } from '@/lib/activity-log';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // 'maker' | 'checker'
    const status = searchParams.get('status'); // 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | null

    try {
        const where: any = {};

        if (role === 'maker') {
            // Maker sees only their own requests
            where.requestedByEmail = session.user.email;
        }

        if (status) {
            where.status = status;
        }

        const records = await db.pendingApproval.findMany({
            where,
            orderBy: { requestedAt: 'desc' },
            take: 100,
        });

        // Parse the details JSON to extract cif, branchCode, documents etc.
        const mapped = records.map((r: any) => {
            let parsedDetails: any = {};
            try {
                if (r.details) parsedDetails = JSON.parse(r.details);
            } catch {}

            return {
                id: String(r.id),
                type: r.type,
                cif: parsedDetails?.cif || parsedDetails?.requestContext?.cif || r.customerName,
                customerName: r.customerName,
                customerPhone: r.customerPhone,
                branchCode: parsedDetails?.requestContext?.requesterBranch || null,
                submittedBy: r.requestedByEmail,
                submittedAt: r.requestedAt,
                // normalize to uppercase so frontend filters (PENDING, APPROVED etc) work regardless of DB casing
                status: (r.status || 'pending').toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED',
                documents: parsedDetails?.documents || [],
                details: parsedDetails,
            };
        });

        return NextResponse.json(mapped);
    } catch (error: any) {
        console.error('Failed to fetch approvals:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}



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
    'unlock-customer': 'CUSTOMER_UNSUSPEND_REQUESTED',
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

        const sessionEmail = session.user?.email as string;

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
                details: finalDetails,
                requestedByEmail: session.user?.email || null,
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
