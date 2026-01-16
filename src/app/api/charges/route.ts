
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

const TABLE = '"LIMIT_CHARGE_MODULE"."ChargeRules"';

export async function GET() {
    try {
        const query = `SELECT * FROM ${TABLE} WHERE "IsActive" = 1 ORDER BY "CustomerCategory", "TransactionType"`;
        const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
        return NextResponse.json(result.rows.map((row: any) => ({
            id: row.Id,
            category: row.CustomerCategory,
            transactionType: row.TransactionType,
            chargeType: row.FixedAmount > 0 ? 'Fixed' : 'Percentage',
            value: row.FixedAmount > 0 ? row.FixedAmount : row.Percentage,
        })));
    } catch (error) {
        console.error('Failed to fetch charge rules:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { category, transactionType, value } = await req.json();
        const id = crypto.randomUUID();
        const query = `
            INSERT INTO ${TABLE} ("Id", "CustomerCategory", "TransactionType", "Percentage", "FixedAmount", "IsActive") 
            VALUES (:Id, :CustomerCategory, :TransactionType, :Percentage, 0, 1)
        `;
        const binds = {
            Id: id,
            CustomerCategory: category,
            TransactionType: transactionType,
            Percentage: parseFloat(value),
        };

        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ id, category, transactionType, chargeType: 'Percentage', value: parseFloat(value) }, { status: 201 });
    } catch (error) {
        console.error('Failed to create charge rule:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, category, transactionType, value } = await req.json();
        const query = `
            UPDATE ${TABLE} SET 
                "CustomerCategory" = :CustomerCategory, 
                "TransactionType" = :TransactionType, 
                "Percentage" = :Percentage,
                "FixedAmount" = 0
            WHERE "Id" = :Id
        `;
        const binds = {
            Id: id,
            CustomerCategory: category,
            TransactionType: transactionType,
            Percentage: parseFloat(value),
        };
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ id, category, transactionType, chargeType: 'Percentage', value: parseFloat(value) });
    } catch (error) {
        console.error('Failed to update charge rule:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        const query = `UPDATE ${TABLE} SET "IsActive" = 0 WHERE "Id" = :Id`;
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, { Id: id });
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Failed to delete charge rule:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
