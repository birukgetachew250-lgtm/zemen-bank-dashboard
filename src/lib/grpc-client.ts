'use server';

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import * as protobuf from 'protobufjs';

const GRPC_SERVER_ADDRESS = process.env.FLEX_GRPC_URL || 'localhost:8081';
const PROTO_DIR = path.join(process.cwd(), 'src/lib/grpc/protos');

const getClient = (protoFileName: string, servicePath: string) => {
    const PROTO_PATH = path.join(PROTO_DIR, protoFileName);
    
    try {
        const packageDef = protoLoader.loadSync(PROTO_PATH, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
            includeDirs: [PROTO_DIR]
        });
        
        const grpcObj = grpc.loadPackageDefinition(packageDef) as any;
        
        const serviceConstructor = servicePath.split('.').reduce((obj, part) => obj?.[part], grpcObj);

        if (!serviceConstructor) {
            throw new Error(`Service ${servicePath} not found in ${protoFileName}`);
        }
        
        return new serviceConstructor(
            GRPC_SERVER_ADDRESS,
            grpc.credentials.createInsecure()
        );
    } catch (error) {
        console.error(`[gRPC Client Init Failed for ${servicePath}]`, error);
        throw new Error(`Failed to load gRPC client for ${servicePath}.`);
    }
};

const accountDetailServiceClient = getClient('accountdetail.proto', 'accountdetail.AccountDetailService');
const accountListServiceClient = getClient('accountlist.proto', 'accountlist.AccountListService');


function promisifyCall<TRequest, TResponse>(client: any, methodName: string, request: TRequest): Promise<TResponse> {
  return new Promise((resolve, reject) => {
    const deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 60);

    client[methodName](request, { deadline }, (err: any, res: TResponse) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}

const protoTypeCache = new Map<string, protobuf.Type>();

async function loadProtobufType(protoFileName: string, typeName: string) {
    const cacheKey = `${protoFileName}:${typeName}`;
    if (protoTypeCache.has(cacheKey)) {
        return protoTypeCache.get(cacheKey)!;
    }

    const protoPath = path.join(PROTO_DIR, protoFileName);
    const root = await protobuf.load(protoPath);
    const type = root.lookupType(typeName);
    if (!type) {
      throw new Error(`${typeName} type not found in protobufjs for ${protoFileName}`);
    }
    protoTypeCache.set(cacheKey, type);
    return type;
}

export const GrpcClient = {
    accountDetailServiceClient,
    accountListServiceClient,
    promisifyCall,
    loadProtobufType,
};
