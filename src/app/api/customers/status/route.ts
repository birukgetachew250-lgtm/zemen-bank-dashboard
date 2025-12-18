
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import config from '@/lib/config';
import { decrypt } from '@/lib/crypto';

export async function POST(req: Request) {
    try {
        const { cifNumber, status } = await req.json();

        if (!cifNumber || !status || !['Block', 'Active'].includes(status)) {
            return NextResponse.json({ message: 'Invalid input. CIF number and a valid status are required.' }, { status: 400 });
        }

        let statement;
        if (config.db.isProduction) {
            statement = db.prepare('UPDATE "USER_MODULE"."AppUsers" SET "Status" = :1 WHERE "CIFNumber" = :2 AND "Status" != \'Pending\'');
        } else {
            statement = db.prepare('UPDATE AppUsers SET Status = ? WHERE CIFNumber = ? AND Status != \'Pending\'');
        }

        const result = statement.run(status, cifNumber);
        
        if (result.changes === 0) {
            // Check if user exists but is pending
            const userCheckSql = config.db.isProduction 
              ? 'SELECT "Status" FROM "USER_MODULE"."AppUsers" WHERE "CIFNumber" = :1' 
              : 'SELECT Status FROM AppUsers WHERE CIFNumber = ?';
            const user = db.prepare(userCheckSql).get(cifNumber);
            
            if (user && (user.Status || user.STATUS) === 'Pending') {
                 return NextResponse.json({ message: 'Cannot change status of a pending customer.' }, { status: 403 });
            }
            return NextResponse.json({ message: 'Customer not found or status could not be updated.' }, { status: 404 });
        }

        // Fetch the updated user to return it
        const fetchSql = config.db.isProduction
          ? 'SELECT "Id", "CIFNumber", "FirstName", "SecondName", "LastName", "Email", "PhoneNumber", "AddressLine1", "AddressLine2", "Nationality", "BranchName", "Status", "InsertDate" FROM "USER_MODULE"."AppUsers" WHERE "CIFNumber" = :1'
          : 'SELECT * FROM AppUsers WHERE CIFNumber = ?';

        const updatedUser = db.prepare(fetchSql).get(cifNumber);

        if (!updatedUser) {
             return NextResponse.json({ message: 'Customer updated, but could not be refetched.' }, { status: 500 });
        }

        const d = updatedUser;
        const firstName = decrypt(d.FirstName || d.FIRSTNAME);
        const secondName = decrypt(d.SecondName || d.SECONDNAME);
        const lastName = decrypt(d.LastName || d.LASTNAME);
        
        const response = {
            id: d.Id || d.ID,
            cifNumber: d.CIFNumber || d.CIFNUMBER,
            name: [firstName, secondName, lastName].filter(Boolean).join(' '),
            firstName: firstName,
            lastName: lastName,
            email: decrypt(d.Email || d.EMAIL),
            phoneNumber: decrypt(d.PhoneNumber || d.PHONENUMBER),
            address: `${d.AddressLine1 || d.ADDRESSLINE1 || ''}, ${d.AddressLine2 || d.ADDRESSLINE2 || ''}`,
            nationality: d.Nationality || d.NATIONALITY,
            branchName: d.BranchName || d.BRANCHNAME,
            status: d.Status || d.STATUS,
            insertDate: d.InsertDate || d.INSERTDATE,
        };

        return NextResponse.json(response);

    } catch (error: any) {
        console.error('Failed to update customer status:', error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
