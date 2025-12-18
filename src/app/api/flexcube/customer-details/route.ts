
'use server';

import { NextResponse } from 'next/server';
import { getAccountDetailServiceClient, getAccountDetailRequestType } from '@/lib/grpc-client';
import { status } from '@grpc/grpc-js';


// This is the actual POST handler for the API route.
export async function POST(req: Request) {
    const { branch_code, customer_id } = await req.json();

    console.log(`[API] Received request for branch: ${branch_code}, cif: ${customer_id}`);

    if (!branch_code || !customer_id) {
        return NextResponse.json({ message: 'Branch code and customer ID are required' }, { status: 400 });
    }

    try {
        const client = getAccountDetailServiceClient();
        
        const RequestType = getAccountDetailRequestType();
        if (!RequestType) {
            throw new Error("Could not load the AccountDetailRequest message type.");
        }
        
        const accountDetailPayload = { branch_code, customer_id };

        // Create a buffer from the protobuf message
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

                if (response && response.success && response.data && response.data.value) {
                    try {
                        const detailResponse = JSON.parse(response.data.value.toString('utf8'));
                        
                        if (detailResponse.status === 'SUCCESS' && detailResponse.customer) {
                             console.log("[API] gRPC Success, decoded customer data:", detailResponse.customer);
                             resolve(detailResponse.customer);
                        } else {
                             console.error("[API] gRPC call returned non-success in nested response:", detailResponse.message);
                             // Pass the specific error message from Flexcube
                             reject({ code: status.NOT_FOUND, details: detailResponse.message || "Customer not found in Flexcube" });
                        }
                    } catch(e) {
                         console.error("[API] Failed to parse nested response from gRPC data field", e);
                         reject({ code: status.INTERNAL, details: "Failed to parse nested gRPC response."});
                    }
                } else {
                    console.error("[API] gRPC call returned non-success or empty data:", response.message);
                    reject({ code: status.UNIMPLEMENTED, details: response.message || "Upstream service returned an invalid response." });
                }
            });
        });

        return NextResponse.json(customer);

    } catch (error: any) {
        console.error("[API] Final catch block - gRPC call failed:", error);
        return NextResponse.json({ message: error.details || 'An internal server error occurred' }, { status: 500 });
    }
}
