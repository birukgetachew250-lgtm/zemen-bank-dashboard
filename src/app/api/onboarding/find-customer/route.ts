
'use server';

import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { getAccountDetailServiceClient, getAccountDetailPackage } from '@/lib/grpc-client';

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
        // 1. Check if user already exists in AppUsers table
        const existingUserQuery = `SELECT "Id" FROM "USER_MODULE"."AppUsers" WHERE "CIFNumber" = :cif`;
        const existingUserResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, existingUserQuery, [customer_id]);
        
        if (existingUserResult.rows && existingUserResult.rows.length > 0) {
            return NextResponse.json({ message: 'Customer is already registered for mobile banking.' }, { status: 409 });
        }

        // 2. If not, proceed to call gRPC service
        const client = getAccountDetailServiceClient();
        
        // The gRPC client expects a plain JS object that matches the proto definition.
        const requestPayload = {
            branch_code: branch_code,
            customer_id: customer_id
        };
        
        console.log("[gRPC Request] Sending to queryCustomerDetails:", JSON.stringify(requestPayload, null, 2));

        return new Promise((resolve, reject) => {
             client.queryCustomerDetails(requestPayload, (error: any, response: any) => {
                if (error) {
                    console.error("[gRPC Error] customer-details:", error);
                    // Fallback to mock data if gRPC fails for specific demo CIF
                    if (customer_id === '0000238') {
                        console.log("[gRPC Fallback] Serving mock data for CIF 0000238");
                        resolve(NextResponse.json(mockCustomer));
                    } else {
                        const errorMessage = error.details || 'Customer not found in core banking system.';
                        resolve(NextResponse.json({ message: errorMessage }, { status: 404 }));
                    }
                } else {
                    console.log("[gRPC Success] customer-details:", response);
                    resolve(NextResponse.json(response));
                }
            });
        });

    } catch (dbError: any) {
        console.error("[DB Error] Checking existing user:", dbError);
        // If DB check fails, fallback to mock data for demo purposes
        if (customer_id === '0000238') {
            console.log("[DB Fallback] Serving mock data for CIF 0000238");
            return NextResponse.json(mockCustomer);
        }
        return NextResponse.json({ message: "Database error while checking for existing customer." }, { status: 500 });
    }
}
