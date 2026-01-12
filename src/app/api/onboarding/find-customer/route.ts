
'use server';

import { NextResponse } from 'next/server';

const mockCustomer = {
    "full_name": "TSEDALE ADAMU MEDHANE",
    "cif_creation_date": "2022-01-01T00:00:00.000Z",
    "customer_number": "0000238",
    "date_of_birth": "1990-01-01T00:00:00.000Z",
    "gender": "Female",
    "email_id": "biruk.getachew@zemenbank.com",
    "mobile_number": "+251920249797",
    "address_line_1": "Bole Sub-city",
    "address_line_2": "Woreda 03",
    "address_line_3": "Addis Ababa",
    "address_line_4": "",
    "country": "Ethiopia",
    "branch": "Bole"
};

const otherMockCustomer = {
    "full_name": "AKALEWORK TAMENE KEBEDE",
    "cif_creation_date": "2021-05-10T00:00:00.000Z",
    "customer_number": "0048533",
    "date_of_birth": "1985-08-20T00:00:00.000Z",
    "gender": "Male",
    "email_id": "akalework.t@example.com",
    "mobile_number": "+251911223345",
    "address_line_1": "Arada Sub-city",
    "address_line_2": "",
    "address_line_3": "Addis Ababa",
    "address_line_4": "",
    "country": "Ethiopia",
    "branch": "Arada"
};

export async function POST(req: Request) {
    const { branch_code, customer_id } = await req.json();

    if (!branch_code || !customer_id) {
        return NextResponse.json({ message: 'Branch code and customer ID are required' }, { status: 400 });
    }

    // Simulate checking if user exists
    if (customer_id === '0052347') {
         return NextResponse.json({ message: 'Customer is already registered for mobile banking.' }, { status: 409 });
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (customer_id === '0000238') {
        return NextResponse.json(mockCustomer);
    }
    
    if (customer_id === '0048533') {
        return NextResponse.json(otherMockCustomer);
    }

    return NextResponse.json({ message: `Customer with CIF ${customer_id} not found.` }, { status: 404 });
}
