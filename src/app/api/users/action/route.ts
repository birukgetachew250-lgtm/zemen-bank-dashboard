
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logActivity, type ActivityLogAction } from '@/lib/activity-log';
import crypto from 'crypto';
import { requireAnyPermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

type Action = 'suspend' | 'unsuspend' | 'unlock' | 'reset-password';

const actionToActionLog: Record<Action, ActivityLogAction> = {
    suspend: 'USER_SUSPENDED',
    unsuspend: 'USER_UNSUSPENDED',
    unlock: 'USER_UNLOCKED',
    'reset-password': 'USER_PASSWORD_RESET',
};

const MAX_LOGIN_ATTEMPTS = 5;

export async function POST(req: Request) {
    const session = await requireAnyPermission([PERMISSIONS.USERS_SUSPEND, PERMISSIONS.USERS_UNLOCK, PERMISSIONS.USERS_RESET_PASSWORD]);
    if (session instanceof NextResponse) return session;

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

    try {
        const { userId, action } = await req.json() as { userId: string, action: Action };

        if (!userId || !action) {
            return NextResponse.json({ message: 'User ID and action are required' }, { status: 400 });
        }
        
        const userToUpdate = await db.user.findUnique({
            where: { id: parseInt(userId, 10) },
        });

        if (!userToUpdate) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        let data: any = {};
        let successMessage: string = '';
        let responsePayload: any = { success: true };

        switch (action) {
            case 'suspend':
                data.status = 'Suspended';
                data.isLocked = true;
                successMessage = `User ${userToUpdate.name} has been suspended.`;
                break;
            case 'unsuspend':
                data.status = 'Active';
                data.isLocked = false;
                data.failedLoginAttempts = 0;
                successMessage = `User ${userToUpdate.name} has been unsuspended.`;
                break;
            case 'unlock':
                data.status = 'Active';
                data.isLocked = false;
                data.failedLoginAttempts = 0;
                successMessage = `User ${userToUpdate.name} has been unlocked.`;
                break;
            case 'reset-password':
                const newPassword = crypto.randomBytes(8).toString('hex');
                // In a real app, hash this password
                data.password = newPassword; 
                data.status = 'PasswordChangeRequired';
                responsePayload.newPassword = newPassword;
                successMessage = `Password for ${userToUpdate.name} has been reset.`;
                break;
            default:
                 throw new Error('Invalid action');
        }

        await db.user.update({
            where: { id: userToUpdate.id },
            data,
        });

        await logActivity({
            userEmail: session.user?.email || 'system',
            action: actionToActionLog[action],
            status: 'Success',
            details: `User: ${userToUpdate.email}, Action: ${action}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });
        
        responsePayload.message = successMessage;
        return NextResponse.json(responsePayload);

    } catch (error: any) {
        console.error('User action failed:', error);
         await logActivity({
            userEmail: session.user?.email || 'system',
            action: 'USER_UPDATED',
            status: 'Failure',
            details: `Failed to perform action on user. Error: ${error.message}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
