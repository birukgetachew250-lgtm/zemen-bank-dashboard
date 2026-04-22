
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
                lr."CustomerCategoryId" as "customerCategoryId",
                lr."TransactionTypeId" as "transactionTypeId",
                cc."Name" as "category",
                tt."Name" as "transactionType",
                lr."ServiceName" as "serviceName",
                lr."IsGlobal" as "isGlobal",
                lr."Currency" as "currency",
                lr."EffectiveFrom" as "effectiveFrom",
                lr."EffectiveTo" as "effectiveTo",
                (SELECT li."LimitAmount" FROM "LIMIT_CHARGE_MODULE"."LimitRuleIntervals" li JOIN "LIMIT_CHARGE_MODULE"."PeriodIntervals" pi ON li."PeriodIntervalId" = pi."Id" WHERE li."LimitRuleId" = lr."Id" AND pi."Name" = 'Daily') as "dailyLimit",
                (SELECT li."LimitAmount" FROM "LIMIT_CHARGE_MODULE"."LimitRuleIntervals" li JOIN "LIMIT_CHARGE_MODULE"."PeriodIntervals" pi ON li."PeriodIntervalId" = pi."Id" WHERE li."LimitRuleId" = lr."Id" AND pi."Name" = 'Weekly') as "weeklyLimit",
                (SELECT li."LimitAmount" FROM "LIMIT_CHARGE_MODULE"."LimitRuleIntervals" li JOIN "LIMIT_CHARGE_MODULE"."PeriodIntervals" pi ON li."PeriodIntervalId" = pi."Id" WHERE li."LimitRuleId" = lr."Id" AND pi."Name" = 'Monthly') as "monthlyLimit"
            FROM ${TABLE} lr
            LEFT JOIN "LIMIT_CHARGE_MODULE"."CustomerCategories" cc ON lr."CustomerCategoryId" = cc."Id"
            LEFT JOIN "LIMIT_CHARGE_MODULE"."TransactionTypes" tt ON lr."TransactionTypeId" = tt."Id"
            WHERE lr."IsActive" = 1
            ORDER BY cc."Name", tt."Name"`;
        
        const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
        
        if (!result.rows) return NextResponse.json([]);

        return NextResponse.json(result.rows.map((row: any) => ({
            id: row.id,
            customerCategoryId: row.customerCategoryId,
            transactionTypeId: row.transactionTypeId,
            category: row.category || 'All Categories',
            transactionType: row.transactionType || 'All Types',
            serviceName: row.serviceName,
            isGlobal: row.isGlobal === 1,
            currency: row.currency || 'ETB',
            effectiveFrom: row.effectiveFrom,
            effectiveTo: row.effectiveTo,
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
        const { categoryId, transactionTypeId, serviceName, isGlobal, currency, effectiveFrom, effectiveTo, limits } = await req.json();
        
        const limitRuleId = crypto.randomUUID();
        const ruleQuery = `
            INSERT INTO ${TABLE} ("Id", "CustomerCategoryId", "TransactionTypeId", "ServiceName", "IsGlobal", "Currency", "EffectiveFrom", "EffectiveTo", "IsActive", "InsertDate", "Version") 
            VALUES (:Id, :CustomerCategoryId, :TransactionTypeId, :ServiceName, :IsGlobal, :Currency, CASE WHEN :EffectiveFrom IS NOT NULL THEN TO_TIMESTAMP(:EffectiveFrom, 'YYYY-MM-DD"T"HH24:MI') ELSE NULL END, CASE WHEN :EffectiveTo IS NOT NULL THEN TO_TIMESTAMP(:EffectiveTo, 'YYYY-MM-DD"T"HH24:MI') ELSE NULL END, 1, SYSTIMESTAMP, SUBSTR(RAWTOHEX(SYS_GUID()), 1, 8))
        `;
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, ruleQuery, { 
            Id: limitRuleId, 
            CustomerCategoryId: categoryId || null, 
            TransactionTypeId: transactionTypeId || null,
            ServiceName: serviceName || null,
            IsGlobal: isGlobal ? 1 : 0,
            Currency: currency || 'ETB',
            EffectiveFrom: effectiveFrom || null,
            EffectiveTo: effectiveTo || null,
        });

        for (const intervalId in limits) {
            if (Object.prototype.hasOwnProperty.call(limits, intervalId)) {
                const entry = limits[intervalId];
                const amount = typeof entry === 'object' ? entry.amount : entry;
                const perTransactionLimit = typeof entry === 'object' ? entry.perTransactionLimit : null;
                if (amount !== null && amount !== '') {
                    const intervalQuery = `INSERT INTO ${INTERVAL_TABLE} ("Id", "LimitRuleId", "PeriodIntervalId", "LimitAmount", "PerTransactionLimit", "Currency", "InsertDate", "Version") VALUES (SYS_GUID(), :LimitRuleId, :PeriodIntervalId, :LimitAmount, :PerTransactionLimit, :Currency, SYSTIMESTAMP, SUBSTR(RAWTOHEX(SYS_GUID()), 1, 8))`;
                    await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, intervalQuery, {
                        LimitRuleId: limitRuleId,
                        PeriodIntervalId: intervalId,
                        LimitAmount: parseFloat(amount),
                        PerTransactionLimit: perTransactionLimit ? parseFloat(perTransactionLimit) : null,
                        Currency: currency || 'ETB',
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
    try {
        const { id, categoryId, transactionTypeId, serviceName, isGlobal, currency, effectiveFrom, effectiveTo, limits } = await req.json();
        
        const ruleQuery = `
            UPDATE ${TABLE} SET
                "CustomerCategoryId" = :CustomerCategoryId,
                "TransactionTypeId" = :TransactionTypeId,
                "ServiceName" = :ServiceName,
                "IsGlobal" = :IsGlobal,
                "Currency" = :Currency,
                "EffectiveFrom" = CASE WHEN :EffectiveFrom IS NOT NULL THEN TO_TIMESTAMP(:EffectiveFrom, 'YYYY-MM-DD"T"HH24:MI') ELSE NULL END,
                "EffectiveTo" = CASE WHEN :EffectiveTo IS NOT NULL THEN TO_TIMESTAMP(:EffectiveTo, 'YYYY-MM-DD"T"HH24:MI') ELSE NULL END,
                "UpdateDate" = SYSTIMESTAMP
            WHERE "Id" = :Id
        `;
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, ruleQuery, {
            Id: id,
            CustomerCategoryId: categoryId || null,
            TransactionTypeId: transactionTypeId || null,
            ServiceName: serviceName || null,
            IsGlobal: isGlobal ? 1 : 0,
            Currency: currency || 'ETB',
            EffectiveFrom: effectiveFrom || null,
            EffectiveTo: effectiveTo || null,
        });

        // Delete existing intervals and re-insert
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, `DELETE FROM ${INTERVAL_TABLE} WHERE "LimitRuleId" = :Id`, { Id: id });
        
        for (const intervalId in limits) {
            if (Object.prototype.hasOwnProperty.call(limits, intervalId)) {
                const entry = limits[intervalId];
                const amount = typeof entry === 'object' ? entry.amount : entry;
                const perTransactionLimit = typeof entry === 'object' ? entry.perTransactionLimit : null;
                if (amount !== null && amount !== '') {
                    const intervalQuery = `INSERT INTO ${INTERVAL_TABLE} ("Id", "LimitRuleId", "PeriodIntervalId", "LimitAmount", "PerTransactionLimit", "Currency", "InsertDate", "Version") VALUES (SYS_GUID(), :LimitRuleId, :PeriodIntervalId, :LimitAmount, :PerTransactionLimit, :Currency, SYSTIMESTAMP, SUBSTR(RAWTOHEX(SYS_GUID()), 1, 8))`;
                    await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, intervalQuery, {
                        LimitRuleId: id,
                        PeriodIntervalId: intervalId,
                        LimitAmount: parseFloat(amount),
                        PerTransactionLimit: perTransactionLimit ? parseFloat(perTransactionLimit) : null,
                        Currency: currency || 'ETB',
                    });
                }
            }
        }
        
        return NextResponse.json({ success: true, message: 'Limit rule updated successfully' });

    } catch (error) {
        console.error('Failed to update limit rule:', error);
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
        console.error('Failed to delete limit rule:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
