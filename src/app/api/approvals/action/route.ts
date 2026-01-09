
import { NextResponse } from 'next/server';
import { systemDb } from '@/lib/system-db';

export async function POST(req: Request) {
    try {
        const { approvalId, action } = await req.json();

        if (!approvalId || !action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
        }
        
        const approval = await systemDb.pendingApproval.findUnique({ where: { id: approvalId } });
        
        if (!approval) {
             return NextResponse.json({ message: 'Approval not found' }, { status: 404 });
        }

        if (action === 'reject') {
            await systemDb.pendingApproval.delete({ where: { id: approvalId } });
            return NextResponse.json({ success: true, message: `Request has been rejected` });
        }

        // Handle approval
        if (approval.details && typeof approval.details === 'object' && 'cif' in approval.details) {
            const cif = (approval.details as any).cif;
            
            if (!cif) {
                throw new Error(`CIF not found in approval details for approvalId: ${approvalId}`);
            }

            // Using a transaction to ensure both DBs are updated or none are.
            // Note: Prisma does not support transactions across different database connections.
            // This is a simplified approach. A production system would use a saga pattern or other mechanism for distributed transactions.
            
            // 1. Update Admin DB
            switch (approval.type) {
                case 'new-customer':
                    await systemDb.appUser.updateMany({ where: { CIFNumber: cif }, data: { Status: 'Active' } });
                    break;
                case 'suspend-customer':
                     await systemDb.appUser.updateMany({ where: { CIFNumber: cif }, data: { Status: 'Block' } });
                    break;
                case 'unsuspend-customer':
                     await systemDb.appUser.updateMany({ where: { CIFNumber: cif }, data: { Status: 'Active' } });
                    break;
                case 'pin-reset':
                    console.log(`PIN reset approved for customer CIF ${cif}`);
                    // Logic to trigger actual PIN reset would go here
                    break;
            }

            // 2. Update System DB (Delete the approval record)
            await systemDb.pendingApproval.delete({ where: { id: approvalId } });

        } else {
            // Failsafe for if details are missing
            await systemDb.pendingApproval.delete({ where: { id: approvalId } });
        }

        return NextResponse.json({ success: true, message: `Request has been approved` });

    } catch (error) {
        console.error('Approval action failed:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
