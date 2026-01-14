
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { encrypt, decrypt } from '@/lib/crypto';

export async function GET() {
    try {
        const integrations = await db.integration.findMany({
            orderBy: {
                service: 'asc',
            }
        });
        const decryptedIntegrations = integrations.map(int => ({
            ...int,
            password: int.password ? '••••••••' : null, // Never send password to client
        }));
        return NextResponse.json(decryptedIntegrations);
    } catch (error) {
        console.error("Failed to fetch integrations:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, service, endpointUrl, username, password, isProduction } = await req.json();
        
        const data: any = {
            name,
            service,
            endpointUrl,
            isProduction,
        };

        if (username) data.username = username;
        if (password) data.password = encrypt(password);

        const newIntegration = await db.integration.create({ data });

        const { password: _, ...responseData } = newIntegration;
        return NextResponse.json(responseData, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ message: 'An integration with this name already exists.' }, { status: 409 });
        }
        console.error("Failed to create integration:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, name, service, endpointUrl, username, password, isProduction, status } = await req.json();

        const dataToUpdate: any = { name, service, endpointUrl, isProduction, status };

        if (username) dataToUpdate.username = username;
        // Only update password if a new one is provided
        if (password && !password.includes('••••')) {
            dataToUpdate.password = encrypt(password);
        }

        const updatedIntegration = await db.integration.update({
            where: { id },
            data: dataToUpdate,
        });
        
        const { password: _, ...responseData } = updatedIntegration;
        return NextResponse.json(responseData);

    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json({ message: 'Integration not found' }, { status: 404 });
        }
        console.error('Failed to update integration:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ message: 'ID is required for deletion' }, { status: 400 });
        }

        await db.integration.delete({
            where: { id: Number(id) }
        });

        return new Response(null, { status: 204 });

    } catch (error: any) {
        if (error.code === 'P2025') {
             return NextResponse.json({ message: 'Integration not found' }, { status: 404 });
        }
        console.error("Failed to delete integration:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
