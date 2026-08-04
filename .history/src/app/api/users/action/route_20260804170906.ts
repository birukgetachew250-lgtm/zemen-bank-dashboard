
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logActivity, type ActivityLogAction } from '@/lib/activity-log';
import crypto from 'crypto';
import { requireAnyPermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import { sendEmail } from '@/services/email-service';

type Action = 'suspend' | 'unsuspend' | 'unlock' | 'reset-password';

const actionToActionLog: Record<Action, ActivityLogAction> = {
    suspend: 'USER_SUSPENDED',
    unsuspend: 'USER_UNSUSPENDED',
    unlock: 'USER_UNLOCKED',
    'reset-password': 'USER_PASSWORD_RESET',
};

// ── Rate-limiting for admin password reset ────────────────────────────────────
// Limit: max 5 reset-password actions targeting the same user in 10 minutes.
const RESET_WINDOW_MINUTES = 10;
const RESET_MAX_PER_WINDOW = 5;

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

        // ── Rate-limit the reset-password action per target user ──────────────
        if (action === 'reset-password') {
            try {
                const windowStart = new Date(Date.now() - RESET_WINDOW_MINUTES * 60 * 1000);
                const recentResets = await db.systemActivityLog.count({
                    where: {
                        action: 'USER_PASSWORD_RESET',
                        details: { contains: userToUpdate.email },
                        timestamp: { gte: windowStart },
                    },
                });
                if (recentResets >= RESET_MAX_PER_WINDOW) {
                    await logActivity({
                        userEmail: session.user?.email || 'system',
                        action: 'RATE_LIMIT_BLOCK',
                        status: 'Failure',
                        details: `Password reset rate limit exceeded for target user ${userToUpdate.email}: ${recentResets} resets in last ${RESET_WINDOW_MINUTES} minutes.`,
                        ipAddress: typeof ip === 'string' ? ip : undefined,
                    });
                    return NextResponse.json({
                        message: `Too many password reset requests for this user. Please wait ${RESET_WINDOW_MINUTES} minutes before trying again.`,
                    }, { status: 429 });
                }
            } catch (e) {
                console.error('Failed to evaluate password-reset rate limit:', e);
            }
        }

        let data: any = {};
        let successMessage: string = '';
        const responsePayload: any = { success: true };

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
                // Generate a complex temporary password meeting all policy rules:
                // 16 chars, includes upper, lower, digit, and special character.
                const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
                const lower = 'abcdefghjkmnpqrstuvwxyz';
                const digits = '23456789';
                const specials = '!@#$%^&*';
                const all = upper + lower + digits + specials;
                let newPassword =
                    upper[crypto.randomInt(upper.length)] +
                    lower[crypto.randomInt(lower.length)] +
                    digits[crypto.randomInt(digits.length)] +
                    specials[crypto.randomInt(specials.length)];
                for (let i = newPassword.length; i < 16; i++) {
                    newPassword += all[crypto.randomInt(all.length)];
                }
                // Shuffle
                newPassword = newPassword.split('').sort(() => crypto.randomInt(3) - 1).join('');

                const bcrypt = require('bcryptjs');
                data.password = bcrypt.hashSync(newPassword, 10);
                data.status = 'PasswordChangeRequired';
                // ── SECURITY: NEVER return the generated password in the API response.
                // Send it ONLY to the target user's registered email address.
                try {
                    const loginUrl =  process.env.NEXT_PUBLIC_APP_URL || 'https://superappadmin.zemenbank.et';
                    const emailBody = `
                        <html><body style="font-family: sans-serif; line-height: 1.6;">
                        <h2>Password Reset — Zemen Admin Center</h2>
                        <p>Dear ${userToUpdate.name},</p>
                        <p>An administrator has reset your password. Use the temporary password below to log in, then change it immediately.</p>
                        <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
                        <p><strong>Temporary Password:</strong> <strong style="font-size: 18px; letter-spacing: 2px;">${newPassword}</strong></p>
                        <p>You will be required to set a new password on your first login after this reset.</p>
                        <p>If you did not expect this, contact your administrator immediately.</p>
                        <br/><p>Best regards,<br/><strong>Zemen Bank System Administrator</strong></p>
                        </body></html>`;
                    const emailResult = await sendEmail(userToUpdate.email, 'Your Zemen Admin Center Password Has Been Reset', emailBody);
                    if (emailResult.success) {
                        successMessage = `Password for ${userToUpdate.name} has been reset. A new temporary password has been sent to their registered email address.`;
                    } else {
                        console.warn(`[reset-password] Failed to send reset email to ${userToUpdate.email}: ${emailResult.message}`);
                        successMessage = `Password for ${userToUpdate.name} has been reset, but the notification email could not be sent. Please provide the new password to the user securely through an alternative channel.`;
                    }
                } catch (emailErr) {
                    console.error('[reset-password] Email send error:', emailErr);
                    successMessage = `Password for ${userToUpdate.name} has been reset, but the notification email failed. Please follow up with the user directly.`;
                }
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
            details: `User: ${userToUpdate.email}, Action: ${action}. Performed by: ${session.user?.email}.`,
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

