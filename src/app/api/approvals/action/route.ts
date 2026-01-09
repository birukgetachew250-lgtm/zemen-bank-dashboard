
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const updateUserStatus = async (cif: string, status: 'Active' | 'Block') => {
    await db.appUser.updateMany({
        where: { CIFNumber: cif },
        data: { Status: status }
    });
};

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

        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        
        await db.$transaction(async (tx) => {
            await tx.pendingApproval.delete({ where: { id: approvalId } });
            
            if (action === 'approve' && approval.details) {
                const details = JSON.parse(approval.details as string);
                const cif = details.cif;

                if (!cif) {
                    console.error(`CIF not found in approval details for approvalId: ${approvalId}`);
                    return; 
                }

                switch (approval.type) {
                    case 'new-customer':
                        await tx.appUser.updateMany({ where: { CIFNumber: cif }, data: { Status: 'Active' } });
                        break;
                    case 'suspend-customer':
                         await tx.appUser.updateMany({ where: { CIFNumber: cif }, data: { Status: 'Block' } });
                        break;
                    case 'unsuspend-customer':
                         await tx.appUser.updateMany({ where: { CIFNumber: cif }, data: { Status: 'Active' } });
                        break;
                    case 'pin-reset':
                        console.log(`PIN reset approved for customer CIF ${cif}`);
                        break;
                }
            } else { 
                console.log(`Approval request ${approvalId} for type ${approval.type} was rejected.`);
            }
        });

        return NextResponse.json({ success: true, message: `Request has been ${newStatus}` });

    } catch (error) {
        console.error('Approval action failed:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
