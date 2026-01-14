
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { decrypt } from '@/lib/crypto';
import { db } from '@/lib/db';

async function getAdminUserRoles() {
    try {
        const users = await db.user.findMany({
            select: { email: true, role: true }
        });
        return users.reduce((acc, user) => {
            acc[user.email.toLowerCase()] = user.role;
            return acc;
        }, {} as Record<string, string>);
    } catch (e) {
        console.error("Failed to fetch admin roles from dashboard DB:", e);
        return {};
    }
}

export async function GET() {
    try {
        const adminRoles = await getAdminUserRoles();
        
        const query = `SELECT "Id", "FirstName", "SecondName", "LastName", "Email", "SignUp2FA" FROM "USER_MODULE"."AppUsers" WHERE "Status" = 'Active'`;
        const result: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, query);
        
        if (!result.rows) {
            return NextResponse.json([]);
        }

        const userStatuses = result.rows.map((user: any) => {
            const email = decrypt(user.Email)?.toLowerCase() || '';
            let mfaStatus = 'Not Enrolled';
            let method = 'N/A';
            
            if (user.SignUp2FA && user.SignUp2FA !== 'None') {
                mfaStatus = 'Enrolled';
                method = user.SignUp2FA;
            }

            const firstName = decrypt(user.FirstName);
            const secondName = decrypt(user.SecondName);
            const lastName = decrypt(user.LastName);
            
            return {
                id: user.Id,
                name: [firstName, secondName, lastName].filter(Boolean).join(' '),
                email: email,
                role: adminRoles[email] || 'App User',
                mfaStatus,
                method,
            };
        });

        return NextResponse.json(userStatuses);

    } catch (error) {
        console.error('Failed to fetch user MFA statuses:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
