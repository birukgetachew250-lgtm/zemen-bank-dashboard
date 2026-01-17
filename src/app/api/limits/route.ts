
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

const TABLE = '"LIMIT_CHARGE_MODULE"."LimitRules"';
const INTERVAL_TABLE = '"LIMIT_CHARGE_MODULE"."LimitRuleIntervals"';

export async function GET() {
    try {
        const query = `
            SELECT
                lr.Id as "id",
                cc.Name as "category",
                tt.Name as "transactionType",
                (SELECT li.LimitAmount FROM "LIMIT_CHARGE_MODULE"."LimitRuleIntervals" li JOIN "LIMIT_CHARGE_MODULE"."PeriodIntervals" pi ON li.PeriodIntervalId = pi.Id WHERE li.LimitRuleId = lr.Id AND pi.Name = 'Daily') as "dailyLimit",
                (SELECT li.LimitAmount FROM "LIMIT_CHARGE_MODULE"."LimitRuleIntervals" li JOIN "LIMIT_CHARGE_MODULE"."PeriodIntervals" pi ON li.PeriodIntervalId = pi.Id WHERE li.LimitRuleId = lr.Id AND pi.Name = 'Weekly') as "weeklyLimit",
                (SELECT li.LimitAmount FROM "LIMIT_CHARGE_MODULE"."LimitRuleIntervals" li JOIN "LIMIT_CHARGE_MODULE"."PeriodIntervals" pi ON li.PeriodIntervalId = pi.Id WHERE li.LimitRuleId = lr.Id AND pi.Name = 'Monthly') as "monthlyLimit"
            FROM ${TABLE} lr
            JOIN "LIMIT_CHARGE_MODULE"."CustomerCategories" cc ON lr.CustomerCategoryId = cc.Id
            JOIN "LIMIT_CHARGE_MODULE"."TransactionTypes" tt ON lr.TransactionTypeId = tt.Id
            WHERE lr.IsActive = 1
            ORDER BY cc.Name, tt.Name`;
        
        const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
        
        if (!result.rows) return NextResponse.json([]);

        return NextResponse.json(result.rows.map((row: any) => ({
            id: row.id,
            category: row.category,
            transactionType: row.transactionType,
            dailyLimit: row.dailyLimit,
            weeklyLimit: row.weeklyLimit,
            monthlyLimit: row.monthlyLimit,
        })));
    } catch (error) {
        console.error('Failed to fetch limit rules:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

async function getIntervalIds() {
    const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, `SELECT "Id", "Name" FROM "LIMIT_CHARGE_MODULE"."PeriodIntervals"`);
    const intervalMap: Record<string, string> = {};
    if (result.rows) {
        for (const row of result.rows) {
            intervalMap[row.Name] = row.Id;
        }
    }
    return intervalMap;
}

export async function POST(req: Request) {
    try {
        const { categoryId, transactionTypeId, dailyLimit, weeklyLimit, monthlyLimit } = await req.json();
        
        const limitRuleId = crypto.randomUUID();
        const ruleQuery = `
            INSERT INTO ${TABLE} ("Id", "CustomerCategoryId", "TransactionTypeId", "Currency", "IsActive") 
            VALUES (:Id, :CustomerCategoryId, :TransactionTypeId, 'ETB', 1)
        `;
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, ruleQuery, { 
            Id: limitRuleId, 
            CustomerCategoryId: categoryId, 
            TransactionTypeId: transactionTypeId 
        });

        const intervalIds = await getIntervalIds();
        const intervalBinds = [
            { Id: crypto.randomUUID(), LimitRuleId: limitRuleId, PeriodIntervalId: intervalIds.Daily, LimitAmount: parseFloat(dailyLimit), Currency: 'ETB' },
            { Id: crypto.randomUUID(), LimitRuleId: limitRuleId, PeriodIntervalId: intervalIds.Weekly, LimitAmount: parseFloat(weeklyLimit), Currency: 'ETB' },
            { Id: crypto.randomUUID(), LimitRuleId: limitRuleId, PeriodIntervalId: intervalIds.Monthly, LimitAmount: parseFloat(monthlyLimit), Currency: 'ETB' },
        ];

        for (const binds of intervalBinds) {
            const intervalQuery = `INSERT INTO ${INTERVAL_TABLE} ("Id", "LimitRuleId", "PeriodIntervalId", "LimitAmount", "Currency") VALUES (:Id, :LimitRuleId, :PeriodIntervalId, :LimitAmount, :Currency)`;
            await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, intervalQuery, binds);
        }
        
        const categoryRes: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, `SELECT "Name" FROM "LIMIT_CHARGE_MODULE"."CustomerCategories" WHERE "Id" = :id`, [categoryId]);
        const typeRes: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, `SELECT "Name" FROM "LIMIT_CHARGE_MODULE"."TransactionTypes" WHERE "Id" = :id`, [transactionTypeId]);

        return NextResponse.json({ 
            id: limitRuleId, 
            category: categoryRes.rows[0].Name,
            transactionType: typeRes.rows[0].Name,
            dailyLimit, weeklyLimit, monthlyLimit 
        }, { status: 201 });
    } catch (error) {
        console.error('Failed to create limit rule:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, categoryId, transactionTypeId, dailyLimit, weeklyLimit, monthlyLimit } = await req.json();
        
        const ruleQuery = `UPDATE ${TABLE} SET "CustomerCategoryId" = :CustomerCategoryId, "TransactionTypeId" = :TransactionTypeId WHERE "Id" = :Id`;
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, ruleQuery, { CustomerCategoryId: categoryId, TransactionTypeId: transactionTypeId, Id: id });

        const intervalIds = await getIntervalIds();
        const intervalUpdates = [
            { intervalId: intervalIds.Daily, amount: dailyLimit },
            { intervalId: intervalIds.Weekly, amount: weeklyLimit },
            { intervalId: intervalIds.Monthly, amount: monthlyLimit },
        ];

        for (const update of intervalUpdates) {
            const intervalQuery = `UPDATE ${INTERVAL_TABLE} SET "LimitAmount" = :LimitAmount WHERE "LimitRuleId" = :LimitRuleId AND "PeriodIntervalId" = :PeriodIntervalId`;
            await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, intervalQuery, { LimitAmount: parseFloat(update.amount), LimitRuleId: id, PeriodIntervalId: update.intervalId });
        }
        
        const categoryRes: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, `SELECT "Name" FROM "LIMIT_CHARGE_MODULE"."CustomerCategories" WHERE "Id" = :id`, [categoryId]);
        const typeRes: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, `SELECT "Name" FROM "LIMIT_CHARGE_MODULE"."TransactionTypes" WHERE "Id" = :id`, [transactionTypeId]);

        return NextResponse.json({ id, category: categoryRes.rows[0].Name, transactionType: typeRes.rows[0].Name, dailyLimit, weeklyLimit, monthlyLimit });
    } catch (error) {
        console.error('Failed to update limit rule:', error);
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
        console.error('Failed to delete limit rule:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

