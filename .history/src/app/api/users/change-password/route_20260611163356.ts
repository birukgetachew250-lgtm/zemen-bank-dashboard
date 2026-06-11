
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';
import { sendEmail } from '@/services/email-service';
import { sendSms } from '@/services/sms-service';

const WINDOW_MINUTES = 10; // sliding window for rate limiting
const WINDOW_MAX_ATTEMPTS = 20; // max attempts in WINDOW_MINUTES
const SHORT_WINDOW_MINUTES = 1; // aggressive detection window
const SHORT_WINDOW_THRESHOLD = 6; // attempts in short window considered high velocity
const NOTIFY_THRESHOLD = 3; // number of failed attempts to notify user
const MAX_PASSWORD_VERIFY_ATTEMPTS = 5; // lock threshold

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: 'Current and new passwords are required' }, { status: 400 });
        }
        
        const user = await db.user.findUnique({ where: { email: session.user.email }});

        if (!user) {
            // This case should ideally not happen if the user has a session.
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // IMPORTANT: In a real application, passwords should be hashed.
        // This is a plain-text comparison for demonstration purposes only.
        if (user.password !== currentPassword) {
            const forwardedFor = (req as any).headers?.get?.('x-forwarded-for');
            const realIp = (req as any).headers?.get?.('x-real-ip');
            const ip = forwardedFor || realIp || 'unknown';

            // Rate limiting: count recent failures for this user
            try {
                const now = new Date();
                const windowStart = new Date(now.getTime() - WINDOW_MINUTES * 60 * 1000);
                const shortWindowStart = new Date(now.getTime() - SHORT_WINDOW_MINUTES * 60 * 1000);

                const recentFailures = await db.systemActivityLog.count({
                    where: {
                        userEmail: user.email,
                        action: 'LOGIN_FAILURE',
                        timestamp: { gte: windowStart },
                    },
                });

                const shortWindowFailures = await db.systemActivityLog.count({
                    where: {
                        userEmail: user.email,
                        action: 'LOGIN_FAILURE',
                        timestamp: { gte: shortWindowStart },
                    },
                });

                if (recentFailures >= WINDOW_MAX_ATTEMPTS) {
                    // Too many attempts in the recent window
                    await db.systemActivityLog.create({
                        data: {
                            userEmail: user.email,
                            action: 'RATE_LIMIT_BLOCK',
                            status: 'Failure',
                            details: `Rate limit exceeded: ${recentFailures} failures in last ${WINDOW_MINUTES} minutes.`,
                            ipAddress: ip,
                        },
                    });
                    return NextResponse.json({ message: 'Too many requests, try again later' }, { status: 429 });
                }

                // High velocity detection -> alert
                if (shortWindowFailures >= SHORT_WINDOW_THRESHOLD) {
                    await db.systemActivityLog.create({
                        data: {
                            userEmail: user.email,
                            action: 'BRUTE_FORCE_DETECTED',
                            status: 'Failure',
                            details: `High velocity brute force detected: ${shortWindowFailures} failures in last ${SHORT_WINDOW_MINUTES} minute(s).`,
                            ipAddress: ip,
                        },
                    });

                    // Optionally notify security admins
                    const alertEmail = process.env.SECURITY_ALERT_EMAIL;
                    if (alertEmail) {
                        try {
                            await sendEmail(alertEmail, `Brute force detected for ${user.email}`, `<p>Detected ${shortWindowFailures} failed password attempts for user ${user.email} from IP ${ip}.</p>`);
                        } catch (e) {
                            console.error('Failed to send brute force alert email:', e);
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to evaluate rate limits for change-password:', e);
            }

            // increment failed attempts and lock if threshold reached
            try {
                await db.user.update({ where: { id: user.id }, data: { failedLoginAttempts: { increment: 1 } as any } });
            } catch (e) {
                console.error('Failed to increment failedLoginAttempts on change-password:', e);
            }

            await logActivity({ userEmail: user.email, action: 'LOGIN_FAILURE', status: 'Failure', details: 'Incorrect current password on change-password', ipAddress: ip });

            const refreshed = await db.user.findUnique({ where: { id: user.id } });
            const attempts = Number((refreshed as any)?.failedLoginAttempts || 0);

            // Notify user on repeated failures
            try {
                if (attempts >= NOTIFY_THRESHOLD) {
                    const subject = 'Security alert: repeated failed password change attempts';
                    const body = `<p>We detected ${attempts} failed attempts to change your password. If this wasn't you, please contact support immediately.</p>`;
                    await sendEmail(user.email, subject, body);
                    // If user has phone number on record, attempt SMS
                    if ((user as any).phone) {
                        try {
                            await sendSms((user as any).phone, `We detected ${attempts} failed attempts to change your password. If this wasn't you, contact support.`);
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
                    await db.user.update({ where: { id: user.id }, data: { isLocked: true, status: 'Suspended', sessionInvalidatedAt: now } as any });
                } catch (e) {
                    console.error('Failed to lock user on change-password:', e);
                }

                return NextResponse.json({ message: 'Account locked due to multiple failed attempts' }, { status: 403 });
            }

            return NextResponse.json({ message: 'Incorrect current password' }, { status: 403 });
        }
        
        // In a real app, the new password would be hashed here.
        await db.user.update({
            where: { email: session.user.email },
            data: { password: newPassword, status: 'Active' },
        });

        return NextResponse.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Failed to change password:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
