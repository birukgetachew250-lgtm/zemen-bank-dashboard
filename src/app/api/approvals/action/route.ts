
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
             // If parsing fails, we might still be able to proceed if the action doesn't depend on details.
        }

        if (detailsObject && 'cif' in detailsObject) {
            const cif = detailsObject.cif;
            
            if (!cif) {
                throw new Error(`CIF not found in approval details for approvalId: ${approvalId}`);
            }
            
            // 1. Update user status based on approval type
            switch (approval.type) {
                case 'new-customer':
                    await db.appUser.updateMany({ where: { CIFNumber: cif }, data: { Status: 'Active' } });
                    break;
                case 'suspend-customer':
                     await db.appUser.updateMany({ where: { CIFNumber: cif }, data: { Status: 'Block' } });
                    break;
                case 'unsuspend-customer':
                     await db.appUser.updateMany({ where: { CIFNumber: cif }, data: { Status: 'Active' } });
                    break;
                case 'pin-reset':
                    console.log(`PIN reset approved for customer CIF ${cif}`);
                    // Logic to trigger actual PIN reset would go here
                    break;
            }

            // 2. Delete the approval record
            await db.pendingApproval.delete({ where: { id: approvalId } });

        } else {
            // Failsafe for if details are missing or malformed
            await db.pendingApproval.delete({ where: { id: approvalId } });
        }

        return NextResponse.json({ success: true, message: `Request has been approved` });

    } catch (error) {
        console.error('Approval action failed:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
