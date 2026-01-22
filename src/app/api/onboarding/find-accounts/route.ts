
'use server';

import { NextResponse } from 'next/server';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import * as protobuf from 'protobufjs';
import crypto from 'crypto';
import { executeQuery } from '@/lib/oracle-db';

const mockAccounts = [
  { custacno: "1031110048533015", branch_code: "103", ccy: "ETB", account_type: "S", acclassdesc: "Personal Saving - Private and Individual", status: "Active" },
  { custacno: "1031110048533016", branch_code: "103", ccy: "ETB", account_type: "C", acclassdesc: "Personal Current - Private and Individual", status: "Active" },
  { custacno: "1031110048533017", branch_code: "101", ccy: "USD", account_type: "S", acclassdesc: "Personal Domiciliary Saving", status: "Dormant" },
  { custacno: "1031110048533018", branch_code: "103", ccy: "ETB", account_type: "S", acclassdesc: "Personal Saving - Joint", status: "Inactive" },
];

const GRPC_SERVER_ADDRESS = process.env.FLEX_GRPC_URL || 'localhost:8081';
const PROTO_DIR = path.join(process.cwd(), 'src/lib/grpc/protos');

// Module-level variables
let client: any = null;
let root: protobuf.Root | null = null;
let AccountListRequestType: protobuf.Type | null = null;
let AnyType: protobuf.Type | null = null;
let ServiceRequestType: protobuf.Type | null = null;
let AccountListResponseType: protobuf.Type | null = null;

// Single promise to ensure init only once
let initPromise: Promise<void> | null = null;

async function initializeGrpc() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      console.log('[find-accounts] Initializing gRPC client...');

      // Load for @grpc/grpc-js
      const packageDef = protoLoader.loadSync(
        path.join(PROTO_DIR, 'accountlist.proto'),
        {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
          includeDirs: [PROTO_DIR]
        }
      );

      const grpcObj = grpc.loadPackageDefinition(packageDef) as any;
      
      client = new grpcObj.accountlist.AccountListService(
        GRPC_SERVER_ADDRESS,
        grpc.credentials.createInsecure()
      );

      // Load for protobufjs message creation
      root = await protobuf.load(path.join(PROTO_DIR, 'accountlist.proto'));

      AccountListRequestType = root.lookupType('accountlist.AccountListRequest');
      AnyType = root.lookupType('google.protobuf.Any');
      ServiceRequestType = root.lookupType('common.ServiceRequest');
      AccountListResponseType = root.lookupType('accountlist.AccountListResponse');

      if (!AccountListRequestType || !AnyType || !ServiceRequestType || !AccountListResponseType) {
        throw new Error('One or more protobuf types not found in proto files');
      }

      console.log('[find-accounts] gRPC client initialized successfully.');
    } catch (error) {
      console.error('[find-accounts] Initialization failed:', error);
      throw error; // re-throw so handler can catch it
    }
  })();

  return initPromise;
}

function promisifyCall<TRequest, TResponse>(methodName: string, request: TRequest): Promise<TResponse> {
  return new Promise((resolve, reject) => {
    if (!client) return reject(new Error("gRPC client not initialized"));
    
    console.log(`[find-accounts] Making gRPC call to method: ${methodName}`);

    const deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 60);

    client[methodName](request, { deadline }, (err: any, res: TResponse) => {
      if (err) {
        console.error(`[find-accounts] gRPC call to ${methodName} failed.`, err);
        return reject(err);
      }
      console.log(`[find-accounts] gRPC call to ${methodName} successful.`);
      resolve(res);
    });
  });
}

