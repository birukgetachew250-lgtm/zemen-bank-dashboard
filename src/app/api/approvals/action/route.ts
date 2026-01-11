
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { executeQuery } from '@/lib/oracle-db';

const getCifFromApproval = async (approval: any) => {
    // 1. Try to get CIF from the details JSON
    if (approval.details) {
        try {
            const detailsObject = JSON.parse(approval.details);
            if (detailsObject.cif) {
                return detailsObject.cif;
            }
        } catch (e) {
            console.warn("Could not parse CIF from approval details JSON:", e);
        }
    }

    // 2. Fallback: Get phone from approval, then query Oracle for CIF
    if (approval.customerPhone) {
        try {
            console.log(`[gRPC Fallback] Searching for CIF with phone number: ${approval.customerPhone}`);
            const userResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, `SELECT "CIFNumber" FROM "USER_MODULE"."AppUsers" WHERE "PhoneNumber" = :phone`, [approval.customerPhone]);
            if (userResult && userResult.length > 0) {
                return userResult[0].CIFNumber;
            }
        } catch (e) {
            console.error("Error during gRPC fallback to get CIF:", e);
        }
    }
    
    return null;
}


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

        // --- Handle Approval ---
        
        const cif = await getCifFromApproval(approval);

        if (!cif) {
            // If we still can't find a CIF, we can't proceed with the Oracle update.
            // We will still remove the approval request to clear the queue.
            await db.pendingApproval.delete({ where: { id: approvalId } });
            console.error(`Could not determine CIF for approvalId: ${approvalId}. Approval removed without action.`);
            throw new Error(`Could not determine customer CIF for approval ID ${approvalId}. The request was cleared without action.`);
        }
            
        const updateUserStatusQuery = `UPDATE "USER_MODULE"."AppUsers" SET "Status" = :status WHERE "CIFNumber" = :cif`;
        let statusToSet = '';

        switch (approval.type) {
            case 'new-customer':
                statusToSet = 'Active';
                break;
            case 'suspend-customer':
                statusToSet = 'Suspended';
                break;
            case 'unsuspend-customer':
                statusToSet = 'Active';
                break;
            case 'pin-reset':
                console.log(`PIN reset approved for customer CIF ${cif}`);
                // Placeholder for actual PIN reset logic, no status change needed.
                break;
        }

        if (statusToSet) {
             const result = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, updateUserStatusQuery, { status: statusToSet, cif });
             console.log(`Successfully executed update for CIF ${cif}. Result:`, result);
        }

        await db.pendingApproval.delete({ where: { id: approvalId } });

        return NextResponse.json({ success: true, message: `Request has been approved and status updated.` });

    } catch (error: any) {
        console.error('Approval action failed:', error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
