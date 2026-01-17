
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

const TABLE = '"LIMIT_CHARGE_MODULE"."CustomerCategories"';

export async function GET() {
    try {
        const query = `SELECT "Id", "Code", "Name", "Description" FROM ${TABLE} ORDER BY "Name"`;
        const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
        return NextResponse.json(result.rows.map((row: any) => ({
            id: row.Id,
            code: row.Code,
            name: row.Name,
            description: row.Description,
        })));
    } catch (error) {
        console.error('Failed to fetch customer categories:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { code, name, description } = await req.json();
        if (!code || !name) {
            return NextResponse.json({ message: 'Code and Name are required' }, { status: 400 });
        }
        const id = crypto.randomUUID();
        const query = `INSERT INTO ${TABLE} ("Id", "Code", "Name", "Description") VALUES (:Id, :Code, :Name, :Description)`;
        const binds = { Id: id, Code: code, Name: name, Description: description };
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ id, code, name, description }, { status: 201 });
    } catch (error) {
        console.error('Failed to create customer category:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        const query = `DELETE FROM ${TABLE} WHERE "Id" = :Id`;
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, { Id: id });
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Failed to delete customer category:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
