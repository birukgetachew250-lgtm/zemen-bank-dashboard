
'use server';

import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { GrpcClient } from '@/lib/grpc-client';
import crypto from 'crypto';

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


export async function POST(req: Request) {
    const { branch_code, customer_id } = await req.json();

    if (!branch_code || !customer_id) {
        return NextResponse.json({ message: 'Branch code and customer ID are required' }, { status: 400 });
    }

    try {
        const client = GrpcClient.getAccountDetailServiceClient();
        
        const requestPayload = {
            branch_code,
            customer_id
        };

        const serviceRequest = {
            request_id: `req_${crypto.randomUUID()}`,
            source_system: 'dashboard',
            channel: 'dash',
            user_id: customer_id,
            data: {
                type_url: 'type.googleapis.com/accountdetail.AccountDetailRequest',
                value: requestPayload
            }
        };

        console.log("[gRPC Request] Sending ServiceRequest:", JSON.stringify(serviceRequest, null, 2));

        const grpcResponse = await GrpcClient.promisifyCall<any, any>(client, 'queryCustomerDetail', serviceRequest);

        console.log("[gRPC Success] Received ServiceResponse:", grpcResponse);
         if (grpcResponse.code === '0' && grpcResponse.data) {
           try {
                const AccountDetailResponse = await GrpcClient.loadProtobufType('accountdetail.proto', 'accountdetail.AccountDetailResponse');
                const decodedResponse = AccountDetailResponse.decode(grpcResponse.data.value);
                const responseObject = AccountDetailResponse.toObject(decodedResponse, { arrays: true });
                return NextResponse.json(responseObject);
            } catch (unpackError) {
                console.error("[gRPC Unpack Error]", unpackError);
                return NextResponse.json({ message: "Failed to unpack customer details from response." }, { status: 500 });
            }
        } else {
            // Fallback to mock data if gRPC fails in dev
            if (process.env.NODE_ENV === 'development' && customer_id === '0000238') {
                console.log("[gRPC Fallback] Serving mock data for CIF 0000238");
                return NextResponse.json(mockCustomer);
            }
            return NextResponse.json({ message: grpcResponse.message || "An error occurred from the core banking service." }, { status: 404 });
        }

    } catch (error: any) {
        console.error("[gRPC/DB Error] customer-details:", error);
        // If DB check fails, fallback to mock data for demo purposes
        if (customer_id === '0000238') {
            console.log("[DB Fallback] Serving mock data for CIF 0000238");
            return NextResponse.json(mockCustomer);
        }
        return NextResponse.json({ message: "Database error while checking for existing customer." }, { status: 500 });
    }
}
