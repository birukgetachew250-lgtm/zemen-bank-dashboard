
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { decrypt } from '@/lib/crypto';
import { GrpcClient } from '@/lib/grpc-client';
import crypto from 'crypto';
import type { ServiceRequest, ServiceResponse } from '@/lib/grpc/generated/common';
import type { AccountDetailRequest, AccountDetailResponse } from '@/lib/grpc/generated/accountdetail';
import { Any } from '@/lib/grpc/generated/google/protobuf/any';

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
    
    await GrpcClient.initialize();
    
    const serviceRequest = {
      request_id: `req_${crypto.randomUUID()}`,
      source_system: 'dashboard',
      channel: 'web',
      user_id: cif,
      data: {
        "@type": "type.googleapis.com/querycustomerinfo.QueryCustomerDetailRequest",
        customer_id: cif,
      }
    };
    
    const response = await GrpcClient.promisifyCall<ServiceResponse>('queryCustomerDetail', serviceRequest);
    
    if (response.code !== '0' || !response.data) {
        throw new Error(response.message || 'Failed to fetch account details from service');
    }

    const dataValue = (response as any).data?.value;
    if (!dataValue) {
      throw new Error("Response success but data field is missing");
    }

    const buffer = Buffer.isBuffer(dataValue) ? dataValue : Buffer.from(dataValue.data || dataValue);
    
    const AccountDetailResponse = GrpcClient.AccountDetailResponse;
    if (!AccountDetailResponse) {
        throw new Error("AccountDetailResponse definition not found on gRPC client.");
    }
    
    const decoded = (AccountDetailResponse as any).decode(buffer);
    const decodedObject = (AccountDetailResponse as any).toObject(decoded);

    // Assuming the response contains an 'accounts' field which is an array
    const accounts = decodedObject.accounts || [];

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
