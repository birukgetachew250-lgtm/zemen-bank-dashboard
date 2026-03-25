
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

const TABLE = '"LIMIT_CHARGE_MODULE"."ChargeRules"';

export async function GET() {
    try {
        const query = `
          SELECT 
            cr."Id" as "id",
            cr."CustomerCategoryId" as "customerCategoryId",
            cr."TransactionTypeId" as "transactionTypeId",
            cc."Name" as "category",
            tt."Name" as "transactionType",
            cr."ServiceName" as "serviceName",
            cr."Percentage" as "percentage",
            cr."FixedAmount" as "fixedAmount",
            cr."VatPercentage" as "vatPercentage",
            cr."MinCharge" as "minCharge",
            cr."MaxCharge" as "maxCharge",
            cr."EffectiveFrom" as "effectiveFrom",
            cr."EffectiveTo" as "effectiveTo",
            cr."IsActive" as "isActive"
          FROM ${TABLE} cr
          LEFT JOIN "LIMIT_CHARGE_MODULE"."CustomerCategories" cc ON cr."CustomerCategoryId" = cc."Id"
          LEFT JOIN "LIMIT_CHARGE_MODULE"."TransactionTypes" tt ON cr."TransactionTypeId" = tt."Id"
          WHERE cr."IsActive" = 1 
          ORDER BY cc."Name", tt."Name"
        `;
        const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
        
        if (!result.rows) {
            return NextResponse.json([]);
        }
        
        return NextResponse.json(result.rows.map((row: any) => ({
            id: row.id,
            customerCategoryId: row.customerCategoryId,
            transactionTypeId: row.transactionTypeId,
            category: row.category || 'All Categories',
            transactionType: row.transactionType || 'All Types',
            serviceName: row.serviceName,
            percentage: row.percentage,
            fixedAmount: row.fixedAmount,
            vatPercentage: row.vatPercentage,
            minCharge: row.minCharge,
            maxCharge: row.maxCharge,
            effectiveFrom: row.effectiveFrom,
            effectiveTo: row.effectiveTo,
        })));
    } catch (error) {
        console.error('Failed to fetch charge rules:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
       
               
        const { categoryId, transactionTypeId, serviceName, percentage, fixedAmount, vatPercentage, minCharge, maxCharge, effectiveFrom, effectiveTo } = await req.json();
        const id = crypto.randomUUID();
         const version = crypto.randomBytes(8);
        const query = `
            INSERT INTO ${TABLE} ("Id", "CustomerCategoryId", "TransactionTypeId", "ServiceName", "Percentage", "FixedAmount", "VatPercentage", "MinCharge", "MaxCharge", "EffectiveFrom", "EffectiveTo", "IsActive", "InsertDate", "Version") 
            VALUES (:Id, :CustomerCategoryId, :TransactionTypeId, :ServiceName, :Percentage, :FixedAmount, :VatPercentage, :MinCharge, :MaxCharge, TO_TIMESTAMP(:EffectiveFrom, 'YYYY-MM-DD"T"HH24:MI:SS'), TO_TIMESTAMP(:EffectiveTo, 'YYYY-MM-DD"T"HH24:MI:SS'), 1, SYSTIMESTAMP, :version)
        `;
        const binds = {
            Id: id,
            CustomerCategoryId: categoryId || null,
            TransactionTypeId: transactionTypeId || null,
            ServiceName: serviceName || null,
            Percentage: parseFloat(percentage) || 0,
            FixedAmount: parseFloat(fixedAmount) || 0,
            VatPercentage: vatPercentage !== undefined && vatPercentage !== '' ? parseFloat(vatPercentage) : 15,
            MinCharge: minCharge ? parseFloat(minCharge) : null,
            MaxCharge: maxCharge ? parseFloat(maxCharge) : null,
            EffectiveFrom: effectiveFrom || null,
            EffectiveTo: effectiveTo || null,
        };

        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, binds);

        let categoryName = 'All Categories';
        let typeName = 'All Types';
        if (categoryId) {
            const categoryRes: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, `SELECT "Name" FROM "LIMIT_CHARGE_MODULE"."CustomerCategories" WHERE "Id" = :id`, [categoryId]);
            if (categoryRes.rows?.[0]) categoryName = categoryRes.rows[0].Name;
        }
        if (transactionTypeId) {
            const typeRes: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, `SELECT "Name" FROM "LIMIT_CHARGE_MODULE"."TransactionTypes" WHERE "Id" = :id`, [transactionTypeId]);
            if (typeRes.rows?.[0]) typeName = typeRes.rows[0].Name;
        }

        return NextResponse.json({ 
            id,
            customerCategoryId: categoryId || null,
            transactionTypeId: transactionTypeId || null,
            category: categoryName,
            transactionType: typeName,
            serviceName: serviceName || null,
            percentage: parseFloat(percentage) || 0,
            fixedAmount: parseFloat(fixedAmount) || 0,
            vatPercentage: binds.VatPercentage,
            minCharge: binds.MinCharge,
            maxCharge: binds.MaxCharge,
            effectiveFrom: effectiveFrom || null,
            effectiveTo: effectiveTo || null,
        }, { status: 201 });
    } catch (error) {
        console.error('Failed to create charge rule:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, categoryId, transactionTypeId, serviceName, percentage, fixedAmount, vatPercentage, minCharge, maxCharge, effectiveFrom, effectiveTo } = await req.json();
        const query = `
            UPDATE ${TABLE} SET 
                "CustomerCategoryId" = :CustomerCategoryId, 
                "TransactionTypeId" = :TransactionTypeId, 
                "ServiceName" = :ServiceName,
                "Percentage" = :Percentage,
                "FixedAmount" = :FixedAmount,
                "VatPercentage" = :VatPercentage,
                "MinCharge" = :MinCharge,
                "MaxCharge" = :MaxCharge,
                "EffectiveFrom" = TO_TIMESTAMP(:EffectiveFrom, 'YYYY-MM-DD"T"HH24:MI:SS'),
                "EffectiveTo" = TO_TIMESTAMP(:EffectiveTo, 'YYYY-MM-DD"T"HH24:MI:SS'),
                "UpdateDate" = SYSTIMESTAMP
            WHERE "Id" = :Id
        `;
        const binds = {
            Id: id,
            CustomerCategoryId: categoryId || null,
            TransactionTypeId: transactionTypeId || null,
            ServiceName: serviceName || null,
            Percentage: parseFloat(percentage) || 0,
            FixedAmount: parseFloat(fixedAmount) || 0,
            VatPercentage: vatPercentage !== undefined && vatPercentage !== '' ? parseFloat(vatPercentage) : 15,
            MinCharge: minCharge ? parseFloat(minCharge) : null,
            MaxCharge: maxCharge ? parseFloat(maxCharge) : null,
            EffectiveFrom: effectiveFrom || null,
            EffectiveTo: effectiveTo || null,
        };
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, binds);
        
        let categoryName = 'All Categories';
        let typeName = 'All Types';
        if (categoryId) {
            const categoryRes: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, `SELECT "Name" FROM "LIMIT_CHARGE_MODULE"."CustomerCategories" WHERE "Id" = :id`, [categoryId]);
            if (categoryRes.rows?.[0]) categoryName = categoryRes.rows[0].Name;
        }
        if (transactionTypeId) {
            const typeRes: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, `SELECT "Name" FROM "LIMIT_CHARGE_MODULE"."TransactionTypes" WHERE "Id" = :id`, [transactionTypeId]);
            if (typeRes.rows?.[0]) typeName = typeRes.rows[0].Name;
        }

        return NextResponse.json({ 
            id, 
            customerCategoryId: categoryId || null,
            transactionTypeId: transactionTypeId || null,
            category: categoryName,
            transactionType: typeName,
            serviceName: serviceName || null,
            percentage: parseFloat(percentage) || 0,
            fixedAmount: parseFloat(fixedAmount) || 0,
            vatPercentage: binds.VatPercentage,
            minCharge: binds.MinCharge,
            maxCharge: binds.MaxCharge,
            effectiveFrom: effectiveFrom || null,
            effectiveTo: effectiveTo || null,
        });
    } catch (error) {
        console.error('Failed to update charge rule:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        const query = `UPDATE ${TABLE} SET "IsActive" = 0, "UpdateDate" = SYSTIMESTAMP WHERE "Id" = :Id`;
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, { Id: id });
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Failed to delete charge rule:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
