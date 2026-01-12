
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import config from '@/lib/config';
import type { ProtoGrpcType as AccountDetailProtoGrpcType } from './grpc/generated/accountdetail';
import type { ServiceRequest, ServiceResponse } from './grpc/generated/common';
import type { AccountDetailRequest, AccountDetailResponse } from './grpc/generated/accountdetail';
import { Buffer } from 'buffer';

const PROTO_FILE = 'accountdetail.proto';
const PROTO_DIR = path.join(process.cwd(), 'src', 'lib', 'grpc', 'protos');
const GRPC_TIMEOUT_MS = 5000;

class GrpcClientSingleton {
    public client: AccountDetailProtoGrpcType['accountdetail']['AccountDetailServiceClient'];
    private AccountDetailResponse: any;
    private isInitialized = false;
    private initPromise: Promise<void> | null = null;


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
        } catch (error) {
            console.error("[gRPC Client] Failed to initialize:", error);
            throw new Error("Could not initialize gRPC client.");
        }
    }
    
    private promisifyCall<TRequest, TResponse>(methodName: string): (request: TRequest) => Promise<TResponse> {
        return (request: TRequest): Promise<TResponse> => {
            return new Promise((resolve, reject) => {
                const deadline = Date.now() + GRPC_TIMEOUT_MS;
                const method = this.client[methodName as keyof typeof this.client] as unknown as (req: TRequest, opts: { deadline: number }, cb: (err: any, res: TResponse) => void) => void;
                
                if (typeof method !== 'function') {
                    return reject(new TypeError(`this.client[${methodName}] is not a function`));
                }

                method.call(this.client, request, { deadline }, (err: any, res: TResponse) => {
                    if (err) return reject(err);
                    resolve(res);
                });
            });
        };
    }

    public async queryCustomerDetail(request: ServiceRequest): Promise<AccountDetailResponse> {
        console.log('Sending gRPC request [queryCustomerDetail]', { 
            request_id: request.request_id, 
            user_id: request.user_id 
        });

        try {
            const queryCustomerDetail = this.promisifyCall<ServiceRequest, ServiceResponse>('queryCustomerDetail');
            const response = await queryCustomerDetail(request);

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
            console.error('Critical failure in queryCustomerDetail:', err);
            throw err; 
        }
    }
}

export const GrpcClient = new GrpcClientSingleton();
