/* eslint-disable */
import type { Call, Client, ClientDuplexStream, ClientReadableStream, ClientUnaryCall, ClientWritableStream, ServiceError, SurfaceDuplexStream, SurfaceReadableStream, SurfaceUnaryCall, SurfaceWritableStream } from "@grpc/grpc-js";
import type { ServiceRequest, ServiceResponse } from "./service";

export const protobufPackage = "accountdetail";

/**
 * The AccountDetailRequest message contains the branch_code and customer_id
 * for which account details are being requested.
 */
export interface AccountDetailRequest {
  branch_code: string;
  customer_id: string;
}

/**
 * The AccountDetailResponse message contains the detailed information of a
 * customer's account.
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

/** The AccountDetailService definition. */
export interface AccountDetailServiceClient extends Client {
  /** Sends a request for customer account details. */
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

/** The AccountDetailService definition. */
export interface AccountDetailServiceHandlers {
  /** Sends a request for customer account details. */
  queryCustomerDetail(
    call: SurfaceUnaryCall<ServiceRequest, ServiceResponse>,
    callback: (error?: ServiceError, result?: ServiceResponse) => void,
  ): void;
}
