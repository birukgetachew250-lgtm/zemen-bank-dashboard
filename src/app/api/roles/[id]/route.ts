
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { logActivity } from '@/lib/activity-log';

// GET a single role
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return NextResponse.json({ message: 'Invalid role ID' }, { status: 400 });
        }
        
        const role = await db.role.findUnique({
            where: { id },
        });

        if (!role) {
            return NextResponse.json({ message: 'Role not found' }, { status: 404 });
        }

        return NextResponse.json(role);

    } catch (error) {
        console.error('Failed to fetch role:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


// UPDATE a role
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

    try {
        const id = parseInt(params.id, 10);
         if (isNaN(id)) {
            return NextResponse.json({ message: 'Invalid role ID' }, { status: 400 });
        }
        const { name, description, permissions } = await req.json();

        if (!name) {
            return NextResponse.json({ message: 'Role name is required' }, { status: 400 });
        }
        
        const detailedDescription = JSON.stringify({
            main: description,
            permissions: permissions || [],
        });

        const updatedRole = await db.role.update({
            where: { id },
            data: {
                name,
                description: detailedDescription,
            },
        });
        
        await logActivity({
            userEmail: session?.user?.email || 'system',
            action: 'ROLE_UPDATED',
            status: 'Success',
            details: `Updated role: ${name}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });

        return NextResponse.json(updatedRole);
    } catch (error: any) {
         if (error.code === 'P2025') {
            return NextResponse.json({ message: 'Role not found' }, { status: 404 });
        }
        console.error('Failed to update role:', error);
        await logActivity({
            userEmail: session?.user?.email || 'system',
            action: 'ROLE_UPDATED',
            status: 'Failure',
            details: `Failed to update role ID ${params.id}. Error: ${error.message}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE a role
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    
    try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return NextResponse.json({ message: 'Invalid role ID' }, { status: 400 });
        }
        
        const role = await db.role.findUnique({ where: { id } });
        if (!role) {
            return NextResponse.json({ message: 'Role not found' }, { status: 404 });
        }
        
        await db.role.delete({
            where: { id },
        });

        await logActivity({
            userEmail: session?.user?.email || 'system',
            action: 'ROLE_DELETED',
            status: 'Success',
            details: `Deleted role: ${role.name}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });


        return new Response(null, { status: 204 });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json({ message: 'Role not found' }, { status: 404 });
        }
        await logActivity({
            userEmail: session?.user?.email || 'system',
            action: 'ROLE_DELETED',
            status: 'Failure',
            details: `Failed to delete role ID ${params.id}. Error: ${error.message}`,
            ipAddress: typeof ip === 'string' ? ip : undefined,
        });
        console.error('Failed to delete role:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
