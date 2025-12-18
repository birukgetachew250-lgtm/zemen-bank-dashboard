
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const getCustomerByCifOrId = (id: string) => {
    // This function can now find a user by their AppUser ID or their CIF Number
    const user = db.prepare('SELECT * FROM AppUsers WHERE Id = ? OR CIFNumber = ?').get(id, id);
    
    if (user) {
        return {
            id: user.Id,
            cifNumber: user.CIFNumber,
            name: `${user.FirstName} ${user.LastName}`,
            email: user.Email,
            phoneNumber: user.PhoneNumber,
            address: `${user.AddressLine1 || ''}, ${user.AddressLine2 || ''}`,
            nationality: user.Nationality,
            branchName: user.BranchName,
            status: user.Status,
            insertDate: user.InsertDate,
            avatarUrl: `https://picsum.photos/seed/${user.Id}/100/100`
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
    const customer = getCustomerByCifOrId(customerId);

    if (!customer) {
      return NextResponse.json({ message: 'Customer not found with that CIF or ID' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Failed to fetch customer:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

    