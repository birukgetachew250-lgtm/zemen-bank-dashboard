
'use server';

import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { GrpcClient } from '@/lib/grpc-client';
import crypto from 'crypto';
import type { ServiceRequest } from '@/lib/grpc/generated/common';
import type { Any } from '@/lib/grpc/generated/google/protobuf/any';

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
        // Continue to gRPC call even if DB check fails, for demo robustness
    }

    try {
        const grpcSingleton = GrpcClient.getInstance();
        await grpcSingleton.initialize();

        const client = grpcSingleton.client;
        const proto = grpcSingleton.proto;
        
        if (!client || !proto) {
             console.error("[gRPC] Client not available. Falling back to mock data for demo.");
             if (customer_id === '0000238') {
                return NextResponse.json(mockCustomer);
             }
            throw new Error("gRPC client is not initialized. Please check server logs.");
        }
        
        const accountDetailPackage = proto.lookup("accountdetail");
        const AccountDetailRequest = accountDetailPackage?.lookupType("AccountDetailRequest");
        const AccountDetailResponse = accountDetailPackage?.lookupType("AccountDetailResponse");

        if (!AccountDetailRequest || !AccountDetailResponse) {
             throw new Error("gRPC type definitions for AccountDetail not found.");
        }

        const innerDetail = {
            branch_code: branch_code,
            customer_id: customer_id,
        };
        
        const message = (AccountDetailRequest.create as any)(innerDetail);
        const buffer = (AccountDetailRequest.encode as any)(message).finish();
        
        const anyPayload: Any = {
            type_url: 'type.googleapis.com/querycustomerinfo.QueryCustomerDetailRequest',
            value: buffer
        };
        
        const serviceRequest: ServiceRequest = {
            request_id: `req_${crypto.randomUUID()}`,
            source_system: 'dashboard',
            channel: 'web',
            user_id: customer_id,
            data: anyPayload
        };


        console.log("[gRPC Request] Sending ServiceRequest:", JSON.stringify(serviceRequest, null, 2));

        return new Promise((resolve) => {
             client.queryCustomerDetails(serviceRequest, (error: any, response: any) => {
                if (error) {
                    console.error("[gRPC Error] customer-details:", error);
                    if (customer_id === '0000238') {
                        console.log("[gRPC Fallback] Serving mock data for CIF 0000238");
                        resolve(NextResponse.json(mockCustomer));
                    } else {
                        const errorMessage = error.details || 'Customer not found in core banking system.';
                        resolve(NextResponse.json({ message: errorMessage }, { status: 404 }));
                    }
                } else {
                    console.log("[gRPC Success] Received ServiceResponse:", response);
                     if (response.code === '0' && response.data) {
                       try {
                            const decodedResponse = (AccountDetailResponse.decode as any)(response.data.value);
                            const responseObject = AccountDetailResponse.toObject(decodedResponse, {
                                longs: String,
                                enums: String,
                                bytes: String,
                            });
                            resolve(NextResponse.json(responseObject.customer));
                        } catch (unpackError) {
                            console.error("[gRPC Unpack Error]", unpackError);
                            resolve(NextResponse.json({ message: "Failed to unpack customer details from response." }, { status: 500 }));
                        }
                    } else {
                        resolve(NextResponse.json({ message: response.message || "Customer not found." }, { status: 404 }));
                    }
                }
            });
        });

    } catch (error: any) {
        console.error("[gRPC Client Error]", error);
         if (customer_id === '0000238') {
            console.log("[gRPC Main Catch Fallback] Serving mock data for CIF 0000238");
            return NextResponse.json(mockCustomer);
        }
        return NextResponse.json({ message: "An unexpected error occurred with the gRPC client." }, { status: 500 });
    }
}
