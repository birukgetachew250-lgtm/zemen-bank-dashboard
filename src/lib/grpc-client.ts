
'use server';

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from './grpc/generated/service';
import { AccountDetailServiceClient } from './grpc/generated/accountdetail';
import path from 'path';
import config from '../config';

// Singleton instance of the client
let client: AccountDetailServiceClient | null = null;

const PROTO_PATH = path.join(process.cwd(), 'src/lib/grpc/protos/service.proto');

function loadGrpcClient(): AccountDetailServiceClient {
    if (client) {
        return client;
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

        if (!proto.accountdetail || !proto.accountdetail.AccountDetailService) {
            console.error("[gRPC Client] Failed to load 'accountdetail.AccountDetailService' from proto definition.");
            throw new Error("Service definition not found in loaded proto.");
        }
        
        // Create a new client instance
        client = new proto.accountdetail.AccountDetailService(grpcUrl, grpc.credentials.createInsecure());
        console.log("[gRPC Client] gRPC client created successfully.");

    } catch (error) {
        console.error("[gRPC Client] Failed to initialize gRPC client:", error);
        throw error; // Re-throw the error to be handled by the caller
    }

    return client;
}

export function getAccountDetailServiceClient(): AccountDetailServiceClient {
    if (!client) {
       client = loadGrpcClient();
    }
    return client;
}

// This function is useful for scenarios where you might need to re-establish a connection,
// for example, in long-running services or to recover from connection errors.
export function resetGrpcClient(): void {
    if (client) {
        client.close();
        client = null;
    }
    console.log("[gRPC Client] Client reset.");
}
