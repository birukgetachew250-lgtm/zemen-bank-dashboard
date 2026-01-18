
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

const TABLE = '"LIMIT_CHARGE_MODULE"."PeriodIntervals"';

export async function GET() {
    try {
        const query = `SELECT "Id", "Code", "Name", "Days" FROM ${TABLE} ORDER BY "Days"`;
        const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
        return NextResponse.json(result.rows.map((row: any) => ({
            id: row.Id,
            code: row.Code,
            name: row.Name,
            days: row.Days,
        })));
    } catch (error) {
        console.error('Failed to fetch period intervals:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { code, name, days } = await req.json();
        if (!code || !name || days === undefined) {
            return NextResponse.json({ message: 'Code, Name, and Days are required' }, { status: 400 });
        }
        const id = crypto.randomUUID();
        const query = `INSERT INTO ${TABLE} ("Id", "Code", "Name", "Days", "Version") VALUES (:Id, :Code, :Name, :Days, SYS_GUID())`;
        const binds = { Id: id, Code: code, Name: name, Days: parseInt(days, 10) };
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ id, code, name, days: parseInt(days, 10) }, { status: 201 });
    } catch (error) {
        console.error('Failed to create period interval:', error);
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
        console.error('Failed to delete period interval:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
