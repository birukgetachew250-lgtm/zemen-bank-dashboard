
'use server';

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import type { ProtoGrpcType } from './grpc/generated/service';
import type { AccountDetailServiceClient } from './grpc/generated/accountdetail';
import path from 'path';
import config from '@/lib/config';

const PROTO_PATH = path.join(process.cwd(), 'src/lib/grpc/protos/service.proto');

class GrpcClientSingleton {
    private static instance: GrpcClientSingleton;
    public client: AccountDetailServiceClient | null = null;
    public proto: ProtoGrpcType | null = null;

    private constructor() {
        if (!config.grpc.url) {
            console.error("[gRPC Client] FLEX_GRPC_URL is not defined in your .env file.");
            throw new Error("FLEX_GRPC_URL is not defined in the environment variables.");
        }

        const grpcUrl = config.grpc.url.replace(/^(https?:\/\/)/, '');
        console.log(`[gRPC Client] Initializing gRPC client for AccountDetailService at target URL: ${grpcUrl}`);

        try {
            const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            });

            this.proto = (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType;

            if (!this.proto.accountdetail || !this.proto.accountdetail.AccountDetailService) {
                console.error("[gRPC Client] Failed to load 'accountdetail.AccountDetailService' from proto definition.");
                throw new Error("Service definition not found in loaded proto.");
            }
            
            this.client = new this.proto.accountdetail.AccountDetailService(grpcUrl, grpc.credentials.createInsecure());
            console.log("[gRPC Client] gRPC client created successfully.");

        } catch (error) {
            console.error("[gRPC Client] Failed to initialize gRPC client:", error);
            throw error; 
        }
    }

    public static getInstance(): GrpcClientSingleton {
        if (!GrpcClientSingleton.instance) {
            GrpcClientSingleton.instance = new GrpcClientSingleton();
        }
        return GrpcClientSingleton.instance;
    }
}

// Export the singleton instance
export const GrpcClient = GrpcClientSingleton.getInstance();
