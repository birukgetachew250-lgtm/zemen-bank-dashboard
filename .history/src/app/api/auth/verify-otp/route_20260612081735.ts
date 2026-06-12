
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Authentication session not found. Please log in again.' }, { status: 401 });
    }

    try {
        const { otp } = await req.json();

        if (!otp || typeof otp !== 'string' || otp.length !== 6) {
            return NextResponse.json({ message: 'Invalid OTP format.' }, { status: 400 });
        }
        
        const user = await db.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
             return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }
        
        const otpRecord = await db.otpCode.findFirst({
            where: {
                UserId: user.id.toString(),
                Purpose: 'LOGIN_MFA',
                IsUsed: false,
                ExpiresAt: {
                    gte: new Date(),
                },
            },
            orderBy: {
                InsertDate: 'desc',
            }
        });

        if (!otpRecord) {
            return NextResponse.json({ message: 'No valid OTP found or it has expired. Please try logging in again.' }, { status: 400 });
        }
        
        // In a real app, you would compare hashed OTPs
        if (otpRecord.Code !== otp) {
            await db.otpCode.update({
                where: { Id: otpRecord.Id },
                data: { Attempts: { increment: 1 } },
            });
            return NextResponse.json({ message: 'Invalid verification code.' }, { status: 400 });
        }

        await db.otpCode.update({
            where: { Id: otpRecord.Id },
            data: { IsUsed: true },
        });

        // Invalidate all previous sessions when MFA is validated
        try {
            const now = new Date();
            await db.user.update({
                where: { email: session.user.email },
                data: { sessionInvalidatedAt: now } as any,
            });
        } catch (e) {
            console.error('Failed to set sessionInvalidatedAt after MFA validation:', e);
        }

        return NextResponse.json({ success: true, message: 'Verification successful.' });
    } catch (error) {
        console.error("OTP Verification Error:", error);
        return NextResponse.json({ message: 'An internal error occurred.' }, { status: 500 });
    }
}
