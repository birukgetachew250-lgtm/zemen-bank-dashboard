'use server';

import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

// ─── Safe JSON parse ───────────────────────────────────────────────────────────
function safeParseJson(text: string): { ok: true; data: any } | { ok: false; error: string } {
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ─── OAuth2 Token Cache (shared logic, mirrored from find-accounts) ────────────
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getOAuthToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && now < tokenExpiresAt - 30_000) {
    console.log('[find-customer][OAuth] Using cached token');
    return cachedToken;
  }

  const tokenUrl    = process.env.FLEX_OAUTH_TOKEN_URL;
  const clientId    = process.env.FLEX_OAUTH_CLIENT_ID;
  const clientSecret = process.env.FLEX_OAUTH_CLIENT_SECRET;
  const grantType   = process.env.FLEX_OAUTH_GRANT_TYPE || 'client_credentials';

  console.log('[find-customer][OAuth] Requesting new token from:', tokenUrl);

  if (!tokenUrl || !clientId || !clientSecret) {
    throw new Error('OAuth2 credentials missing. Set FLEX_OAUTH_TOKEN_URL, FLEX_OAUTH_CLIENT_ID, FLEX_OAUTH_CLIENT_SECRET in .env');
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
    console.error('[find-customer][OAuth] Network error:', networkErr.message);
    throw new Error(`OAuth2 network error: ${networkErr.message}`);
  }

  const rawText = await res.text();
  console.log('[find-customer][OAuth] Status:', res.status, res.statusText);
  console.log('[find-customer][OAuth] Content-Type:', res.headers.get('content-type'));
  console.log('[find-customer][OAuth] Raw body:', rawText.slice(0, 500));

  if (!res.ok) {
    throw new Error(`OAuth2 token request failed [${res.status} ${res.statusText}]. Body: ${rawText.slice(0, 300)}`);
  }

  const parsed = safeParseJson(rawText);
  if (!parsed.ok) {
    throw new Error(`OAuth2 token response is not valid JSON. Parse error: "${parsed.error}". Raw body: ${rawText.slice(0, 300)}`);
  }

  const json  = parsed.data;
  const token: string = json.token || json.access_token;

  if (!token) {
    throw new Error(`OAuth2 response did not contain a token. Full response: ${JSON.stringify(json)}`);
  }

  console.log('[find-customer][OAuth] Token acquired. expires_in:', json.expires_in ?? 'not provided');
  cachedToken = token;
  tokenExpiresAt = now + (json.expires_in ? json.expires_in * 1000 : 3_600_000);

  return token;
}

// ─── Customer Detail REST Fetch ────────────────────────────────────────────────
async function fetchCustomerDetail(customerNumber: string, branchCode: string): Promise<any> {
  const apiUrl = process.env.FLEX_CUSTOMER_DETAIL_URL;

  if (!apiUrl) {
    throw new Error('FLEX_CUSTOMER_DETAIL_URL is not configured in .env');
  }

  const token = await getOAuthToken();

  const requestId = `DASH-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const payload = {
    branchCode,
    channel: 'INTERNET',
    customerNumber,
    requestId,
    userId: 'DASH_USER',
  };

  console.log('[find-customer][API] Calling:', apiUrl);
  console.log('[find-customer][API] Payload:', JSON.stringify(payload));

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
    console.error('[find-customer][API] Network error:', networkErr.message);
    throw new Error(`Customer detail network error: ${networkErr.message}`);
  }

  const rawText = await res.text();
  console.log('[find-customer][API] Status:', res.status, res.statusText);
  console.log('[find-customer][API] Content-Type:', res.headers.get('content-type'));
  console.log('[find-customer][API] Raw body:', rawText.slice(0, 1000));

  const parsed = safeParseJson(rawText);
  if (!parsed.ok) {
    throw new Error(`Customer detail response is not valid JSON. Parse error: "${parsed.error}". Raw body: ${rawText.slice(0, 300)}`);
  }

  const json = parsed.data;

  // Unauthorized → clear token cache
  if (res.status === 401 || json.status === 'Unauthorized') {
    console.warn('[find-customer][API] Unauthorized — clearing token cache');
    cachedToken = null;
    tokenExpiresAt = 0;
    throw new Error(`Unauthorized: ${json.message || 'Access denied by upstream service'}`);
  }

  if (json.status === 'Failed' || !res.ok) {
    throw new Error(json.message || `Upstream API error [${res.status}]: ${JSON.stringify(json)}`);
  }

  console.log('[find-customer][API] Success. status:', json.status);
  return json;
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

  const { branch_code, customer_id } = body;

  console.log('[find-customer] Incoming: branch_code=', branch_code, 'customer_id=', customer_id);

  if (!branch_code || !customer_id) {
    return NextResponse.json({ message: 'Branch code and customer ID are required' }, { status: 400 });
  }

  // ── 1. Check if already registered in Oracle User Module ──────────────────
  try {
    const checkUserQuery = `SELECT COUNT(*) as "count" FROM "USER_MODULE"."AppUsers" WHERE "CIFNumber" = :cif`;
    const checkUserResult: any = await executeQuery(
      process.env.USER_MODULE_DB_CONNECTION_STRING,
      checkUserQuery,
      [customer_id]
    );
    if (checkUserResult.rows && checkUserResult.rows[0]?.count > 0) {
      return NextResponse.json(
        { message: 'Customer with this CIF is already registered for mobile banking.' },
        { status: 409 }
      );
    }
  } catch (dbError: any) {
    console.warn('[find-customer] DB check failed (non-fatal):', dbError.message);
  }

  // ── 2. Fetch from Flexcube REST API ──────────────────────────────────────
  try {
    const apiResponse = await fetchCustomerDetail(customer_id, branch_code);

    // Map the API response to the shape the UI expects.
    // Adjust field names below to match the actual response from your endpoint.
    const data = apiResponse?.data || apiResponse;

    return NextResponse.json({
      full_name:          data.fullName         || data.full_name         || data.customerName   || '',
      cif_creation_date:  data.cifCreationDate   || data.cif_creation_date || '',
      customer_number:    data.customerNumber    || data.customer_number   || customer_id,
      date_of_birth:      data.dateOfBirth       || data.date_of_birth     || '',
      gender:             data.gender            || '',
      email_id:           data.emailId           || data.email_id          || data.email          || '',
      mobile_number:      data.mobileNumber      || data.mobile_number     || data.phone          || '',
      address_line_1:     data.addressLine1      || data.address_line_1    || data.addressLine_1  || '',
      address_line_2:     data.addressLine2      || data.address_line_2    || data.addressLine_2  || '',
      address_line_3:     data.addressLine3      || data.address_line_3    || data.addressLine_3  || '',
      address_line_4:     data.addressLine4      || data.address_line_4    || data.addressLine_4  || '',
      country:            data.country           || '',
      branch:             data.branch            || data.branchCode        || branch_code,
    });

  } catch (error: any) {
    console.error('[find-customer] ===== ERROR =====');
    console.error('[find-customer] Message:', error.message);
    console.error('[find-customer] Stack:', error.stack);

    const message = error.message || 'Failed to fetch customer details';

    if (message.toLowerCase().includes('unauthorized')) {
      return NextResponse.json({ message }, { status: 401 });
    }

    return NextResponse.json({ message }, { status: 502 });
  }
}
