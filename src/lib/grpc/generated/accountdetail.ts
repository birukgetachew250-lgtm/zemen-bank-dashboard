
/* eslint-disable */
import type { GrpcTransport } from "@protobuf-ts/grpc-transport";
import type { MethodInfo } from "@protobuf-ts/runtime-rpc";
import { stackIntercept } from "@protobuf-ts/runtime-rpc";
import type { ServiceInfo } from "@protobuf-ts/runtime-rpc";
import { ServiceRequest } from "./service";
import { ServiceResponse } from "./service";
import type { UnaryCall } from "@protobuf-ts/runtime-rpc";
import type { RpcOptions } from "@protobuf-ts/runtime-rpc";
import { Any, Any$type } from "./google/protobuf/any";
import { MessageType } from "@protobuf-ts/runtime";


/**
 * AccountDetailRequest is the request message for the QueryCustomerDetail RPC.
 *
 * @generated from protobuf message accountdetail.AccountDetailRequest
 */
export interface AccountDetailRequest {
    /**
     * @generated from protobuf field: string branch_code = 1;
     */
    branch_code: string;
    /**
     * @generated from protobuf field: string customer_id = 2;
     */
    customer_id: string;
}

/**
 * AccountDetailResponse is the response message for the QueryCustomerDetail RPC.
 * It includes all the details for a given customer.
 *
 * @generated from protobuf message accountdetail.AccountDetailResponse
 */
export interface AccountDetailResponse {
    /**
     * @generated from protobuf field: string full_name = 1;
     */
    full_name: string;
    /**
     * @generated from protobuf field: string cif_creation_date = 2;
     */
    cif_creation_date: string;
    /**
     * @generated from protobuf field: string customer_number = 3;
     */
    customer_number: string;
    /**
     * @generated from protobuf field: string date_of_birth = 4;
     */
    date_of_birth: string;
    /**
     * @generated from protobuf field: string gender = 5;
     */
    gender: string;
    /**
     * @generated from protobuf field: string email_id = 6;
     */
    email_id: string;
    /**
     * @generated from protobuf field: string mobile_number = 7;
     */
    mobile_number: string;
    /**
     * @generated from protobuf field: string address_line_1 = 8;
     */
    address_line_1: string;
    /**
     * @generated from protobuf field: string address_line_2 = 9;
     */
    address_line_2: string;
    /**
     * @generated from protobuf field: string address_line_3 = 10;
     */
    address_line_3: string;
    /**
     * @generated from protobuf field: string address_line_4 = 11;
     */
    address_line_4: string;
    /**
     * @generated from protobuf field: string country = 12;
     */
    country: string;
    /**
     * @generated from protobuf field: string branch = 13;
     */
    branch: string;
}

// @generated message type with reflection information for "accountdetail.AccountDetailRequest"
export const AccountDetailRequest$type = new MessageType<AccountDetailRequest>("accountdetail.AccountDetailRequest", [
    { no: 1, name: "branch_code", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
    { no: 2, name: "customer_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
]);

// @generated message type with reflection information for "accountdetail.AccountDetailResponse"
export const AccountDetailResponse$type = new MessageType<AccountDetailResponse>("accountdetail.AccountDetailResponse", [
    { no: 1, name: "full_name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
    { no: 2, name: "cif_creation_date", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
    { no: 3, name: "customer_number", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
    { no: 4, name: "date_of_birth", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
    { no: 5, name: "gender", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
    { no: 6, name: "email_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
    { no: 7, name: "mobile_number", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
    { no: 8, name: "address_line_1", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
    { no: 9, name: "address_line_2", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
    { no: 10, name: "address_line_3", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
    { no: 11, name: "address_line_4", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
    { no: 12, name: "country", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
    { no: 13, name: "branch", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
]);

/**
 * @generated ServiceType for protobuf service accountdetail.AccountDetailService
 */
export const AccountDetailService = new class implements ServiceInfo {
    typeName = "accountdetail.AccountDetailService";
    methods = {
        queryCustomerDetail: {
            name: "QueryCustomerDetail",
            I: ServiceRequest,
            O: ServiceResponse,
            options: {}
        }
    };
    options = {};
}();

/**
 * @generated ServiceClient for protobuf service accountdetail.AccountDetailService
 */
export interface IAccountDetailServiceClient {
    /**
     * @generated from protobuf rpc: QueryCustomerDetail(service.ServiceRequest) returns (service.ServiceResponse);
     */
    queryCustomerDetail(input: ServiceRequest, options?: RpcOptions): UnaryCall<ServiceRequest, ServiceResponse>;
}

/**
 * @generated ServiceClient for protobuf service accountdetail.AccountDetailService
 */
export class AccountDetailServiceClient implements IAccountDetailServiceClient {
    readonly typeName = AccountDetailService.typeName;
    readonly methods = AccountDetailService.methods;
    readonly options = AccountDetailService.options;
    private readonly _transport: any; // Keep transport as any for grpc-js compatibility

    constructor(transport: GrpcTransport) {
        this._transport = transport;
    }

    /**
     * @generated from protobuf rpc: QueryCustomerDetail(service.ServiceRequest) returns (service.ServiceResponse);
     */
    queryCustomerDetail(input: ServiceRequest, options?: RpcOptions, callback?: (err: any, response?: any) => void): UnaryCall<ServiceRequest, ServiceResponse> {
        const methodDescriptor = {
            path: `/accountdetail.AccountDetailService/QueryCustomerDetail`,
            requestStream: false,
            responseStream: false,
            requestSerialize: (value: ServiceRequest) => Buffer.from(ServiceRequest.toBinary(value)),
            responseDeserialize: (value: Buffer) => ServiceResponse.fromBinary(value),
        };

        // This is a direct hack to make it compatible with @grpc/grpc-js
        if (callback) {
            this._transport.makeUnaryRequest(
                methodDescriptor.path,
                methodDescriptor.requestSerialize,
                methodDescriptor.responseDeserialize,
                input,
                callback,
            );
        }

        // Return a mock UnaryCall object if no callback is provided, to satisfy the interface.
        // The actual call is handled by the callback-based path.
        const mockUnaryCall: UnaryCall<ServiceRequest, ServiceResponse> = {
            request: input,
            headers: Promise.resolve({}),
            response: new Promise<ServiceResponse>((res, rej) => {}),
            status: Promise.resolve({ code: 'OK', details: '' }),
            trailers: Promise.resolve({}),
        };
        return mockUnaryCall;
    }
}
