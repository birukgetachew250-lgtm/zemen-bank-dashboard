
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const getCustomerById = (id: string) => {
    const customerFromDb = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (customerFromDb) {
        return {
             id: customerFromDb.id,
            cifNumber: "CIF" + customerFromDb.id.substring(4, 10).toUpperCase(),
            firstName: customerFromDb.name.split(' ')[0],
            secondName: customerFromDb.name.split(' ')[1] || '',
            lastName: customerFromDb.name.split(' ')[2] || '',
            name: customerFromDb.name,
            email: `${customerFromDb.name.split(' ')[0].toLowerCase()}@example.com`,
            phoneNumber: customerFromDb.phone,
            address: "123, Mock Street, Addis Ababa",
            nationality: "Ethiopian",
            branchCode: "101",
            branchName: "Main Branch",
            status: customerFromDb.status,
            signUp2FA: "SMS_OTP",
            signUpMainAuth: "PIN",
            insertDate: customerFromDb.registeredAt,
            avatarUrl: `https://picsum.photos/seed/${customerFromDb.id}/100/100`
        }
    }
    return null;
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
    const customer = getCustomerById(customerId);

    if (!customer) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Failed to fetch customer:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
