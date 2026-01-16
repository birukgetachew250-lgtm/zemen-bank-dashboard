
'use server';

import { db } from '@/lib/db';

export type ActivityLogAction = 
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILURE'
    | 'USER_CREATED'
    | 'USER_UPDATED'
    | 'USER_DELETED'
    | 'ROLE_CREATED'
    | 'ROLE_UPDATED'
    | 'ROLE_DELETED'
    // Customer action requests
    | 'CUSTOMER_UPDATE_REQUESTED'
    | 'CUSTOMER_SUSPEND_REQUESTED'
    | 'CUSTOMER_UNSUSPEND_REQUESTED'
    | 'PIN_RESET_REQUESTED'
    | 'ACCOUNT_LINK_REQUESTED'
    | 'ACCOUNT_UNLINK_REQUESTED'
    | 'CUSTOMER_CREATE_REQUESTED'
    | 'SECURITY_RESET_REQUESTED'
    // Approval actions
    | 'REQUEST_REJECTED'
    | 'CUSTOMER_UPDATE_APPROVED'
    | 'CUSTOMER_SUSPEND_APPROVED'
    | 'CUSTOMER_UNSUSPEND_APPROVED'
    | 'PIN_RESET_APPROVED'
    | 'ACCOUNT_LINK_APPROVED'
    | 'ACCOUNT_UNLINK_APPROVED'
    | 'CUSTOMER_CREATE_APPROVED'
    | 'SECURITY_RESET_APPROVED';

export type LogEntry = {
    userEmail: string;
    action: ActivityLogAction;
    status: 'Success' | 'Failure';
    details?: string;
    ipAddress?: string;
}

export async function logActivity(entry: LogEntry) {
    try {
        await db.systemActivityLog.create({
            data: {
                userEmail: entry.userEmail,
                action: entry.action,
                status: entry.status,
                details: entry.details,
                ipAddress: entry.ipAddress,
            },
        });
    } catch (error) {
        console.error("Failed to write to activity log:", error);
        // In a production scenario, you might want to have a fallback logging mechanism here.
    }
}
