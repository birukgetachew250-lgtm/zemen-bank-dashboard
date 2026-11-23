import oracledb from 'oracledb';
import crypto from 'crypto';
import { getAccountClassDescription } from '@/lib/account-class-mapper';

export interface FlexCubeAccountMeta {
  accountNumber: string;
  hashedAccountNumber: string;
  branchCode: string;
  currency: string;
  accountType: string;
  accountClass: string;
  accountClassDescription: string;
  customerCategory: string;
  customerName: string;
  accStatus: string;
  recordStat: 'O' | 'C';
  isFrozen: boolean;
  isDormant: boolean;
  isBlocked: boolean;
  isNoDebit: boolean;
  isNoCredit: boolean;
  isLoan: boolean;
  derivedStatus: 'Active' | 'Frozen' | 'Dormant' | 'Blocked' | 'Closed';
  statusReason: string | null;
}

export interface FlexCubeCustomerSyncData {
  cif: string;
  fullName: string;
  firstName: string;
  secondName: string;
  lastName: string;
  phoneNumber: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  addressLine3: string | null;
  addressLine4: string | null;
  nationality: string | null;
  branchCode: string | null;
  customerCategory: string;
  customerType: string;
  isCustomerFrozen: boolean;
  isCustomerDeceased: boolean;
  accounts: FlexCubeAccountMeta[];
}

function ynFlag(val: any): 'Y' | 'N' {
  const v = String(val ?? '').trim().toUpperCase();
  return v === 'Y' ? 'Y' : 'N';
}

function recordStat(val: any): 'O' | 'C' {
  const v = String(val ?? '').trim().toUpperCase();
  return v === 'C' ? 'C' : 'O';
}

export function splitFullName(fullName: string): {
  firstName: string;
  secondName: string;
  lastName: string;
} {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: '', secondName: '', lastName: '' };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], secondName: '', lastName: parts[0] };
  }
  if (parts.length === 2) {
    return { firstName: parts[0], secondName: '', lastName: parts[1] };
  }
  return {
    firstName: parts[0],
    secondName: parts.slice(1, -1).join(' '),
    lastName: parts[parts.length - 1],
  };
}

// Optional OAuth2 token cache for FlexCube REST customer detail lookup
let cachedFlexToken: string | null = null;
let cachedFlexTokenExpiresAt = 0;

async function fetchFlexRestCustomerDetail(
  cif: string,
  branchCode: string
): Promise<{
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  nationality?: string;
  branchCode?: string;
} | null> {
  const tokenUrl = process.env.FLEX_OAUTH_TOKEN_URL;
  const clientId = process.env.FLEX_OAUTH_CLIENT_ID;
  const clientSecret = process.env.FLEX_OAUTH_CLIENT_SECRET;
  const detailUrl = process.env.FLEX_CUSTOMER_DETAIL_URL;

  if (!tokenUrl || !clientId || !clientSecret || !detailUrl) {
    return null;
  }

  try {
    const now = Date.now();
    if (!cachedFlexToken || now >= cachedFlexTokenExpiresAt - 30_000) {
      const body = new URLSearchParams();
      body.append('client_id', clientId);
      body.append('client_secret', clientSecret);
      body.append('grant_type', process.env.FLEX_OAUTH_GRANT_TYPE || 'client_credentials');

      const tokenRes = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (!tokenRes.ok) return null;
      const tokenJson = await tokenRes.json();
      cachedFlexToken = tokenJson.token || tokenJson.access_token || null;
      cachedFlexTokenExpiresAt =
        now + (tokenJson.expires_in ? Number(tokenJson.expires_in) * 1000 : 3_600_000);
    }

    if (!cachedFlexToken) return null;

    const requestId = `SYNC-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const res = await fetch(detailUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cachedFlexToken}`,
      },
      body: JSON.stringify({
        branchCode: branchCode || '103',
        channel: process.env.FLEX_API_CHANNEL || 'WEB',
        accountNumber: cif,
        customerNumber: cif,
        requestId,
        userId: process.env.FLEX_API_USER_ID || 'DASH_USER',
      }),
    });

    if (!res.ok) return null;
    const json = await res.json();
    if (json.status === 'Failed' || json.status === 'System Error') return null;

    const data = json?.data?.accountDetail || json?.data || json;
    const personal = data?.personalDetail || {};
    const addr = personal?.address || {};

    return {
      fullName: personal.fullName || data.accountHolder || data.customerName || undefined,
      phoneNumber: personal.phoneNumber || data.mobileNumber || undefined,
      email: personal.email || data.emailId || undefined,
      addressLine1: addr.city || data.addressLine1 || undefined,
      addressLine2: addr.subcity || data.addressLine2 || undefined,
      addressLine3: data.addressLine3 || undefined,
      addressLine4: data.addressLine4 || undefined,
      nationality: personal.nationality || data.country || undefined,
      branchCode: data.branchCode || branchCode || undefined,
    };
  } catch (err) {
    console.warn('[FlexCubeSync][REST] Optional REST detail fetch warning:', err);
    return null;
  }
}

