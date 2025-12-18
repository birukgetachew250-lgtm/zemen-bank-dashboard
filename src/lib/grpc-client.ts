
'server-only';

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import config from './config';

let accountDetailPackage: any = null;

const PROTO_PATH = path.resolve(process.cwd(), 'public', 'protos');

function loadGrpcClient() {
    if (accountDetailPackage) {
        return; 
    }

    if (!config.grpc.url) {
        console.error("[gRPC Client] GRPC_URL is not defined. Please set it in your .env file.");
        throw new Error("GRPC_URL is not defined in the environment variables.");
    }
    
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
                includeDirs: [PROTO_PATH] 
            }
        );

        const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
        const loadedPackage = (protoDescriptor as any).accountdetail;

        if (!loadedPackage || !loadedPackage.AccountDetailService) {
            console.error("[gRPC Client] Proto definition for 'accountdetail.AccountDetailService' not found after loading.");
            throw new Error("Could not load AccountDetailService from proto definition.");
        }
        
        console.log("[gRPC Client] Successfully loaded 'accountdetail' package from proto.");
        
        // The loadedPackage contains both the Service and the message types (e.g., AccountDetailRequest)
        accountDetailPackage = loadedPackage;
        
        // Create a client instance and attach it to our cached package object
        accountDetailPackage.client = new accountDetailPackage.AccountDetailService(
            grpcUrl,
            grpc.credentials.createInsecure()
        );

        console.log("[gRPC Client] gRPC client created successfully.");

    } catch (error) {
        console.error("[gRPC Client] Failed to initialize gRPC client:", error);
        throw error;
    }
}

// This function returns the service client
export function getAccountDetailServiceClient(): grpc.Client {
    if (!accountDetailPackage) {
        loadGrpcClient();
    }
    return accountDetailPackage.client;
}

// This function returns the message type class, which has the .encode method
export function getAccountDetailRequestType(): any {
     if (!accountDetailPackage) {
        loadGrpcClient();
    }
    // AccountDetailRequest is a property on the loaded package
    return accountDetailPackage.AccountDetailRequest;
}
