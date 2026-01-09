import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import config from '@/lib/config';

// Function to update user status in the correct database
const updateUserStatus = async (cif: string, status: 'Active' | 'Block') => {
    let statement;
    if (config.db.isProduction) {
        statement = await db.prepare('UPDATE "USER_MODULE"."AppUsers" SET "Status" = :1 WHERE "CIFNumber" = :2');
        return statement.run(status, cif);
    } else {
        statement = db.prepare('UPDATE AppUsers SET Status = ? WHERE CIFNumber = ?');
        return statement.run(status, cif);
    }
};

export async function POST(req: Request) {
    try {
        const { approvalId, action } = await req.json();

        if (!approvalId || !action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
        }
        
        const approval = db.prepare('SELECT * FROM pending_approvals WHERE id = ?').get(approvalId);
        
        if (!approval) {
             return NextResponse.json({ message: 'Approval not found' }, { status: 404 });
        }

        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        
        const transaction = db.transaction(async () => {
            // First, delete the approval request
            db.prepare('DELETE FROM pending_approvals WHERE id = ?').run(approvalId);
            
            // Handle different approval types only if the action is 'approve'
            if (action === 'approve') {
                const details = JSON.parse(approval.details || '{}');
                const cif = details.cif;

                if (!cif) {
                    console.error(`CIF not found in approval details for approvalId: ${approvalId}`);
                    // We don't throw here to avoid rolling back the transaction, 
                    // the approval is still removed.
                    return; 
                }

                switch (approval.type) {
                    case 'new-customer':
                        await updateUserStatus(cif, 'Active');
                        break;
                    case 'suspend-customer':
                        await updateUserStatus(cif, 'Block');
                        break;
                    case 'unsuspend-customer':
                         await updateUserStatus(cif, 'Active');
                        break;
                    case 'pin-reset':
                        // In a real app, this would trigger the actual PIN reset mechanism (e.g., sending SMS)
                        console.log(`PIN reset approved for customer CIF ${cif}`);
                        break;
                    // Add other specific 'approve' actions for different approval types here
                }
            } else { // action === 'reject'
                // Handle rejection logic if needed, e.g., logging or setting a 'rejected' status elsewhere.
                console.log(`Approval request ${approvalId} for type ${approval.type} was rejected.`);
            }
        });

        await transaction();

        return NextResponse.json({ success: true, message: `Request has been ${newStatus}` });

    } catch (error) {
        console.error('Approval action failed:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
