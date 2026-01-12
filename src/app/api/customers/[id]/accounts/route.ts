
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { decrypt } from '@/lib/crypto';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customerIdOrCif = params.id;
    let cif = customerIdOrCif;

    if (!/^\d+$/.test(customerIdOrCif)) {
        try {
            const customerResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, `SELECT "CIFNumber" FROM "USER_MODULE"."AppUsers" WHERE "Id" = :id`, [customerIdOrCif]);
            if (!customerResult || !customerResult.rows || customerResult.rows.length === 0) {
               return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
            }
            cif = customerResult.rows[0].CIFNumber;
        } catch (e: any) {
            // If the query fails, it might be a CIF that looks like a user ID.
            // We can proceed with the original ID.
             console.warn(`Could not find AppUser with ID ${customerIdOrCif}, proceeding as if it's a CIF. Error: ${e.message}`);
        }
    }
    
    const accountsFromDb: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, `SELECT * FROM "USER_MODULE"."Accounts" WHERE "CIFNumber" = :cif`, [cif]);
    
    if (!accountsFromDb || !accountsFromDb.rows) {
        return NextResponse.json([]);
    }

    const accounts = accountsFromDb.rows.map((acc: any) => ({
        id: acc.Id,
        accountNumber: decrypt(acc.AccountNumber),
        accountType: decrypt(acc.AccountType),
        currency: decrypt(acc.Currency),
        branchName: acc.BranchName,
        status: acc.Status,
    }));
    
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
