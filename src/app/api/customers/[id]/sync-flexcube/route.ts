import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { decrypt, encrypt } from '@/lib/crypto';
import crypto from 'crypto';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import { logActivity } from '@/lib/activity-log';
import {
  fetchFlexCubeCustomerAndAccounts,
  splitFullName,
} from '@/lib/flexcube-sync';

export const dynamic = 'force-dynamic';

async function loadCurrentCustomerFromOracle(identifier: string) {
  const connStr = process.env.USER_MODULE_DB_CONNECTION_STRING;
  if (!connStr) {
    throw new Error('USER_MODULE_DB_CONNECTION_STRING is not configured.');
  }

  let cif = identifier;
  if (identifier.startsWith('user_')) {
    cif = identifier.split('_')[1];
  }

  const userRes: any = await executeQuery(
    connStr,
    `SELECT * FROM "USER_MODULE"."AppUsers" WHERE "CIFNumber" = :cif OR "Id" = :id FETCH FIRST 1 ROWS ONLY`,
    { cif, id: identifier }
  );

  if (!userRes?.rows || userRes.rows.length === 0) {
    return null;
  }

  const user = userRes.rows[0];
  const actualCif = String(user.CIFNumber);
  const firstName = decrypt(user.FirstName) || '';
  const secondName = decrypt(user.SecondName) || '';
  const lastName = decrypt(user.LastName) || '';
  const fullName = [firstName, secondName, lastName].filter(Boolean).join(' ').trim();
  const phoneNumber = decrypt(user.PhoneNumber) || '';
  const email = decrypt(user.Email) || '';

  const accRes: any = await executeQuery(
    connStr,
    `SELECT * FROM "USER_MODULE"."Accounts" WHERE "CIFNumber" = :cif`,
    { cif: actualCif }
  );

  const linkedAccounts = (accRes?.rows || []).map((acc: any) => ({
    id: acc.Id,
    accountNumber: decrypt(acc.AccountNumber) || '',
    hashedAccountNumber: acc.HashedAccountNumber || '',
    accountType: decrypt(acc.AccountType) || '',
    accountClass: acc.AccountClass || '',
    customerCategory: acc.CustomerCategory || '',
    currency: decrypt(acc.Currency) || 'ETB',
    status: acc.Status || 'Active',
    branchCode: acc.BranchCode || '',
    branchName: acc.BranchName || '',
  }));

  return {
    id: user.Id,
    cifNumber: actualCif,
    fullName,
    firstName,
    secondName,
    lastName,
    phoneNumber,
    email,
    branchCode: user.BranchCode || '103',
    branchName: user.BranchName || '',
    mobileStatus: user.MobileStatus || 'Active',
    ussdStatus: user.UssdStatus || 'Pending',
    linkedAccounts,
  };
}

