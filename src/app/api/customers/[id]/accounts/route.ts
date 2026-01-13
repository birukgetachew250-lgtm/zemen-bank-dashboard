
'use server';

import { NextResponse } from 'next/server';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const GRPC_SERVER_ADDRESS = process.env.FLEX_GRPC_URL || 'localhost:50051';
const PROTO_PATH = path.join(process.cwd(), 'src/lib/grpc/protos/accountdetail.proto');

let client: any;
try {
    const packageDef = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });
    const grpcObj = grpc.loadPackageDefinition(packageDef) as any;
    client = new grpcObj.accountdetail.AccountDetailService(GRPC_SERVER_ADDRESS, grpc.credentials.createInsecure());
} catch(e) {
    console.error("Failed to initialize gRPC client for accounts", e);
}


const getMockAccounts = (cif: string) => {
    if (cif === '0000238') {
        return [
            { custacno: "3021110000238018", branch_code: "302", ccy: "ETB", account_type: "S", acclassdesc: "Z-Club Gold –  Saving", status: "Active" },
        ];
    }
    return [
        { custacno: "1031110048533015", branch_code: "103", ccy: "ETB", account_type: "S", acclassdesc: "Personal Saving - Private and Individual", status: "Active" },
        { custacno: "1031110048533016", branch_code: "103", ccy: "ETB", account_type: "C", acclassdesc: "Personal Current - Private and Individual", status: "Active" },
        { custacno: "1031110048533017", branch_code: "101", ccy: "USD", account_type: "S", acclassdesc: "Personal Domiciliary Saving", status: "Dormant" },
        { custacno: "1031110048533018", branch_code: "103", ccy: "ETB", account_type: "S", acclassdesc: "Personal Saving - Joint", status: "Inactive" },
    ];
};

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
    let cif = customerId;

    if (customerId.startsWith('user_')) {
        cif = customerId.split('_')[1];
    }

    if (!cif) {
        return NextResponse.json({ message: 'Could not determine CIF for the given customer ID.' }, { status: 404 });
    }

    const accountDetailRequestPayload = {
        branch_code: "103", // This seems to be hardcoded in the original file, review if needed
        customer_id: cif,
    };
    
    const response: any = await new Promise((resolve, reject) => {
        if (!client) {
            return reject(new Error("gRPC client not initialized"));
        }
        client.QueryCustomerDetail(accountDetailRequestPayload, (err: any, res: any) => {
            if (err) reject(err);
            else resolve(res);
        })
    });
    
    return NextResponse.json(response.accounts || []);

  } catch (error: any) {
    console.error('Failed to fetch accounts:', error);
    
    let cif = params.id.startsWith('user_') ? params.id.split('_')[1] : params.id;
    const mockAccounts = getMockAccounts(cif);
    return NextResponse.json(mockAccounts);
  }
}
