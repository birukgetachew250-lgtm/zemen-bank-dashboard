
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { executeQuery } from '@/lib/oracle-db';

export async function POST(req: Request) {
    try {
        const { approvalId, action } = await req.json();

        if (!approvalId || !action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
        }
        
        const approval = await db.pendingApproval.findUnique({ where: { id: approvalId } });
        
        if (!approval) {
             return NextResponse.json({ message: 'Approval not found' }, { status: 404 });
        }

        if (action === 'reject') {
            await db.pendingApproval.delete({ where: { id: approvalId } });
            return NextResponse.json({ success: true, message: `Request has been rejected` });
        }

        // Handle approval
        let detailsObject = null;
        try {
            if (approval.details) {
                detailsObject = JSON.parse(approval.details);
            }
        } catch (e) {
             console.error("Failed to parse approval details JSON:", e);
        }

        if (detailsObject && 'cif' in detailsObject) {
            const cif = detailsObject.cif;
            
            if (!cif) {
                throw new Error(`CIF not found in approval details for approvalId: ${approvalId}`);
            }
            
            const updateUserStatusQuery = `UPDATE "USER_MODULE"."AppUsers" SET "Status" = :status WHERE "CIFNumber" = :cif`;

            switch (approval.type) {
                case 'new-customer':
                    await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, updateUserStatusQuery, { status: 'Active', cif });
                    break;
                case 'suspend-customer':
                     await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, updateUserStatusQuery, { status: 'Suspended', cif });
                    break;
                case 'unsuspend-customer':
                     await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, updateUserStatusQuery, { status: 'Active', cif });
                    break;
                case 'pin-reset':
                    console.log(`PIN reset approved for customer CIF ${cif}`);
                    // Placeholder for actual PIN reset logic
                    break;
            }

            await db.pendingApproval.delete({ where: { id: approvalId } });

        } else {
            // Fallback for older approvals without structured details
            await db.pendingApproval.delete({ where: { id: approvalId } });
        }

        return NextResponse.json({ success: true, message: `Request has been approved` });

    } catch (error) {
        console.error('Approval action failed:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
