
import { NextResponse } from 'next/server';
import { credentials } from '@grpc/grpc-js';
import config from '@/lib/config';

// These are placeholder imports. In a real project, these would be generated
// from your .proto files by a tool like grpc-tools.
// We are defining mock classes here to make the TypeScript compiler happy.
class MockAccountDetailServiceClient {
    constructor(url: string, creds: any) {}
    QueryCustomerDetails(request: any, callback: (err: any, res: any) => void) {
        console.log("Making mock gRPC call with request:", request.toObject());
        const { requestBody } = JSON.parse(request.getPayload());
        const customer_id = requestBody.customer_id;
        
        if (customer_id === '0048533') {
             callback(null, { 
                getPayload: () => JSON.stringify({
                    customer: {
                        customer_number: customer_id,
                        full_name: 'AKALEWORK TAMENE KEBEDE',
                        cif_creation_date: '2022-01-20',
                        date_of_birth: '1990-05-15',
                        gender: 'Female',
                        email_id: 'akalework.t@example.com',
                        mobile_number: '+251911223344',
                        address_line_1: 'AA, ADDIS KETEMA',
                        address_line_2: '06',
                        address_line_3: '790',
                        address_line_4: '',
                        country: 'ETHIOPIA',
                        branch: 'ADDIS KETEMA',
                    },
                    status: "SUCCESS",
                    message: "Customer found"
                })
            });
        } else {
            callback({ code: 5, details: "Customer not found" }, null);
        }
    }
}
const AccountDetailServiceClient = MockAccountDetailServiceClient;

class MockServiceRequest {
    private payload: string;
    constructor() { this.payload = ''; }
    setPayload(p: string) { this.payload = p; }
    getPayload() { return this.payload; }
    toObject() { return { payload: this.payload }; }
};
const ServiceRequest = MockServiceRequest;


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


// This function contains the gRPC logic and is only executed on the server.
const queryCustomerDetails = async (branch_code: string, customer_id: string): Promise<any | null> => {
    console.log(`Querying Flexcube with Branch: ${branch_code}, CIF: ${customer_id}`);
    
    // --- Production gRPC Call ---
    if (!config.grpc.url) {
        throw new Error("gRPC URL is not configured in environment variables.");
    }
    console.log(`Making a real gRPC call to ${config.grpc.url}...`);
    
    // In a real scenario, the 'AccountDetailServiceClient' would be imported from generated code.
    const client = new AccountDetailServiceClient(config.grpc.url, credentials.createInsecure());
    
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
