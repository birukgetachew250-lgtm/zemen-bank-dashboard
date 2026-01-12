
'use client';

import {
  AccountDetailRequest,
  AccountDetailResponse,
} from './grpc/generated/accountdetail';
import { AccountDetailServiceClient } from './grpc/generated/AccountdetailServiceClientPb';
import { ServiceRequest, ServiceResponse } from './grpc/generated/common';
import config from '@/lib/config';
import { Any } from './grpc/generated/google/protobuf/any';

const grpcUrl = (config.grpc.url.startsWith('http') ? '' : 'http://') + config.grpc.url.replace(/^(https?:\/\/)/, '');
console.log(`[gRPC Client] Initializing client for AccountDetailService at target URL: ${grpcUrl}`);

class GrpcClientSingleton {
  public client: AccountDetailServiceClient;

  constructor() {
    this.client = new AccountDetailServiceClient(grpcUrl);
  }

  private promisifyCall<TRequest, TResponse>(
    method: (
      request: TRequest,
      metadata: null | { [key: string]: string },
      callback: (err: any, response: TResponse) => void,
    ) => void,
  ): (request: TRequest) => Promise<TResponse> {
    return (request: TRequest): Promise<TResponse> => {
      return new Promise((resolve, reject) => {
        method.call(this.client, request, null, (err: any, res: TResponse) => {
          if (err) return reject(err);
          resolve(res);
        });
      });
    };
  }

  public async queryCustomerDetail(request: ServiceRequest): Promise<AccountDetailResponse> {
    const methodName = 'queryCustomerDetail';
    console.log(`Sending gRPC request [${methodName}]`, {
      request_id: request.request_id,
      user_id: request.user_id,
    });

    try {
      const queryFn = this.promisifyCall<ServiceRequest, ServiceResponse>(
        this.client.queryCustomerDetail,
      );
      const response = await queryFn(request);
      
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
      
      // grpc-web's toObject already decodes the any value for us.
      // The value will be a base64 string which we need to decode into a buffer,
      // and then decode that buffer using our protobuf message definition.
      const value = (data as any).value;
      const buffer = Buffer.from(value, 'base64');
      const decoded = AccountDetailResponse.deserializeBinary(buffer);
      
      return decoded.toObject();

    } catch (err) {
      console.error(`Critical failure in ${methodName}:`, err);
      throw err;
    }
  }
}

export const GrpcClient = new GrpcClientSingleton();
