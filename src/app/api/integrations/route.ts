
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { encrypt, decrypt } from '@/lib/crypto';

export async function GET() {
    try {
        const integrations = await db.integration.findMany();
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
        const { name, type, baseUrl, username, password, isProduction } = await req.json();
        
        const data: any = {
            name,
            type,
            baseUrl,
            isProduction,
        };

        if (username) data.username = username;
        if (password) data.password = encrypt(password);

        const newIntegration = await db.integration.create({ data });

        const { password: _, ...responseData } = newIntegration;
        return NextResponse.json(responseData, { status: 201 });
    } catch (error) {
        console.error("Failed to create integration:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, name, type, baseUrl, username, password, isProduction, status } = await req.json();

        const dataToUpdate: any = { name, type, baseUrl, isProduction, status };

        if (username) dataToUpdate.username = username;
        // Only update password if a new one is provided (not '••••••••')
        if (password && password !== '••••••••') {
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
