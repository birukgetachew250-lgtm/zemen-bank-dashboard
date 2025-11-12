import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
        
        const transaction = db.transaction(() => {
            db.prepare('UPDATE pending_approvals SET status = ? WHERE id = ?').run(newStatus, approvalId);
            
            // Example action: if unblocking a customer, set their status to 'active'
            if (action === 'approve' && approval.type === 'unblock') {
                db.prepare("UPDATE customers SET status = 'active' WHERE id = ?").run(approval.customerId);
            }
            
            // Add other specific actions for different approval types here
        });

        transaction();

        return NextResponse.json({ success: true, message: `Request has been ${newStatus}` });

    } catch (error) {
        console.error('Approval action failed:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
