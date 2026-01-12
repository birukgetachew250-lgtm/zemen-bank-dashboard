
'use server';

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import config from './config';

// This will cache the loaded package definition and its components
let accountDetailPackage: any = null;
let accountDetailServiceClient: grpc.Client | null = null;
let accountDetailRequestType: any = null;

const PROTO_PATH = path.resolve(process.cwd(), 'public', 'protos');

function loadGrpcClient() {
    // If already loaded, do nothing
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

        if (!loadedPackage || !loadedPackage.AccountDetailService || !loadedPackage.AccountDetailRequest) {
            console.error("[gRPC Client] Proto definition for 'AccountDetailService' or 'AccountDetailRequest' not found after loading.");
            throw new Error("Could not load required components from proto definition.");
        }
        
        console.log("[gRPC Client] Successfully loaded 'accountdetail' package from proto.");
        
        // Cache the entire loaded package and its specific components
        accountDetailPackage = loadedPackage;
        accountDetailRequestType = loadedPackage.AccountDetailRequest;
        accountDetailServiceClient = new loadedPackage.AccountDetailService(
            grpcUrl,
            grpc.credentials.createInsecure()
        );
        console.log("[gRPC Client] gRPC client and message types created successfully.");
        
    } catch (error) {
        console.error("[gRPC Client] Failed to initialize gRPC client:", error);
        throw error;
    }
}


export function getAccountDetailServiceClient(): grpc.Client {
    if (!accountDetailServiceClient) {
        loadGrpcClient();
    }
    return accountDetailServiceClient!;
}

export function getAccountDetailPackage(): any {
     if (!accountDetailPackage) {
        loadGrpcClient();
    }
    return accountDetailPackage;
}
