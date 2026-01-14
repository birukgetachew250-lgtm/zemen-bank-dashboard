
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const DEFAULT_POLICY = {
    id: 1,
    mfaRequired: true,
    allowedMfaMethods: ['email'],
    sessionTimeout: 30,
    concurrentSessions: 1,
};

export async function GET() {
    try {
        let policy = await db.securityPolicy.findUnique({
            where: { id: 1 },
        });

        if (!policy) {
            policy = await db.securityPolicy.create({
                data: DEFAULT_POLICY,
            });
        }
        return NextResponse.json(policy);
    } catch (error) {
        console.error("Failed to fetch security policies:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
     try {
        const body = await req.json();
        
        // Ensure values are correct type, especially numbers
        const dataToUpdate = {
            mfaRequired: !!body.mfaRequired,
            allowedMfaMethods: Array.isArray(body.allowedMfaMethods) ? body.allowedMfaMethods : ['email'],
            sessionTimeout: parseInt(body.sessionTimeout, 10) || 30,
            concurrentSessions: parseInt(body.concurrentSessions, 10),
        };

        const updatedPolicy = await db.securityPolicy.update({
            where: { id: 1 },
            data: dataToUpdate,
        });

        return NextResponse.json(updatedPolicy);

    } catch (error) {
        console.error("Failed to update security policies:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

