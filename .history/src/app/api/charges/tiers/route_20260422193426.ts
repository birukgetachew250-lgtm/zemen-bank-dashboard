import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

const TABLE = '"LIMIT_CHARGE_MODULE"."ChargeTiers"';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const chargeRuleId = searchParams.get('chargeRuleId');

        if (!chargeRuleId) {
            return NextResponse.json({ message: 'chargeRuleId is required' }, { status: 400 });
        }

        const query = `
            SELECT
                "Id"            as "id",
                "ChargeRuleId"  as "chargeRuleId",
                "TierName"      as "tierName",
                "AmountFrom"    as "amountFrom",
                "AmountTo"      as "amountTo",
                "Percentage"    as "percentage",
                "FixedAmount"   as "fixedAmount",
                "VatPercentage" as "vatPercentage",
                "MinCharge"     as "minCharge",
                "MaxCharge"     as "maxCharge",
                "DisplayOrder"  as "displayOrder"
            FROM ${TABLE}
            WHERE "ChargeRuleId" = :ChargeRuleId AND "IsActive" = 1
            ORDER BY "DisplayOrder", "AmountFrom"
        `;
        const result: any = await executeQuery(
            process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
            query,
            { ChargeRuleId: chargeRuleId }
        );
        return NextResponse.json(result.rows || []);
    } catch (error) {
        console.error('Failed to fetch charge tiers:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { chargeRuleId, tierName, amountFrom, amountTo, percentage, fixedAmount, vatPercentage, minCharge, maxCharge, displayOrder } = await req.json();

        if (!chargeRuleId) {
            return NextResponse.json({ message: 'chargeRuleId is required' }, { status: 400 });
        }

        const id = crypto.randomUUID();
        const query = `
            INSERT INTO ${TABLE}
                ("Id", "ChargeRuleId", "TierName", "AmountFrom", "AmountTo", "Percentage", "FixedAmount", "VatPercentage", "MinCharge", "MaxCharge", "DisplayOrder", "IsActive", "InsertDate", "UpdateDate", "Version")
            VALUES
                (:Id, :ChargeRuleId, :TierName, :AmountFrom, :AmountTo, :Percentage, :FixedAmount, :VatPercentage, :MinCharge, :MaxCharge, :DisplayOrder, 1, SYSTIMESTAMP, SYSTIMESTAMP, SUBSTR(RAWTOHEX(SYS_GUID()), 1, 8))
        `;
        const binds = {
            Id: id,
            ChargeRuleId: chargeRuleId,
            TierName: tierName || null,
            AmountFrom: parseFloat(amountFrom) || 0,
            AmountTo: amountTo !== '' && amountTo !== null && amountTo !== undefined ? parseFloat(amountTo) : null,
            Percentage: parseFloat(percentage) || 0,
            FixedAmount: parseFloat(fixedAmount) || 0,
            VatPercentage: vatPercentage !== '' && vatPercentage !== null && vatPercentage !== undefined ? parseFloat(vatPercentage) : null,
            MinCharge: minCharge !== '' && minCharge !== null && minCharge !== undefined ? parseFloat(minCharge) : null,
            MaxCharge: maxCharge !== '' && maxCharge !== null && maxCharge !== undefined ? parseFloat(maxCharge) : null,
            DisplayOrder: parseInt(displayOrder) || 0,
        };
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, binds);

        return NextResponse.json({
            id,
            chargeRuleId,
            tierName: binds.TierName,
            amountFrom: binds.AmountFrom,
            amountTo: binds.AmountTo,
            percentage: binds.Percentage,
            fixedAmount: binds.FixedAmount,
            vatPercentage: binds.VatPercentage,
            minCharge: binds.MinCharge,
            maxCharge: binds.MaxCharge,
            displayOrder: binds.DisplayOrder,
        }, { status: 201 });
    } catch (error) {
        console.error('Failed to create charge tier:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, tierName, amountFrom, amountTo, percentage, fixedAmount, vatPercentage, minCharge, maxCharge, displayOrder } = await req.json();

        if (!id) {
            return NextResponse.json({ message: 'id is required' }, { status: 400 });
        }

        const query = `
            UPDATE ${TABLE} SET
                "TierName"      = :TierName,
                "AmountFrom"    = :AmountFrom,
                "AmountTo"      = :AmountTo,
                "Percentage"    = :Percentage,
                "FixedAmount"   = :FixedAmount,
                "VatPercentage" = :VatPercentage,
                "MinCharge"     = :MinCharge,
                "MaxCharge"     = :MaxCharge,
                "DisplayOrder"  = :DisplayOrder,
                "UpdateDate"    = SYSTIMESTAMP
            WHERE "Id" = :Id
        `;
        const binds = {
            Id: id,
            TierName: tierName || null,
            AmountFrom: parseFloat(amountFrom) || 0,
            AmountTo: amountTo !== '' && amountTo !== null && amountTo !== undefined ? parseFloat(amountTo) : null,
            Percentage: parseFloat(percentage) || 0,
            FixedAmount: parseFloat(fixedAmount) || 0,
            VatPercentage: vatPercentage !== '' && vatPercentage !== null && vatPercentage !== undefined ? parseFloat(vatPercentage) : null,
            MinCharge: minCharge !== '' && minCharge !== null && minCharge !== undefined ? parseFloat(minCharge) : null,
            MaxCharge: maxCharge !== '' && maxCharge !== null && maxCharge !== undefined ? parseFloat(maxCharge) : null,
            DisplayOrder: parseInt(displayOrder) || 0,
        };
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, binds);

        return NextResponse.json({
            id,
            tierName: binds.TierName,
            amountFrom: binds.AmountFrom,
            amountTo: binds.AmountTo,
            percentage: binds.Percentage,
            fixedAmount: binds.FixedAmount,
            vatPercentage: binds.VatPercentage,
            minCharge: binds.MinCharge,
            maxCharge: binds.MaxCharge,
            displayOrder: binds.DisplayOrder,
        });
    } catch (error) {
        console.error('Failed to update charge tier:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ message: 'id is required' }, { status: 400 });
        }

        await executeQuery(
            process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
            `UPDATE ${TABLE} SET "IsActive" = 0, "UpdateDate" = SYSTIMESTAMP WHERE "Id" = :Id`,
            { Id: id }
        );
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Failed to delete charge tier:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
