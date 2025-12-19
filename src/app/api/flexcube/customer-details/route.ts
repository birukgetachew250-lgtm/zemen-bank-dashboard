
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

export async function POST(req: Request) {
    const { branch_code, customer_id } = await req.json();

    console.log(`[API MOCK] Received request for branch: ${branch_code}, cif: ${customer_id}`);

    if (!branch_code || !customer_id) {
        return NextResponse.json({ message: 'Branch code and customer ID are required' }, { status: 400 });
    }

    if (customer_id === '0000238') {
        return NextResponse.json(mockCustomer);
    } else {
        return NextResponse.json({ message: `Customer with CIF ${customer_id} not found.` }, { status: 404 });
    }
}
