

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import config from '@/lib/config';
import { decrypt } from '@/lib/crypto';

const getCustomerByCifOrId = async (id: string) => {
    let user;
    if (config.db.isProduction) {
        // Case-sensitive query for Oracle
        user = await db.prepare('SELECT * FROM "USER_MODULE"."AppUsers" WHERE "Id" = :1 OR "CIFNumber" = :2').get(id, id);
    } else {
        user = db.prepare('SELECT * FROM AppUsers WHERE Id = ? OR CIFNumber = ?').get(id, id);
    }
    
    if (user) {
        // Handle Oracle's uppercase column names
        const d = user;
        const firstName = decrypt(d.FirstName || d.FIRSTNAME);
        const lastName = d.LastName || d.LASTNAME; // Assuming this might also be encrypted later

        return {
            id: d.Id || d.ID,
            cifNumber: d.CIFNumber || d.CIFNUMBER,
            name: `${firstName} ${lastName}`,
            firstName: firstName,
            lastName: lastName,
            email: d.Email || d.EMAIL,
            phoneNumber: d.PhoneNumber || d.PHONENUMBER,
            address: `${d.AddressLine1 || d.ADDRESSLINE1 || ''}, ${d.AddressLine2 || d.ADDRESSLINE2 || ''}`,
            nationality: d.Nationality || d.NATIONALITY,
            branchName: d.BranchName || d.BRANCHNAME,
            status: d.Status || d.STATUS,
            insertDate: d.InsertDate || d.INSERTDATE,
            avatarUrl: `https://picsum.photos/seed/${d.Id || d.ID}/100/100`
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
