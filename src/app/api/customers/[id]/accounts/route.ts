
import { NextResponse } from 'next/server';

const getMockAccounts = (cif: string) => {
    if (cif === '0000238') {
        return [
            { CUSTACNO: "3021110000238018", BRANCH_CODE: "302", CCY: "ETB", ACCOUNT_TYPE: "S", ACCLASSDESC: "Z-Club Gold –  Saving", status: "Active" },
        ];
    }
    return [
        { CUSTACNO: "1031110048533015", BRANCH_CODE: "103", CCY: "ETB", ACCOUNT_TYPE: "S", ACCLASSDESC: "Personal Saving - Private and Individual", status: "Active" },
        { CUSTACNO: "1031110048533016", BRANCH_CODE: "103", CCY: "ETB", ACCOUNT_TYPE: "C", ACCLASSDESC: "Personal Current - Private and Individual", status: "Active" },
        { CUSTACNO: "1031110048533017", BRANCH_CODE: "101", CCY: "USD", ACCOUNT_TYPE: "S", ACCLASSDESC: "Personal Domiciliary Saving", status: "Dormant" },
        { CUSTACNO: "1031110048533018", BRANCH_CODE: "103", CCY: "ETB", ACCOUNT_TYPE: "S", ACCLASSDESC: "Personal Saving - Joint", status: "Inactive" },
    ];
};

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
    let cif = customerId;

    // A simple mock logic to resolve CIF from a user ID
    if (customerId.startsWith('user_')) {
        cif = customerId.split('_')[1];
    }

    if (!cif) {
        return NextResponse.json({ message: 'Could not determine CIF for the given customer ID.' }, { status: 404 });
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const accounts = getMockAccounts(cif);

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
