
'use server';

import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { decrypt } from '@/lib/crypto';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

/**
 * GET /api/customers/search?accountNumber=XXXX
 * Searches for a customer by their bank account number.
 */
export async function GET(req: Request) {
  const session = await requirePermission(PERMISSIONS.CUSTOMERS_READ);
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const accountNumber = searchParams.get('accountNumber')?.trim();

  if (!accountNumber) {
    return NextResponse.json(
      { message: 'accountNumber query parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Query Oracle DB: join Accounts to AppUsers via CIF
    const result: any = await executeQuery(
      process.env.USER_MODULE_DB_CONNECTION_STRING,
      `SELECT u."Id", u."CIFNumber", u."FirstName", u."SecondName", u."LastName",
              u."Email", u."PhoneNumber", u."Status", u."BranchName", u."BranchCode",
              u."InsertDate", u."Nationality", u."AddressLine1", u."AddressLine2",
              u."SignUpMainAuth", u."SignUp2FA", u."Channel",
              a."AccountNumber"
       FROM "USER_MODULE"."AppUsers" u
       JOIN "USER_MODULE"."Accounts" a ON a."CIFNumber" = u."CIFNumber"
       WHERE a."AccountNumber" = :accNo
       FETCH FIRST 1 ROWS ONLY`,
      { accNo: accountNumber }
    );

    if (!result?.rows || result.rows.length === 0) {
      return NextResponse.json(
        { message: `No customer found for account number: ${accountNumber}` },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    const firstName = decrypt(user.FirstName);
    const lastName  = decrypt(user.LastName);

    return NextResponse.json({
      id:             user.Id,
      cifNumber:      user.CIFNumber,
      name:           [firstName, decrypt(user.SecondName), lastName].filter(Boolean).join(' '),
      firstName,
      lastName,
      email:          decrypt(user.Email),
      phoneNumber:    decrypt(user.PhoneNumber),
      address:        [user.AddressLine1, user.AddressLine2].filter(Boolean).join(', '),
      nationality:    user.Nationality,
      branchName:     user.BranchName,
      branchCode:     user.BranchCode,
      status:         user.Status,
      insertDate:     user.InsertDate?.toISOString?.() ?? '',
      signUpMainAuth: user.SignUpMainAuth,
      signUp2FA:      user.SignUp2FA,
      channel:        user.Channel,
      accountNumber:  user.AccountNumber,
    });
  } catch (e: any) {
    console.error('[AccountSearch] Oracle query failed:', e);

    // Fallback demo data when DB is unavailable
    if (accountNumber === '1234567890') {
      return NextResponse.json({
        id:            'user_demo',
        cifNumber:     '0048533',
        name:          'AKALEWORK TAMENE KEBEDE',
        firstName:     'AKALEWORK',
        lastName:      'KEBEDE',
        email:         'akalework.t@example.com',
        phoneNumber:   '+251911223345',
        address:       'Arada, Addis Ababa',
        nationality:   'Ethiopian',
        branchName:    'Arada',
        branchCode:    '103',
        status:        'Active',
        insertDate:    new Date().toISOString(),
        signUpMainAuth:'SMSOTP',
        signUp2FA:     'GAUTH',
        channel:       'Both',
        accountNumber: '1234567890',
      });
    }

    return NextResponse.json(
      { message: 'Failed to search by account number. Please try again.' },
      { status: 500 }
    );
  }
}
