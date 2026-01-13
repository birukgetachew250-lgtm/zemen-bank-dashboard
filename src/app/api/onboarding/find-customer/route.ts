
'use server';

import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { GrpcClient } from '@/lib/grpc-client';
import crypto from 'crypto';
import { ServiceRequest } from '@/lib/grpc/generated/service_pb';
import { AccountDetailRequest } from '@/lib/grpc/generated/accountdetail_pb';
import { Any } from 'google-protobuf/google/protobuf/any_pb';

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
        // First, check if the customer is already registered in our local DB
        const userCheckQuery = `SELECT "Id" FROM "USER_MODULE"."AppUsers" WHERE "CIFNumber" = :cif`;
        const existingUserResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, userCheckQuery, [customer_id]);
        
        if (existingUserResult && existingUserResult.rows && existingUserResult.rows.length > 0) {
            return NextResponse.json({ message: 'Customer is already registered for mobile banking.' }, { status: 409 });
        }

        const accountDetailRequestPayload = new AccountDetailRequest();
        accountDetailRequestPayload.setBranchCode(branch_code);
        accountDetailRequestPayload.setCustomerId(customer_id);

        const any = new Any();
        any.pack(accountDetailRequestPayload.serializeBinary(), 'accountdetail.AccountDetailRequest');
        
        const serviceRequest = new ServiceRequest();
        serviceRequest.setRequestId(`req_${crypto.randomUUID()}`);
        serviceRequest.setSourceSystem('dashboard');
        serviceRequest.setChannel('dash');
        serviceRequest.setUserId(customer_id);
        serviceRequest.setData(any);
        
        const accountDetailResponse = await GrpcClient.queryCustomerDetail(serviceRequest);

        return NextResponse.json(accountDetailResponse.toObject());

    } catch (error: any) {
        console.error("[gRPC/DB Error]", error);
        
        // Fallback to mock data if gRPC or DB fails for demo purposes
        if (customer_id === '0000238') {
            console.log("[Fallback] Serving mock data for CIF 0000238");
            return NextResponse.json(mockCustomer);
        }
        
        const errorMessage = error.details || error.message || 'Failed to fetch customer details.';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
