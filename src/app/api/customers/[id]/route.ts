
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const getCustomerById = (id: string) => {
    const mockCustomers: {[key: string]: any} = {
        'CIFCUST_1': {
            id: "cust_1",
            cifNumber: "CIFCUST_1",
            name: "John Adebayo Doe",
            email: "john.doe@example.com",
            phoneNumber: "+2348012345678",
            address: "123, Main Street, Victoria Island, Lagos, Nigeria",
            nationality: "Nigerian",
            branchName: "Head Office",
            status: "Active",
            insertDate: "2022-08-15T10:30:00Z",
            avatarUrl: "https://picsum.photos/seed/customer1/100/100"
        },
    };

    if (mockCustomers[id]) {
        return mockCustomers[id];
    }
    
    const customerFromDb = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    
    if (customerFromDb) {
        return {
             id: customerFromDb.id,
            cifNumber: "CIF" + customerFromDb.id.substring(4, 10).toUpperCase(),
            name: customerFromDb.name,
            email: `${customerFromDb.name.split(' ')[0].toLowerCase()}@example.com`,
            phoneNumber: customerFromDb.phone,
            address: "123, Mock Street, Addis Ababa",
            nationality: "Ethiopian",
            branchName: "Main Branch",
            status: customerFromDb.status,
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
      return NextResponse.json({ message: 'Customer not found with that CIF or ID' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Failed to fetch customer:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
