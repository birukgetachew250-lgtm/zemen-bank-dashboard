
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import config from './config';

let accountDetailServiceClient: grpc.Client | null = null;

const PROTO_PATH = path.resolve(process.cwd(), 'public', 'protos');

function loadGrpcClient() {
    if (accountDetailServiceClient) {
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
        const accountDetailPackage = (protoDescriptor as any).accountdetail;

        if (!accountDetailPackage || !accountDetailPackage.AccountDetailService) {
            console.error("[gRPC Client] Proto definition for 'accountdetail.AccountDetailService' not found after loading.");
            throw new Error("Could not load AccountDetailService from proto definition.");
        }
        
        console.log("[gRPC Client] Successfully loaded 'accountdetail.AccountDetailService' from proto.");
        
        accountDetailServiceClient = new accountDetailPackage.AccountDetailService(
            grpcUrl,
            grpc.credentials.createInsecure()
        );

        console.log("[gRPC Client] gRPC client created successfully.");

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
