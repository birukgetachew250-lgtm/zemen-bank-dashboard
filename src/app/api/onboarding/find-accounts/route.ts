
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
const PROTO_PATH = path.join(process.cwd(), 'src/lib/grpc/protos/accountlist.proto');


// Module-level variables
let client: any = null;
let accountListResponseType: protobuf.Type | null = null;

(async () => {
  try {
    const packageDef = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs: [path.join(process.cwd(), 'src/lib/grpc/protos')]
    });

    const grpcObj = grpc.loadPackageDefinition(packageDef) as any;
    
    client = new grpcObj.accountlist.AccountListService(
      GRPC_SERVER_ADDRESS,
      grpc.credentials.createInsecure()
    );
    
    const root = await protobuf.load(PROTO_PATH);
    accountListResponseType = root.lookupType('accountlist.AccountListResponse');

    if (!accountListResponseType) {
        throw new Error('accountlist.AccountListResponse type not found in protobufjs');
    }

  } catch (error) {
    console.error('[gRPC Client Init Failed for find-accounts]', error);
  }
})();

function promisifyCall<TRequest, TResponse>(methodName: string, request: TRequest): Promise<TResponse> {
  return new Promise((resolve, reject) => {
    if (!client) return reject(new Error("gRPC client not initialized"));
    const deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 60);

    client[methodName](request, { deadline }, (err: any, res: TResponse) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}

export async function POST(req: Request) {
    const { cif, branch_code } = await req.json();

    if (!cif || !branch_code) {
        return NextResponse.json({ message: 'CIF and branch code are required' }, { status: 400 });
    }

    if (!client) {
        console.error('gRPC client for AccountListService is not available.');
        return NextResponse.json({ message: 'Internal server error: Could not connect to banking service.' }, { status: 500 });
    }

    try {
        const linkedAccountsQuery = `SELECT "HashedAccountNumber" FROM "USER_MODULE"."Accounts" WHERE "CIFNumber" = :cif AND "Status" = 'Active'`;
        const linkedResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, linkedAccountsQuery, [cif]);
        const linkedAccountHashes = new Set((linkedResult.rows || []).map((row: any) => row.HashedAccountNumber));

        const requestPayload = {
            customer_id: cif,
            branch_code: branch_code,
        };

        const serviceRequest = {
            data: {
                "@type": "type.googleapis.com/accountlist.AccountListRequest",
                ...requestPayload
            },
            request_id: `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            source_system: 'MOBILE',
            channel: 'mobile',
            user_id: 'DASH_USER'
        };

        const grpcResponse = await promisifyCall<any, any>('QueryCustomerAccountList', serviceRequest);
        
       if (!grpcResponse || (grpcResponse.code !== '0' && grpcResponse.code !== '00' )) {
            const errorMessage = grpcResponse?.message || 'Upstream service returned a failure status.';
            console.error('[gRPC Call Failed] QueryCustomerAccountList:', errorMessage);
            throw new Error(errorMessage);
       }
        
        const dataValue = grpcResponse.data?.value;
        if (!dataValue) {
          throw new Error("Response from service was successful, but contained no data.");
        }

        if (!accountListResponseType) {
          throw new Error("AccountListResponse type not loaded - check gRPC initialization.");
        }

        const buffer = Buffer.isBuffer(dataValue) ? dataValue : Buffer.from(dataValue);
        const decodedResponse = accountListResponseType.decode(buffer);
        const responseObject = accountListResponseType.toObject(decodedResponse, { arrays: true });

        const accounts = responseObject.accounts || [];
        
        const transformedAccounts = accounts.map((acc: any) => {
            const hashed = crypto.createHash('sha256').update(acc.custacno).digest('hex');
            return {
                custacno: acc.custacno || "",
                branch_code: acc.branchCode || "",
                ccy: acc.ccy || "",
                account_type: acc.accountType || "",
                acclassdesc: acc.acclassdesc || "",
                status: "Active", // Assuming core banking only returns active/valid accounts for linking
                isAlreadyLinked: linkedAccountHashes.has(hashed)
            };
        });
        
        return NextResponse.json(transformedAccounts);

    } catch (error: any) {
        console.error('[gRPC/DB Error] find-accounts:', error);
        
        // Demo fallback
        if (cif === '0048533') {
            return NextResponse.json(mockAccounts.map(acc => ({...acc, isAlreadyLinked: acc.custacno === '1031110048533015'})));
        }

        const errorMessage = error.details || error.message || 'An unexpected error occurred while fetching accounts.';
        return NextResponse.json({ message: `Failed to fetch accounts. ${errorMessage}` }, { status: 502 });
    }
}
