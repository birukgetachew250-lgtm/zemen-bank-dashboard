import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { encrypt, decrypt } from '@/lib/crypto';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { requireAuthenticatedSession } from '@/lib/auth-utils';

function getPhoneVariants(rawPhone: string): string[] {
  const trimmed = rawPhone.trim();
  const digits = trimmed.replace(/\D/g, '');
  const last9 = digits.length >= 9 ? digits.slice(-9) : digits;

  const variants = new Set<string>([trimmed, digits]);
  if (last9.length === 9) {
    variants.add(`251${last9}`);
    variants.add(`+251${last9}`);
    variants.add(`0${last9}`);
    variants.add(last9);
  }
  return Array.from(variants).filter(Boolean);
}

export async function POST(req: Request) {
  const session = await requireAuthenticatedSession();
  if (session instanceof NextResponse) return session;

  try {
    const { phoneNumber, cif } = await req.json();
    const rawPhone = String(phoneNumber || '').trim();
    const rawCif = String(cif || '').trim();

    if (!rawPhone) {
      return NextResponse.json(
        { exists: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    const variants = getPhoneVariants(rawPhone);
    const hashes = variants.map((v) =>
      crypto.createHash('sha256').update(v).digest('hex')
    );
    const encryptedVariants = variants
      .map((v) => encrypt(v))
      .filter((v): v is string => Boolean(v));
    const targetLast9 = rawPhone.replace(/\D/g, '').slice(-9);

    // 1. Check Oracle "USER_MODULE"."AppUsers"
    const connStr = process.env.USER_MODULE_DB_CONNECTION_STRING;
    if (connStr) {
      try {
        const hashBinds: Record<string, any> = {};
        const hashPlaceholders = hashes.map((h, i) => {
          const k = `h${i}`;
          hashBinds[k] = h;
          return `:${k}`;
        });

        const encPlaceholders = encryptedVariants.map((e, i) => {
          const k = `e${i}`;
          hashBinds[k] = e;
          return `:${k}`;
        });

        let whereSql = `"PhoneNumberHashed" IN (${hashPlaceholders.join(', ')})`;
        if (encPlaceholders.length > 0) {
          whereSql += ` OR "PhoneNumber" IN (${encPlaceholders.join(', ')})`;
        }
        if (rawCif) {
          hashBinds.cif = rawCif;
          whereSql += ` OR "CIFNumber" = :cif`;
        }

        const res: any = await executeQuery(
          connStr,
          `SELECT "CIFNumber", "FirstName", "LastName", "PhoneNumber", "MobileStatus"
           FROM "USER_MODULE"."AppUsers"
           WHERE ${whereSql}
           FETCH FIRST 5 ROWS ONLY`,
          hashBinds
        );

        if (res?.rows && res.rows.length > 0) {
          const matched = res.rows[0];
          const matchedCif = matched.CIFNumber || matched.CIFNUMBER;
          const matchedName = [
            decrypt(matched.FirstName || matched.FIRSTNAME),
            decrypt(matched.LastName || matched.LASTNAME),
          ]
            .filter(Boolean)
            .join(' ');

          if (rawCif && matchedCif === rawCif) {
            return NextResponse.json({
              exists: true,
              conflictType: 'CIF_AND_PHONE',
              existingCif: matchedCif,
              existingName: matchedName,
              message: `Customer with CIF ${matchedCif} (${
                matchedName || 'existing user'
              }) is already registered in SuperApp.`,
            });
          }

          return NextResponse.json({
            exists: true,
            conflictType: 'PHONE',
            existingCif: matchedCif,
            existingName: matchedName,
            message: `Phone number ${rawPhone} is already registered to another customer (CIF: ${matchedCif}${
              matchedName ? ` — ${matchedName}` : ''
            }). Phone numbers must be unique.`,
          });
        }
      } catch (dbErr) {
        console.warn('[CheckPhone] Oracle query warning:', dbErr);
      }
    }

    // 2. Check Pending Approvals for an active unapproved new-customer request with this phone or CIF
    try {
      const pendingList = await db.pendingApproval.findMany({
        where: { type: 'new-customer', status: 'pending' },
        orderBy: { requestedAt: 'desc' },
        take: 100,
      });

      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      for (const item of pendingList) {
        const reqTime = item.requestedAt ? new Date(item.requestedAt).getTime() : 0;
        if (reqTime < sevenDaysAgo) continue; // Ignore expired >7d requests

        const itemPhoneDigits = String(item.customerPhone || '')
          .replace(/\D/g, '')
          .slice(-9);
        let itemCif = '';
        try {
          if (item.details) {
            const parsed = JSON.parse(item.details);
            itemCif = parsed?.cif || parsed?.customerData?.customer_number || '';
          }
        } catch {}

        if (targetLast9 && itemPhoneDigits && targetLast9 === itemPhoneDigits) {
          return NextResponse.json({
            exists: true,
            conflictType: 'PENDING_PHONE',
            existingCif: itemCif,
            existingName: item.customerName,
            message: `Phone number ${rawPhone} already has a pending registration request awaiting Checker approval (${
              item.customerName || `CIF ${itemCif}`
            }).`,
          });
        }

        if (rawCif && itemCif && rawCif === itemCif) {
          return NextResponse.json({
            exists: true,
            conflictType: 'PENDING_CIF',
            existingCif: itemCif,
            existingName: item.customerName,
            message: `Customer CIF ${rawCif} already has a pending registration request awaiting Checker approval.`,
          });
        }
      }
    } catch (err) {
      console.warn('[CheckPhone] PendingApproval check warning:', err);
    }

    return NextResponse.json({
      exists: false,
      message: 'Phone number is unique and available for registration.',
    });
  } catch (error: any) {
    console.error('[CheckPhone] Error:', error);
    return NextResponse.json(
      { exists: false, message: 'Could not verify phone uniqueness' },
      { status: 500 }
    );
  }
}
