
'use server';

import { NextResponse } from 'next/server';
import { getAccountDetailServiceClient } from '@/lib/grpc-client';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

let AccountDetailRequest: any = null;

// This function loads the AccountDetailRequest type from the proto file.
// It's cached so it only runs once.
function loadRequestType() {
    if (AccountDetailRequest) return AccountDetailRequest;

    try {
        const PROTO_PATH = path.resolve(process.cwd(), 'public', 'protos');
        const packageDefinition = protoLoader.loadSync(
            path.join(PROTO_PATH, 'accountdetail.proto'),
            { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true }
        );
        const accountDetailProto: any = (packageDefinition['accountdetail.AccountDetailRequest'] as any);
        AccountDetailRequest = accountDetailProto;
        return AccountDetailRequest;
    } catch(e) {
        console.error("Failed to load AccountDetailRequest from proto", e);
        throw new Error("Failed to load AccountDetailRequest from proto");
    }
}


// This is the actual POST handler for the API route.
export async function POST(req: Request) {
    const { branch_code, customer_id } = await req.json();

    console.log(`[API] Received request for branch: ${branch_code}, cif: ${customer_id}`);

    if (!branch_code || !customer_id) {
        return NextResponse.json({ message: 'Branch code and customer ID are required' }, { status: 400 });
    }

    try {
        const client = getAccountDetailServiceClient();
        
        // Correctly serialize the AccountDetailRequest message to binary format
        const RequestType = loadRequestType();
        const accountDetailPayload = { branch_code, customer_id };
        const serializedPayload = RequestType.encode(accountDetailPayload).finish();
        
        const serviceRequest = {
            data: {
                type_url: 'type.googleapis.com/accountdetail.AccountDetailRequest',
                value: serializedPayload // Use the binary buffer directly
            },
            request_id: `req_${Date.now()}`,
            source_system: 'ZemenSuperAppAdmin',
            channel: 'WebAdmin',
            user_id: 'admin_user'
        };

        console.log('[API] Sending gRPC request with correctly serialized payload.');

        const customer = await new Promise((resolve, reject) => {
            (client as any).QueryCustomerDetails(serviceRequest, (err: any, response: any) => {
                if (err) {
                    console.error("[API] gRPC Error received:", err);
                    return reject(err);
                }

                console.log("[API] Raw gRPC Response received:", JSON.stringify(response, null, 2));

                if (response && response.success && response.data) {
                    try {
                        const detailResponse = JSON.parse(response.data.value.toString('utf8'));
                        
                        if (detailResponse.status === 'SUCCESS' && detailResponse.customer) {
                             console.log("[API] gRPC Success, decoded customer data:", detailResponse.customer);
                             resolve(detailResponse.customer);
                        } else {
                             console.error("[API] gRPC call returned non-success in nested response:", detailResponse.message);
                             resolve(null);
                        }
                    } catch(e) {
                         console.error("[API] Failed to parse nested response from gRPC data field", e);
                         reject(new Error("Failed to parse nested gRPC response."));
                    }
                } else {
                    console.error("[API] gRPC call returned non-success or empty data:", response.message);
                    resolve(null);
                }
            });
        });

        if (customer) {
            console.log("[API] Customer found, returning data.");
            return NextResponse.json(customer);
        } else {
            console.error("[API] Customer not found after successful gRPC call.");
            return NextResponse.json({ message: 'Customer not found in Flexcube' }, { status: 404 });
        }
    } catch (error: any) {
        console.error("[API] Final catch block - gRPC call failed:", error);
        return NextResponse.json({ message: error.details || 'An internal server error occurred' }, { status: 500 });
    }
}
