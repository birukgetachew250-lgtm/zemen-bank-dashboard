
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { GrpcClient } from '@/lib/grpc-client';
import crypto from 'crypto';
import { ServiceRequest } from '@/lib/grpc/generated/service_pb';
import { AccountDetailRequest } from '@/lib/grpc/generated/accountdetail_pb';
import { Any } from 'google-protobuf/google/protobuf/any_pb';


const getCifFromId = async (customerId: string) => {
    if (/^\\d+$/.test(customerId)) {
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
    
    const accountDetailRequest = new AccountDetailRequest();
    accountDetailRequest.setBranchCode(''); // Assuming not needed for this call, adjust if necessary
    accountDetailRequest.setCustomerId(cif);

    const anyPayload = new Any();
    anyPayload.pack(accountDetailRequest.serializeBinary(), 'accountdetail.AccountDetailRequest');

    const serviceRequest = new ServiceRequest();
    serviceRequest.setRequestId(`req_${crypto.randomUUID()}`);
    serviceRequest.setSourceSystem('dashboard');
    serviceRequest.setChannel('dash');
    serviceRequest.setUserId(cif);
    serviceRequest.setData(anyPayload);
    
    const response = await GrpcClient.queryCustomerDetail(serviceRequest);

    const accounts = response.getAccountsList().map(acc => acc.toObject());

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
