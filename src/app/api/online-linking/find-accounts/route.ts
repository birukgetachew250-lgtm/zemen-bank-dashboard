'use server';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

// ─── Safe JSON parse helper ────────────────────────────────────────────────────
function safeParseJson(text: string): { ok: true; data: any } | { ok: false; error: string } {
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ─── OAuth2 Token Cache ────────────────────────────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getOAuthToken(): Promise<string> {
  const now = Date.now();

  // Return cached token if still valid (with 30s buffer)
  if (cachedToken && now < tokenExpiresAt - 30_000) {
    console.log('[find-accounts][OAuth] Using cached token (valid for another', Math.round((tokenExpiresAt - now) / 1000), 's)');
    return cachedToken;
  }

  const tokenUrl = process.env.FLEX_OAUTH_TOKEN_URL;
  const clientId  = process.env.FLEX_OAUTH_CLIENT_ID;
  const clientSecret = process.env.FLEX_OAUTH_CLIENT_SECRET;
  const grantType = process.env.FLEX_OAUTH_GRANT_TYPE || 'client_credentials';

  console.log('[find-accounts][OAuth] Requesting new token from:', tokenUrl);
  console.log('[find-accounts][OAuth] client_id:', clientId ? `${clientId.slice(0, 4)}****` : 'NOT SET');
  console.log('[find-accounts][OAuth] grant_type:', grantType);

  if (!tokenUrl || !clientId || !clientSecret) {
    throw new Error(
      'OAuth2 credentials missing. Set FLEX_OAUTH_TOKEN_URL, FLEX_OAUTH_CLIENT_ID, FLEX_OAUTH_CLIENT_SECRET in .env'
    );
  }

  const body = new URLSearchParams();
  body.append('client_id', clientId);
  body.append('client_secret', clientSecret);
  body.append('grant_type', grantType);

  let res: Response;
  try {
    res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
  } catch (networkErr: any) {
    console.error('[find-accounts][OAuth] Network error reaching token URL:', networkErr.message);
    throw new Error(`OAuth2 token request network error: ${networkErr.message}`);
  }

  const rawText = await res.text();
  console.log('[find-accounts][OAuth] Token response status:', res.status, res.statusText);
  console.log('[find-accounts][OAuth] Token response Content-Type:', res.headers.get('content-type'));
  console.log('[find-accounts][OAuth] Token response raw body:', rawText.slice(0, 500));

  if (!res.ok) {
    throw new Error(
      `OAuth2 token request failed [${res.status} ${res.statusText}]. Body: ${rawText.slice(0, 300)}`
    );
  }

  const parsed = safeParseJson(rawText);
  if (!parsed.ok) {
    throw new Error(
      `OAuth2 token response is not valid JSON. Parse error: "${parsed.error}". Raw body: ${rawText.slice(0, 300)}`
    );
  }

  const json = parsed.data;
  const token: string = json.token || json.access_token;

  if (!token) {
    throw new Error(
      `OAuth2 response did not contain a token field. Full response: ${JSON.stringify(json)}`
    );
  }

  console.log('[find-accounts][OAuth] Token acquired successfully. expires_in:', json.expires_in ?? 'not provided');

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

  const payload = { branchCode, channel, customerNumber, requestId, userId };

  console.log('[find-accounts][API] Calling account list URL:', apiUrl);
  console.log('[find-accounts][API] Request payload:', JSON.stringify(payload));

  let res: Response;
  try {
    res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (networkErr: any) {
    console.error('[find-accounts][API] Network error reaching account list URL:', networkErr.message);
    throw new Error(`Account list network error: ${networkErr.message}`);
  }

  const rawText = await res.text();
  console.log('[find-accounts][API] Response status:', res.status, res.statusText);
  console.log('[find-accounts][API] Response Content-Type:', res.headers.get('content-type'));
  console.log('[find-accounts][API] Response raw body:', rawText.slice(0, 1000));

  // Parse JSON safely — the server might return HTML/XML on error
  const parsed = safeParseJson(rawText);
  if (!parsed.ok) {
    throw new Error(
      `Account list response is not valid JSON. Parse error: "${parsed.error}". Raw body: ${rawText.slice(0, 300)}`
    );
  }

  const json = parsed.data;

  // Handle Unauthorized
  if (res.status === 401 || json.status === 'Unauthorized') {
    console.warn('[find-accounts][API] Unauthorized response — clearing token cache');
    cachedToken = null;
    tokenExpiresAt = 0;
    throw new Error(`Unauthorized: ${json.message || 'Access denied by upstream service'}`);
  }

  // Handle explicit failure status
  if (json.status === 'Failed' || !res.ok) {
    throw new Error(
      json.message ||
      `Upstream API error [${res.status}]: ${JSON.stringify(json)}`
    );
  }

  console.log('[find-accounts][API] Success. status:', json.status, '| customerNumber:', json.data?.customerNumber);

  return json;
}

// ─── POST Handler ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const session = await requirePermission(PERMISSIONS.CUSTOMERS_READ);
  if (session instanceof NextResponse) return session;

  let body: any;
  try {
    body = await req.json();
  } catch (e: any) {
    return NextResponse.json({ message: `Invalid request body: ${e.message}` }, { status: 400 });
  }

  const { cif, branch_code, channel, userId } = body;

  console.log('[find-accounts] Incoming request: cif=', cif, 'branch_code=', branch_code, 'channel=', channel, 'userId=', userId);

  if (!cif || !branch_code) {
    return NextResponse.json(
      { message: 'cif and branch_code are required' },
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
      console.log('[find-accounts] Linked account hashes fetched:', linkedAccountHashes.size);
    } catch (dbErr: any) {
      console.warn('[find-accounts] Could not fetch linked accounts (non-fatal):', dbErr.message);
    }

    // ── 2. Fetch accounts from Flexcube via OAuth2-authenticated REST ────────
    const requestId = `DASH-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const apiResponse = await fetchCustomerAccounts(
      cif,
      branch_code,
      channel || process.env.FLEX_API_CHANNEL || 'WEB',
      userId || process.env.FLEX_API_USER_ID || 'DASH_USER',
      requestId
    );

    const customerAccounts: any[] = apiResponse?.data?.customerAccount || [];

    if (!customerAccounts.length) {
      console.warn('[find-accounts] No accounts returned for CIF:', cif);
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

    console.log('[find-accounts] Returning', transformed.length, 'accounts for CIF:', cif);
    return NextResponse.json(transformed);

  } catch (error: any) {
    console.error('[find-accounts] ===== ERROR =====');
    console.error('[find-accounts] Message:', error.message);
    console.error('[find-accounts] Stack:', error.stack);

    const message = error.message || 'Failed to fetch customer accounts';

    if (message.toLowerCase().includes('unauthorized')) {
      return NextResponse.json({ message }, { status: 401 });
    }

    return NextResponse.json({ message }, { status: 502 });
  }
}