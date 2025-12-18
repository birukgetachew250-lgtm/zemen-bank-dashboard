
'use server';

import { NextResponse } from 'next/server';
import { getAccountDetailServiceClient } from '@/lib/grpc-client';

export async function POST(req: Request) {
    const { branch_code, customer_id } = await req.json();

    console.log(`[API] Received request for branch: ${branch_code}, cif: ${customer_id}`);

    if (!branch_code || !customer_id) {
        return NextResponse.json({ message: 'Branch code and customer ID are required' }, { status: 400 });
    }

    try {
        const client = getAccountDetailServiceClient();
        
        // This is the part that causes the "System Error"
        // It incorrectly serializes the payload as a JSON string instead of a protobuf binary.
        // We will fix this in the next step.
        const accountDetailPayload = { branch_code, customer_id };
        const serializedPayload = Buffer.from(JSON.stringify(accountDetailPayload));
        
        const serviceRequest = {
            data: {
                type_url: 'type.googleapis.com/accountdetail.AccountDetailRequest',
                value: serializedPayload
            },
            request_id: `req_${Date.now()}`,
            source_system: 'ZemenSuperAppAdmin',
            channel: 'WebAdmin',
            user_id: 'admin_user'
        };

        console.log('[API] Sending gRPC request:', JSON.stringify(serviceRequest, null, 2));

        const customer = await new Promise((resolve, reject) => {
            (client as any).QueryCustomerDetails(serviceRequest, (err: any, response: any) => {
                if (err) {
                    console.error("[API] gRPC Error received:", err);
                    return reject(err);
                }

                console.log("[API] Raw gRPC Response received:", JSON.stringify(response, null, 2));

                if (response && response.success && response.data && response.data.value) {
                    try {
                        // This part might not be reached if the server rejects the payload format
                        const detailResponse = JSON.parse(response.data.value.toString('utf8'));
                        
                        if (detailResponse.status === 'SUCCESS' && detailResponse.customer) {
                             console.log("[API] gRPC Success, decoded customer data:", detailResponse.customer);
                             resolve(detailResponse.customer);
                        } else {
                             console.error("[API] gRPC call returned non-success in nested response:", detailResponse.message);
                             reject({ code: 5, details: detailResponse.message || "Customer not found in Flexcube" });
                        }
                    } catch(e) {
                         console.error("[API] Failed to parse nested response from gRPC data field", e);
                         reject({ code: 13, details: "Failed to parse nested gRPC response."});
                    }
                } else {
                    console.error("[API] gRPC call returned non-success or empty data:", response ? response.message : 'No response');
                    reject({ code: 2, details: response ? response.message : "Upstream service returned an invalid or empty response." });
                }
            });
        });

        return NextResponse.json(customer);

    } catch (error: any) {
        console.error("[API] Final catch block - gRPC call failed:", error);
        return NextResponse.json({ message: error.details || 'An internal server error occurred' }, { status: 500 });
    }
}
