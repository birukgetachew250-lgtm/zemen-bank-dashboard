import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { executeQuery } from '@/lib/oracle-db';
import { encrypt, decrypt } from '@/lib/crypto';
import crypto from 'crypto';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import { logActivity } from '@/lib/activity-log';

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
  const session = await requirePermission(PERMISSIONS.CUSTOMERS_CREATE);
  if (session instanceof NextResponse) return session;
  const sessionEmail = session.user?.email || '';

  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

    const requester = await db.user.findUnique({
      where: { email: sessionEmail },
      select: { branch: true, email: true },
    });

    if (!requester) {
      return NextResponse.json({ message: 'Requester account not found' }, { status: 403 });
    }

    const { customer, accounts, onboardingData, documents } = await req.json();

    if (!customer || !customer.customer_number || !accounts || !onboardingData) {
      return NextResponse.json(
        { message: 'Incomplete customer, account, or onboarding data' },
        { status: 400 }
      );
    }

    const rawPhone = String(customer.mobile_number || '').trim();
    const rawCif = String(customer.customer_number || '').trim();

    if (!rawPhone) {
      return NextResponse.json(
        { message: 'Customer phone number is required for registration.' },
        { status: 400 }
      );
    }

    // ── Enforce Phone Number & CIF Uniqueness in USER_MODULE.AppUsers ──
    const connStr = process.env.USER_MODULE_DB_CONNECTION_STRING;
    if (connStr) {
      try {
        const variants = getPhoneVariants(rawPhone);
        const hashes = variants.map((v) =>
          crypto.createHash('sha256').update(v).digest('hex')
        );
        const encryptedVariants = variants
          .map((v) => encrypt(v))
          .filter((v): v is string => Boolean(v));

        const binds: Record<string, any> = { cif: rawCif };
        const hashPlaceholders = hashes.map((h, i) => {
          binds[`h${i}`] = h;
          return `:h${i}`;
        });
        const encPlaceholders = encryptedVariants.map((e, i) => {
          binds[`e${i}`] = e;
          return `:e${i}`;
        });

        let whereSql = `"CIFNumber" = :cif OR "PhoneNumberHashed" IN (${hashPlaceholders.join(', ')})`;
        if (encPlaceholders.length > 0) {
          whereSql += ` OR "PhoneNumber" IN (${encPlaceholders.join(', ')})`;
        }

        const existingRes: any = await executeQuery(
          connStr,
          `SELECT "CIFNumber", "FirstName", "LastName"
           FROM "USER_MODULE"."AppUsers"
           WHERE ${whereSql}
           FETCH FIRST 1 ROWS ONLY`,
          binds
        );

        if (existingRes?.rows && existingRes.rows.length > 0) {
          const matched = existingRes.rows[0];
          const matchedCif = matched.CIFNumber || matched.CIFNUMBER;
          const matchedName = [
            decrypt(matched.FirstName || matched.FIRSTNAME),
            decrypt(matched.LastName || matched.LASTNAME),
          ]
            .filter(Boolean)
            .join(' ');

          return NextResponse.json(
            {
              message:
                matchedCif === rawCif
                  ? `Customer CIF ${rawCif} is already registered in SuperApp.`
                  : `Phone number ${rawPhone} is already registered to another customer (CIF: ${matchedCif}${
                      matchedName ? ` — ${matchedName}` : ''
                    }). Phone numbers must be unique.`,
            },
            { status: 409 }
          );
        }
      } catch (dbErr) {
        console.warn('[CustomerCreate] Oracle uniqueness check warning:', dbErr);
      }
    }

    // ── Also Check Active Pending Approvals (within 7 days) for Duplicate Phone / CIF ──
    const targetLast9 = rawPhone.replace(/\D/g, '').slice(-9);
    const pendingList = await db.pendingApproval.findMany({
      where: { type: 'new-customer', status: 'pending' },
      orderBy: { requestedAt: 'desc' },
      take: 100,
    });
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    for (const item of pendingList) {
      const reqTime = item.requestedAt ? new Date(item.requestedAt).getTime() : 0;
      if (reqTime < sevenDaysAgo) continue;
      const itemPhoneLast9 = String(item.customerPhone || '')
        .replace(/\D/g, '')
        .slice(-9);
      let itemCif = '';
      try {
        if (item.details) {
          const parsed = JSON.parse(item.details);
          itemCif = parsed?.cif || parsed?.customerData?.customer_number || '';
        }
      } catch {}

      if (targetLast9 && itemPhoneLast9 && targetLast9 === itemPhoneLast9) {
        return NextResponse.json(
          {
            message: `Phone number ${rawPhone} already has an active pending registration request (${
              item.customerName || `CIF ${itemCif}`
            }).`,
          },
          { status: 409 }
        );
      }
      if (rawCif && itemCif && rawCif === itemCif) {
        return NextResponse.json(
          {
            message: `Customer CIF ${rawCif} already has an active pending registration request.`,
          },
          { status: 409 }
        );
      }
    }

    let legacyCustomer = await db.customer.findFirst({
      where: { phone: customer.mobile_number },
    });

    if (!legacyCustomer) {
      legacyCustomer = await db.customer.create({
        data: {
          name: customer.full_name,
          phone: customer.mobile_number,
          status: 'Pending',
        },
      });
    }

    const normalizedDocuments = Array.isArray(documents)
      ? documents
      : Array.isArray(onboardingData?.documents)
      ? onboardingData.documents
      : [];

    const detailsForApproval = {
      cif: customer.customer_number,
      customerData: customer,
      linkedAccounts: accounts,
      onboardingData,
      documents: normalizedDocuments,
      requestContext: {
        requesterBranch: requester.branch || null,
        requesterEmail: requester.email,
      },
    };

    await db.pendingApproval.create({
      data: {
        customerId: legacyCustomer.id,
        type: 'new-customer',
        customerName: customer.full_name,
        customerPhone: customer.mobile_number,
        details: JSON.stringify(detailsForApproval),
        status: 'pending',
        requestedByEmail: requester.email,
      },
    });

    await logActivity({
      userEmail: sessionEmail,
      action: 'CUSTOMER_CREATE_REQUESTED',
      status: 'Success',
      details: `Submitted new customer onboarding approval for CIF ${customer.customer_number} (${customer.full_name}) with ${normalizedDocuments.length} KYC document(s).`,
      ipAddress: typeof ip === 'string' ? ip : undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Customer registration submitted for approval',
    });
  } catch (error: any) {
    console.error('Failed to create approval request:', error);

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    await logActivity({
      userEmail: sessionEmail || 'system',
      action: 'CUSTOMER_CREATE_REQUESTED',
      status: 'Failure',
      details: `Failed to submit new customer onboarding approval. Error: ${
        error?.message || 'Unknown error'
      }`,
      ipAddress: typeof ip === 'string' ? ip : undefined,
    });

    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
