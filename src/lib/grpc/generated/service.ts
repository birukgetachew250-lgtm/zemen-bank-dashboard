
import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { AccountDetailServiceClient as _accountdetail_AccountDetailServiceClient, AccountDetailServiceDefinition as _accountdetail_AccountDetailServiceDefinition } from './accountdetail/AccountDetailService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  accountdetail: {
    AccountDetailRequest: MessageTypeDefinition
    AccountDetailResponse: MessageTypeDefinition
    AccountDetailService: SubtypeConstructor<typeof grpc.Client, _accountdetail_AccountDetailServiceClient> & { service: _accountdetail_AccountDetailServiceDefinition }
  }
  google: {
    protobuf: {
      Any: MessageTypeDefinition
    }
  }
  service: {
    ServiceRequest: MessageTypeDefinition
    ServiceResponse: MessageTypeDefinition
  }
}
