
import { NextResponse } from 'next/server';
import { getAccountDetailServiceClient } from '@/lib/grpc-client';

// This is the actual POST handler for the API route.
export async function POST(req: Request) {
    const { branch_code, customer_id } = await req.json();

    console.log(`[API] Received request for branch: ${branch_code}, cif: ${customer_id}`);

    if (!branch_code || !customer_id) {
        return NextResponse.json({ message: 'Branch code and customer ID are required' }, { status: 400 });
    }

    try {
        const client = getAccountDetailServiceClient();
        
        const accountDetailRequest = {
            branch_code: branch_code,
            customer_id: customer_id
        };

        const serviceRequest = {
            data: {
                type_url: 'type.googleapis.com/accountdetail.AccountDetailRequest',
                value: Buffer.from(JSON.stringify(accountDetailRequest))
            },
            request_id: `req_${Date.now()}`,
            source_system: 'ZemenSuperAppAdmin',
            channel: 'WebAdmin',
            user_id: 'admin_user'
        };

        console.log('[API] Sending gRPC request:', JSON.stringify(serviceRequest, null, 2));

        const customer = await new Promise((resolve, reject) => {
             // The client object here is dynamically created by proto-loader and has the service methods
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
