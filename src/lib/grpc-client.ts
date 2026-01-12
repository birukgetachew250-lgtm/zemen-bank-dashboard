
'use client';

import {
  AccountDetailRequest,
  AccountDetailResponse,
  Account,
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
    this.client = new AccountDetailServiceClient(grpcUrl, null, null);
    console.log(`[gRPC Client] Initialized client for AccountDetailService at target URL: ${grpcUrl}`);
  }

  private promisifyCall<TRequest, TResponse>(
    methodName: 'queryCustomerDetail',
    request: TRequest
  ): Promise<TResponse> {
    return new Promise((resolve, reject) => {
      const deadline = new Date();
      deadline.setMilliseconds(deadline.getMilliseconds() + GRPC_TIMEOUT_MS);

      const method = this.client[methodName];

      if (typeof method !== 'function') {
        return reject(new TypeError(`this.client.${methodName} is not a function`));
      }

      method.call(this.client, request, { deadline: deadline.getTime().toString() }, (err: any, res: TResponse) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  public async queryCustomerDetail(request: ServiceRequest): Promise<AccountDetailResponse> {
    console.log(`Sending gRPC request [queryCustomerDetail]`, {
      request_id: request.getRequestId(),
      user_id: request.getUserId(),
    });

    try {
      const response = await this.promisifyCall<ServiceRequest, ServiceResponse>(
        'queryCustomerDetail',
        request
      );

      const responseObj = response.toObject();

      if (responseObj.code !== '0') {
        throw new Error(responseObj.message || 'Operation failed in core banking service.');
      }
      
      const data = response.getData();
      if (!data) {
        throw new Error('Response success but data field is missing from the payload.');
      }
      
      return AccountDetailResponse.deserializeBinary(data.getValue_asU8());

    } catch (err) {
      console.error(`Critical failure in queryCustomerDetail:`, err);
      throw err;
    }
  }
}

export const GrpcClient = new GrpcClientSingleton();