/**
 * GET /api/customers/[id]/sync-flexcube
 * Previews live FlexCube customer & account status data side-by-side with USER_MODULE.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requirePermission(PERMISSIONS.CUSTOMERS_READ);
  if (session instanceof NextResponse) return session;

  try {
    const current = await loadCurrentCustomerFromOracle(params.id);
    if (!current) {
      return NextResponse.json({ message: 'Customer not found in USER_MODULE.AppUsers.' }, { status: 404 });
    }

    const flexcube = await fetchFlexCubeCustomerAndAccounts(
      current.cifNumber,
      current.branchCode || '103'
    );

    const flexByHash = new Map(
      flexcube.accounts.map((a) => [a.hashedAccountNumber, a])
    );
    const flexByAccNo = new Map(
      flexcube.accounts.map((a) => [a.accountNumber, a])
    );

    const accountComparisons = current.linkedAccounts.map((linked: any) => {
      const match =
        flexByHash.get(linked.hashedAccountNumber) ||
        flexByAccNo.get(linked.accountNumber);

      const nextAccountClass =
        match?.accountClass || linked.accountClass || 'SAV';
      const nextCustomerCategory =
        match?.customerCategory ||
        linked.customerCategory ||
        flexcube.customerCategory ||
        'INDV';

      // Preserve 'Unlinked' if the account was explicitly unlinked, otherwise take FlexCube derivedStatus
      const nextStatus =
        linked.status === 'Unlinked'
          ? 'Unlinked'
          : match?.derivedStatus || linked.status || 'Active';

      return {
        id: linked.id,
        accountNumber: linked.accountNumber,
        currentStatus: linked.status,
        flexcubeStatus: match?.derivedStatus || 'Not Found in FlexCube',
        recommendedStatus: nextStatus,
        statusChanged: linked.status !== nextStatus,
        currentAccountClass: linked.accountClass || null,
        flexcubeAccountClass: nextAccountClass,
        currentCustomerCategory: linked.customerCategory || null,
        flexcubeCustomerCategory: nextCustomerCategory,
        classOrCategoryMissing: !linked.accountClass || !linked.customerCategory,
        isFrozen: match?.isFrozen ?? false,
        isDormant: match?.isDormant ?? false,
        isBlocked: match?.isBlocked ?? false,
        statusReason: match?.statusReason || null,
      };
    });

    const recommendedAppStatus =
      flexcube.isCustomerDeceased || flexcube.isCustomerFrozen
        ? 'Suspended'
        : current.mobileStatus;

    return NextResponse.json({
      cifNumber: current.cifNumber,
      current: {
        fullName: current.fullName,
        firstName: current.firstName,
        secondName: current.secondName,
        lastName: current.lastName,
        phoneNumber: current.phoneNumber,
        email: current.email,
        mobileStatus: current.mobileStatus,
        ussdStatus: current.ussdStatus,
        branchCode: current.branchCode,
      },
      flexcube: {
        fullName: flexcube.fullName || current.fullName,
        firstName: flexcube.firstName || current.firstName,
        secondName: flexcube.secondName,
        lastName: flexcube.lastName || current.lastName,
        phoneNumber: flexcube.phoneNumber || current.phoneNumber,
        email: flexcube.email ?? current.email,
        customerCategory: flexcube.customerCategory,
        isCustomerFrozen: flexcube.isCustomerFrozen,
        isCustomerDeceased: flexcube.isCustomerDeceased,
        recommendedAppStatus,
        totalFlexAccounts: flexcube.accounts.length,
      },
      accountComparisons,
    });
  } catch (error: any) {
    console.error('[SYNC_FLEXCUBE_GET] Error:', error);
    return NextResponse.json(
      { message: error?.message || 'Failed to preview FlexCube sync data.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customers/[id]/sync-flexcube
 * Synchronizes customer Full Name, Phone Number, Email, Customer Freeze Status,
 * and Linked Accounts (Status, AccountClass, CustomerCategory) from FlexCube into USER_MODULE.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requirePermission(PERMISSIONS.CUSTOMERS_READ);
  if (session instanceof NextResponse) return session;

  const connStr = process.env.USER_MODULE_DB_CONNECTION_STRING;
  if (!connStr) {
    return NextResponse.json(
      { message: 'USER_MODULE_DB_CONNECTION_STRING is not configured.' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const current = await loadCurrentCustomerFromOracle(params.id);
    if (!current) {
      return NextResponse.json(
        { message: 'Customer not found in USER_MODULE.AppUsers.' },
        { status: 404 }
      );
    }

    const flexcube = await fetchFlexCubeCustomerAndAccounts(
      current.cifNumber,
      current.branchCode || '103'
    );

    // Resolve final values to apply (allowing admin override or direct FlexCube values)
    const targetFullName = String(
      body.fullName ?? (flexcube.fullName || current.fullName)
    ).trim();
    const { firstName, secondName, lastName } = splitFullName(targetFullName);

    const rawPhone = String(
      body.phoneNumber ?? (flexcube.phoneNumber || current.phoneNumber)
    ).trim();
    const normalizedPhone = rawPhone.replace(/\D/g, '') || current.phoneNumber.replace(/\D/g, '');
    const phoneHash = crypto
      .createHash('sha256')
      .update(normalizedPhone)
      .digest('hex');

    const targetEmail = String(
      body.email !== undefined ? body.email : (flexcube.email ?? current.email)
    ).trim();

    const syncCustomerFreeze = body.syncCustomerStatus !== false;
    let nextMobileStatus = current.mobileStatus;
    let nextUssdStatus = current.ussdStatus;

    if (syncCustomerFreeze && (flexcube.isCustomerFrozen || flexcube.isCustomerDeceased)) {
      nextMobileStatus = 'Suspended';
      nextUssdStatus = 'Suspended';
    } else if (body.mobileStatus) {
      nextMobileStatus = body.mobileStatus;
    }

    const actor = String(session?.user?.email || 'system').slice(0, 50);

    // 1. Update USER_MODULE.AppUsers
    await executeQuery(
      connStr,
      `UPDATE "USER_MODULE"."AppUsers"
       SET
         "FirstName" = :FirstName,
         "SecondName" = :SecondName,
         "LastName" = :LastName,
         "PhoneNumber" = :PhoneNumber,
         "PhoneNumberHashed" = :PhoneNumberHashed,
         "Email" = :Email,
         "MobileStatus" = :MobileStatus,
         "UssdStatus" = :UssdStatus,
         "UpdateDate" = SYSTIMESTAMP,
         "UpdateUser" = :UpdateUser
       WHERE "CIFNumber" = :CIFNumber`,
      {
        FirstName: encrypt(firstName)!,
        SecondName: encrypt(secondName)!,
        LastName: encrypt(lastName)!,
        PhoneNumber: encrypt(normalizedPhone)!,
        PhoneNumberHashed: phoneHash,
        Email: encrypt(targetEmail)!,
        MobileStatus: nextMobileStatus,
        UssdStatus: nextUssdStatus,
        UpdateUser: actor,
        CIFNumber: current.cifNumber,
      }
    );

    // 2. Sync all linked accounts in USER_MODULE.Accounts (Status, AccountClass, CustomerCategory, Name)
    const flexByHash = new Map(
      flexcube.accounts.map((a) => [a.hashedAccountNumber, a])
    );
    const flexByAccNo = new Map(
      flexcube.accounts.map((a) => [a.accountNumber, a])
    );

    let updatedAccountsCount = 0;
    const accountSyncResults: Array<{
      accountNumber: string;
      oldStatus: string;
      newStatus: string;
      accountClass: string;
      customerCategory: string;
    }> = [];

    for (const linked of current.linkedAccounts) {
      const match =
        flexByHash.get(linked.hashedAccountNumber) ||
        flexByAccNo.get(linked.accountNumber);

      const nextAccountClass =
        match?.accountClass || linked.accountClass || 'SAV';
      const nextCustomerCategory =
        match?.customerCategory ||
        linked.customerCategory ||
        flexcube.customerCategory ||
        'INDV';
      const nextAccountType =
        match?.accountType || linked.accountType || nextAccountClass;

      const nextStatus =
        linked.status === 'Unlinked'
          ? 'Unlinked'
          : match?.derivedStatus || linked.status || 'Active';

      await executeQuery(
        connStr,
        `UPDATE "USER_MODULE"."Accounts"
         SET
           "FirstName" = :FirstName,
           "SecondName" = :SecondName,
           "LastName" = :LastName,
           "AccountType" = :AccountType,
           "AccountClass" = :AccountClass,
           "CustomerCategory" = :CustomerCategory,
           "Status" = :Status
         WHERE "Id" = :Id`,
        {
          FirstName: encrypt(firstName)!,
          SecondName: encrypt(secondName)!,
          LastName: encrypt(lastName)!,
          AccountType: encrypt(String(nextAccountType))!,
          AccountClass: nextAccountClass,
          CustomerCategory: nextCustomerCategory,
          Status: nextStatus,
          Id: linked.id,
        }
      );

      updatedAccountsCount++;
      accountSyncResults.push({
        accountNumber: linked.accountNumber,
        oldStatus: linked.status,
        newStatus: nextStatus,
        accountClass: nextAccountClass,
        customerCategory: nextCustomerCategory,
      });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    await logActivity({
      userEmail: actor,
      action: 'CUSTOMER_UPDATE_APPROVED',
      status: 'Success',
      details: `Synced CIF ${current.cifNumber} from FlexCube: Name="${targetFullName}", Phone="${normalizedPhone}", Email="${targetEmail}", Status="${nextMobileStatus}", Updated ${updatedAccountsCount} linked account(s) (AccountClass, CustomerCategory & Freeze/Active status).`,
      ipAddress: typeof ip === 'string' ? ip : undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Customer profile and ${updatedAccountsCount} linked account(s) synced with FlexCube.`,
      syncedProfile: {
        cifNumber: current.cifNumber,
        name: targetFullName,
        firstName,
        secondName,
        lastName,
        phoneNumber: normalizedPhone,
        email: targetEmail,
        mobileStatus: nextMobileStatus,
        ussdStatus: nextUssdStatus,
      },
      accountSyncResults,
    });
  } catch (error: any) {
    console.error('[SYNC_FLEXCUBE_POST] Error:', error);
    return NextResponse.json(
      { message: error?.message || 'Failed to sync customer from FlexCube.' },
      { status: 500 }
    );
  }
}
