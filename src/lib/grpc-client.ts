
'server-only';

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import config from './config';

let accountDetailServiceClient: grpc.Client | null = null;

const PROTO_PATH = path.resolve(process.cwd(), 'public', 'protos');

export function getAccountDetailServiceClient() {
    if (accountDetailServiceClient) {
        return accountDetailServiceClient;
    }

    if (!config.grpc.url) {
        console.error("[gRPC Client] GRPC_URL is not defined. Please set it in your .env file.");
        throw new Error("GRPC_URL is not defined in the environment variables.");
    }
    
    // gRPC clients expect 'hostname:port', not 'http://hostname:port'.
    // This regex removes the protocol prefix.
    const grpcUrl = config.grpc.url.replace(/^(https?:\/\/)/, '');

    console.log(`[gRPC Client] Initializing gRPC client for AccountDetailService at target URL: ${grpcUrl}`);

    try {
        const packageDefinition = protoLoader.loadSync(
            path.join(PROTO_PATH, 'accountdetail.proto'),
            {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
                includeDirs: [PROTO_PATH] // Important for resolving imports
            }
        );

        const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
        
        // The package name is 'accountdetail' as defined in the proto file
        const accountDetailPackage = (protoDescriptor as any).accountdetail;

        if (!accountDetailPackage || !accountDetailPackage.AccountDetailService) {
            console.error("[gRPC Client] Proto definition for 'accountdetail.AccountDetailService' not found after loading.");
            throw new Error("Could not load AccountDetailService from proto definition.");
        }
        
        console.log("[gRPC Client] Successfully loaded 'accountdetail.AccountDetailService' from proto.");
        
        // Create the client
        accountDetailServiceClient = new accountDetailPackage.AccountDetailService(
            grpcUrl,
            grpc.credentials.createInsecure()
        );

        console.log("[gRPC Client] gRPC client created successfully.");
        return accountDetailServiceClient;

    } catch (error) {
        console.error("[gRPC Client] Failed to initialize gRPC client:", error);
        throw error; // Re-throw the error to be caught by the caller
    }
}
