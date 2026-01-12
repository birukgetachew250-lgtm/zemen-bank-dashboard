
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import config from '@/lib/config';
import type { ProtoGrpcType } from './grpc/generated/service';
import type { AccountDetailServiceClient } from './grpc/generated/accountdetail';

const PROTO_DIR = path.join(process.cwd(), 'src/lib/grpc/protos');
const PROTO_FILES = [
    'common.proto',
    'service.proto',
    'accountdetail.proto',
    'google/protobuf/any.proto'
];

class GrpcClientSingleton {
    private static instance: GrpcClientSingleton;
    public client: AccountDetailServiceClient | null = null;
    public proto: ProtoGrpcType | null = null;

    private constructor() {
        if (!config.grpc.url) {
            console.error("[gRPC Client] FLEX_GRPC_URL is not defined in your .env file.");
            // Don't throw here, allow it to fail gracefully if not used.
            return;
        }

        const grpcUrl = config.grpc.url.replace(/^(https?:\/\/)/, '');
        console.log(`[gRPC Client] Initializing gRPC client for AccountDetailService at target URL: ${grpcUrl}`);

        try {
            const packageDefinition = protoLoader.loadSync(PROTO_FILES, {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
                includeDirs: [PROTO_DIR]
            });

            this.proto = (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType;
            
            if (!this.proto.accountdetail || !this.proto.accountdetail.AccountDetailService) {
                console.error("[gRPC Client] Failed to load 'accountdetail.AccountDetailService' from proto definition. Available packages:", Object.keys(this.proto));
                throw new Error("Service definition 'accountdetail.AccountDetailService' not found in loaded proto.");
            }
            
            this.client = new this.proto.accountdetail.AccountDetailService(grpcUrl, grpc.credentials.createInsecure());
            console.log("[gRPC Client] gRPC client created successfully.");

        } catch (error) {
            console.error("[gRPC Client] Failed to initialize gRPC client:", error);
            // We don't throw here to allow the app to run in offline/demo mode,
            // but the client will be null.
            this.client = null;
            this.proto = null;
        }
    }

    public static getInstance(): GrpcClientSingleton {
        if (!GrpcClientSingleton.instance) {
            GrpcClientSingleton.instance = new GrpcClientSingleton();
        }
        return GrpcClientSingleton.instance;
    }
}

export const GrpcClient = GrpcClientSingleton.getInstance();
