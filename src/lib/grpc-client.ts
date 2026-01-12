
'use client';

import {
  AccountDetailRequest,
  AccountDetailResponse,
} from './grpc/generated/accountdetail_pb';
import { AccountDetailServiceClient } from './grpc/generated/AccountdetailServiceClientPb';
import { ServiceRequest, ServiceResponse } from './grpc/generated/service_pb';
import config from '@/lib/config';
import { Any } from 'google-protobuf/google/protobuf/any_pb';
import * as grpcWeb from 'grpc-web';

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

      // The actual method on the generated client class
      const method = this.client[methodName];

      if (typeof method !== 'function') {
        return reject(new TypeError(`this.client.${methodName} is not a function`));
      }

      // Correctly call the method with its context (`this.client`)
      method.call(this.client, request, { deadline: deadline.getTime().toString() }, (err: grpcWeb.RpcError, res: TResponse) => {
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
      
      // The `unpack` method is the correct way to deserialize from an `Any` type.
      return data.unpack(AccountDetailResponse.deserializeBinary, 'accountdetail.AccountDetailResponse');

    } catch (err) {
      console.error(`Critical failure in queryCustomerDetail:`, err);
      throw err;
    }
  }
}

export const GrpcClient = new GrpcClientSingleton();
