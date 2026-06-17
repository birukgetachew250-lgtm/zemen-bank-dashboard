
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuthenticatedSession } from '@/lib/auth-utils';

export async function POST(req: Request) {
    const session = await requireAuthenticatedSession();
    if (session instanceof NextResponse) return session;

    try {
        const { mfaEnabled } = await req.json();

        if (typeof mfaEnabled !== 'boolean') {
            return NextResponse.json({ message: 'Invalid `mfaEnabled` value provided.' }, { status: 400 });
        }
        
        await db.user.update({
            where: { email: session.user.email as string },

            data: { mfaEnabled: mfaEnabled },
        });

        return NextResponse.json({ success: true, message: 'MFA status updated successfully' });

    } catch (error) {
        console.error('Failed to update MFA status:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
