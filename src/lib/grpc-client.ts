
'use server';

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import type { ProtoGrpcType } from './grpc/generated/service';
import type { AccountDetailServiceClient } from './grpc/generated/accountdetail';
import { AccountDetailRequest } from './grpc/generated/accountdetail';
import path from 'path';
import config from '@/lib/config';

let client: AccountDetailServiceClient | null = null;
let loadedProto: ProtoGrpcType | null = null;

const PROTO_PATH = path.join(process.cwd(), 'src/lib/grpc/protos/service.proto');

function loadGrpcClient(): void {
    if (client) {
        return;
    }
    
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

        const proto = (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType;
        loadedProto = proto;

        if (!proto.accountdetail || !proto.accountdetail.AccountDetailService) {
            console.error("[gRPC Client] Failed to load 'accountdetail.AccountDetailService' from proto definition.");
            throw new Error("Service definition not found in loaded proto.");
        }
        
        client = new proto.accountdetail.AccountDetailService(grpcUrl, grpc.credentials.createInsecure());
        console.log("[gRPC Client] gRPC client created successfully.");

    } catch (error) {
        console.error("[gRPC Client] Failed to initialize gRPC client:", error);
        throw error; 
    }
}

// Singleton accessor for the client
function getClient(): AccountDetailServiceClient {
    if (!client) {
        loadGrpcClient();
    }
    return client!;
}

// Singleton accessor for the package definition
function getPackage() {
    if (!loadedProto) {
        loadGrpcClient();
    }
    return loadedProto!.accountdetail;
}

// Export a single object with methods to interact with the client
export const GrpcClient = {
    getAccountDetailServiceClient: getClient,
    getAccountDetailPackage: getPackage,
};

