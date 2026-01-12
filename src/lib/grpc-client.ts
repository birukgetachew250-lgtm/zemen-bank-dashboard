
'use client';

import {
  AccountDetailRequest,
  AccountDetailResponse,
} from './grpc/generated/accountdetail_pb';
import { AccountDetailServiceClient } from './grpc/generated/AccountdetailServiceClientPb';
import { ServiceRequest, ServiceResponse } from './grpc/generated/service_pb';
import config from '@/lib/config';
import { Any } from 'google-protobuf/google/protobuf/any_pb';

const GRPC_TIMEOUT_MS = 5000;
const grpcUrl = (config.grpc.url.startsWith('http') ? '' : 'http://') + config.grpc.url.replace(/^(https?:\/\/)/, '');

class GrpcClientSingleton {
  public client: AccountDetailServiceClient;

  constructor() {
    this.client = new AccountDetailServiceClient(grpcUrl);
    console.log(`[gRPC Client] Initialized client for AccountDetailService at target URL: ${grpcUrl}`);
  }

  private promisifyCall<TResponse>(
    methodName: 'queryCustomerDetail',
    request: ServiceRequest
  ): Promise<TResponse> {
    return new Promise((resolve, reject) => {
        const method = this.client[methodName];
        if (typeof method !== 'function') {
            return reject(new TypeError(`this.client.${methodName} is not a function`));
        }

        method.call(this.client, request, null, (err: any, res: TResponse) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
  }

  public async queryCustomerDetail(request: ServiceRequest): Promise<AccountDetailResponse.AsObject> {
    console.log(`Sending gRPC request [queryCustomerDetail]`, {
      request_id: request.getRequestId(),
      user_id: request.getUserId(),
    });
    
    try {
      const response = await this.promisifyCall<ServiceResponse>(
        'queryCustomerDetail',
        request
      );

      const responseObj = response.toObject();

      if (responseObj.code !== '0') {
        throw new Error(responseObj.message || 'Operation failed in core banking service.');
      }
      
      const data = responseObj.data;
      if (!data) {
        throw new Error('Response success but data field is missing from the payload.');
      }
      
      const value = data.value as Uint8Array; // Value is Uint8Array
      if (!(value instanceof Uint8Array)) {
         throw new Error('Expected data.value to be a Uint8Array.');
      }
      
      const decoded = AccountDetailResponse.deserializeBinary(value);
      return decoded.toObject();

    } catch (err) {
      console.error(`Critical failure in queryCustomerDetail:`, err);
      throw err;
    }
  }
}

export const GrpcClient = new GrpcClientSingleton();
    