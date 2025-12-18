
import { NextResponse } from 'next/server';
import { getAccountDetailServiceClient } from '@/lib/grpc-client';

// This is the actual POST handler for the API route.
export async function POST(req: Request) {
    const { branch_code, customer_id } = await req.json();

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
                value: Buffer.from(JSON.stringify(accountDetailRequest)) // This is a simplification. Real proto encoding is needed.
            },
            request_id: `req_${Date.now()}`,
            source_system: 'ZemenSuperAppAdmin',
            channel: 'WebAdmin',
            user_id: 'admin_user'
        };

        const customer = await new Promise((resolve, reject) => {
             // The client object here is dynamically created by proto-loader and has the service methods
            (client as any).QueryCustomerDetails(serviceRequest, (err: any, response: any) => {
                if (err) {
                    console.error("gRPC Error:", err);
                    return reject(err);
                }

                console.log("Raw gRPC Response:", response);

                if (response && response.success && response.data) {
                    // Assuming data is of type `google.protobuf.Any`
                    // In a real scenario, you'd properly unpack the 'Any' type.
                    // For now, we'll assume it's a JSON string in the 'value' buffer.
                    try {
                        // This part is tricky without proper proto-decoding stubs.
                        // We are assuming the response 'data.value' is a buffer containing a JSON string.
                        // This might need adjustment based on the actual server implementation.
                        const detailResponse = JSON.parse(response.data.value.toString('utf8'));
                        
                        if (detailResponse.status === 'SUCCESS' && detailResponse.customer) {
                             console.log("gRPC Success, Customer Data:", detailResponse.customer);
                             resolve(detailResponse.customer);
                        } else {
                             console.error("gRPC call returned non-success in nested response:", detailResponse.message);
                             resolve(null);
                        }
                    } catch(e) {
                         console.error("Failed to parse nested response from gRPC data field", e);
                         reject(new Error("Failed to parse nested gRPC response."));
                    }
                } else {
                    console.error("gRPC call returned non-success or empty data:", response.message);
                    resolve(null);
                }
            });
        });

        if (customer) {
            return NextResponse.json(customer);
        } else {
            return NextResponse.json({ message: 'Customer not found in Flexcube' }, { status: 404 });
        }
    } catch (error: any) {
        console.error("gRPC call failed:", error);
        return NextResponse.json({ message: error.details || 'An internal server error occurred' }, { status: 500 });
    }
}
