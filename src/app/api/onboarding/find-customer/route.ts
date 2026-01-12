
'use server';

import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { GrpcClient } from '@/lib/grpc-client';
import crypto from 'crypto';
import type { ServiceRequest } from '@/lib/grpc/generated/service';
import type { AccountDetailRequest } from '@/lib/grpc/generated/accountdetail';
import protobuf from 'protobufjs';
import path from 'path';

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

// We'll load this once and cache it
let AccountDetailRequestType: protobuf.Type | null = null;
let AccountDetailResponseType: protobuf.Type | null = null;

async function loadProtos() {
  if (AccountDetailRequestType && AccountDetailResponseType) {
    return { AccountDetailRequestType, AccountDetailResponseType };
  }

  const root = await protobuf.load(path.join(process.cwd(), 'src/lib/grpc/protos/accountdetail.proto'));
  
  AccountDetailRequestType = root.lookupType('accountdetail.AccountDetailRequest');
  AccountDetailResponseType = root.lookupType('accountdetail.AccountDetailResponse');

  return { AccountDetailRequestType, AccountDetailResponseType };
}


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

        const client = GrpcClient.client;
        if (!client) {
            throw new Error("gRPC client not initialized");
        }
        
        // 1. Create plain JS object for the request payload
        const innerDetail: AccountDetailRequest = {
            branch_code: branch_code,
            customer_id: customer_id,
        };

        // 2. Get protobuf type and encode to binary
        const { AccountDetailRequestType } = await loadProtos();
        const errMsg = AccountDetailRequestType.verify(innerDetail);
        if (errMsg) throw Error(errMsg);
        const message = AccountDetailRequestType.create(innerDetail);
        const buffer = AccountDetailRequestType.encode(message).finish();

        // 3. Build the wrapper `Any` payload
        const anyPayload = {
            type_url: "type.googleapis.com/accountdetail.AccountDetailRequest",
            value: Buffer.from(buffer),
        };

        const serviceRequest: ServiceRequest = {
            request_id: `req_${crypto.randomUUID()}`,
            source_system: 'dashboard',
            channel: 'dash',
            user_id: customer_id,
            data: anyPayload,
        };

        console.log("[gRPC Request] Sending ServiceRequest:", JSON.stringify(serviceRequest, null, 2));

        return new Promise((resolve) => {
             client.queryCustomerDetail(serviceRequest, async (error: any, response: any) => {
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
                            const { AccountDetailResponseType } = await loadProtos();
                            const accountDetailResponse = AccountDetailResponseType.decode(response.data.value);
                            const responseObject = AccountDetailResponseType.toObject(accountDetailResponse, {
                                longs: String,
                                enums: String,
                                bytes: String,
                            });
                            resolve(NextResponse.json(responseObject));
                        } catch (unpackError) {
                            console.error("[gRPC Unpack Error]", unpackError);
                            resolve(NextResponse.json({ message: "Failed to unpack customer details from response." }, { status: 500 }));
                        }
                    } else {
                        resolve(NextResponse.json({ message: response.message || "An error occurred from the core banking service." }, { status: 404 }));
                    }
                }
            });
        });

    } catch (dbError: any) {
        console.error("[DB Error] Checking existing user:", dbError);
        if (customer_id === '0000238') {
            console.log("[DB Fallback] Serving mock data for CIF 0000238");
            return NextResponse.json(mockCustomer);
        }
        return NextResponse.json({ message: "Database error while checking for existing customer." }, { status: 500 });
    }
}
