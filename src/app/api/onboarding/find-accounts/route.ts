
'use server';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { executeQuery } from '@/lib/oracle-db';

const mockAccounts = [
    { custacno: "1031110048533015", branch_code: "103", ccy: "ETB", account_type: "S", acclassdesc: "Personal Saving - Private and Individual", status: "Active" },
    { custacno: "1031110048533016", branch_code: "103", ccy: "ETB", account_type: "C", acclassdesc: "Personal Current - Private and Individual", status: "Active" },
    { custacno: "1031110048533017", branch_code: "101", ccy: "USD", account_type: "S", acclassdesc: "Personal Domiciliary Saving", status: "Dormant" },
    { custacno: "1031110048533018", branch_code: "103", ccy: "ETB", account_type: "S", acclassdesc: "Personal Saving - Joint", status: "Inactive" },
];

export async function POST(req: Request) {
    const { cif, branch_code } = await req.json();

    if (!cif || !branch_code) {
        return NextResponse.json({ message: 'CIF and branch code are required' }, { status: 400 });
    }

    try {
        const linkedAccountsQuery = `SELECT "HashedAccountNumber" FROM "USER_MODULE"."Accounts" WHERE "CIFNumber" = :cif AND "Status" = 'Active'`;
        const linkedResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, linkedAccountsQuery, [cif]);
        const linkedAccountHashes = new Set((linkedResult.rows || []).map((row: any) => row.HashedAccountNumber));

        // gRPC logic is temporarily replaced with mock data
        const accounts = mockAccounts.map((acc: any) => {
            const hashed = crypto.createHash('sha256').update(acc.custacno).digest('hex');
            return {
                ...acc,
                isAlreadyLinked: linkedAccountHashes.has(hashed)
            };
        });
        
        return NextResponse.json(accounts);

    } catch (error: any) {
        console.error('[DB Error] find-accounts:', error);
        
        // Demo fallback
        if (cif === '0048533') {
            return NextResponse.json(mockAccounts.map(acc => ({...acc, isAlreadyLinked: acc.custacno === '1031110048533015'})));
        }

        const errorMessage = error.details || error.message || 'An unexpected error occurred while fetching accounts.';
        return NextResponse.json({ message: `Failed to fetch accounts. ${errorMessage}` }, { status: 502 });
    }
}
