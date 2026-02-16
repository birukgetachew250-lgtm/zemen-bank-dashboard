
'use server';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
interface AccountDetailMsgResponse {
  customer?: CustomerDetailInsideResponse | null;
  status?: string | null;
  message?: string | null;
}

// 3. The CustomerDetail (exactly matching server naming + your mock)
export interface CustomerDetailInsideResponse {
  full_name?: string | null;
  cif_creation_date?: string | null;
  customer_number?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  email_id?: string | null;
  mobile_number?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  address_line_3?: string | null;
  address_line_4?: string | null;
  country?: string | null;
  branch?: string | null;
}
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


const GRPC_SERVER_ADDRESS = process.env.FLEX_GRPC_URL || 'localhost:8081';
const PROTO_PATH = path.join(process.cwd(), 'src/lib/grpc/protos/accountdetail.proto');

let client: any;
try {
    const packageDef = protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: [path.join(process.cwd(), 'src/lib/grpc/protos')] // ← helps with import "Protos/common.proto"
    });
    const grpcObj = grpc.loadPackageDefinition(packageDef) as any;
    client = new grpcObj.accountdetail.AccountDetailService(
        GRPC_SERVER_ADDRESS,
        grpc.credentials.createInsecure()
    );
    console.log('[gRPC] Client initialized for accountdetail.AccountDetailService');
} catch (error) {
    console.error('[gRPC] Client init failed:', error);
}


function promisifyCall<TRequest, TResponse>(methodName: string, request: TRequest): Promise<TResponse> {
    return new Promise((resolve, reject) => {
        if (!client) {
            return reject(new Error("gRPC client not initialized"));
        }
        const deadline = new Date();
        deadline.setSeconds(deadline.getSeconds() + 60);
        
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

        // ── Real payload ──
        const innerPayload = {
            branch_code,
            customer_id
        };
         const request = {
            data: {
                "@type": "type.googleapis.com/accountdetail.AccountDetailRequest",
                branch_code: branch_code,   
                customer_id: customer_id
            },
            request_id:`REQ-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            source_system: 'MOBILE',
            channel: 'mobile',
            user_id: 'DASH_USER'
         };
        // Use the CORRECT method name (plural!)
        const grpcResponse = await promisifyCall<any, any>('QueryCustomerDetails', request);
        
        let customerData = null;
        if (!grpcResponse || !grpcResponse.success) {
          console.log("gRPC Transport Error",grpcResponse as unknown as Record<string, unknown>);
           return NextResponse.json(
                { message: grpcResponse?.message || 'Upstream service error'  }, 
                { status: 598 }
           );
        } 
        if (grpcResponse.code !== '0' && grpcResponse.code !== '00') {
           return NextResponse.json(
                { message: grpcResponse.message || "Operation not Working."  }, 
                { status: 598 }
           );
        }
        console.error('result data', grpcResponse.data);
        const dataValue = (grpcResponse as any).data?.value;
        if (!dataValue) {
        throw new Error("Response success but data field is missing");
        }

        const buffer = Buffer.isBuffer(dataValue) ? dataValue : Buffer.from(dataValue.data || dataValue);
        console.error('result', buffer);
        let accountdetail: AccountDetailMsgResponse | null = null;
        // Case 1: Server puts customer directly in data.customer (common pattern)
        if (grpcResponse.data?.customer) {
            customer = grpcResponse.data.customer as CustomerDetailInsideResponse;
        }
        // Case 2: Server puts customer in data (top-level fields)
        else if (grpcResponse.data && typeof grpcResponse.data === 'object') {
            customer = grpcResponse.data as CustomerDetailInsideResponse;
        }
        // Case 3: data.value contains JSON string or bytes that we can parse
        else if (grpcResponse.data?.value) {
            try {
                let rawValue = grpcResponse.data.value;

                // Handle different possible formats
                if (Buffer.isBuffer(rawValue)) {
                    rawValue = rawValue.toString('utf8');
                } else if (rawValue instanceof Uint8Array) {
                    rawValue = Buffer.from(rawValue).toString('utf8');
                }

                // Try parsing as JSON
                const parsed = JSON.parse(rawValue);
                
                // Most common nesting patterns in banking responses
                customer = 
                    parsed.customer ||
                    parsed.data?.customer ||
                    parsed ||  // direct object
                    null;
                
                console.log('[JSON Parse Success] Extracted customer:', customer);
            } catch (parseErr) {
                console.warn('[JSON Parse Failed]', parseErr);
                console.log('[Raw value preview]:', 
                    typeof grpcResponse.data.value === 'string' 
                        ? grpcResponse.data.value.substring(0, 200) 
                        : 'Binary/non-string data'
                );
            }
        }
         console.log('[JSON Parse Success] Extracted customer:', customer);
        return NextResponse.json({
            success: grpcResponse.success,
            message: grpcResponse.message,
            code: grpcResponse.code,
            customer: customer,
            errors: grpcResponse.errors || []
        });
    } catch (error: any) {
        console.error('[gRPC/DB Error]', error);

        // Your mock fallback
        if (customer_id === '0000238') {
            console.log('[Fallback] Using mock data for CIF 0000238');
            return NextResponse.json(mockCustomer);
        }

        const errorMsg = error?.details || error?.message || 'Failed to fetch customer details';
        return NextResponse.json({ message: errorMsg }, { status: 500 });
    }
}
