
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
        throw new Error("GRPC_URL is not defined in the environment variables.");
    }
    console.log(`Initializing gRPC client for AccountDetailService at ${config.grpc.url}`);

    const packageDefinition = protoLoader.loadSync(
        path.join(PROTO_PATH, 'accountdetail.proto'),
        {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
            includeDirs: [PROTO_PATH] // Important for resolving imports like common.proto
        }
    );

    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    
    // The package name is 'accountdetail' as defined in the proto file
    const accountDetailPackage = (protoDescriptor as any).accountdetail;

    if (!accountDetailPackage || !accountDetailPackage.AccountDetailService) {
        throw new Error("Could not load AccountDetailService from proto definition.");
    }
    
    // Create the client
    accountDetailServiceClient = new accountDetailPackage.AccountDetailService(
        config.grpc.url,
        grpc.credentials.createInsecure()
    );

    return accountDetailServiceClient;
}
