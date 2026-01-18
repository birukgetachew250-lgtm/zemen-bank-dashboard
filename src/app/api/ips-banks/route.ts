
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

const TABLE = '"APP_CONTROL_MODULE"."IPSBank"';

export async function GET() {
    try {
        const query = `SELECT "Id", "BankName", "BankCode", "ReconciliationAccount", "BankLogo", "Status", "Rank", "CreatedAt", "UpdatedAt" FROM ${TABLE} ORDER BY "Rank" ASC`;
        const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query);
        
        if (!result.rows) return NextResponse.json([]);
        
        // Map Oracle's ALL_CAPS columns to the camelCase expected by the client
        return NextResponse.json(result.rows.map((b: any) => ({
            id: b.Id,
            bankName: b.BankName,
            bankCode: b.BankCode,
            reconciliationAccount: b.ReconciliationAccount,
            bankLogo: b.BankLogo,
            status: b.Status,
            rank: b.Rank,
            createdAt: new Date(b.CreatedAt).toISOString(),
            updatedAt: new Date(b.UpdatedAt).toISOString(),
        })));
    } catch (error) {
        console.error("Failed to fetch IPS banks:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}


export async function POST(req: Request) {
    try {
        const { bankName, bankCode, reconciliationAccount, bankLogo, status, rank } = await req.json();
        
        if (!bankName || !bankCode || !reconciliationAccount || !rank) {
            return NextResponse.json({ message: 'Bank Name, Code, Reconciliation Account, and Rank are required' }, { status: 400 });
        }

        const id = crypto.randomUUID();
        const query = `INSERT INTO ${TABLE} ("Id", "BankName", "BankCode", "ReconciliationAccount", "BankLogo", "Status", "Rank", "CreatedAt", "UpdatedAt") VALUES (:Id, :BankName, :BankCode, :ReconciliationAccount, :BankLogo, :Status, :Rank, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
        
        const binds = {
            Id: id,
            BankName: bankName,
            BankCode: bankCode,
            ReconciliationAccount: reconciliationAccount,
            BankLogo: bankLogo || null,
            Status: status,
            Rank: parseInt(rank, 10),
        };

        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        
        const newBankQuery = `SELECT "Id", "BankName", "BankCode", "ReconciliationAccount", "BankLogo", "Status", "Rank", "CreatedAt", "UpdatedAt" FROM ${TABLE} WHERE "Id" = :Id`;
        const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, newBankQuery, { Id: id });
        const newBank = result.rows[0];

        return NextResponse.json({
            id: newBank.Id,
            bankName: newBank.BankName,
            bankCode: newBank.BankCode,
            reconciliationAccount: newBank.ReconciliationAccount,
            bankLogo: newBank.BankLogo,
            status: newBank.Status,
            rank: newBank.Rank,
            createdAt: new Date(newBank.CreatedAt).toISOString(),
            updatedAt: new Date(newBank.UpdatedAt).toISOString(),
        }, { status: 201 });

    } catch (error) {
        console.error('Failed to create IPS Bank:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, bankName, bankCode, reconciliationAccount, bankLogo, status, rank } = await req.json();

        if (!id) {
            return NextResponse.json({ message: 'Bank ID is required for update' }, { status: 400 });
        }
        
        const query = `
            UPDATE ${TABLE} SET 
                "BankName" = :BankName, 
                "BankCode" = :BankCode, 
                "ReconciliationAccount" = :ReconciliationAccount, 
                "BankLogo" = :BankLogo, 
                "Status" = :Status, 
                "Rank" = :Rank,
                "UpdatedAt" = CURRENT_TIMESTAMP
            WHERE "Id" = :Id
        `;
        const binds = {
            Id: id,
            BankName: bankName,
            BankCode: bankCode,
            ReconciliationAccount: reconciliationAccount,
            BankLogo: bankLogo || null,
            Status: status,
            Rank: parseInt(rank, 10),
        };

        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        
        const updatedBankQuery = `SELECT "Id", "BankName", "BankCode", "ReconciliationAccount", "BankLogo", "Status", "Rank", "CreatedAt", "UpdatedAt" FROM ${TABLE} WHERE "Id" = :Id`;
        const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, updatedBankQuery, { Id: id });
        const updatedBank = result.rows[0];

        return NextResponse.json({
            id: updatedBank.Id,
            bankName: updatedBank.BankName,
            bankCode: updatedBank.BankCode,
            reconciliationAccount: updatedBank.ReconciliationAccount,
            bankLogo: updatedBank.BankLogo,
            status: updatedBank.Status,
            rank: updatedBank.Rank,
            createdAt: new Date(updatedBank.CreatedAt).toISOString(),
            updatedAt: new Date(updatedBank.UpdatedAt).toISOString(),
        });

    } catch (error: any) {
        console.error("Failed to update IPS Bank:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ message: 'Bank ID is required' }, { status: 400 });
        }

        const query = `DELETE FROM ${TABLE} WHERE "Id" = :Id`;
        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, { Id: id });

        return new Response(null, { status: 204 });
    } catch (error: any) {
        console.error("Failed to delete IPS Bank:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
