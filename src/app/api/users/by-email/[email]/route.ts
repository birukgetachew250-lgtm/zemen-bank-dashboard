
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { email: string } }
) {
    try {
        const email = decodeURIComponent(params.email);
        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }
        
        const user = await db.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        // Exclude password from the response
        const { password, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);

    } catch (error) {
        console.error('Failed to fetch user by email:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
