
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { decrypt } from '@/lib/crypto';

const getCustomerByCifOrId = async (id: string) => {
    // This query finds the base customer profile from the AppUsers table.
    // It's flexible enough to search by CIFNumber or the AppUser ID.
    const query = `SELECT * FROM "USER_MODULE"."AppUsers" WHERE "CIFNumber" = :id OR "Id" = :id`;
    const result: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, query, [id, id]);

    if (result && result.rows && result.rows.length > 0) {
        const d = result.rows[0];
        const firstName = decrypt(d.FirstName);
        const secondName = decrypt(d.SecondName);
        const lastName = decrypt(d.LastName);

        return {
            id: d.Id,
            cifNumber: d.CIFNumber,
            name: [firstName, secondName, lastName].filter(Boolean).join(' '),
            firstName: firstName,
            lastName: lastName,
            email: decrypt(d.Email),
            phoneNumber: decrypt(d.PhoneNumber),
            address: [d.AddressLine1, d.AddressLine2, d.AddressLine3, d.AddressLine4].filter(Boolean).join(', '),
            nationality: d.Nationality,
            branchName: d.BranchName,
            status: d.Status,
            insertDate: d.InsertDate,
        };
    }
    return null;
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
    const customer = await getCustomerByCifOrId(customerId);

    if (!customer) {
      return NextResponse.json({ message: 'Customer not found with that CIF or ID' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Failed to fetch customer:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
