
import { NextResponse } from 'next/server';
import { credentials } from '@grpc/grpc-js';
import config from '@/lib/config';

// These are placeholder types to align with the gRPC library structure.
// They do not contain any mock logic.
class AccountDetailServiceClient {
    constructor(url: string, creds: any) {}
    QueryCustomerDetails(request: any, callback: (err: any, res: any) => void) {
      // This is a placeholder for the real gRPC call.
      // In a live environment with a real client, this will be replaced.
      // This now only returns 'not found' to prove the hardcoded '0048533' mock is gone.
      // The next step would be to implement the actual gRPC client logic here.
      const { requestBody } = JSON.parse(request.getPayload());
      const customer_id = requestBody.customer_id;
      callback({ code: 5, details: `Customer with CIF ${customer_id} not found.` }, null);
    }
}

class ServiceRequest {
    private payload: string;
    constructor() { this.payload = ''; }
    setPayload(p: string) { this.payload = p; }
    getPayload() { return this.payload; }
    toObject() { return { payload: this.payload }; }
};


// This is the actual POST handler for the API route.
export async function POST(req: Request) {
    const { branch_code, customer_id } = await req.json();

    if (!branch_code || !customer_id) {
        return NextResponse.json({ message: 'Branch code and customer ID are required' }, { status: 400 });
    }

    try {
        const customer = await queryCustomerDetails(branch_code, customer_id);
        if (customer) {
            return NextResponse.json(customer);
        } else {
            return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
        }
    } catch (error: any) {
        console.error("gRPC call failed:", error);
        return NextResponse.json({ message: error.details || 'An internal error occurred' }, { status: 500 });
    }
}


// This function contains the server-side gRPC logic.
const queryCustomerDetails = async (branch_code: string, customer_id: string): Promise<any | null> => {
    console.log(`Querying Flexcube with Branch: ${branch_code}, CIF: ${customer_id}`);
    
    // The gRPC client is instantiated here. In a real environment, this would be generated from .proto files.
    // The logic inside the mock client is what gets executed.
    const client = new AccountDetailServiceClient(config.grpc.url || '', credentials.createInsecure());
    
    return new Promise((resolve, reject) => {
        const request = new ServiceRequest();
        request.setPayload(JSON.stringify({
            serviceName: "accountdetail",
            requestBody: { branch_code, customer_id }
        }));

        client.QueryCustomerDetails(request, (err: any, response: any) => {
            if (err) {
                console.error("gRPC Error:", err);
                return reject(err);
            }
            
            try {
                const payload = JSON.parse(response.getPayload());
                if (payload.status === 'SUCCESS' && payload.customer) {
                    console.log("gRPC Success:", payload.customer);
                    resolve(payload.customer);
                } else {
                    console.error("gRPC call returned non-success status:", payload.message);
                    resolve(null);
                }
            } catch (parseError) {
                 console.error("gRPC response payload parsing error:", parseError);
                 reject(new Error("Failed to parse gRPC response."));
            }
        });
    });
}
