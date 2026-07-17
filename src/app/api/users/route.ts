
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { logActivity, type ActivityLogAction } from '@/lib/activity-log';
import { sendEmail } from '@/services/email-service';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import { validatePasswordComplexity } from '@/lib/password-utils';


function generateWelcomeEmail(name: string, username: string, tempPassword: string, loginUrl: string): string {
  return `
    <html>
      <body style="font-family: sans-serif; line-height: 1.6;">
        <h2>Welcome to Zemen Admin Center</h2>
        <p>Dear ${name},</p>
        <p>An administrator account has been created for you. Please use the credentials below to log in, and update your password on the first login.</p>
        <p><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #D02149;">${loginUrl}</a></p>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Temporary Password:</strong> <strong style='font-size: 18px; letter-spacing: 2px;'>${tempPassword}</strong></p>
        <p>If you have any trouble logging in, please contact the IT department immediately.</p>
        <br/>
        <p>Best regards,<br/><strong>Zemen Bank System Administrator</strong></p>
      </body>
    </html>
  `;
}

export async function POST(req: Request) {
    const session = await requirePermission(PERMISSIONS.USERS_CREATE);
    if (session instanceof NextResponse) return session;

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    let body: any;

    try {
        body = await req.json();
        const { employeeId, name, email, role, branch, department } = body;
        let { password } = body;

        if (!employeeId || !name || !email || !role || !department) {
            return NextResponse.json({ message: 'All fields except branch are required' }, { status: 400 });
        }
        
        if (!email.endsWith('@zemenbank.com')) {
            return NextResponse.json({ message: 'Email must be a @zemenbank.com address' }, { status: 400 });
        }

        const existingUserByEmail = await db.user.findUnique({ where: { email } });
        if (existingUserByEmail) {
            return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
        }

        const existingUserByEmployeeId = await db.user.findUnique({ where: { employeeId } });
        if (existingUserByEmployeeId) {
            return NextResponse.json({ message: 'User with this Employee ID already exists' }, { status: 409 });
        }
        
        const isPasswordGenerated = !password;
        if (isPasswordGenerated) {
            // Auto-generate a complex password that satisfies the complexity policy
            const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
            const lower = 'abcdefghjkmnpqrstuvwxyz';
            const digits = '23456789';
            const specials = '!@#$%^&*';
            const all = upper + lower + digits + specials;
            let generated =
                upper[crypto.randomInt(upper.length)] +
                lower[crypto.randomInt(lower.length)] +
                digits[crypto.randomInt(digits.length)] +
                specials[crypto.randomInt(specials.length)];
            for (let i = generated.length; i < 16; i++) {
                generated += all[crypto.randomInt(all.length)];
            }
            password = generated.split('').sort(() => crypto.randomInt(3) - 1).join('');
        } else {
            // Validate caller-supplied password against complexity policy
            const complexityCheck = validatePasswordComplexity(password);
            if (!complexityCheck.valid) {
                return NextResponse.json({
                    message: 'Password does not meet complexity requirements.',
                    errors: complexityCheck.errors,
                }, { status: 400 });
            }
        }

        // Hash this password before saving
        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync(password, 10);

        const newUser = await db.user.create({
            data: {
                employeeId, name, email, password: hashedPassword, role, branch, department,
                status: 'PasswordChangeRequired',
            }
        });
        
        await logActivity({
            userEmail: session.user?.email || 'system',
            action: 'USER_CREATED',
            status: 'Success',
            details: `Created new user: ${email} (Role: ${role})`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });

        // Send welcome email with temporary password
        const loginUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const emailBody = generateWelcomeEmail(name, email, password, loginUrl);
        const emailResult = await sendEmail(email, 'Your Zemen Admin Center Account', emailBody);

        let finalMessage = 'User created successfully.';
        if (emailResult.success) {
            finalMessage += ' Welcome email sent.';
        } else {
            finalMessage += ' However, the welcome email could not be sent. Please provide credentials manually.';
            console.warn(`[User Creation] Failed to send welcome email to ${email}: ${emailResult.message}`);
        }

        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json({ success: true, message: finalMessage, user: userWithoutPassword }, { status: 201 });

    } catch (error: any) {
        console.error('Failed to create user:', error);
         await logActivity({
            userEmail: session.user?.email || 'system',
            action: 'USER_CREATED',
            status: 'Failure',
            details: `Failed to create user. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await requirePermission(PERMISSIONS.USERS_DELETE);
    if (session instanceof NextResponse) return session;

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }
        
        const user = await db.user.findUnique({ where: { id: parseInt(id, 10) } });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        if (user?.employeeId === 'admin001') {
            return NextResponse.json({ message: 'Cannot delete the default admin user' }, { status: 403 });
        }

        await db.user.delete({ where: { id: parseInt(id, 10) } });

        await logActivity({
            userEmail: session.user?.email || 'system',
            action: 'USER_DELETED',
            status: 'Success',
            details: `Deleted user: ${user.email}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });

        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('Failed to delete user:', error);
        await logActivity({
            userEmail: session.user?.email || 'system',
            action: 'USER_DELETED',
            status: 'Failure',
            details: `Failed to delete user. Error: ${error.message || 'Unknown error'}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });

        if (error.code === 'P2025') {
             return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
