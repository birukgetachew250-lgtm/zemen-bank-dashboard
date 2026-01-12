
'use client';

import {
  AccountDetailRequest,
  AccountDetailResponse,
} from './grpc/generated/accountdetail';
import { AccountDetailServiceClient } from './grpc/generated/AccountdetailServiceClientPb';
import { ServiceRequest, ServiceResponse } from './grpc/generated/common';
import config from '@/lib/config';
import { Any } from './grpc/generated/google/protobuf/any';

// Define a timeout for gRPC calls
const GRPC_TIMEOUT_MS = 5000;

const grpcUrl = (config.grpc.url.startsWith('http') ? '' : 'http://') + config.grpc.url.replace(/^(https?:\/\/)/, '');

class GrpcClientSingleton {
  public client: AccountDetailServiceClient;

  constructor() {
    this.client = new AccountDetailServiceClient(grpcUrl);
    console.log(`[gRPC Client] Initialized client for AccountDetailService at target URL: ${grpcUrl}`);
  }

  private promisifyCall<TRequest, TResponse>(
    methodName: string,
    request: TRequest,
  ): Promise<TResponse> {
    return new Promise((resolve, reject) => {
        const method = this.client[methodName as keyof AccountDetailServiceClient];
        
        if (typeof method !== 'function') {
            return reject(new TypeError(`this.client.${methodName} is not a function`));
        }

        method.call(this.client, request, null, (err: any, res: TResponse) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
  }

  public async queryCustomerDetail(request: ServiceRequest): Promise<AccountDetailResponse> {
    const methodName = 'queryCustomerDetail';
    console.log(`Sending gRPC request [${methodName}]`, {
      request_id: request.request_id,
      user_id: request.user_id,
    });

    try {
        const response = await this.promisifyCall<ServiceRequest, ServiceResponse>(
            methodName, 
            request
        );

      const responsePlain = response.toObject();

      if (responsePlain.code !== '0') {
        console.warn('gRPC call returned non-zero code:', responsePlain);
        throw new Error(
          responsePlain.message || 'Operation failed in core banking service.',
        );
      }
      
      const data = responsePlain.data;
      if (!data) {
        throw new Error('Response success but data field is missing from the payload.');
      }
      
      // grpc-web's toObject already base64-encodes the value of Any.
      const value = (data as any).value;
      if (typeof value !== 'string') {
        throw new Error('Expected data.value to be a base64 string from grpc-web.');
      }
      
      const buffer = Buffer.from(value, 'base64');
      const decoded = AccountDetailResponse.deserializeBinary(buffer);
      
      return decoded.toObject();

    } catch (err) {
      console.error(`Critical failure in ${methodName}:`, err);
      throw err;
    }
  }
}

// Export a single instance of the client
export const GrpcClient = new GrpcClientSingleton();
