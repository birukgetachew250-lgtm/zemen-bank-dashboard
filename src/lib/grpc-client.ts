
'use client';

import {
  AccountDetailRequest,
  AccountDetailResponse,
} from './grpc/generated/accountdetail';
import * as accountDetailService from './grpc/generated/AccountdetailServiceClientPb';
import { ServiceRequest, ServiceResponse } from './grpc/generated/common';
import config from '@/lib/config';
import { Any } from './grpc/generated/google/protobuf/any';

const GRPC_TIMEOUT_MS = 5000;
const grpcUrl = (config.grpc.url.startsWith('http') ? '' : 'http://') + config.grpc.url.replace(/^(https?:\/\/)/, '');

class GrpcClientSingleton {
  public client: accountDetailService.AccountDetailServiceClient;

  constructor() {
    this.client = new accountDetailService.AccountDetailServiceClient(grpcUrl);
    console.log(`[gRPC Client] Initialized client for AccountDetailService at target URL: ${grpcUrl}`);
  }

  private promisifyCall<TRequest, TResponse>(
    method: (request: TRequest, metadata: any, callback: (err: any, res: TResponse) => void) => void,
    request: TRequest
  ): Promise<TResponse> {
    return new Promise((resolve, reject) => {
      const deadline = new Date(Date.now() + GRPC_TIMEOUT_MS).getTime().toString();
      method.call(this.client, request, { deadline }, (err: any, res: TResponse) => {
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
      const response = await this.promisifyCall<ServiceRequest, ServiceResponse>(
        this.client.queryCustomerDetail,
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
      
      const value = data.value;
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
