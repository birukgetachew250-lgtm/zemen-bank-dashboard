
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import config from '@/lib/config';
import type { ProtoGrpcType as AccountDetailProtoGrpcType } from './grpc/generated/accountdetail';
import type { ServiceRequest, ServiceResponse } from './grpc/generated/common';
import { Any } from './grpc/generated/google/protobuf/any';

const PROTO_FILE = 'accountdetail.proto';
const PROTO_DIR = path.join(process.cwd(), 'src', 'lib', 'grpc', 'protos');
const GRPC_TIMEOUT_MS = 5000; // 5 seconds

class GrpcClientSingleton {
    private client: AccountDetailProtoGrpcType['accountdetail']['AccountDetailServiceClient'];
    private AccountDetailResponse: any;

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

            const grpcUrl = config.grpc.url.replace(/^(https?:\/\/)/, '');
            this.client = new grpcObject.accountdetail.AccountDetailService(grpcUrl, grpc.credentials.createInsecure());
            this.AccountDetailResponse = grpcObject.accountdetail.AccountDetailResponse;
            
            console.log(`[gRPC Client] Initialized gRPC client for AccountDetailService at target URL: ${grpcUrl}`);

        } catch (error) {
            console.error("[gRPC Client] Failed to initialize:", error);
            throw new Error("Could not initialize gRPC client.");
        }
    }

    private promisifyCall<TRequest, TResponse>(methodName: string, request: TRequest): Promise<TResponse> {
        return new Promise((resolve, reject) => {
            const deadline = Date.now() + GRPC_TIMEOUT_MS;
            if (typeof (this.client as any)[methodName] !== 'function') {
                return reject(new Error(`Method ${methodName} does not exist on the gRPC client.`));
            }
            (this.client as any)[methodName](request, { deadline }, (err: ServiceError | null, res: TResponse) => {
                if (err) return reject(err);
                resolve(res);
            });
        });
    }

    public async queryCustomerDetail(request: ServiceRequest): Promise<any> {
        console.log('Sending gRPC request [queryCustomerDetail]', {
            request_id: request.request_id,
            user_id: request.user_id,
        });

        try {
            const response = await this.promisifyCall<ServiceRequest, ServiceResponse>('queryCustomerDetail', request);

            if (response.code !== '0') {
                console.warn('gRPC call returned non-zero code:', response);
                throw new Error(response.message || "Operation failed in core banking service.");
            }

            const dataValue = response.data?.value;
            if (!dataValue) {
                throw new Error("Response successful but data field is missing from the payload.");
            }

            const buffer = Buffer.isBuffer(dataValue) ? dataValue : Buffer.from(dataValue);
            const decoded = this.AccountDetailResponse.decode(buffer);
            const responseObject = this.AccountDetailResponse.toObject(decoded, {
                defaults: true,
                enums: String,
                longs: String,
                arrays: true,
            });

            console.log('Decoded AccountDetailResponse');
            return responseObject;
        } catch (err: any) {
            console.error('Critical failure in queryCustomerDetail:', err);
            // Re-throw genuine system/network errors
            throw err;
        }
    }
}

// Export a singleton instance
export const GrpcClient = new GrpcClientSingleton();
