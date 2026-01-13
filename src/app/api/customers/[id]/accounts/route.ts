
'use server';

import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { decrypt } from '@/lib/crypto';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
    let cif = customerId;

    // If the ID is a user_id from our local DB, extract the CIF
    if (customerId.startsWith('user_')) {
        cif = customerId.split('_')[1];
    } else if (customerId.length !== 7) { // Basic CIF length check
        // If it's not a user_id and not a likely CIF, check the AppUsers table
        const userQuery = `SELECT "CIFNumber" FROM "USER_MODULE"."AppUsers" WHERE "Id" = :id`;
        const userResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, userQuery, [customerId]);
        if (!userResult.rows || userResult.rows.length === 0) {
            return NextResponse.json({ message: 'Could not determine CIF for the given customer ID.' }, { status: 404 });
        }
        cif = userResult.rows[0].CIFNumber;
    }


    if (!cif) {
        return NextResponse.json({ message: 'Could not determine CIF for the given customer ID.' }, { status: 404 });
    }

    const linkedAccountsQuery = `SELECT * FROM "USER_MODULE"."Accounts" WHERE "CIFNumber" = :cif AND "Status" = 'Active'`;
    const linkedResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, linkedAccountsQuery, [cif]);

    if (!linkedResult.rows) {
        return NextResponse.json([]);
    }

    const accounts = linkedResult.rows.map((acc: any) => ({
      id: acc.Id,
      accountNumber: decrypt(acc.AccountNumber),
      accountType: decrypt(acc.AccountType),
      currency: decrypt(acc.Currency),
      status: acc.Status,
      branchName: acc.BranchName,
    }));
    
    return NextResponse.json(accounts);

  } catch (error: any) {
    console.error('Failed to fetch linked accounts:', error);
    const errorMessage = error.details || error.message || 'An unexpected error occurred while fetching accounts.';
    return NextResponse.json({ message: `Failed to fetch accounts. ${errorMessage}` }, { status: 502 });
  }
}