export async function POST(req: Request) {
  console.log(`\n--- [find-accounts] Received POST request to ${req.url} ---`);
  const body = await req.json();
  const { cif, branch_code } = body;

  console.log('[find-accounts] Request Body:', JSON.stringify(body, null, 2));

  if (!cif || !branch_code) {
    console.error('[find-accounts] Validation Error: CIF and branch code required.');
    return NextResponse.json({ message: 'CIF and branch code are required' }, { status: 400 });
  }

  try {
    // Wait for initialization
    await initializeGrpc();
  } catch (initErr) {
    console.error('[find-accounts] Init failed during request:', initErr);
    return NextResponse.json({ message: 'gRPC initialization failed' }, { status: 500 });
  }

  if (!client || !ServiceRequestType || !AnyType || !AccountListRequestType || !AccountListResponseType) {
    console.error('[find-accounts] Types not ready after initialization.');
    return NextResponse.json({ message: 'gRPC types not ready' }, { status: 500 });
  }

  try {
    console.log(`[find-accounts] Fetching already linked accounts for CIF: ${cif}`);
    const linkedAccountsQuery = `SELECT "HashedAccountNumber" FROM "USER_MODULE"."Accounts" WHERE "CIFNumber" = :cif AND "Status" = 'Active'`;
    const linkedResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, linkedAccountsQuery, [cif]);
    const linkedAccountHashes = new Set((linkedResult.rows || []).map((row: any) => row.HashedAccountNumber));
    console.log(`[find-accounts] Found ${linkedAccountHashes.size} linked accounts.`);

    const innerPayload = AccountListRequestType.create({
      branchCode: branch_code || "",
      customerId: cif || ""
    });

    const innerBuffer = AccountListRequestType.encode(innerPayload).finish();
    
    const anyPayload = AnyType.create({
      type_url: 'type.googleapis.com/accountlist.AccountListRequest',
      value: innerBuffer,
    });

    const serviceRequestPayload = ServiceRequestType.create({
      data: anyPayload,
      request_id: `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      source_system: 'MOBILE',
      channel: 'mobile',
      user_id: 'DASH_USER'
    }) as any;
    
    console.log('[find-accounts] Constructed gRPC ServiceRequest:', JSON.stringify(serviceRequestPayload, null, 2));

    const grpcResponse = await promisifyCall<any, any>('QueryCustomerAccountList', serviceRequestPayload);

    if (!grpcResponse || (grpcResponse.code !== '0' && grpcResponse.code !== '00')) {
      const errorMessage = grpcResponse?.message || 'Upstream service failure.';
      console.error('[gRPC Failed]:', errorMessage, 'Response:', JSON.stringify(grpcResponse));
      throw new Error(errorMessage);
    }

    console.log('[find-accounts] gRPC success. Decoding response...');

    const dataValue = grpcResponse.data?.value;
    if (!dataValue) {
      throw new Error("Response successful but no data returned.");
    }

    const buffer = Buffer.isBuffer(dataValue) ? dataValue : Buffer.from(dataValue);
    const decodedResponse = AccountListResponseType.decode(buffer);
    const responseObject = AccountListResponseType.toObject(decodedResponse, { arrays: true });

    const accounts = responseObject.accounts || [];
    console.log(`[find-accounts] Decoded ${accounts.length} accounts.`);

    const transformedAccounts = accounts.map((acc: any) => {
      const hashed = crypto.createHash('sha256').update(acc.custacno).digest('hex');
      return {
        custacno: acc.custacno || "",
        branch_code: acc.branchCode || "",
        ccy: acc.ccy || "",
        account_type: acc.accountType || "",
        acclassdesc: acc.acclassdesc || "",
        status: "Active",
        isAlreadyLinked: linkedAccountHashes.has(hashed)
      };
    });

    console.log('[find-accounts] Sending transformed accounts.');
    return NextResponse.json(transformedAccounts);

  } catch (error: any) {
    console.error(`[gRPC/DB Error] A critical error occurred in find-accounts API:`, error);

    if (cif === '0048533') {
      console.warn('[find-accounts] Using mock data for CIF 0048533.');
      return NextResponse.json(mockAccounts.map(acc => ({...acc, isAlreadyLinked: acc.custacno === '1031110048533015'})));
    }

    const errorMessage = error.details || error.message || 'Failed to fetch accounts.';
    return NextResponse.json({ message: `Failed to fetch accounts. ${errorMessage}` }, { status: 502 });
  }
}
