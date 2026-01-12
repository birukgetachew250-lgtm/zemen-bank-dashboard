
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { GrpcClient } from '@/lib/grpc-client';
import crypto from 'crypto';
import type { ServiceRequest } from '@/lib/grpc/generated/common';
import type { AccountDetailRequest } from '@/lib/grpc/generated/accountdetail';

const getCifFromId = async (customerId: string) => {
    if (/^\d+$/.test(customerId)) {
        return customerId;
    }
    
    try {
        const customerResult: any = await executeQuery(
            process.env.USER_MODULE_DB_CONNECTION_STRING, 
            `SELECT "CIFNumber" FROM "USER_MODULE"."AppUsers" WHERE "Id" = :id`,
            [customerId]
        );
        if (customerResult && customerResult.rows && customerResult.rows.length > 0) {
            return customerResult.rows[0].CIFNumber;
        }
    } catch (e: any) {
        console.warn(`Could not find AppUser with ID ${customerId}, error: ${e.message}`);
    }
    return null;
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cif = await getCifFromId(params.id);

    if (!cif) {
        return NextResponse.json({ message: 'Could not determine CIF for the given customer ID.' }, { status: 404 });
    }
    
    const accountDetailRequestPayload = {
        branch_code: '', // Assuming not needed for this call, adjust if necessary
        customer_id: cif,
    };

    const serviceRequest: ServiceRequest = {
        request_id: `req_${crypto.randomUUID()}`,
        source_system: 'dashboard',
        channel: 'web',
        user_id: cif,
        data: {
          "@type": "type.googleapis.com/accountdetail.AccountDetailRequest",
          ...accountDetailRequestPayload
        },
    };
    
    const response = await GrpcClient.queryCustomerDetail(serviceRequest);

    // Assuming the response contains an 'accounts' field which is an array
    const accounts = (response as any).accounts || [];

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
