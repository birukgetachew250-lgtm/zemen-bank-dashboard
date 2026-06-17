
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';
import { sendEmail } from '@/services/email-service';
import { sendSms } from '@/services/sms-service';
import { requireAuthenticatedSession } from '@/lib/auth-utils';
import {
    validatePasswordComplexity,
    checkPasswordHistory,
    recordPasswordHistory,
} from '@/lib/password-utils';

// ── Rate-limiting constants ───────────────────────────────────────────────────
const WINDOW_MINUTES = 10;           // sliding window
const WINDOW_MAX_ATTEMPTS = 20;      // max wrong-current-password attempts in window
const SHORT_WINDOW_MINUTES = 1;      // aggressive detection window
const SHORT_WINDOW_THRESHOLD = 6;    // high-velocity threshold
const NOTIFY_THRESHOLD = 3;          // alert user after this many failures
const MAX_PASSWORD_VERIFY_ATTEMPTS = 5; // lock account at this many failures

// Use a dedicated action key so password-change failures are not mixed with
// login failure counts (which drive the login lockout counter separately).
const RATE_LIMIT_ACTION = 'PASSWORD_CHANGE_FAILURE' as const;

export async function POST(req: Request) {
    // ── 1. Enforce authenticated, non-expired session ─────────────────────────
    const session = await requireAuthenticatedSession();
    if (session instanceof NextResponse) return session;

    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';

    try {
        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: 'Current and new passwords are required' }, { status: 400 });
        }

        const user = await db.user.findUnique({ where: { email: session.user.email as string } });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // ── 2. Verify current password ────────────────────────────────────────
        if (user.password !== currentPassword) {
            // Rate limiting: count recent password-change failures
            try {
                const now = new Date();
                const windowStart = new Date(now.getTime() - WINDOW_MINUTES * 60 * 1000);
                const shortWindowStart = new Date(now.getTime() - SHORT_WINDOW_MINUTES * 60 * 1000);

                const recentFailures = await db.systemActivityLog.count({
                    where: {
                        userEmail: user.email,
                        action: RATE_LIMIT_ACTION,
                        timestamp: { gte: windowStart },
                    },
                });

                const shortWindowFailures = await db.systemActivityLog.count({
                    where: {
                        userEmail: user.email,
                        action: RATE_LIMIT_ACTION,
                        timestamp: { gte: shortWindowStart },
                    },
                });

                if (recentFailures >= WINDOW_MAX_ATTEMPTS) {
                    await db.systemActivityLog.create({
                        data: {
                            userEmail: user.email,
                            action: 'RATE_LIMIT_BLOCK',
                            status: 'Failure',
                            details: `Rate limit exceeded: ${recentFailures} password-change failures in last ${WINDOW_MINUTES} minutes.`,
                            ipAddress: ip,
                        },
                    });
                    return NextResponse.json({ message: 'Too many requests. Please try again later.' }, { status: 429 });
                }

                if (shortWindowFailures >= SHORT_WINDOW_THRESHOLD) {
                    await db.systemActivityLog.create({
                        data: {
                            userEmail: user.email,
                            action: 'BRUTE_FORCE_DETECTED',
                            status: 'Failure',
                            details: `High-velocity brute force detected on change-password: ${shortWindowFailures} failures in last ${SHORT_WINDOW_MINUTES} minute(s).`,
                            ipAddress: ip,
                        },
                    });
                    const alertEmail = process.env.SECURITY_ALERT_EMAIL;
                    if (alertEmail) {
                        try {
                            await sendEmail(
                                alertEmail,
                                `Brute force detected for ${user.email}`,
                                `<p>Detected ${shortWindowFailures} failed password-change attempts for user ${user.email} from IP ${ip}.</p>`
                            );
                        } catch (e) {
                            console.error('Failed to send brute-force alert email:', e);
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to evaluate rate limits for change-password:', e);
            }

            // Increment failed attempts
            try {
                await db.user.update({ where: { id: user.id }, data: { failedLoginAttempts: { increment: 1 } as any } });
            } catch (e) {
                console.error('Failed to increment failedLoginAttempts on change-password:', e);
            }

            await logActivity({
                userEmail: user.email,
                action: RATE_LIMIT_ACTION as any,
                status: 'Failure',
                details: 'Incorrect current password on change-password.',
                ipAddress: ip,
            });

            const refreshed = await db.user.findUnique({ where: { id: user.id } });
            const attempts = Number((refreshed as any)?.failedLoginAttempts || 0);

            // Notify user on repeated failures
            try {
                if (attempts >= NOTIFY_THRESHOLD) {
                    const subject = 'Security alert: repeated failed password-change attempts';
                    const body = `<p>We detected ${attempts} failed attempts to change your password. If this wasn't you, please contact support immediately.</p>`;
                    await sendEmail(user.email, subject, body);
                    if ((user as any).phone) {
                        try {
                            await sendSms(
                                (user as any).phone,
                                `We detected ${attempts} failed attempts to change your password. If this wasn't you, contact support immediately.`
                            );
                        } catch (e) {
                            console.error('Failed to send SMS notification on repeated failures:', e);
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to send repeated-failure notifications:', e);
            }

            if (attempts >= MAX_PASSWORD_VERIFY_ATTEMPTS) {
                try {
                    const now = new Date();
                    await db.user.update({
                        where: { id: user.id },
                        data: { isLocked: true, status: 'Suspended', sessionInvalidatedAt: now } as any,
                    });
                } catch (e) {
                    console.error('Failed to lock user on change-password:', e);
                }
                return NextResponse.json({ message: 'Account locked due to multiple failed attempts. Please contact an administrator.' }, { status: 403 });
            }

            return NextResponse.json({ message: 'Incorrect current password.' }, { status: 403 });
        }

        // ── 3. Block same-as-current password ────────────────────────────────
        if (newPassword === currentPassword) {
            return NextResponse.json({
                message: 'New password must be different from your current password.',
            }, { status: 400 });
        }

        // ── 4. Enforce server-side password complexity ────────────────────────
        const complexityCheck = validatePasswordComplexity(newPassword);
        if (!complexityCheck.valid) {
            return NextResponse.json({
                message: 'Password does not meet complexity requirements.',
                errors: complexityCheck.errors,
            }, { status: 400 });
        }

        // ── 5. Check password history (last 5 passwords) ──────────────────────
        const wasRecentlyUsed = await checkPasswordHistory(user.id, newPassword);
        if (wasRecentlyUsed) {
            return NextResponse.json({
                message: 'This password was recently used. Please choose a password you have not used before.',
            }, { status: 400 });
        }

        // ── 6. Save old password to history before overwriting ────────────────
        await recordPasswordHistory(user.id, user.password);

        // ── 7. Update password ─────────────────────────────────────────────────
        await db.user.update({
            where: { email: session.user.email as string },
            data: {
                password: newPassword,
                status: 'Active',
                failedLoginAttempts: 0,
                passwordChangedAt: new Date(),
            } as any,
        });

        await logActivity({
            userEmail: user.email,
            action: 'USER_UPDATED',
            status: 'Success',
            details: 'Password changed successfully by user.',
            ipAddress: ip,
        });

        return NextResponse.json({ success: true, message: 'Password updated successfully.' });

    } catch (error) {
        console.error('Failed to change password:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


