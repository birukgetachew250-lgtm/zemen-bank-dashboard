
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { decrypt } from '@/lib/crypto';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
    const customerResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, `SELECT "CIFNumber" FROM "USER_MODULE"."AppUsers" WHERE "Id" = :id`, [customerId]);
    
    if (!customerResult || customerResult.length === 0) {
       return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }

    const cif = customerResult[0].CIFNumber;

    const accountsFromDb: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, `SELECT * FROM "USER_MODULE"."Accounts" WHERE "CIFNumber" = :cif`, [cif]);
    
    const accounts = accountsFromDb.map((acc: any) => ({
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