/**
 * Fetches live customer demographics, freeze/status flags, and all accounts
 * (including ACCOUNT_CLASS, CUSTOMER_CATEGORY, and freeze/dormant/closed status)
 * directly from FlexCube DB + REST API.
 */
export async function fetchFlexCubeCustomerAndAccounts(
  cif: string,
  branchHint = '103'
): Promise<FlexCubeCustomerSyncData> {
  const user = process.env.FLEXDB_USER;
  const password = process.env.FLEXDB_PASSWORD;
  const connectString = process.env.FLEXDB_CONNECT_STRING;

  let rows: any[] = [];
  let personalRow: any = null;

  if (user && password && connectString) {
    let connection: oracledb.Connection | undefined;
    try {
      connection = await oracledb.getConnection({ user, password, connectString });

      // 1. Query STTM_CUSTOMER + STTM_CUST_ACCOUNT + Loan View
      const sql = `
        SELECT
          sca.BRANCH_CODE,
          sca.CUST_NO,
          sca.ACCOUNT_CLASS,
          sca.AC_DESC,
          sc.CUSTOMER_NAME1,
          sc.CUSTOMER_CATEGORY,
          sc.CUSTOMER_TYPE,
          sc.CUSTOMER_NO,
          sc.DECEASED        AS CUST_DECEASED,
          sc.FROZEN          AS CUST_FROZEN,
          sc.ADDRESS_LINE1,
          sc.ADDRESS_LINE2,
          sc.ADDRESS_LINE3,
          sc.ADDRESS_LINE4,
          sc.COUNTRY,
          sc.LOCAL_BRANCH,
          sca.AC_STAT_NO_CR,
          sca.AC_STAT_BLOCK,
          sca.AC_STAT_DORMANT,
          sca.AC_STAT_FROZEN,
          sca.AC_STAT_NO_DR,
          sca.ACC_STATUS,
          sca.ACCOUNT_TYPE,
          sca.CCY,
          sca.CUST_AC_NO,
          sca.RECORD_STAT,
          c.ACCOUNT_NUMBER   AS LOAN_ACCOUNT_NUMBER,
          c.ACCOUNT_STATUS   AS LOAN_ACCOUNT_STATUS
        FROM FCUBSPRD.STTM_CUSTOMER sc
        LEFT JOIN FCUBSPRD.STTM_CUST_ACCOUNT sca ON sc.CUSTOMER_NO = sca.CUST_NO
        LEFT JOIN FCUBSPRD.SUPERAPP_CLTB_ACCOUNT_MASTER_VW c
          ON c.CUSTOMER_ID = sc.CUSTOMER_NO AND c.ACCOUNT_STATUS = 'A'
        WHERE sc.CUSTOMER_NO = :cif
      `;

      try {
        const result = await connection.execute(
          sql,
          { cif },
          { outFormat: oracledb.OBJECT, autoCommit: false }
        );
        rows = (result.rows || []) as any[];
      } catch {
        // Fallback query if optional columns like ADDRESS_LINE1/LOCAL_BRANCH are not on STTM_CUSTOMER view
        const fallbackSql = `
          SELECT
            sca.BRANCH_CODE,
            sca.CUST_NO,
            sca.ACCOUNT_CLASS,
            sca.AC_DESC,
            sc.CUSTOMER_NAME1,
            sc.CUSTOMER_CATEGORY,
            sc.CUSTOMER_TYPE,
            sc.CUSTOMER_NO,
            sc.DECEASED        AS CUST_DECEASED,
            sc.FROZEN          AS CUST_FROZEN,
            sca.AC_STAT_NO_CR,
            sca.AC_STAT_BLOCK,
            sca.AC_STAT_DORMANT,
            sca.AC_STAT_FROZEN,
            sca.AC_STAT_NO_DR,
            sca.ACC_STATUS,
            sca.ACCOUNT_TYPE,
            sca.CCY,
            sca.CUST_AC_NO,
            sca.RECORD_STAT,
            c.ACCOUNT_NUMBER   AS LOAN_ACCOUNT_NUMBER,
            c.ACCOUNT_STATUS   AS LOAN_ACCOUNT_STATUS
          FROM FCUBSPRD.STTM_CUSTOMER sc
          LEFT JOIN FCUBSPRD.STTM_CUST_ACCOUNT sca ON sc.CUSTOMER_NO = sca.CUST_NO
          LEFT JOIN FCUBSPRD.SUPERAPP_CLTB_ACCOUNT_MASTER_VW c
            ON c.CUSTOMER_ID = sc.CUSTOMER_NO AND c.ACCOUNT_STATUS = 'A'
          WHERE sc.CUSTOMER_NO = :cif
        `;
        const result = await connection.execute(
          fallbackSql,
          { cif },
          { outFormat: oracledb.OBJECT, autoCommit: false }
        );
        rows = (result.rows || []) as any[];
      }

      // 2. Try querying STTM_CUST_PERSONAL for MOBILE_NUMBER and E_MAIL if granted
      try {
        const personalRes = await connection.execute(
          `SELECT MOBILE_NUMBER, E_MAIL, TELEPHONE FROM FCUBSPRD.STTM_CUST_PERSONAL WHERE CUSTOMER_NO = :cif FETCH FIRST 1 ROWS ONLY`,
          { cif },
          { outFormat: oracledb.OBJECT, autoCommit: false }
        );
        if (personalRes.rows && personalRes.rows.length > 0) {
          personalRow = personalRes.rows[0];
        }
      } catch {
        // STTM_CUST_PERSONAL may not be granted to this DB role; REST API fallback handles it
      }
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch {}
      }
    }
  }

  const firstRow = rows[0] || {};
  const detectedBranch =
    String(firstRow.LOCAL_BRANCH || firstRow.BRANCH_CODE || branchHint || '103').trim();

  // 3. Also query FlexCube Customer Detail REST API for phone/email/name if available
  const restDetail = await fetchFlexRestCustomerDetail(cif, detectedBranch);

  const rawFullName =
    String(firstRow.CUSTOMER_NAME1 || restDetail?.fullName || '').trim();
  const { firstName, secondName, lastName } = splitFullName(rawFullName);

  const customerCategory = String(firstRow.CUSTOMER_CATEGORY || 'INDV').trim();
  const customerType = String(firstRow.CUSTOMER_TYPE || 'I').trim();
  const isCustomerFrozen = ynFlag(firstRow.CUST_FROZEN) === 'Y';
  const isCustomerDeceased = ynFlag(firstRow.CUST_DECEASED) === 'Y';

  const phoneFromDb = personalRow?.MOBILE_NUMBER || personalRow?.TELEPHONE || null;
  const emailFromDb = personalRow?.E_MAIL || null;

  const phoneNumber =
    String(phoneFromDb || restDetail?.phoneNumber || '').trim() || null;
  const email =
    String(emailFromDb || restDetail?.email || '').trim() || null;

  const seenCasa = new Set<string>();
  const seenLoan = new Set<string>();
  const accounts: FlexCubeAccountMeta[] = [];

  for (const row of rows) {
    const rowCustCat = String(row.CUSTOMER_CATEGORY || customerCategory || 'INDV').trim();
    const rowCustName = String(row.CUSTOMER_NAME1 || rawFullName || '').trim();
    const custFrozen = ynFlag(row.CUST_FROZEN) === 'Y';
    const custDeceased = ynFlag(row.CUST_DECEASED) === 'Y';

    // Standard CASA account
    const casaNo = String(row.CUST_AC_NO ?? '').trim();
    if (casaNo && !seenCasa.has(casaNo)) {
      seenCasa.add(casaNo);
      const hashed = crypto.createHash('sha256').update(casaNo).digest('hex');
      const acStatFrozen = ynFlag(row.AC_STAT_FROZEN) === 'Y';
      const acStatDormant = ynFlag(row.AC_STAT_DORMANT) === 'Y';
      const acStatBlock = ynFlag(row.AC_STAT_BLOCK) === 'Y';
      const acStatNoDr = ynFlag(row.AC_STAT_NO_DR) === 'Y';
      const acStatNoCr = ynFlag(row.AC_STAT_NO_CR) === 'Y';
      const recStat = recordStat(row.RECORD_STAT);
      const accStatus = String(row.ACC_STATUS || 'NORM').trim().toUpperCase();
      const accClass = String(row.ACCOUNT_CLASS || row.ACCOUNT_TYPE || 'SAV').trim();
      const accDesc = getAccountClassDescription(accClass, String(row.AC_DESC || accClass));

      let derivedStatus: FlexCubeAccountMeta['derivedStatus'] = 'Active';
      let statusReason: string | null = null;

      if (recStat === 'C') {
        derivedStatus = 'Closed';
        statusReason = 'Account is closed in FlexCube (RECORD_STAT = C)';
      } else if (custDeceased) {
        derivedStatus = 'Blocked';
        statusReason = 'Customer is marked deceased in FlexCube';
      } else if (custFrozen || acStatFrozen) {
        derivedStatus = 'Frozen';
        statusReason = custFrozen
          ? 'Customer CIF is frozen in FlexCube'
          : 'Account is frozen in FlexCube (AC_STAT_FROZEN = Y)';
      } else if (acStatBlock || (accStatus && accStatus !== 'NORM' && accStatus !== 'DORM')) {
        derivedStatus = 'Blocked';
        statusReason = acStatBlock
          ? 'Account is blocked in FlexCube (AC_STAT_BLOCK = Y)'
          : `FlexCube account status is ${accStatus}`;
      } else if (acStatDormant || accStatus === 'DORM') {
        derivedStatus = 'Dormant';
        statusReason = 'Account is dormant in FlexCube';
      }

      accounts.push({
        accountNumber: casaNo,
        hashedAccountNumber: hashed,
        branchCode: String(row.BRANCH_CODE || detectedBranch),
        currency: String(row.CCY || 'ETB').trim(),
        accountType: accDesc || accClass,
        accountClass: accClass,
        accountClassDescription: accDesc,
        customerCategory: rowCustCat,
        customerName: rowCustName,
        accStatus,
        recordStat: recStat,
        isFrozen: custFrozen || acStatFrozen,
        isDormant: acStatDormant || accStatus === 'DORM',
        isBlocked: custDeceased || acStatBlock,
        isNoDebit: acStatNoDr,
        isNoCredit: acStatNoCr,
        isLoan: false,
        derivedStatus,
        statusReason,
      });
    }

    // Loan account
    const loanNo = String(row.LOAN_ACCOUNT_NUMBER ?? '').trim();
    if (loanNo && !seenLoan.has(loanNo)) {
      seenLoan.add(loanNo);
      const hashed = crypto.createHash('sha256').update(loanNo).digest('hex');
      const loanStatusRaw = String(row.LOAN_ACCOUNT_STATUS || 'A').trim().toUpperCase();
      const isLoanClosed = ['C', 'CLOSED', 'L', 'LIQUIDATED'].includes(loanStatusRaw);

      let derivedStatus: FlexCubeAccountMeta['derivedStatus'] = 'Active';
      let statusReason: string | null = null;
      if (isLoanClosed) {
        derivedStatus = 'Closed';
        statusReason = `Loan account is closed/liquidated (${loanStatusRaw})`;
      } else if (custFrozen) {
        derivedStatus = 'Frozen';
        statusReason = 'Customer CIF is frozen in FlexCube';
      } else if (custDeceased) {
        derivedStatus = 'Blocked';
        statusReason = 'Customer is marked deceased in FlexCube';
      }

      accounts.push({
        accountNumber: loanNo,
        hashedAccountNumber: hashed,
        branchCode: String(row.BRANCH_CODE || detectedBranch),
        currency: String(row.CCY || 'ETB').trim(),
        accountType: 'Loan Account',
        accountClass: 'LOAN',
        accountClassDescription: 'Loan Account',
        customerCategory: rowCustCat,
        customerName: rowCustName,
        accStatus: loanStatusRaw,
        recordStat: isLoanClosed ? 'C' : 'O',
        isFrozen: custFrozen,
        isDormant: false,
        isBlocked: custDeceased,
        isNoDebit: false,
        isNoCredit: false,
        isLoan: true,
        derivedStatus,
        statusReason,
      });
    }
  }

  return {
    cif,
    fullName: rawFullName,
    firstName,
    secondName,
    lastName,
    phoneNumber,
    email,
    addressLine1: String(firstRow.ADDRESS_LINE1 || restDetail?.addressLine1 || '').trim() || null,
    addressLine2: String(firstRow.ADDRESS_LINE2 || restDetail?.addressLine2 || '').trim() || null,
    addressLine3: String(firstRow.ADDRESS_LINE3 || restDetail?.addressLine3 || '').trim() || null,
    addressLine4: String(firstRow.ADDRESS_LINE4 || restDetail?.addressLine4 || '').trim() || null,
    nationality: String(firstRow.COUNTRY || restDetail?.nationality || '').trim() || null,
    branchCode: detectedBranch || null,
    customerCategory,
    customerType,
    isCustomerFrozen,
    isCustomerDeceased,
    accounts,
  };
}

