
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { encrypt } from '@/lib/crypto';
import crypto from 'crypto';

const TABLE = '"LIMIT_CHARGE_MODULE"."LimitExceptions"';

export async function POST(req: Request) {
    try {
        const { accountNumber, additionalDailyLimit, additionalWeeklyLimit, additionalMonthlyLimit, reason } = await req.json();
        
        if (!accountNumber) {
            return NextResponse.json({ message: 'Account Number is required' }, { status: 400 });
        }

        const id = crypto.randomUUID();
        const encryptedAccountNumber = encrypt(accountNumber);
        
        const query = `
            INSERT INTO ${TABLE} 
            ("Id", "EncryptedAccountNumber", "AdditionalDailyLimit", "AdditionalWeeklyLimit", "AdditionalMonthlyLimit", "Reason", "IsActive", "Version") 
            VALUES (:Id, :EncryptedAccountNumber, :AdditionalDailyLimit, :AdditionalWeeklyLimit, :AdditionalMonthlyLimit, :Reason, 1, SYS_GUID())
        `;
        
        const binds = {
            Id: id,
            EncryptedAccountNumber: encryptedAccountNumber,
            AdditionalDailyLimit: additionalDailyLimit ? parseFloat(additionalDailyLimit) : null,
            AdditionalWeeklyLimit: additionalWeeklyLimit ? parseFloat(additionalWeeklyLimit) : null,
            AdditionalMonthlyLimit: additionalMonthlyLimit ? parseFloat(additionalMonthlyLimit) : null,
            Reason: reason || null,
        };

        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, binds);
        
        return NextResponse.json({ 
            id, 
            accountNumber, 
            additionalDailyLimit: binds.AdditionalDailyLimit,
            additionalWeeklyLimit: binds.AdditionalWeeklyLimit,
            additionalMonthlyLimit: binds.AdditionalMonthlyLimit,
            reason: binds.Reason,
            isActive: true 
        }, { status: 201 });

    } catch (error) {
        console.error('Failed to create limit exception:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


export async function PUT(req: Request) {
    try {
        const { id, accountNumber, additionalDailyLimit, additionalWeeklyLimit, additionalMonthlyLimit, reason } = await req.json();
        
        if (!id || !accountNumber) {
            return NextResponse.json({ message: 'ID and Account Number are required' }, { status: 400 });
        }

        const encryptedAccountNumber = encrypt(accountNumber);
        
        const query = `
            UPDATE ${TABLE} SET
                "EncryptedAccountNumber" = :EncryptedAccountNumber,
                "AdditionalDailyLimit" = :AdditionalDailyLimit,
                "AdditionalWeeklyLimit" = :AdditionalWeeklyLimit,
                "AdditionalMonthlyLimit" = :AdditionalMonthlyLimit,
                "Reason" = :Reason,
                "UpdateDate" = SYSTIMESTAMP
            WHERE "Id" = :Id
        `;
        
        const binds = {
            Id: id,
            EncryptedAccountNumber: encryptedAccountNumber,
            AdditionalDailyLimit: additionalDailyLimit ? parseFloat(additionalDailyLimit) : null,
            AdditionalWeeklyLimit: additionalWeeklyLimit ? parseFloat(additionalWeeklyLimit) : null,
            AdditionalMonthlyLimit: additionalMonthlyLimit ? parseFloat(additionalMonthlyLimit) : null,
            Reason: reason || null,
        };

        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, binds);

        return NextResponse.json({ 
            id, 
            accountNumber, 
            additionalDailyLimit: binds.AdditionalDailyLimit,
            additionalWeeklyLimit: binds.AdditionalWeeklyLimit,
            additionalMonthlyLimit: binds.AdditionalMonthlyLimit,
            reason: binds.Reason,
            isActive: true // Assuming we only edit active ones
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
