
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { encrypt, decrypt } from '@/lib/crypto';
import crypto from 'crypto';

const TABLE = '"LIMIT_CHARGE_MODULE"."LimitExceptions"';

export async function GET() {
    try {
        const query = `
            SELECT "Id", "CIFNumber", "AccountNumber", "AdditionalDailyLimit", "AdditionalWeeklyLimit", "AdditionalMonthlyLimit", "IsOverride", "Reason", "EffectiveFrom", "EffectiveTo", "IsActive"
            FROM ${TABLE}
            ORDER BY "InsertDate" DESC
        `;
        const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
        
        if (!result.rows) return NextResponse.json([]);
        
        return NextResponse.json(result.rows.map((row: any) => ({
            id: row.Id,
            cifNumber: row.CIFNumber,
            accountNumber: decrypt(row.AccountNumber) || 'Decryption Error',
            additionalDailyLimit: row.AdditionalDailyLimit,
            additionalWeeklyLimit: row.AdditionalWeeklyLimit,
            additionalMonthlyLimit: row.AdditionalMonthlyLimit,
            isOverride: row.IsOverride === 1,
            reason: row.Reason,
            effectiveFrom: row.EffectiveFrom,
            effectiveTo: row.EffectiveTo,
            isActive: row.IsActive === 1,
        })));
    } catch (error) {
        console.error('Failed to fetch limit exceptions:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { cifNumber, accountNumber, additionalDailyLimit, additionalWeeklyLimit, additionalMonthlyLimit, isOverride, reason, effectiveFrom, effectiveTo } = await req.json();
        
        if (!accountNumber || !cifNumber) {
            return NextResponse.json({ message: 'CIF Number and Account Number are required' }, { status: 400 });
        }

        const id = crypto.randomUUID();
        const encryptedAccountNumber = encrypt(accountNumber);
        
        const query = `
            INSERT INTO ${TABLE} 
            ("Id", "CIFNumber", "AccountNumber", "AdditionalDailyLimit", "AdditionalWeeklyLimit", "AdditionalMonthlyLimit", "IsOverride", "Reason", "EffectiveFrom", "EffectiveTo", "IsActive", "InsertDate", "Version") 
            VALUES (:Id, :CIFNumber, :AccountNumber, :AdditionalDailyLimit, :AdditionalWeeklyLimit, :AdditionalMonthlyLimit, :IsOverride, :Reason, TO_TIMESTAMP(:EffectiveFrom, 'YYYY-MM-DD"T"HH24:MI:SS'), TO_TIMESTAMP(:EffectiveTo, 'YYYY-MM-DD"T"HH24:MI:SS'), 1, SYSTIMESTAMP, SYS_GUID())
        `;
        
        const binds = {
            Id: id,
            CIFNumber: cifNumber,
            AccountNumber: encryptedAccountNumber,
            AdditionalDailyLimit: additionalDailyLimit ? parseFloat(additionalDailyLimit) : null,
            AdditionalWeeklyLimit: additionalWeeklyLimit ? parseFloat(additionalWeeklyLimit) : null,
            AdditionalMonthlyLimit: additionalMonthlyLimit ? parseFloat(additionalMonthlyLimit) : null,
            IsOverride: isOverride ? 1 : 0,
            Reason: reason || null,
            EffectiveFrom: effectiveFrom || null,
            EffectiveTo: effectiveTo || null,
        };

        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, binds);
        
        return NextResponse.json({ 
            id, 
            cifNumber,
            accountNumber, 
            additionalDailyLimit: binds.AdditionalDailyLimit,
            additionalWeeklyLimit: binds.AdditionalWeeklyLimit,
            additionalMonthlyLimit: binds.AdditionalMonthlyLimit,
            isOverride: !!isOverride,
            reason: binds.Reason,
            effectiveFrom: effectiveFrom || null,
            effectiveTo: effectiveTo || null,
            isActive: true 
        }, { status: 201 });

    } catch (error) {
        console.error('Failed to create limit exception:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


export async function PUT(req: Request) {
    try {
        const { id, cifNumber, accountNumber, additionalDailyLimit, additionalWeeklyLimit, additionalMonthlyLimit, isOverride, reason, effectiveFrom, effectiveTo } = await req.json();
        
        if (!id || !accountNumber || !cifNumber) {
            return NextResponse.json({ message: 'ID, CIF Number and Account Number are required' }, { status: 400 });
        }

        const encryptedAccountNumber = encrypt(accountNumber);
        
        const query = `
            UPDATE ${TABLE} SET
                "CIFNumber" = :CIFNumber,
                "AccountNumber" = :AccountNumber,
                "AdditionalDailyLimit" = :AdditionalDailyLimit,
                "AdditionalWeeklyLimit" = :AdditionalWeeklyLimit,
                "AdditionalMonthlyLimit" = :AdditionalMonthlyLimit,
                "IsOverride" = :IsOverride,
                "Reason" = :Reason,
                "EffectiveFrom" = TO_TIMESTAMP(:EffectiveFrom, 'YYYY-MM-DD"T"HH24:MI:SS'),
                "EffectiveTo" = TO_TIMESTAMP(:EffectiveTo, 'YYYY-MM-DD"T"HH24:MI:SS'),
                "UpdateDate" = SYSTIMESTAMP
            WHERE "Id" = :Id
        `;
        
        const binds = {
            Id: id,
            CIFNumber: cifNumber,
            AccountNumber: encryptedAccountNumber,
            AdditionalDailyLimit: additionalDailyLimit ? parseFloat(additionalDailyLimit) : null,
            AdditionalWeeklyLimit: additionalWeeklyLimit ? parseFloat(additionalWeeklyLimit) : null,
            AdditionalMonthlyLimit: additionalMonthlyLimit ? parseFloat(additionalMonthlyLimit) : null,
            IsOverride: isOverride ? 1 : 0,
            Reason: reason || null,
            EffectiveFrom: effectiveFrom || null,
            EffectiveTo: effectiveTo || null,
        };

        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, binds);

        return NextResponse.json({ 
            id, 
            cifNumber,
            accountNumber, 
            additionalDailyLimit: binds.AdditionalDailyLimit,
            additionalWeeklyLimit: binds.AdditionalWeeklyLimit,
            additionalMonthlyLimit: binds.AdditionalMonthlyLimit,
            isOverride: !!isOverride,
            reason: binds.Reason,
            effectiveFrom: effectiveFrom || null,
            effectiveTo: effectiveTo || null,
            isActive: true
        });

    } catch (error) {
        console.error('Failed to update limit exception:', error);
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
        console.error('Failed to delete limit exception:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
