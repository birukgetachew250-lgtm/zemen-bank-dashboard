
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const getCustomerByCifOrId = async (id: string) => {
    // This query finds the base customer profile from the AppUsers table.
    // It's flexible enough to search by CIFNumber or the AppUser ID.
    // NOTE: This now uses the local Prisma client. In a real scenario, this might call another service.
    const user = await db.user.findFirst({
        where: {
            OR: [
                { employeeId: id },
                { id: parseInt(id, 10) }
            ]
        }
    });

    if (user) {
        return {
            id: user.id.toString(),
            cifNumber: user.employeeId,
            name: user.name,
            firstName: user.name.split(' ')[0],
            lastName: user.name.split(' ').slice(-1)[0],
            email: user.email,
            phoneNumber: 'N/A', // Not in User model
            address: 'N/A', // Not in User model
            nationality: 'N/A', // Not in User model
            branchName: user.branch,
            status: 'Active', // Mocked status
            insertDate: user.createdAt.toISOString(),
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

