
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import config from '@/lib/config';
import type { ProtoGrpcType as AccountDetailProtoGrpcType } from './grpc/generated/accountdetail';
import { Root } from 'protobufjs';

const PROTO_FILES = ['common.proto', 'accountdetail.proto'];
const PROTO_DIR = path.join(process.cwd(), 'src', 'lib', 'grpc', 'protos');

type ProtoGrpcType = AccountDetailProtoGrpcType;

class GrpcClientSingleton {
  private static instance: GrpcClientSingleton;
  public client: AccountDetailProtoGrpcType['accountdetail']['AccountDetailServiceClient'] | null = null;
  public proto: Root | null = null;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): GrpcClientSingleton {
    if (!GrpcClientSingleton.instance) {
      GrpcClientSingleton.instance = new GrpcClientSingleton();
    }
    return GrpcClientSingleton.instance;
  }

  public async initialize(): Promise<void> {
    if (this.client && this.proto) {
      return;
    }
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    this.initializationPromise = this._initialize();
    return this.initializationPromise;
  }

  private async _initialize(): Promise<void> {
    if (!config.grpc.url) {
      console.error("[gRPC Client] FLEX_GRPC_URL is not defined in your .env file.");
      throw new Error("gRPC URL is not configured.");
    }

    const grpcUrl = config.grpc.url.replace(/^(https?:\/\/)/, '');
    console.log(`[gRPC Client] Initializing gRPC client for AccountDetailService at target URL: ${grpcUrl}`);

    try {
      const packageDefinition = await protoLoader.load(PROTO_FILES, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: [PROTO_DIR],
      });

      const grpcObject = (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType;

      const protoRoot = new Root();
      await protoRoot.load(PROTO_FILES.map(f => path.join(PROTO_DIR, f)), { keepCase: true });
      this.proto = protoRoot;
      
      if (!grpcObject.accountdetail || !grpcObject.accountdetail.AccountDetailService) {
        console.error("[gRPC Client] Failed to load 'accountdetail.AccountDetailService' from proto definition.");
        throw new Error("Service definition not found in loaded proto.");
      }

      this.client = new grpcObject.accountdetail.AccountDetailService(grpcUrl, grpc.credentials.createInsecure());
      console.log("[gRPC Client] gRPC client created successfully.");
    } catch (error) {
      console.error("[gRPC Client] Failed to initialize gRPC client:", error);
      this.client = null;
      this.proto = null;
      this.initializationPromise = null;
      throw error;
    }
  }
}

export const GrpcClient = GrpcClientSingleton.getInstance();
