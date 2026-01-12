/* eslint-disable */
import type { Call, Client, ClientDuplexStream, ClientReadableStream, ClientUnaryCall, ClientWritableStream, ServiceError, SurfaceDuplexStream, SurfaceReadableStream, SurfaceUnaryCall, SurfaceWritableStream } from "@grpc/grpc-js";
import type { ServiceRequest, ServiceResponse } from "./service";
import { Jsonkey, type ProtoGrpcType } from './service';

export const protobufPackage = "accountdetail";

export interface AccountDetailRequest {
  branch_code: string;
  customer_id: string;
}

export interface AccountDetailResponse {
  full_name: string;
  cif_creation_date: string;
  customer_number: string;
  date_of_birth: string;
  gender: string;
  email_id: string;
  mobile_number: string;
  address_line_1: string;
  address_line_2: string;
  address_line_3: string;
  address_line_4: string;
  country: string;
  branch: string;
}

export interface AccountDetailServiceClient extends Client {
  queryCustomerDetail(
    argument: ServiceRequest,
    callback: (error?: ServiceError, result?: ServiceResponse) => void,
  ): ClientUnaryCall;
  queryCustomerDetail(
    argument: ServiceRequest,
    metadata: any,
    callback: (error?: ServiceError, result?: ServiceResponse) => void,
  ): ClientUnaryCall;
  queryCustomerDetail(
    argument: ServiceRequest,
    metadata: any,
    options: any,
    callback: (error?: ServiceError, result?: ServiceResponse) => void,
  ): ClientUnaryCall;
}

export interface AccountDetailServiceHandlers {
  queryCustomerDetail(
    call: SurfaceUnaryCall<ServiceRequest, ServiceResponse>,
    callback: (error?: ServiceError, result?: ServiceResponse) => void,
  ): void;
}

export const ACCOUNTDETAIL_PACKAGE_NAME = "accountdetail";

const baseAccountDetailRequest: object = {
  branch_code: "",
  customer_id: "",
};

export const AccountDetailRequest: Jsonkey<AccountDetailRequest> = {
  fromJSON(object: any): AccountDetailRequest {
    const message = { ...baseAccountDetailRequest } as AccountDetailRequest;
    if (object.branch_code !== undefined && object.branch_code !== null) {
      message.branch_code = String(object.branch_code);
    }
    if (object.customer_id !== undefined && object.customer_id !== null) {
      message.customer_id = String(object.customer_id);
    }
    return message;
  },

  toJSON(message: AccountDetailRequest): unknown {
    const obj: any = {};
    message.branch_code !== undefined && (obj.branch_code = message.branch_code);
    message.customer_id !== undefined && (obj.customer_id = message.customer_id);
    return obj;
  },
};
