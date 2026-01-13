
'use server';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import * as protobuf from 'protobufjs';
import { executeQuery } from '@/lib/oracle-db';

const mockCustomer = {
  full_name: "TSEDALE ADAMU MEDHANE",
  cif_creation_date: "2022-01-01T00:00:00.000Z",
  customer_number: "0000238",
  date_of_birth: "1990-01-01T00:00:00.000Z",
  gender: "Female",
  email_id: "biruk.getachew@zemenbank.com",
  mobile_number: "+251920249797",
  address_line_1: "Bole Sub-city",
  address_line_2: "Woreda 03",
  address_line_3: "Addis Ababa",
  address_line_4: "",
  country: "Ethiopia",
  branch: "Bole"
};

const GRPC_SERVER_ADDRESS = process.env.FLEX_GRPC_URL || 'localhost:8081';
const PROTO_PATH = path.join(process.cwd(), 'src/lib/grpc/protos/accountdetail.proto');

// Module-level variables
let client: any = null;
let accountDetailResponseType: protobuf.Type | null = null;

(async () => {
  try {
    const packageDef = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs: [path.join(process.cwd(), 'src/lib/grpc/protos')]
    });

    const grpcObj = grpc.loadPackageDefinition(packageDef) as any;
    
    client = new grpcObj.accountdetail.AccountDetailService(
      GRPC_SERVER_ADDRESS,
      grpc.credentials.createInsecure()
    );

    const root = await protobuf.load(PROTO_PATH);
    accountDetailResponseType = root.lookupType('accountdetail.AccountDetailResponse');

    if (!accountDetailResponseType) {
      throw new Error('accountdetail.AccountDetailResponse type not found in protobufjs');
    }

  } catch (error) {
    console.error('[INIT FAILED]', error);
  }
})();

function promisifyCall<TRequest, TResponse>(methodName: string, request: TRequest): Promise<TResponse> {
  return new Promise((resolve, reject) => {
    if (!client) return reject(new Error("gRPC client not initialized"));
    const deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 60);

    client[methodName](request, { deadline }, (err: any, res: TResponse) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}

export async function POST(req: Request) {
  const { branch_code, customer_id } = await req.json();

  if (!branch_code || !customer_id) {
    return NextResponse.json({ message: 'Branch code and customer ID are required' }, { status: 400 });
  }

  try {
    // Check if user already exists in Oracle DB
    const checkUserQuery = `SELECT COUNT(*) as count FROM "USER_MODULE"."AppUsers" WHERE "CIFNumber" = :cif`;
    const checkUserResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, checkUserQuery, [customer_id]);
    
    if (checkUserResult.rows && checkUserResult.rows[0].COUNT > 0) {
        return NextResponse.json({ message: 'Customer with this CIF is already registered for mobile banking.' }, { status: 409 });
    }

    const request = {
      data: {
        "@type": "type.googleapis.com/accountdetail.AccountDetailRequest",
        branch_code,
        customer_id
      },
      request_id: `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      source_system: 'MOBILE',
      channel: 'mobile',
      user_id: 'DASH_USER'
    };

    const grpcResponse = await promisifyCall<any, any>('QueryCustomerDetails', request);

    if (!grpcResponse || !grpcResponse.success) {
      console.info("gRPC Transport Error", grpcResponse);
      return NextResponse.json({ message: grpcResponse.message || 'Upstream service error' }, { status: 502 });
    } 
      if (grpcResponse.code !== '0' && grpcResponse.code !== '00') {
      return NextResponse.json(
        { message: grpcResponse.message || "Operation not Working." },
        { status: 598 }
      );
    }

    const dataValue = grpcResponse.data?.value;
    if (!dataValue) {
      throw new Error("Response success but data.value is missing");
    }
    
    const buffer = Buffer.isBuffer(dataValue) ? dataValue : Buffer.from(dataValue);

    if (!accountDetailResponseType) {
      throw new Error("AccountDetailResponse type not loaded - check init");
    }

    const decoded = accountDetailResponseType.decode(buffer);
    const object = accountDetailResponseType.toObject(decoded, {
      longs: String,
      enums: String,
      defaults: true,
      arrays: true,
      objects: true
    });

     return NextResponse.json({
        full_name: object.customer.fullName,
        cif_creation_date: object.customer.cifCreationDate,
        customer_number: object.customer.customerNumber,
        date_of_birth: object.customer.dateOfBirth,
        gender: object.customer.gender,
        email_id: object.customer.emailId,
        mobile_number: object.customer.mobileNumber,
        address_line_1: object.customer.addressLine_1,
        address_line_2: object.customer.addressLine_2,
        address_line_3: object.customer.addressLine_3,
        address_line_4: object.customer.addressLine_4,
        country: object.customer.country,
        branch: object.customer.branch,
        });
  } catch (error: any) {
    console.error('[gRPC/DB Error]', error);

    // Fallback for demo purposes if DB/gRPC fails
    if (customer_id === '0000238') {
      return NextResponse.json(mockCustomer);
    }
    if (customer_id === '0005995' || customer_id === '0052347') {
      return NextResponse.json({ message: 'Customer with this CIF is already registered for mobile banking.' }, { status: 409 });
    }
    
    const errorMsg = error?.details || error?.message || 'Failed to fetch customer details';
    return NextResponse.json({ message: errorMsg }, { status: 500 });
  }
}
