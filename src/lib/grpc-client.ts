
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import config from '@/lib/config';
import type { ProtoGrpcType as AccountDetailProtoGrpcType } from './grpc/generated/accountdetail';
import type { ServiceRequest, ServiceResponse } from './grpc/generated/common';
import type { AccountDetailRequest, AccountDetailResponse } from './grpc/generated/accountdetail';

const PROTO_FILE = 'accountdetail.proto';
const PROTO_DIR = path.join(process.cwd(), 'src', 'lib', 'grpc', 'protos');

type GrpcProtoType = AccountDetailProtoGrpcType;
type AccountDetailServiceClient = GrpcProtoType['accountdetail']['AccountDetailServiceClient'];

class GrpcClientSingleton {
  private static instance: GrpcClientSingleton;
  private client: AccountDetailServiceClient | null = null;
  public AccountDetailResponse: GrpcProtoType['accountdetail']['AccountDetailResponse__Output'] | null = null;

  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): GrpcClientSingleton {
    if (!GrpcClientSingleton.instance) {
      GrpcClientSingleton.instance = new GrpcClientSingleton();
    }
    return GrpcClientSingleton.instance;
  }

  public initialize(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise = this._initialize();
    }
    return this.initializationPromise;
  }

  private async _initialize(): Promise<void> {
    if (this.client) {
      return;
    }

    if (!config.grpc.url) {
      console.error("[gRPC Client] FLEX_GRPC_URL is not defined in your .env file.");
      throw new Error("gRPC URL is not configured.");
    }

    const grpcUrl = config.grpc.url.replace(/^(https?:\/\/)/, '');
    console.log(`[gRPC Client] Initializing gRPC client for AccountDetailService at target URL: ${grpcUrl}`);

    try {
      const packageDefinition = await protoLoader.load(PROTO_FILE, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: [PROTO_DIR],
      });

      const grpcObject = (grpc.loadPackageDefinition(packageDefinition) as unknown) as GrpcProtoType;
      
      if (!grpcObject.accountdetail || !grpcObject.accountdetail.AccountDetailService) {
        console.error("[gRPC Client] Failed to load 'accountdetail.AccountDetailService' from proto definition.");
        throw new Error("Service definition not found in loaded proto.");
      }

      this.client = new grpcObject.accountdetail.AccountDetailService(grpcUrl, grpc.credentials.createInsecure());
      
      // Store the message type definition for decoding responses
      if (grpcObject.accountdetail.AccountDetailResponse) {
          this.AccountDetailResponse = grpcObject.accountdetail.AccountDetailResponse;
      }
      
      console.log("[gRPC Client] gRPC client created successfully.");
    } catch (error) {
      console.error("[gRPC Client] Failed to initialize gRPC client:", error);
      this.client = null;
      this.initializationPromise = null; 
      throw error;
    }
  }

  public getClient(): AccountDetailServiceClient {
    if (!this.client) {
        throw new Error("gRPC client is not initialized. Please call initialize() first.");
    }
    return this.client;
  }
  
  public promisifyCall<TResponse>(methodName: string, request: ServiceRequest): Promise<TResponse> {
    return new Promise((resolve, reject) => {
        const client = this.getClient();
        if (typeof (client as any)[methodName] !== 'function') {
            return reject(new Error(`Method ${methodName} does not exist on the gRPC client.`));
        }

        (client as any)[methodName](request, (error: ServiceError | null, response: TResponse) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        });
    });
  }
}

export const GrpcClient = GrpcClientSingleton.getInstance();
