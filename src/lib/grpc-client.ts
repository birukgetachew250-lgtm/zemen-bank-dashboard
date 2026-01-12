
'use client';

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import config from '@/lib/config';
import type { ProtoGrpcType as AccountDetailProtoGrpcType } from './grpc/generated/accountdetail';
import type { ServiceRequest, ServiceResponse } from './grpc/generated/common';
import { AccountDetailRequest, AccountDetailResponse } from './grpc/generated/accountdetail';
import { Buffer } from 'buffer';

const PROTO_FILE = 'accountdetail.proto';
const PROTO_DIR = path.join(process.cwd(), 'src', 'lib', 'grpc', 'protos');
const GRPC_TIMEOUT_MS = 5000;

class GrpcClientSingleton {
    public client: AccountDetailProtoGrpcType['accountdetail']['AccountDetailServiceClient'];
    private AccountDetailResponse: any;
    private initialized = false;
    private initializePromise: Promise<void> | null = null;

    constructor() {
        try {
            const packageDefinition = protoLoader.loadSync(PROTO_FILE, {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
                includeDirs: [PROTO_DIR],
            });

            const grpcObject = (grpc.loadPackageDefinition(packageDefinition) as unknown) as AccountDetailProtoGrpcType;

            if (!grpcObject.accountdetail?.AccountDetailService) {
                throw new Error("Service 'accountdetail.AccountDetailService' not loaded from proto.");
            }
            if (!grpcObject.accountdetail?.AccountDetailResponse) {
                throw new Error("Message type 'accountdetail.AccountDetailResponse' not loaded from proto.");
            }
            this.AccountDetailResponse = grpcObject.accountdetail.AccountDetailResponse;
            
            const grpcUrl = config.grpc.url.replace(/^(https?:\/\/)/, '');
            this.client = new grpcObject.accountdetail.AccountDetailService(grpcUrl, grpc.credentials.createInsecure());
            
            console.log(`[gRPC Client] Initialized client for AccountDetailService at target URL: ${grpcUrl}`);
            this.initialized = true;

        } catch (error) {
            console.error("[gRPC Client] Failed to initialize:", error);
            throw new Error("Could not initialize gRPC client.");
        }
    }

    private promisifyCall<TRequest, TResponse>(methodName: 'queryCustomerDetail'): (request: TRequest) => Promise<TResponse> {
        return (request: TRequest): Promise<TResponse> => {
            return new Promise((resolve, reject) => {
                const deadline = Date.now() + GRPC_TIMEOUT_MS;

                // Ensure the method exists before calling.
                const method = this.client[methodName];
                if (typeof method !== 'function') {
                    return reject(new TypeError(`this.client.${methodName} is not a function`));
                }

                // Correctly call the method on the client instance
                this.client[methodName](request as any, { deadline }, (err: any, res: TResponse) => {
                    if (err) return reject(err);
                    resolve(res);
                });
            });
        };
    }
    
    public async queryCustomerDetail(request: ServiceRequest): Promise<AccountDetailResponse> {
        const methodName = 'queryCustomerDetail';
        console.log(`Sending gRPC request [${methodName}]`, { 
            request_id: request.request_id, 
            user_id: request.user_id 
        });

        try {
            const queryFn = this.promisifyCall<ServiceRequest, ServiceResponse>(methodName);
            const response = await queryFn(request);

            if (response.code !== '0') {
                console.warn('gRPC call returned non-zero code:', response);
                throw new Error(response.message || "Operation failed in core banking service.");
            }
            
            const dataValue = (response.data as any)?.value;
            if (!dataValue) {
                throw new Error("Response success but data field is missing from the payload.");
            }
            
            const buffer = Buffer.isBuffer(dataValue) ? dataValue : Buffer.from(dataValue.data || dataValue);
            const decoded = this.AccountDetailResponse.decode(buffer);

            const object = this.AccountDetailResponse.toObject(decoded, {
                longs: String,
                enums: String,
                defaults: true,
                arrays: true,
                objects: true,
            });
            return object;

        } catch (err) {
            console.error(`Critical failure in ${methodName}:`, err);
            throw err; 
        }
    }
}

export const GrpcClient = new GrpcClientSingleton();
