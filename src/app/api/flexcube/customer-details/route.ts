
'use server';

import { NextResponse } from 'next/server';
import { getAccountDetailServiceClient, getAccountDetailRequestType } from '@/lib/grpc-client';
import * as grpc from '@grpc/grpc-js';

export async function POST(req: Request) {
    const { branch_code, customer_id } = await req.json();

    console.log(`[API] Received request for branch: ${branch_code}, cif: ${customer_id}`);

    if (!branch_code || !customer_id) {
        return NextResponse.json({ message: 'Branch code and customer ID are required' }, { status: 400 });
    }

    try {
        const client = getAccountDetailServiceClient();
        const AccountDetailRequest = getAccountDetailRequestType();
        
        const accountDetailPayload = { branch_code, customer_id };

        // Correctly serialize the payload to a binary buffer
        const serializedPayload = AccountDetailRequest.encode(accountDetailPayload).finish();
        
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
                        const nestedJsonResponse = Buffer.from(response.data.value).toString('utf8');
                        const detailResponse = JSON.parse(nestedJsonResponse);
                        
                        if (detailResponse.status === 'SUCCESS' && detailResponse.customer) {
                             console.log("[API] gRPC Success, decoded customer data:", detailResponse.customer);
                             resolve(detailResponse.customer);
                        } else {
                             const errorMessage = detailResponse.message || "Customer not found in Flexcube";
                             console.error("[API] gRPC call returned non-success in nested response:", errorMessage);
                             reject({ code: grpc.status.NOT_FOUND, details: errorMessage });
                        }
                    } catch(e) {
                         console.error("[API] Failed to parse nested response from gRPC data field", e);
                         reject({ code: grpc.status.INTERNAL, details: "Failed to parse nested gRPC response."});
                    }
                } else if (response && !response.success) {
                    const errorMessage = response.message || "Upstream service returned an invalid or empty response.";
                    console.error("[API] gRPC call returned non-success or empty data:", errorMessage);
                    reject({ code: grpc.status.UNAVAILABLE, details: errorMessage });
                } else {
                     const errorMessage = `No customer found for CIF: ${customer_id}`;
                    console.error("[API] Fallback: No customer found for CIF:", customer_id);
                    reject({ code: grpc.status.NOT_FOUND, details: errorMessage });
                }
            });
        });

        if (customer) {
            return NextResponse.json(customer);
        } else {
            // This case should ideally be handled by the promise rejection
            return NextResponse.json({ message: `Customer with CIF ${customer_id} not found.` }, { status: 404 });
        }


    } catch (error: any) {
        console.error("[API] Final catch block - gRPC call failed:", error);
        const statusCode = error.code === grpc.status.NOT_FOUND ? 404 : 500;
        return NextResponse.json({ message: error.details || 'An internal server error occurred' }, { status: statusCode });
    }
}
