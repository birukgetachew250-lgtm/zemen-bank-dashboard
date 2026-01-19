
'use server';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { executeQuery } from '@/lib/oracle-db';
import { GrpcClient } from '@/lib/grpc-client';

const mockAccounts = [
    { custacno: "1031110048533015", branch_code: "103", ccy: "ETB", account_type: "S", acclassdesc: "Personal Saving - Private and Individual", status: "Active" },
    { custacno: "1031110048533016", branch_code: "103", ccy: "ETB", account_type: "C", acclassdesc: "Personal Current - Private and Individual", status: "Active" },
    { custacno: "1031110048533017", branch_code: "101", ccy: "USD", account_type: "S", acclassdesc: "Personal Domiciliary Saving", status: "Dormant" },
    { custacno: "1031110048533018", branch_code: "103", ccy: "ETB", account_type: "S", acclassdesc: "Personal Saving - Joint", status: "Inactive" },
];

export async function POST(req: Request) {
    const { cif, branch_code } = await req.json();

    if (!cif || !branch_code) {
        return NextResponse.json({ message: 'CIF and branch code are required' }, { status: 400 });
    }

    try {
        const linkedAccountsQuery = `SELECT "HashedAccountNumber" FROM "USER_MODULE"."Accounts" WHERE "CIFNumber" = :cif AND "Status" = 'Active'`;
        const linkedResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, linkedAccountsQuery, [cif]);
        const linkedAccountHashes = new Set((linkedResult.rows || []).map((row: any) => row.HashedAccountNumber));

        const client = GrpcClient.getAccountListServiceClient();

        const requestPayload = {
            customer_id: cif,
            branch_code: branch_code,
        };

        const serviceRequest = {
            data: {
                type_url: "type.googleapis.com/accountlist.AccountListRequest",
                value: requestPayload
            },
            request_id: `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            source_system: 'MOBILE',
            channel: 'mobile',
            user_id: 'DASH_USER'
        };

        const grpcResponse = await GrpcClient.promisifyCall<any, any>(client, 'QueryCustomerAccountList', serviceRequest);
        
       if (!grpcResponse || (grpcResponse.code !== '0' && grpcResponse.code !== '00' )) {
            const errorMessage = grpcResponse?.message || 'Upstream service returned a failure status.';
            console.error('[gRPC Call Failed] QueryCustomerAccountList:', errorMessage);
            throw new Error(errorMessage);
       }
        
        const dataValue = grpcResponse.data?.value;
        if (!dataValue) {
          throw new Error("Response from service was successful, but contained no data.");
        }

        const accountListResponseType = await GrpcClient.loadProtobufType('accountlist.proto', 'accountlist.AccountListResponse');
        
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
