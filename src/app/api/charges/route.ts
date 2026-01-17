
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

const TABLE = '"LIMIT_CHARGE_MODULE"."ChargeRules"';

export async function GET() {
    try {
        const query = `
          SELECT 
            cr.Id as "id",
            cc.Name as "category",
            tt.Name as "transactionType",
            cr.Percentage as "percentage",
            cr.FixedAmount as "fixedAmount"
          FROM ${TABLE} cr
          JOIN "LIMIT_CHARGE_MODULE"."CustomerCategories" cc ON cr.CustomerCategoryId = cc.Id
          JOIN "LIMIT_CHARGE_MODULE"."TransactionTypes" tt ON cr.TransactionTypeId = tt.Id
          WHERE cr.IsActive = 1 
          ORDER BY cc.Name, tt.Name
        `;
        const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
        return NextResponse.json(result.rows.map((row: any) => ({
            id: row.id,
            category: row.category,
            transactionType: row.transactionType,
            chargeType: row.fixedAmount > 0 ? 'Fixed' : 'Percentage',
            value: row.fixedAmount > 0 ? row.fixedAmount : row.percentage,
        })));
    } catch (error) {
        console.error('Failed to fetch charge rules:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { categoryId, transactionTypeId, chargeType, value } = await req.json();
        const id = crypto.randomUUID();
        const query = `
            INSERT INTO ${TABLE} ("Id", "CustomerCategoryId", "TransactionTypeId", "Percentage", "FixedAmount", "IsActive") 
            VALUES (:Id, :CustomerCategoryId, :TransactionTypeId, :Percentage, :FixedAmount, 1)
        `;
        const binds = {
            Id: id,
            CustomerCategoryId: categoryId,
            TransactionTypeId: transactionTypeId,
            Percentage: chargeType === 'Percentage' ? parseFloat(value) : 0,
            FixedAmount: chargeType === 'Fixed' ? parseFloat(value) : 0,
        };

        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, binds);
        const categoryRes: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, `SELECT "Name" FROM "LIMIT_CHARGE_MODULE"."CustomerCategories" WHERE "Id" = :id`, [categoryId]);
        const typeRes: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, `SELECT "Name" FROM "LIMIT_CHARGE_MODULE"."TransactionTypes" WHERE "Id" = :id`, [transactionTypeId]);

        return NextResponse.json({ 
            id,
            category: categoryRes.rows[0].Name,
            transactionType: typeRes.rows[0].Name,
            chargeType, 
            value: parseFloat(value) 
        }, { status: 201 });
    } catch (error) {
        console.error('Failed to create charge rule:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, categoryId, transactionTypeId, chargeType, value } = await req.json();
        const query = `
            UPDATE ${TABLE} SET 
                "CustomerCategoryId" = :CustomerCategoryId, 
                "TransactionTypeId" = :TransactionTypeId, 
                "Percentage" = :Percentage,
                "FixedAmount" = :FixedAmount
            WHERE "Id" = :Id
        `;
        const binds = {
            Id: id,
            CustomerCategoryId: categoryId,
            TransactionTypeId: transactionTypeId,
            Percentage: chargeType === 'Percentage' ? parseFloat(value) : 0,
            FixedAmount: chargeType === 'Fixed' ? parseFloat(value) : 0,
        };
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, binds);
        
        const categoryRes: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, `SELECT "Name" FROM "LIMIT_CHARGE_MODULE"."CustomerCategories" WHERE "Id" = :id`, [categoryId]);
        const typeRes: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, `SELECT "Name" FROM "LIMIT_CHARGE_MODULE"."TransactionTypes" WHERE "Id" = :id`, [transactionTypeId]);

        return NextResponse.json({ 
            id, 
            category: categoryRes.rows[0].Name,
            transactionType: typeRes.rows[0].Name,
            chargeType, 
            value: parseFloat(value)
        });
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
