
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const { mfaEnabled } = await req.json();

        if (typeof mfaEnabled !== 'boolean') {
            return NextResponse.json({ message: 'Invalid `mfaEnabled` value provided.' }, { status: 400 });
        }
        
        await db.user.update({
            where: { email: session.user.email },
            data: { mfaEnabled: mfaEnabled },
        });

        return NextResponse.json({ success: true, message: 'MFA status updated successfully' });

    } catch (error) {
        console.error('Failed to update MFA status:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
