
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import config from '@/lib/config';

const getCustomerByCifOrId = (id: string) => {
    let user;
    if (config.db.isProduction) {
        // Case-sensitive query for Oracle
        user = db.prepare('SELECT * FROM "AppUsers" WHERE "Id" = ? OR "CIFNumber" = ?').get(id, id);
    } else {
        user = db.prepare('SELECT * FROM AppUsers WHERE Id = ? OR CIFNumber = ?').get(id, id);
    }
    
    if (user) {
        // Handle Oracle's uppercase column names
        return {
            id: user.Id || user.ID,
            cifNumber: user.CIFNumber || user.CIFNUMBER,
            name: `${user.FirstName || user.FIRSTNAME} ${user.LastName || user.LASTNAME}`,
            email: user.Email || user.EMAIL,
            phoneNumber: user.PhoneNumber || user.PHONENUMBER,
            address: `${user.AddressLine1 || user.ADDRESSLINE1 || ''}, ${user.AddressLine2 || user.ADDRESSLINE2 || ''}`,
            nationality: user.Nationality || user.NATIONALITY,
            branchName: user.BranchName || user.BRANCHNAME,
            status: user.Status || user.STATUS,
            insertDate: user.InsertDate || user.INSERTDATE,
            avatarUrl: `https://picsum.photos/seed/${user.Id || user.ID}/100/100`
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
