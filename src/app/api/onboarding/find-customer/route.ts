
'use server';

import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { GrpcClient } from '@/lib/grpc-client';
import crypto from 'crypto';
import type { ServiceRequest } from '@/lib/grpc/generated/common';
import type { AccountDetailRequest } from '@/lib/grpc/generated/accountdetail';

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
        const serviceRequest: ServiceRequest = {
            request_id: `req_${crypto.randomUUID()}`,
            source_system: 'dashboard',
            channel: 'dash',
            user_id: customer_id,
            data: {
              type_url: "type.googleapis.com/querycustomerinfo.QueryCustomerDetailRequest",
              value: Buffer.from(JSON.stringify({
                  branch_code,
                  customer_id,
              }))
            },
        };
        
        const response = await GrpcClient.queryCustomerDetail(serviceRequest);

        return NextResponse.json(response);

    } catch (error: any) {
        console.error("[gRPC/DB Error]", error);
         if (customer_id === '0000238') {
            console.log("[gRPC Main Catch Fallback] Serving mock data for CIF 0000238");
            return NextResponse.json(mockCustomer);
        }
        const errorMessage = error.details || error.message || 'An unexpected error occurred.';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
