
/* eslint-disable */
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import { WireType } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { Any } from "./google/protobuf/any";


/**
 * @generated from protobuf message service.ServiceRequest
 */
export interface ServiceRequest {
    /**
     * @generated from protobuf field: string request_id = 1;
     */
    request_id: string;
    /**
     * @generated from protobuf field: string source_system = 2;
     */
    source_system: string;
    /**
     * @generated from protobuf field: string channel = 3;
     */
    channel: string;
    /**
     * @generated from protobuf field: string user_id = 4;
     */
    user_id: string;
    /**
     * @generated from protobuf field: google.protobuf.Any data = 5;
     */
    data?: Any;
}
/**
 * @generated from protobuf message service.ServiceResponse
 */
export interface ServiceResponse {
    /**
     * @generated from protobuf field: string request_id = 1;
     */
    request_id: string;
    /**
     * @generated from protobuf field: string code = 2;
     */
    code: string;
    /**
     * @generated from protobuf field: string message = 3;
     */
    message: string;
    /**
     * @generated from protobuf field: google.protobuf.Any data = 4;
     */
    data?: Any;
}
// @generated message type with reflection information for "service.ServiceRequest"
const ServiceRequest$type = new MessageType<ServiceRequest>("service.ServiceRequest", [
    { no: 1, name: "request_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
    { no: 2, name: "source_system", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
    { no: 3, name: "channel", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
    { no: 4, name: "user_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
    { no: 5, name: "data", kind: "message", T: () => Any }
]);
// @generated message type with reflection information for "service.ServiceResponse"
const ServiceResponse$type = new MessageType<ServiceResponse>("service.ServiceResponse", [
    { no: 1, name: "request_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
    { no: 2, name: "code", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
    { no: 3, name: "message", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
    { no: 4, name: "data", kind: "message", T: () => Any }
]);

export { ServiceRequest$type as ServiceRequest, ServiceResponse$type as ServiceResponse };
