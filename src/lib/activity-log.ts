
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
    | 'MFA_ENABLED'
    | 'MFA_DISABLED';

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
