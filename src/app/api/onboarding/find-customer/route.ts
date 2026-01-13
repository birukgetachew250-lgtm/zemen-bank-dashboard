
'use server';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const mockCustomer = {
    "full_name": "TSEDALE ADAMU MEDHANE",
    "cif_creation_date": "2022-01-01T00:00:00.000Z",
    "customer_number": "0000238",
    "date_of_birth": "1990-01-01T00:00:00.000Z",
    "gender": "Female",
    "email_id": "biruk.getachew@zemenbank.com",
    "mobile_number": "+251920249797",
    "address_line_1": "Bole Sub-city",
    "address_line_2": "Woreda 03",
    "address_line_3": "Addis Ababa",
    "address_line_4": "",
    "country": "Ethiopia",
    "branch": "Bole"
};


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
    console.log('[gRPC Client] Initialized client for AccountDetailService at target URL:', GRPC_SERVER_ADDRESS);
} catch (error) {
    console.error("[gRPC Client] Failed to initialize:", error);
}

function promisifyCall<TRequest, TResponse>(methodName: string, request: TRequest): Promise<TResponse> {
    return new Promise((resolve, reject) => {
        if (!client) {
            return reject(new Error("gRPC client not initialized"));
        }
        const deadline = new Date();
        deadline.setSeconds(deadline.getSeconds() + 5);
        
        client[methodName](request, { deadline }, (err: any, res: TResponse) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
}

export async function POST(req: Request) {
    const { branch_code, customer_id } = await req.json();

    if (!branch_code || !customer_id) {
        return NextResponse.json({ message: 'Branch code and customer ID are required' }, { status: 400 });
    }

    try {
        const userCheck = await db.user.findFirst({ where: { employeeId: customer_id }});
        if (userCheck) {
             return NextResponse.json({ message: 'Customer is already registered for mobile banking.' }, { status: 409 });
        }

        const requestPayload = {
            branch_code,
            customer_id
        };

        const response = await promisifyCall<any, any>('QueryCustomerDetail', requestPayload);
        
        return NextResponse.json(response);
    } catch (error: any) {
        console.error("[gRPC/DB Error]", error);
        
        // Fallback to mock data for demo purposes if the specified CIF is used
        if (customer_id === '0000238') {
            console.log("[Fallback] Serving mock data for CIF 0000238");
            return NextResponse.json(mockCustomer);
        }
        
        const errorMessage = error.details || error.message || 'Failed to fetch customer details.';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
