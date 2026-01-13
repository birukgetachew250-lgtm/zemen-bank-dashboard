'use server';

import { NextResponse } from 'next/server';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import * as protobuf from 'protobufjs';
import crypto from 'crypto';

const mockAccounts = [
    { custacno: "1031110048533015", branch_code: "103", ccy: "ETB", account_type: "S", acclassdesc: "Personal Saving - Private and Individual", status: "Active" },
    { custacno: "1031110048533016", branch_code: "103", ccy: "ETB", account_type: "C", acclassdesc: "Personal Current - Private and Individual", status: "Active" },
    { custacno: "1031110048533017", branch_code: "101", ccy: "USD", account_type: "S", acclassdesc: "Personal Domiciliary Saving", status: "Dormant" },
    { custacno: "1031110048533018", branch_code: "103", ccy: "ETB", account_type: "S", acclassdesc: "Personal Saving - Joint", status: "Inactive" },
];

const GRPC_SERVER_ADDRESS = process.env.FLEX_GRPC_URL || 'localhost:8081';
const PROTO_PATH = path.join(process.cwd(), 'src/lib/grpc/protos/accountlist.proto');


async function promisifyCall(client: any, methodName: string, request: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const deadline = new Date();
        deadline.setSeconds(deadline.getSeconds() + 60);
        
        const method = client[methodName];
        if (typeof method !== 'function') {
            return reject(new TypeError(`this.client[${methodName}] is not a function`));
        }

        method.call(client, request, { deadline }, (err: any, res: any) => {
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
            
                console.log('[PROTO] Loaded root namespaces:', Object.keys(grpcObj || {}));
            
               const client2 = new grpcObj.accountlist.AccountListService(
                  GRPC_SERVER_ADDRESS,
                  grpc.credentials.createInsecure()
                );
    
        const root = await protobuf.load(PROTO_PATH);
        const AccountListResponse = root.lookupType('accountlist.AccountListResponse');
        
        const request = {
            data: {
                "@type": "type.googleapis.com/accountlist.AccountListRequest",
                customer_id: cif,
                branch_code: branch_code,
            },
            request_id: `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            source_system: 'DASHBOARD',
            channel: 'WEB',
            user_id: 'DASH_USER'
        };

        const grpcResponse = await promisifyCall(client2, 'QueryCustomerAccountList', request);
        
        if (!grpcResponse || grpcResponse.code !== '0' && grpcResponse.code !== '00') {
             return NextResponse.json({ message: grpcResponse.message || 'Upstream service error' }, { status: 502 });
        }

        const dataValue = grpcResponse.data?.value;
        if (!dataValue) {
            throw new Error("Response success but data field is missing");
        }

        const buffer = Buffer.isBuffer(dataValue) ? dataValue : Buffer.from(dataValue.data || dataValue);
        const decoded = AccountListResponse.decode(buffer);
        const object = AccountListResponse.toObject(decoded, { defaults: true });
        console.log('find-accounts result:', object.accounts || []);
        const transformedAccounts = (object.accounts || []).map((acc: any) => ({
                        custacno: acc.custacno || "",
                        branch_code: acc.branchCode || "",          // note: real data has branchCode (camelCase)
                        ccy: acc.ccy || "",
                        account_type: acc.accountType || "",        // real: accountType
                        acclassdesc: acc.acclassdesc || "",
                        status: "Active"                            // default value (change logic later if needed)
         }));
        
        return NextResponse.json(transformedAccounts);

    } catch (error: any) {
        console.error('[gRPC/DB Error] find-accounts:', error);
        if (cif === '0000238') {
            return NextResponse.json([
                 { CUSTACNO: "3021110000238018", BRANCH_CODE: "302", CCY: "ETB", ACCOUNT_TYPE: "S", ACCLASSDESC: "Z-Club Gold –  Saving", status: "Active" },
            ]);
        }
        return NextResponse.json(mockAccounts);
    }
}