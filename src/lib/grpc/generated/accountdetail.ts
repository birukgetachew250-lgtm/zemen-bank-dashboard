
/* eslint-disable */
import type * as grpc from "@grpc/grpc-js";
import type { ServiceDefinition, ServiceImplementation } from "@grpc/grpc-js";
import type { Any } from "./google/protobuf/any";
import type { ServiceRequest } from "./service";
import type { ServiceResponse } from "./service";

export const protobufPackage = "accountdetail";

/** AccountDetailRequest is the request message for the QueryCustomerDetail RPC. */
export interface AccountDetailRequest {
  branch_code: string;
  customer_id: string;
}

/**
 * AccountDetailResponse is the response message for the QueryCustomerDetail RPC.
 * It includes all the details for a given customer.
 */
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

export const ACCOUNTDETAIL_PACKAGE_NAME = "accountdetail";

/** @generated from protobuf service accountdetail.AccountDetailService */
export interface AccountDetailService {
  queryCustomerDetail(request: ServiceRequest, ...rest: any): Promise<ServiceResponse>;
}

/** @generated from protobuf service accountdetail.AccountDetailService */
export interface AccountDetailServiceClient {
  queryCustomerDetail(request: ServiceRequest, ...rest: any): void;
}