/**
 * Ensures every account object in an array has AccountClass and CustomerCategory populated.
 * If any account is missing AccountClass or CustomerCategory, queries FlexCube for the CIF
 * and fills in the exact values.
 */
export async function enrichAccountsWithFlexCubeMeta(
  cif: string,
  accounts: any[]
): Promise<{
  enrichedAccounts: any[];
  flexData: FlexCubeCustomerSyncData | null;
}> {
  if (!Array.isArray(accounts) || accounts.length === 0) {
    return { enrichedAccounts: [], flexData: null };
  }

  const getAccNum = (acc: any): string =>
    String(
      acc?.CUSTACNO ||
        acc?.custacno ||
        acc?.accountNumber ||
        acc?.account_number ||
        acc?.accountNo ||
        acc?.acctNo ||
        acc ||
        ''
    ).trim();

  const getAccClass = (acc: any): string =>
    String(acc?.ACCOUNT_CLASS || acc?.account_class || acc?.accountClass || '').trim();

  const getCustCat = (acc: any): string =>
    String(acc?.CUSTOMER_CATEGORY || acc?.customer_category || acc?.customerCategory || '').trim();

  const needsFlexLookup = accounts.some(
    (acc) => !getAccClass(acc) || !getCustCat(acc)
  );

  let flexData: FlexCubeCustomerSyncData | null = null;
  if (needsFlexLookup && cif) {
    try {
      flexData = await fetchFlexCubeCustomerAndAccounts(cif);
    } catch (err) {
      console.warn('[enrichAccountsWithFlexCubeMeta] FlexCube lookup warning:', err);
    }
  }

  const flexByAccNo = new Map<string, FlexCubeAccountMeta>();
  if (flexData?.accounts) {
    for (const fa of flexData.accounts) {
      flexByAccNo.set(fa.accountNumber, fa);
    }
  }

  const defaultCustomerCategory = flexData?.customerCategory || 'INDV';

  const enrichedAccounts = accounts.map((acc) => {
    const accNo = getAccNum(acc);
    const flexAcc = flexByAccNo.get(accNo);

    const resolvedClass =
      getAccClass(acc) ||
      flexAcc?.accountClass ||
      (String(acc?.ACCOUNT_TYPE || acc?.account_type || '').toUpperCase() === 'LOAN'
        ? 'LOAN'
        : 'SAV');

    const resolvedCategory =
      getCustCat(acc) ||
      flexAcc?.customerCategory ||
      defaultCustomerCategory;

    const resolvedDesc =
      acc?.ACCLASSDESC ||
      acc?.acclassdesc ||
      flexAcc?.accountClassDescription ||
      getAccountClassDescription(resolvedClass, resolvedClass);

    if (typeof acc === 'string' || typeof acc === 'number') {
      return {
        CUSTACNO: accNo,
        custacno: accNo,
        BRANCH_CODE: flexAcc?.branchCode || '',
        CCY: flexAcc?.currency || 'ETB',
        ACCOUNT_TYPE: flexAcc?.accountType || resolvedDesc,
        ACCLASSDESC: resolvedDesc,
        ACCOUNT_CLASS: resolvedClass,
        account_class: resolvedClass,
        CUSTOMER_CATEGORY: resolvedCategory,
        customer_category: resolvedCategory,
        status: flexAcc?.derivedStatus || 'Active',
      };
    }

    return {
      ...acc,
      CUSTACNO: acc.CUSTACNO || acc.custacno || accNo,
      custacno: acc.custacno || acc.CUSTACNO || accNo,
      ACCOUNT_CLASS: resolvedClass,
      account_class: resolvedClass,
      accountClass: resolvedClass,
      CUSTOMER_CATEGORY: resolvedCategory,
      customer_category: resolvedCategory,
      customerCategory: resolvedCategory,
      ACCLASSDESC: resolvedDesc,
      acclassdesc: resolvedDesc,
    };
  });

  return { enrichedAccounts, flexData };
}
