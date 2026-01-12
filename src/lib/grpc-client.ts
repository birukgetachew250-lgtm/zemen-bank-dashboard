import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import config from '@/lib/config';
import type { ProtoGrpcType as AccountDetailProtoGrpcType } from './grpc/generated/accountdetail';

const PROTO_FILE = 'accountdetail.proto';
const PROTO_DIR = path.join(process.cwd(), 'src', 'lib', 'grpc', 'protos');

type ProtoGrpcType = AccountDetailProtoGrpcType;

class GrpcClientSingleton {
  private static instance: GrpcClientSingleton;
  public client: AccountDetailProtoGrpcType['accountdetail']['AccountDetailService'] | null = null;
  public AccountDetailRequest: AccountDetailProtoGrpcType['accountdetail']['AccountDetailRequest'] | null = null;
  public AccountDetailResponse: AccountDetailProtoGrpcType['accountdetail']['AccountDetailResponse'] | null = null;
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

      const grpcObject = (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType;
      
      if (!grpcObject.accountdetail || !grpcObject.accountdetail.AccountDetailService) {
        console.error("[gRPC Client] Failed to load 'accountdetail.AccountDetailService' from proto definition.");
        throw new Error("Service definition not found in loaded proto.");
      }

      this.client = new grpcObject.accountdetail.AccountDetailService(grpcUrl, grpc.credentials.createInsecure());
      
      if (grpcObject.accountdetail.AccountDetailRequest) {
        this.AccountDetailRequest = grpcObject.accountdetail.AccountDetailRequest;
      }
      if (grpcObject.accountdetail.AccountDetailResponse) {
        this.AccountDetailResponse = grpcObject.accountdetail.AccountDetailResponse;
      }
      
      console.log("[gRPC Client] gRPC client created successfully.");
    } catch (error) {
      console.error("[gRPC Client] Failed to initialize gRPC client:", error);
      this.client = null; // Ensure client is null on failure
      this.initializationPromise = null; // Allow re-initialization
      throw error;
    }
  }

  public getClient(): AccountDetailProtoGrpcType['accountdetail']['AccountDetailServiceClient'] {
    if (!this.client) {
        throw new Error("gRPC client is not initialized. Please call initialize() first.");
    }
    return this.client;
  }
}

export const GrpcClient = GrpcClientSingleton.getInstance();
