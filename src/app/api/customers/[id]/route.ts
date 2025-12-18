

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import config from '@/lib/config';
import { decrypt } from '@/lib/crypto';

const getCustomerByCifOrId = async (id: string) => {
    let user;
    if (config.db.isProduction) {
        user = await db.prepare('SELECT "Id", "CIFNumber", "FirstName", "SecondName", "LastName", "Email", "PhoneNumber", "AddressLine1", "AddressLine2", "AddressLine3", "AddressLine4", "Nationality", "BranchCode", "BranchName", "Status", "SignUp2FA", "SignUpMainAuth", "InsertDate" FROM "USER_MODULE"."AppUsers" WHERE "Id" = :1 OR "CIFNumber" = :2').get(id, id);
    } else {
        user = db.prepare('SELECT * FROM AppUsers WHERE Id = ? OR CIFNumber = ?').get(id, id);
    }
    
    if (user) {
        const d = user;
        const firstName = decrypt(d.FirstName || d.FIRSTNAME);
        const secondName = decrypt(d.SecondName || d.SECONDNAME);
        const lastName = decrypt(d.LastName || d.LASTNAME);

        return {
            id: d.Id || d.ID,
            cifNumber: d.CIFNumber || d.CIFNUMBER,
            name: [firstName, secondName, lastName].filter(Boolean).join(' '),
            firstName: firstName,
            lastName: lastName,
            email: decrypt(d.Email || d.EMAIL),
            phoneNumber: decrypt(d.PhoneNumber || d.PHONENUMBER),
            address: `${d.AddressLine1 || d.ADDRESSLINE1 || ''}, ${d.AddressLine2 || d.ADDRESSLINE2 || ''}`,
            nationality: d.Nationality || d.NATIONALITY,
            branchName: d.BranchName || d.BRANCHNAME,
            status: d.Status || d.STATUS,
            insertDate: d.InsertDate || d.INSERTDATE,
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
