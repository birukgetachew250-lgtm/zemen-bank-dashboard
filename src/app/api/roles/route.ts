
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { logActivity } from '@/lib/activity-log';

export async function GET(req: Request) {
    try {
        const roles = await db.role.findMany({
            orderBy: {
                name: 'asc',
            },
        });

        const rolesWithCounts = await Promise.all(roles.map(async (role) => {
            const userCount = await db.user.count({
                where: { role: role.name },
            });
            return { ...role, userCount };
        }));

        return NextResponse.json(rolesWithCounts);
    } catch (error) {
        console.error('Failed to fetch roles:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

    try {
        const { name, description, permissions } = await req.json();

        if (!name) {
            return NextResponse.json({ message: 'Role name is required' }, { status: 400 });
        }

        const detailedDescription = JSON.stringify({
            main: description,
            permissions: permissions || [],
        });

        const newRole = await db.role.create({
            data: {
                name,
                description: detailedDescription,
            },
        });
        
        await logActivity({
            userEmail: session?.user?.email || 'system',
            action: 'ROLE_CREATED',
            status: 'Success',
            details: `Created new role: ${name}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });

        return NextResponse.json(newRole, { status: 201 });
    } catch (error) {
        console.error('Failed to create role:', error);
        await logActivity({
            userEmail: session?.user?.email || 'system',
            action: 'ROLE_CREATED',
            status: 'Failure',
            details: `Failed to create role. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
