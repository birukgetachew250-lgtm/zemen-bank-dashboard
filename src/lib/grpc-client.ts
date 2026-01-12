
import * as grpc from '@grpc/grpc-js';
import { AccountDetailServiceClient } from './grpc/generated/accountdetail';
import config from './config';

let accountDetailServiceClient: AccountDetailServiceClient | null = null;

function loadGrpcClient() {
    if (accountDetailServiceClient) {
        return;
    }

    if (!config.grpc.url) {
        console.error("[gRPC Client] FLEX_GRPC_URL is not defined. Please set it in your .env file.");
        throw new Error("FLEX_GRPC_URL is not defined in the environment variables.");
    }
    
    const grpcUrl = config.grpc.url.replace(/^(https?:\/\/)/, '');
    console.log(`[gRPC Client] Initializing gRPC client for AccountDetailService at target URL: ${grpcUrl}`);

    try {
        accountDetailServiceClient = new AccountDetailServiceClient(
            grpcUrl,
            grpc.credentials.createInsecure()
        );
        console.log("[gRPC Client] gRPC client created successfully.");
        
    } catch (error) {
        console.error("[gRPC Client] Failed to initialize gRPC client:", error);
        throw error;
    }
}

export function getAccountDetailServiceClient(): AccountDetailServiceClient {
    if (!accountDetailServiceClient) {
        loadGrpcClient();
    }
    return accountDetailServiceClient!;
}
