
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

const TABLE = '"LIMIT_CHARGE_MODULE"."LimitRules"';
const INTERVAL_TABLE = '"LIMIT_CHARGE_MODULE"."LimitRuleIntervals"';

export async function GET() {
    try {
        const query = `
            SELECT
                lr."Id" as "id",
                cc."Name" as "category",
                tt."Name" as "transactionType",
                (SELECT li."LimitAmount" FROM "LIMIT_CHARGE_MODULE"."LimitRuleIntervals" li JOIN "LIMIT_CHARGE_MODULE"."PeriodIntervals" pi ON li."PeriodIntervalId" = pi."Id" WHERE li."LimitRuleId" = lr."Id" AND pi."Name" = 'Daily') as "dailyLimit",
                (SELECT li."LimitAmount" FROM "LIMIT_CHARGE_MODULE"."LimitRuleIntervals" li JOIN "LIMIT_CHARGE_MODULE"."PeriodIntervals" pi ON li."PeriodIntervalId" = pi."Id" WHERE li."LimitRuleId" = lr."Id" AND pi."Name" = 'Weekly') as "weeklyLimit",
                (SELECT li."LimitAmount" FROM "LIMIT_CHARGE_MODULE"."LimitRuleIntervals" li JOIN "LIMIT_CHARGE_MODULE"."PeriodIntervals" pi ON li."PeriodIntervalId" = pi."Id" WHERE li."LimitRuleId" = lr."Id" AND pi."Name" = 'Monthly') as "monthlyLimit"
            FROM ${TABLE} lr
            JOIN "LIMIT_CHARGE_MODULE"."CustomerCategories" cc ON lr."CustomerCategoryId" = cc."Id"
            JOIN "LIMIT_CHARGE_MODULE"."TransactionTypes" tt ON lr."TransactionTypeId" = tt."Id"
            WHERE lr."IsActive" = 1
            ORDER BY cc."Name", tt."Name"`;
        
        const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
        
        if (!result.rows) return NextResponse.json([]);

        return NextResponse.json(result.rows.map((row: any) => ({
            id: row.id,
            category: row.category,
            transactionType: row.transactionType,
            dailyLimit: row.dailyLimit || 0,
            weeklyLimit: row.weeklyLimit || 0,
            monthlyLimit: row.monthlyLimit || 0,
        })));
    } catch (error) {
        console.error('Failed to fetch limit rules:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


export async function POST(req: Request) {
    try {
        const { categoryId, transactionTypeId, limits } = await req.json();
        
        const limitRuleId = crypto.randomUUID();
        const ruleQuery = `
            INSERT INTO ${TABLE} ("Id", "CustomerCategoryId", "TransactionTypeId", "Currency", "IsActive", "Version") 
            VALUES (:Id, :CustomerCategoryId, :TransactionTypeId, 'ETB', 1, SYS_GUID())
        `;
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, ruleQuery, { 
            Id: limitRuleId, 
            CustomerCategoryId: categoryId, 
            TransactionTypeId: transactionTypeId 
        });

        for (const intervalId in limits) {
            if (Object.prototype.hasOwnProperty.call(limits, intervalId)) {
                const amount = limits[intervalId];
                if (amount !== null && amount !== '') {
                    const intervalQuery = `INSERT INTO ${INTERVAL_TABLE} ("Id", "LimitRuleId", "PeriodIntervalId", "LimitAmount", "Currency", "Version") VALUES (SYS_GUID(), :LimitRuleId, :PeriodIntervalId, :LimitAmount, 'ETB', SYS_GUID())`;
                    await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, intervalQuery, {
                        LimitRuleId: limitRuleId,
                        PeriodIntervalId: intervalId,
                        LimitAmount: parseFloat(amount)
                    });
                }
            }
        }
        
        return NextResponse.json({ success: true, message: 'Limit rule created successfully' }, { status: 201 });

    } catch (error) {
        console.error('Failed to create limit rule:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    // Editing logic would be more complex, involving fetching existing interval rules,
    // and then deciding whether to UPDATE or INSERT new ones.
    // For simplicity, this is not implemented as requested by disabling it on the client.
    return NextResponse.json({ message: 'Update not implemented' }, { status: 501 });
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        // Deleting a rule should also delete its interval entries due to `ON DELETE CASCADE`
        const query = `DELETE FROM ${TABLE} WHERE "Id" = :Id`;
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, { Id: id });
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Failed to delete limit rule:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
