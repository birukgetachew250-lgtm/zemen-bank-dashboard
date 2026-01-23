
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { logActivity, type ActivityLogAction } from '@/lib/activity-log';
import { sendEmail } from '@/services/email-service';

function generateWelcomeEmail(name: string, tempPassword: string, loginUrl: string): string {
  return `
    <html>
      <body style="font-family: sans-serif; line-height: 1.6;">
        <h2>Welcome to Zemen Admin Center</h2>
        <p>Dear ${name},</p>
        <p>An administrator account has been created for you. You can use the following temporary password to log in. You will be required to change it upon your first login.</p>
        <p><strong>Username:</strong> Your Email Address</p>
        <p><strong>Temporary Password:</strong> <strong style='font-size: 18px; letter-spacing: 2px;'>${tempPassword}</strong></p>
        <p><a href="${loginUrl}" style="display: inline-block; padding: 10px 15px; background-color: #D02149; color: #fff; text-decoration: none; border-radius: 5px;">Click Here to Log In</a></p>
        <p>If you have any trouble logging in, please contact the IT department.</p>
        <br/>
        <p>Best regards,<br/><strong>Zemen Bank System Administrator</strong></p>
      </body>
    </html>
  `;
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
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
            password = crypto.randomBytes(8).toString('hex').slice(0, 12);
        }

        // In a real app, hash this password before saving
        const newUser = await db.user.create({
            data: {
                employeeId, name, email, password, role, branch, department
            }
        });
        
        await logActivity({
            userEmail: session?.user?.email || 'system',
            action: 'USER_CREATED',
            status: 'Success',
            details: `Created new user: ${email} (Role: ${role})`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });

        // Send welcome email with temporary password
        const loginUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const emailBody = generateWelcomeEmail(name, password, loginUrl);
        const emailResult = await sendEmail(email, 'Your Zemen Admin Center Account', emailBody);

        let finalMessage = 'User created successfully.';
        if (emailResult.success) {
            finalMessage += ' Welcome email sent.';
            await logActivity({ userEmail: 'system', action: 'SMS_SENT', status: 'Success', details: `Welcome email sent to ${email}.` });
        } else {
            finalMessage += ' However, the welcome email could not be sent. Please provide credentials manually.';
            console.warn(`[User Creation] Failed to send welcome email to ${email}: ${emailResult.message}`);
             await logActivity({ userEmail: 'system', action: 'SMS_SENT', status: 'Failure', details: `Failed to send welcome email to ${email}: ${emailResult.message}` });
        }

        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json({ success: true, message: finalMessage, user: userWithoutPassword }, { status: 201 });

    } catch (error: any) {
        console.error('Failed to create user:', error);
         await logActivity({
            userEmail: session?.user?.email || 'system',
            action: 'USER_CREATED',
            status: 'Failure',
            details: `Failed to create user. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
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
            userEmail: session?.user?.email || 'system',
            action: 'USER_DELETED',
            status: 'Success',
            details: `Deleted user: ${user.email}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });

        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('Failed to delete user:', error);
        await logActivity({
            userEmail: session?.user?.email || 'system',
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
