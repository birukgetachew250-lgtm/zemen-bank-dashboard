
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';

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
            // increment failed attempts and lock if threshold reached
            try {
                await db.user.update({ where: { id: user.id }, data: { failedLoginAttempts: { increment: 1 } as any } });
            } catch (e) {
                console.error('Failed to increment failedLoginAttempts on change-password:', e);
            }

            const refreshed = await db.user.findUnique({ where: { id: user.id } });
            const attempts = Number((refreshed as any)?.failedLoginAttempts || 0);
            if (attempts >= 5) {
                try {
                    await db.user.update({ where: { id: user.id }, data: { isLocked: true, status: 'Suspended' } as any });
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
