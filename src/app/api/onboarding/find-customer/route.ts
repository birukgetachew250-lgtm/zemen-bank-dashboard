
'use server';

import { NextResponse } from 'next/server';
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
const PROTO_DIR = path.join(process.cwd(), 'src/lib/grpc/protos');


// Module-level variables
let client: any = null;
let root: protobuf.Root | null = null;
let AccountDetailRequestType: protobuf.Type | null = null;
let AnyType: protobuf.Type | null = null;
let ServiceRequestType: protobuf.Type | null = null;
let AccountDetailResponseType: protobuf.Type | null = null;

// Single promise to ensure init only once
let initPromise: Promise<void> | null = null;

async function initializeGrpc() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const packageDef = protoLoader.loadSync(
        path.join(PROTO_DIR, 'accountdetail.proto'),
        {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
          includeDirs: [PROTO_DIR]
        }
      );

      const grpcObj = grpc.loadPackageDefinition(packageDef) as any;
      
      client = new grpcObj.accountdetail.AccountDetailService(
        GRPC_SERVER_ADDRESS,
        grpc.credentials.createInsecure()
      );

      root = await protobuf.load(path.join(PROTO_DIR, 'accountdetail.proto'));

      AccountDetailRequestType = root.lookupType('accountdetail.AccountDetailRequest');
      AnyType = root.lookupType('google.protobuf.Any');
      ServiceRequestType = root.lookupType('common.ServiceRequest');
      AccountDetailResponseType = root.lookupType('accountdetail.AccountDetailResponse');

      if (!AccountDetailRequestType || !AnyType || !ServiceRequestType || !AccountDetailResponseType) {
        throw new Error('One or more protobuf types not found in proto files');
      }
    } catch (error) {
      console.error('[find-customer][INIT FAILED]', error);
      throw error;
    }
  })();

  return initPromise;
}

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

  // Check if user already exists in Oracle DB
  try {
    const checkUserQuery = `SELECT COUNT(*) as "count" FROM "USER_MODULE"."AppUsers" WHERE "CIFNumber" = :cif`;
    const checkUserResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, checkUserQuery, [customer_id]);
    
    if (checkUserResult.rows && checkUserResult.rows[0].count > 0) {
        return NextResponse.json({ message: 'Customer with this CIF is already registered for mobile banking.' }, { status: 409 });
    }
  } catch (dbError) {
      console.error("Database check failed:", dbError);
      // Fail open during build, but might want to fail closed in production if DB is critical
      if (process.env.NODE_ENV !== 'development') {
           return NextResponse.json({ message: 'Could not verify customer registration status.' }, { status: 500 });
      }
  }


  try {
    await initializeGrpc();
  } catch (initErr) {
    console.error('[find-customer] Init failed during request:', initErr);
    // Fallback for demo purposes
    if (customer_id === '0000238') {
      return NextResponse.json(mockCustomer);
    }
    return NextResponse.json({ message: 'Internal server error: Could not connect to banking service.' }, { status: 500 });
  }

  if (!client || !ServiceRequestType || !AnyType || !AccountDetailRequestType || !AccountDetailResponseType) {
    console.error('gRPC types not ready after initialization.');
    return NextResponse.json({ message: 'gRPC types not ready' }, { status: 500 });
  }

  try {
    const innerPayload = AccountDetailRequestType.create({
        customerId: customer_id,
        branchCode: branch_code,
    });
    
    const innerBuffer = AccountDetailRequestType.encode(innerPayload).finish();

    const anyPayload = AnyType.create({
      type_url: 'type.googleapis.com/accountdetail.AccountDetailRequest',
      value: innerBuffer,
    });

    const serviceRequestPayload = ServiceRequestType.create({
      data: anyPayload,
      request_id: `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      source_system: 'MOBILE',
      channel: 'mobile',
      user_id: 'DASH_USER'
    });

    const grpcResponse = await promisifyCall<any, any>('QueryCustomerDetail', serviceRequestPayload);
    
    if (!grpcResponse || (grpcResponse.code !== '0' && grpcResponse.code !== '00' )) {
      console.info("gRPC Transport Error", grpcResponse);
      return NextResponse.json({ message: grpcResponse.message || 'Upstream service error' }, { status: 502 });
    }

    const dataValue = grpcResponse.data?.value;
    if (!dataValue) {
      throw new Error("Response success but data.value is missing");
    }
    
    const buffer = Buffer.isBuffer(dataValue) ? dataValue : Buffer.from(dataValue);

    const decoded = AccountDetailResponseType.decode(buffer);
    const object = AccountDetailResponseType.toObject(decoded, {
      longs: String,
      enums: String,
      defaults: true,
      arrays: true,
      objects: true
    });

     return NextResponse.json({
        full_name: object.customer?.fullName,
        cif_creation_date: object.customer?.cifCreationDate,
        customer_number: object.customer?.customerNumber,
        date_of_birth: object.customer?.dateOfBirth,
        gender: object.customer?.gender,
        email_id: object.customer?.emailId,
        mobile_number: object.customer?.mobileNumber,
        address_line_1: object.customer?.addressLine_1,
        address_line_2: object.customer?.addressLine_2,
        address_line_3: object.customer?.addressLine_3,
        address_line_4: object.customer?.addressLine_4,
        country: object.customer?.country,
        branch: object.customer?.branch,
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
