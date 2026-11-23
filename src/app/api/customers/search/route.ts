import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { decrypt } from '@/lib/crypto';
import crypto from 'crypto';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

/**
 * GET /api/customers/search?q=XXXX  (Global Customer Search by Name, Phone, or CIF)
 * GET /api/customers/search?accountNumber=XXXX  (Account Number lookup)
 */
export async function GET(req: Request) {
  const session = await requirePermission(PERMISSIONS.CUSTOMERS_READ);
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const queryText = searchParams.get('q')?.trim();
  const accountNumber = searchParams.get('accountNumber')?.trim();
  const recent = searchParams.get('recent') === 'true';

  // ─── Mode 0: Recent Directory Listing (?recent=true) ───
  if (recent) {
    const results: Array<{
      id: string;
      cifNumber: string;
      name: string;
      phoneNumber: string;
      email?: string;
      branchName?: string;
      mobileStatus?: string;
      insertDate?: string;
      matchType: 'CIF' | 'Phone' | 'Name';
    }> = [];
    const seenCifs = new Set<string>();

    try {
      const connStr = process.env.USER_MODULE_DB_CONNECTION_STRING;
      if (connStr) {
        const recentRes: any = await executeQuery(
          connStr,
          `SELECT "Id", "CIFNumber", "FirstName", "SecondName", "LastName",
                  "Email", "PhoneNumber", "MobileStatus", "BranchName", "InsertDate"
           FROM "USER_MODULE"."AppUsers"
           ORDER BY "InsertDate" DESC NULLS LAST
           FETCH FIRST 15 ROWS ONLY`
        );
        for (const user of recentRes?.rows || []) {
          const cif = String(user.CIFNumber || '');
          if (!cif || seenCifs.has(cif)) continue;
          seenCifs.add(cif);
          const firstName = decrypt(user.FirstName) || '';
          const secondName = decrypt(user.SecondName) || '';
          const lastName = decrypt(user.LastName) || '';
          const fullName = [firstName, secondName, lastName].filter(Boolean).join(' ').trim();
          results.push({
            id: user.Id || `user_${cif}`,
            cifNumber: cif,
            name: fullName || `Customer ${cif}`,
            phoneNumber: decrypt(user.PhoneNumber) || '',
            email: decrypt(user.Email) || '',
            branchName: user.BranchName || 'Main Branch',
            mobileStatus: user.MobileStatus || 'Active',
            insertDate: user.InsertDate ? new Date(user.InsertDate).toISOString() : undefined,
            matchType: 'CIF',
          });
        }
      }
    } catch (err) {
      console.error('[CustomerDirectoryRecent] Oracle query warning:', err);
    }

    return NextResponse.json({ results });
  }

  // ─── Mode 1: Global Customer Search (?q=...) ───
  if (queryText !== undefined) {
    if (!queryText || queryText.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const qLower = queryText.toLowerCase();
    const results: Array<{
      id: string;
      cifNumber: string;
      name: string;
      phoneNumber: string;
      email?: string;
      branchName?: string;
      mobileStatus?: string;
      matchType: 'CIF' | 'Phone' | 'Name';
    }> = [];
    const seenCifs = new Set<string>();

    try {
      const connStr = process.env.USER_MODULE_DB_CONNECTION_STRING;
      if (connStr) {
        const phoneHash = crypto.createHash('sha256').update(queryText).digest('hex');

        // 1) Fast targeted query for CIF match or exact hashed phone match
        const directRes: any = await executeQuery(
          connStr,
          `SELECT "Id", "CIFNumber", "FirstName", "SecondName", "LastName",
                  "Email", "PhoneNumber", "MobileStatus", "BranchName"
           FROM "USER_MODULE"."AppUsers"
           WHERE LOWER("CIFNumber") LIKE :cifPattern
              OR "PhoneNumberHashed" = :phoneHash
           FETCH FIRST 15 ROWS ONLY`,
          {
            cifPattern: `%${qLower}%`,
            phoneHash,
          }
        );

        const processRow = (user: any) => {
          const cif = String(user.CIFNumber || '');
          if (!cif || seenCifs.has(cif)) return;

          const firstName = decrypt(user.FirstName) || '';
          const secondName = decrypt(user.SecondName) || '';
          const lastName = decrypt(user.LastName) || '';
          const fullName = [firstName, secondName, lastName].filter(Boolean).join(' ').trim();
          const phone = decrypt(user.PhoneNumber) || '';
          const email = decrypt(user.Email) || '';

          let matchType: 'CIF' | 'Phone' | 'Name' | null = null;
          if (cif.toLowerCase().includes(qLower)) {
            matchType = 'CIF';
          } else if (phone.toLowerCase().includes(qLower)) {
            matchType = 'Phone';
          } else if (fullName.toLowerCase().includes(qLower)) {
            matchType = 'Name';
          }

          if (matchType) {
            seenCifs.add(cif);
            results.push({
              id: user.Id || `user_${cif}`,
              cifNumber: cif,
              name: fullName || `Customer ${cif}`,
              phoneNumber: phone,
              email,
              branchName: user.BranchName || '',
              mobileStatus: user.MobileStatus || 'Active',
              matchType,
            });
          }
        };

        for (const row of directRes?.rows || []) {
          processRow(row);
        }

        // 2) If we still have fewer than 8 results, scan AppUsers to match decrypted Name / partial Phone
        if (results.length < 8) {
          const scanRes: any = await executeQuery(
            connStr,
            `SELECT "Id", "CIFNumber", "FirstName", "SecondName", "LastName",
                    "Email", "PhoneNumber", "MobileStatus", "BranchName"
             FROM "USER_MODULE"."AppUsers"
             ORDER BY "InsertDate" DESC NULLS LAST
             FETCH FIRST 250 ROWS ONLY`
          );

          for (const row of scanRes?.rows || []) {
            if (results.length >= 8) break;
            processRow(row);
          }
        }
      }
    } catch (err) {
      console.error('[GlobalCustomerSearch] Oracle query warning:', err);
    }

    return NextResponse.json({ results: results.slice(0, 8) });
  }

  // ─── Mode 2: Account Number Lookup (?accountNumber=...) ───
  if (!accountNumber) {
    return NextResponse.json(
      { message: 'accountNumber or q query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const result: any = await executeQuery(
      process.env.USER_MODULE_DB_CONNECTION_STRING,
      `SELECT u."Id", u."CIFNumber", u."FirstName", u."SecondName", u."LastName",
              u."Email", u."PhoneNumber", u."MobileStatus", u."UssdStatus", u."BranchName", u."BranchCode",
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
    const lastName = decrypt(user.LastName);

    return NextResponse.json({
      id: user.Id,
      cifNumber: user.CIFNumber,
      name: [firstName, decrypt(user.SecondName), lastName].filter(Boolean).join(' '),
      firstName,
      lastName,
      email: decrypt(user.Email),
      phoneNumber: decrypt(user.PhoneNumber),
      address: [user.AddressLine1, user.AddressLine2].filter(Boolean).join(', '),
      nationality: user.Nationality,
      branchName: user.BranchName,
      branchCode: user.BranchCode,
      mobileStatus: user.MobileStatus,
      ussdStatus: user.UssdStatus,
      insertDate: user.InsertDate?.toISOString?.() ?? '',
      signUpMainAuth: user.SignUpMainAuth,
      signUp2FA: user.SignUp2FA,
      channel: user.Channel,
      accountNumber: user.AccountNumber,
    });
  } catch (e: any) {
    console.error('[AccountSearch] Oracle query failed:', e);

    return NextResponse.json(
      { message: 'Failed to search by account number. Please try again.' },
      { status: 500 }
    );
  }
}
