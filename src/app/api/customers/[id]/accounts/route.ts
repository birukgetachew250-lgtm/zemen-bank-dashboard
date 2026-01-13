
'use server';

import { NextResponse } from 'next/server';
import { GrpcClient } from '@/lib/grpc-client';
import { ServiceRequest } from '@/lib/grpc/generated/service_pb';
import { AccountDetailRequest } from '@/lib/grpc/generated/accountdetail_pb';
import { Any } from 'google-protobuf/google/protobuf/any_pb';
import crypto from 'crypto';

const getMockAccounts = (cif: string) => {
    if (cif === '0000238') {
        return [
            { custacno: "3021110000238018", branchCode: "302", ccy: "ETB", accountType: "S", acclassdesc: "Z-Club Gold –  Saving", status: "Active" },
        ];
    }
    return [
        { custacno: "1031110048533015", branchCode: "103", ccy: "ETB", accountType: "S", acclassdesc: "Personal Saving - Private and Individual", status: "Active" },
        { custacno: "1031110048533016", branchCode: "103", ccy: "ETB", accountType: "C", acclassdesc: "Personal Current - Private and Individual", status: "Active" },
        { custacno: "1031110048533017", branchCode: "101", ccy: "USD", accountType: "S", acclassdesc: "Personal Domiciliary Saving", status: "Dormant" },
        { custacno: "1031110048533018", branchCode: "103", ccy: "ETB", accountType: "S", acclassdesc: "Personal Saving - Joint", status: "Inactive" },
    ];
};

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
    let cif = customerId;

    if (customerId.startsWith('user_')) {
        cif = customerId.split('_')[1];
    }

    if (!cif) {
        return NextResponse.json({ message: 'Could not determine CIF for the given customer ID.' }, { status: 404 });
    }

    const accountDetailRequestPayload = new AccountDetailRequest();
    // Assuming branch code might be needed, using a default or logic to determine it
    accountDetailRequestPayload.setBranchCode("103"); 
    accountDetailRequestPayload.setCustomerId(cif);

    const any = new Any();
    any.pack(accountDetailRequestPayload.serializeBinary(), 'accountdetail.AccountDetailRequest');
    
    const serviceRequest = new ServiceRequest();
    serviceRequest.setRequestId(`req_${crypto.randomUUID()}`);
    serviceRequest.setSourceSystem('dashboard');
    serviceRequest.setChannel('dash');
    serviceRequest.setUserId(cif);
    serviceRequest.setData(any);
    
    const accountDetailResponse = await GrpcClient.queryCustomerDetail(serviceRequest);
    const accounts = accountDetailResponse.getAccountsList().map(acc => acc.toObject());
    
    return NextResponse.json(accounts);

  } catch (error: any) {
    console.error('Failed to fetch accounts:', error);
    
    // Fallback logic for demo purposes
    let cif = params.id.startsWith('user_') ? params.id.split('_')[1] : params.id;
    const mockAccounts = getMockAccounts(cif).map(acc => ({
        ...acc,
        CUSTACNO: acc.custacno,
        BRANCH_CODE: acc.branchCode,
        CCY: acc.ccy,
        ACCOUNT_TYPE: acc.accountType,
        ACCLASSDESC: acc.acclassdesc,
    }));
    return NextResponse.json(mockAccounts);
  }
}
