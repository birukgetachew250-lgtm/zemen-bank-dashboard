
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

        return NextResponse.json(updatedRole);
    } catch (error: any) {
         if (error.code === 'P2025') {
            return NextResponse.json({ message: 'Role not found' }, { status: 404 });
        }
        console.error('Failed to update role:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE a role
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return NextResponse.json({ message: 'Invalid role ID' }, { status: 400 });
        }
        
        await db.role.delete({
            where: { id },
        });

        return new Response(null, { status: 204 });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json({ message: 'Role not found' }, { status: 404 });
        }
        console.error('Failed to delete role:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
