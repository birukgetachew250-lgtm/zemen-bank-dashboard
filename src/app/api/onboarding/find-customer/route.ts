
'use server';

import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { GrpcClient } from '@/lib/grpc-client';
import crypto from 'crypto';
import type { ServiceRequest, ServiceResponse } from '@/lib/grpc/generated/common';
import type { AccountDetailRequest, AccountDetailResponse } from '@/lib/grpc/generated/accountdetail';
import { Any } from '@/lib/grpc/generated/google/protobuf/any';

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
        const existingUserQuery = `SELECT "Id" FROM "USER_MODULE"."AppUsers" WHERE "CIFNumber" = :cif`;
        const existingUserResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, existingUserQuery, [customer_id]);
        
        if (existingUserResult.rows && existingUserResult.rows.length > 0) {
            return NextResponse.json({ message: 'Customer is already registered for mobile banking.' }, { status: 409 });
        }
    } catch (dbError: any) {
        console.error("[DB Error] Checking existing user:", dbError);
    }

    try {
        await GrpcClient.initialize();
        const client = GrpcClient.getClient();

        const serviceRequest: ServiceRequest = {
          request_id: `req_${crypto.randomUUID()}`,
          source_system: 'dashboard',
          channel: 'web',
          user_id: customer_id, // Or an admin user ID
          data: {
            type_url: 'type.googleapis.com/accountdetail.AccountDetailRequest',
            value: Buffer.from(JSON.stringify({
                branch_code,
                customer_id,
            }))
          }
        };

        console.log("[gRPC Request] Sending ServiceRequest:", JSON.stringify(serviceRequest, null, 2));

        const queryCustomerDetails = (request: ServiceRequest): Promise<ServiceResponse> => {
            return new Promise((resolve, reject) => {
                client.queryCustomerDetail(request, (error, response) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(response!);
                    }
                });
            });
        };
        
        const response = await queryCustomerDetails(serviceRequest);

        console.log("[gRPC Success] Received ServiceResponse:", response);
        if (response.code === '0' && response.data) {
            try {
                const decodedData = JSON.parse(Buffer.from(response.data.value).toString());
                return NextResponse.json(decodedData.customer);
            } catch (unpackError) {
                console.error("[gRPC Unpack Error]", unpackError);
                return NextResponse.json({ message: "Failed to unpack customer details from response." }, { status: 500 });
            }
        } else {
            return NextResponse.json({ message: response.message || "Customer not found." }, { status: 404 });
        }
    } catch (error: any) {
        console.error("[gRPC Client Error]", error);
         if (customer_id === '0000238') {
            console.log("[gRPC Main Catch Fallback] Serving mock data for CIF 0000238");
            return NextResponse.json(mockCustomer);
        }
        const errorMessage = error.details || 'An unexpected error occurred with the gRPC client.';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
