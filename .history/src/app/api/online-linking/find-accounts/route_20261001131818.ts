import { NextResponse } from 'next/server';
import crypto from 'crypto';
import oracledb from 'oracledb';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

// ─── Null-safe helpers ─────────────────────────────────────────────────────────
/** Y/N fields: null → 'N' */
function ynFlag(val: string | null | undefined): 'Y' | 'N' {
  const v = val?.trim().toUpperCase();
  return v === 'Y' ? 'Y' : 'N';
}

/** RECORD_STAT: null → 'O' (Open); otherwise 'O' or 'C' */
function recordStat(val: string | null | undefined): 'O' | 'C' {
  const v = val?.trim().toUpperCase();
  return v === 'C' ? 'C' : 'O';
}

// ─── FlexCube direct DB query ──────────────────────────────────────────────────
async function fetchAccountsFromFlexDB(cif: string): Promise<any[]> {
  const user         = process.env.FLEXDB_USER;
  const password     = process.env.FLEXDB_PASSWORD;
  const connectString = process.env.FLEXDB_CONNECT_STRING;

  if (!user || !password || !connectString) {
    throw new Error(
      'FLEXDB_USER, FLEXDB_PASSWORD and FLEXDB_CONNECT_STRING must all be set in .env'
    );
  }

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
      sca.AC_STAT_NO_CR,
      sca.AC_STAT_BLOCK,
      sca.AC_STAT_DORMANT,
      sca.AC_STAT_FROZEN,
      sca.AC_STAT_NO_DR,
      sca.ACC_STATUS,
      sca.ACCOUNT_TYPE,
      sca.CCY,
      sca.CUST_AC_NO,
      sca.RECORD_STAT
    FROM FCUBSPRD.STTM_CUSTOMER sc
    JOIN FCUBSPRD.STTM_CUST_ACCOUNT sca ON sc.CUSTOMER_NO = sca.CUST_NO
    WHERE sc.CUSTOMER_NO = :cif
  `;

  console.log('====================================================');
  console.log(`[find-accounts] CHECK 1: Is OracleDB currently in Thin mode? ${oracledb.thin}`);
  console.log('====================================================');

  console.log(`[find-accounts] CHECK 2: Is OracleDB currently in Thin mode? ${oracledb.thin}`);
  console.log('====================================================');

  let connection;
  try {
    connection = await oracledb.getConnection({ user, password, connectString });
    const result = await connection.execute(sql, { cif }, {
      outFormat: oracledb.OBJECT,
      autoCommit: false,
    });
    return (result.rows || []) as any[];
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) {
        console.error('[find-accounts][FlexDB] Error closing connection:', e);
      }
    }
  }
}

// ─── POST Handler ──────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const session = await requirePermission(PERMISSIONS.CUSTOMERS_READ);
  if (session instanceof NextResponse) return session;

  let body: any;
  try {
    body = await req.json();
  } catch (e: any) {
    return NextResponse.json({ message: `Invalid request body: ${e.message}` }, { status: 400 });
  }

  const { cif } = body;

  console.log('[find-accounts] Incoming request: cif=', cif);

  if (!cif) {
    return NextResponse.json({ message: 'cif is required' }, { status: 400 });
  }

  try {
    // ── 1. Fetch already-linked account hashes from User Module ───────────────
    let linkedAccountHashes = new Set<string>();
    try {
      const linkedResult: any = await executeQuery(
        process.env.USER_MODULE_DB_CONNECTION_STRING,
        `SELECT "HashedAccountNumber" FROM "USER_MODULE"."Accounts" WHERE "CIFNumber" = :cif AND "Status" = 'Active'`,
        [cif]
      );
      linkedAccountHashes = new Set(
        (linkedResult.rows || []).map((row: any) => row.HashedAccountNumber)
      );
      console.log('[find-accounts] Linked account hashes:', linkedAccountHashes.size);
    } catch (dbErr: any) {
      console.warn('[find-accounts] Could not fetch linked accounts (non-fatal):', dbErr.message);
    }

    // ── 2. Fetch accounts directly from FlexCube Oracle DB ────────────────────
    const rows = await fetchAccountsFromFlexDB(cif);

    if (!rows.length) {
      console.warn('[find-accounts] No accounts returned for CIF:', cif);
      return NextResponse.json(
        { message: `No accounts found for customer ${cif}` },
        { status: 404 }
      );
    }

    // ── 3. Transform rows + apply null defaults + flag blocked accounts ────────
    const transformed = rows.map((row: any) => {
      const accountNum  = row.CUST_AC_NO?.toString() || '';
      const hashed      = accountNum
        ? crypto.createHash('sha256').update(accountNum).digest('hex')
        : '';

      // Null-safe flags
      const deceased    = ynFlag(row.CUST_DECEASED);
      const custFrozen  = ynFlag(row.CUST_FROZEN);
      const acStatNoCR  = ynFlag(row.AC_STAT_NO_CR);
      const acStatBlock = ynFlag(row.AC_STAT_BLOCK);
      const acStatDorm  = ynFlag(row.AC_STAT_DORMANT);
      const acStatFrz   = ynFlag(row.AC_STAT_FROZEN);
      const acStatNoDR  = ynFlag(row.AC_STAT_NO_DR);
      const recStat     = recordStat(row.RECORD_STAT);

      // acc_status blocking: only NORM is allowed for linking
      const accStatus    = (row.ACC_STATUS || '').toString().trim().toUpperCase();
      const isNormStatus = accStatus === 'NORM';

      // Blocking: DECEASED, FROZEN, CLOSED, or non-NORM acc_status
      const isBlocked = deceased === 'Y' || custFrozen === 'Y' || recStat === 'C' || !isNormStatus;
      let blockReason: string | null = null;
      if (deceased === 'Y')        blockReason = 'Customer is deceased';
      else if (custFrozen === 'Y') blockReason = 'Customer account is frozen';
      else if (recStat === 'C')    blockReason = 'Account is closed';
      else if (!isNormStatus)      blockReason = `Account status is ${accStatus || 'unknown'} (only NORM accounts can be linked)`;

      // Derive a display status compatible with existing frontend logic:
      //   Blocked → 'Blocked'  |  Dormant → 'Dormant'  |  else → 'Active'
      let status: string;
      if (isBlocked)              status = 'Blocked';
      else if (acStatDorm === 'Y') status = 'Dormant';
      else                        status = 'Active';

      return {
        custacno:          accountNum,
        branch_code:       row.BRANCH_CODE?.toString() || '',
        ccy:               row.CCY || '',
        account_type:      row.ACCOUNT_TYPE || '',
        account_class:     row.ACCOUNT_CLASS || '',
        acclassdesc:       row.AC_DESC || '',
        customer_name:     row.CUSTOMER_NAME1 || '',
        customer_category: row.CUSTOMER_CATEGORY || '',
        customer_type:     row.CUSTOMER_TYPE || '',
        acc_status:        row.ACC_STATUS || '',
        status,             // computed display status for frontend
        record_stat:       recStat,
        deceased,
        cust_frozen:       custFrozen,
        ac_stat_no_cr:     acStatNoCR,
        ac_stat_block:     acStatBlock,
        ac_stat_dormant:   acStatDorm,
        ac_stat_frozen:    acStatFrz,
        ac_stat_no_dr:     acStatNoDR,
        isBlocked,
        blockReason,
        isAlreadyLinked:   linkedAccountHashes.has(hashed),
      };
    });

    console.log('[find-accounts] Returning', transformed.length, 'accounts for CIF:', cif);
    return NextResponse.json(transformed);

  } catch (error: any) {
    console.error('[find-accounts] ===== ERROR =====');
    console.error('[find-accounts] Message:', error.message);
    console.error('[find-accounts] Stack:', error.stack);

    return NextResponse.json(
      { message: error.message || 'Failed to fetch customer accounts' },
      { status: 502 }
    );
  }
}