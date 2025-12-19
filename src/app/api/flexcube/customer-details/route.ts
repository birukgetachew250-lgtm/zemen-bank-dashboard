
'use server';

import { NextResponse } from 'next/server';

const mockCustomer = {
    "full_name": "AKALEWORK TAMENE KEBEDE",
    "cif_creation_date": "2021-08-10T00:00:00.000Z",
    "customer_number": "0048533",
    "date_of_birth": "1985-05-20T00:00:00.000Z",
    "gender": "Male",
    "email_id": "akalework.t@example.com",
    "mobile_number": "+251911223345",
    "address_line_1": "Arada Sub-city",
    "address_line_2": "Woreda 01",
    "address_line_3": "Addis Ababa",
    "address_line_4": "",
    "country": "Ethiopia",
    "branch": "Arada"
};

export async function POST(req: Request) {
    const { branch_code, customer_id } = await req.json();

    console.log(`[API MOCK] Received request for branch: ${branch_code}, cif: ${customer_id}`);

    if (!branch_code || !customer_id) {
        return NextResponse.json({ message: 'Branch code and customer ID are required' }, { status: 400 });
    }

    if (customer_id === '0048533') {
        return NextResponse.json(mockCustomer);
    } else {
        return NextResponse.json({ message: `Customer with CIF ${customer_id} not found.` }, { status: 404 });
    }
}
