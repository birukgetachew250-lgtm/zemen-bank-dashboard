

import { NextResponse } from 'next/server';
import { systemDb } from '@/lib/system-db';
import { decrypt } from '@/lib/crypto';

const getCustomerByCifOrId = async (id: string) => {
    const user = await systemDb.appUser.findFirst({
        where: {
            OR: [
                { Id: id },
                { CIFNumber: id }
            ]
        }
    });
    
    if (user) {
        const d = user;
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
            address: `${d.AddressLine1 || ''}, ${d.AddressLine2 || ''}`,
            nationality: d.Nationality,
            branchName: d.BranchName,
            status: d.Status,
            insertDate: d.InsertDate.toISOString(),
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
