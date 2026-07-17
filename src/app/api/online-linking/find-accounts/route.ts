'use server';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

// ─── OAuth2 Token Cache ────────────────────────────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getOAuthToken(): Promise<string> {
  const now = Date.now();

  // Return cached token if still valid (with 30s buffer)
  if (cachedToken && now < tokenExpiresAt - 30_000) {
    return cachedToken;
  }

  const tokenUrl = process.env.FLEX_OAUTH_TOKEN_URL;
  const clientId = process.env.FLEX_OAUTH_CLIENT_ID;
  const clientSecret = process.env.FLEX_OAUTH_CLIENT_SECRET;
  const grantType = process.env.FLEX_OAUTH_GRANT_TYPE || 'client_credentials';

  if (!tokenUrl || !clientId || !clientSecret) {
    throw new Error('OAuth2 credentials are not configured. Check FLEX_OAUTH_TOKEN_URL, FLEX_OAUTH_CLIENT_ID, FLEX_OAUTH_CLIENT_SECRET in .env');
  }

  const body = new URLSearchParams();
  body.append('client_id', clientId);
  body.append('client_secret', clientSecret);
  body.append('grant_type', grantType);

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    // NOTE: NODE_TLS_REJECT_UNAUTHORIZED=0 is already set in .env for self-signed certs
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OAuth2 token request failed: ${res.status} ${res.statusText} — ${text}`);
  }

  const json = await res.json();
  const token: string = json.token || json.access_token;

  if (!token) {
    throw new Error(`OAuth2 response did not contain a token. Response: ${JSON.stringify(json)}`);
  }

  // Cache for 1 hour by default (adjust if the token endpoint returns expiry)
  cachedToken = token;
  tokenExpiresAt = now + (json.expires_in ? json.expires_in * 1000 : 3_600_000);

  return token;
}

// ─── Account List REST Fetch ───────────────────────────────────────────────────
async function fetchCustomerAccounts(
  customerNumber: string,
  branchCode: string,
  channel: string,
  userId: string,
  requestId: string
): Promise<any> {
  const apiUrl = process.env.FLEX_ACCOUNT_LIST_URL;

  if (!apiUrl) {
    throw new Error('FLEX_ACCOUNT_LIST_URL is not configured in .env');
  }

  const token = await getOAuthToken();

  const payload = {
    branchCode,
    channel,
    customerNumber,
    requestId,
    userId,
  };

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  // Handle Unauthorized
  if (res.status === 401 || json.status === 'Unauthorized') {
    // Invalidate cache so next call re-fetches token
    cachedToken = null;
    tokenExpiresAt = 0;
    throw new Error(`Unauthorized: ${json.message || 'Access denied by upstream service'}`);
  }

  // Handle explicit failure status
  if (json.status === 'Failed' || !res.ok) {
    throw new Error(json.message || `Upstream API error: ${res.status}`);
  }

  return json;
}

// ─── POST Handler ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const session = await requirePermission(PERMISSIONS.CUSTOMERS_READ);
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  const { cif, branch_code, channel, userId } = body;

  if (!cif || !branch_code) {
    return NextResponse.json(
      { message: 'CIF (customerNumber) and branch_code are required' },
      { status: 400 }
    );
  }

  try {
    // ── 1. Fetch already-linked accounts from User Module Oracle DB ──────────
    let linkedAccountHashes = new Set<string>();
    try {
      const linkedAccountsQuery = `SELECT "HashedAccountNumber" FROM "USER_MODULE"."Accounts" WHERE "CIFNumber" = :cif AND "Status" = 'Active'`;
      const linkedResult: any = await executeQuery(
        process.env.USER_MODULE_DB_CONNECTION_STRING,
        linkedAccountsQuery,
        [cif]
      );
      linkedAccountHashes = new Set(
        (linkedResult.rows || []).map((row: any) => row.HashedAccountNumber)
      );
    } catch (dbErr) {
      // Non-fatal: continue without linked account info
      console.warn('[find-accounts] Could not fetch linked accounts from User Module:', dbErr);
    }

    // ── 2. Fetch accounts from Flexcube via OAuth2-authenticated REST ────────
    const requestId = `DASH-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const apiResponse = await fetchCustomerAccounts(
      cif,
      branch_code,
      channel || 'INTERNET',
      userId || 'DASH_USER',
      requestId
    );

    const customerAccounts: any[] = apiResponse?.data?.customerAccount || [];

    if (!customerAccounts.length) {
      return NextResponse.json(
        { message: `No accounts found for customer ${cif}` },
        { status: 404 }
      );
    }

    // ── 3. Transform + flag already-linked accounts ──────────────────────────
    const transformed = customerAccounts.map((acc: any) => {
      const accountNum = acc.accountNumber?.toString() || '';
      const hashed = crypto.createHash('sha256').update(accountNum).digest('hex');
      return {
        custacno: accountNum,
        branch_code: acc.branchCode?.toString() || '',
        ccy: acc.currency || '',
        account_type: acc.accountType || '',
        acclassdesc: acc.accClassDesc || acc.accountDesc || '',
        status: 'Active',
        currentBalance: acc.currentBalance ?? null,
        customerName: acc.customerName || '',
        isAlreadyLinked: linkedAccountHashes.has(hashed),
      };
    });

    return NextResponse.json(transformed);

  } catch (error: any) {
    console.error('[find-accounts] Error:', error);

    const message = error.message || 'Failed to fetch customer accounts';

    if (message.toLowerCase().includes('unauthorized')) {
      return NextResponse.json({ message }, { status: 401 });
    }

    return NextResponse.json({ message }, { status: 502 });
  }
}