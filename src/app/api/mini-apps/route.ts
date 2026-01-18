
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { encrypt } from '@/lib/crypto';
import crypto from 'crypto';

const TABLE = '"APP_CONTROL_MODULE"."MiniApp"';

export async function GET() {
    try {
        const query = `SELECT "Id", "Name", "Url", "LogoUrl", "Username" FROM ${TABLE} ORDER BY "Name" ASC`;
        const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query);
        
        if (!result.rows) {
            return NextResponse.json([]);
        }

        return NextResponse.json(result.rows.map((row: any) => ({
            id: row.Id,
            name: row.Name,
            url: row.Url,
            logo_url: row.LogoUrl,
            username: row.Username
        })));
    } catch (error) {
        console.error("Failed to fetch mini apps:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, url, logo_url, username, password, encryption_key } = await req.json();

        if (!name || !url || !username || !password || !encryption_key) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const id = crypto.randomUUID();
        const encryptedPassword = encrypt(password);
        
        const query = `
            INSERT INTO ${TABLE} ("Id", "Name", "Url", "LogoUrl", "Username", "Password", "EncryptionKey")
            VALUES (:Id, :Name, :Url, :LogoUrl, :Username, :Password, :EncryptionKey)
        `;
        
        const binds = {
            Id: id,
            Name: name,
            Url: url,
            LogoUrl: logo_url || `https://picsum.photos/seed/${id}/100/100`,
            Username: username,
            Password: encryptedPassword,
            EncryptionKey: encryption_key,
        };

        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);

        return NextResponse.json({ success: true, message: 'Mini App created successfully', id }, { status: 201 });
    } catch (error) {
        console.error('Failed to create mini app:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, name, url, logo_url, username, password, encryption_key } = await req.json();

        if (!id || !name || !url || !username || !encryption_key) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }
        
        let query = `UPDATE ${TABLE} SET "Name" = :Name, "Url" = :Url, "LogoUrl" = :LogoUrl, "Username" = :Username, "EncryptionKey" = :EncryptionKey`;
        const binds: any = { id, name, url, logo_url, username, encryption_key };

        if (password) {
            query += ', "Password" = :Password';
            binds.Password = encrypt(password);
        }

        query += ' WHERE "Id" = :id';

        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);

        return NextResponse.json({ success: true, message: 'Mini App updated successfully' });
    } catch (error: any) {
        console.error('Failed to update mini app:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ message: 'Mini App ID is required' }, { status: 400 });
        }
        
        const query = `DELETE FROM ${TABLE} WHERE "Id" = :id`;
        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, { id });

        return NextResponse.json({ success: true, message: 'Mini App deleted successfully' });
    } catch (error: any) {
        console.error('Failed to delete mini app:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
