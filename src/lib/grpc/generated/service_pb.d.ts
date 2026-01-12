
import * as jspb from "google-protobuf";
import * as google_protobuf_any_pb from "google-protobuf/google/protobuf/any_pb";

export class ServiceRequest extends jspb.Message {
  getRequestId(): string;
  setRequestId(value: string): void;

  getSourceSystem(): string;
  setSourceSystem(value: string): void;

  getChannel(): string;
  setChannel(value: string): void;

  getUserId(): string;
  setUserId(value: string): void;

  hasData(): boolean;
  clearData(): void;
  getData(): google_protobuf_any_pb.Any | undefined;
  setData(value?: google_protobuf_any_pb.Any): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServiceRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ServiceRequest): ServiceRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServiceRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServiceRequest;
  static deserializeBinaryFromReader(message: ServiceRequest, reader: jspb.BinaryReader): ServiceRequest;
}

export namespace ServiceRequest {
  export type AsObject = {
    requestId: string,
    sourceSystem: string,
    channel: string,
    userId: string,
    data?: google_protobuf_any_pb.Any.AsObject,
  }
}

export class ServiceResponse extends jspb.Message {
  getCode(): string;
  setCode(value: string): void;

  getMessage(): string;
  setMessage(value: string): void;

  hasData(): boolean;
  clearData(): void;
  getData(): google_protobuf_any_pb.Any | undefined;
  setData(value?: google_protobuf_any_pb.Any): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServiceResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ServiceResponse): ServiceResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServiceResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServiceResponse;
  static deserializeBinaryFromReader(message: ServiceResponse, reader: jspb.BinaryReader): ServiceResponse;
}

export namespace ServiceResponse {
  export type AsObject = {
    code: string,
    message: string,
    data?: google_protobuf_any_pb.Any.AsObject,
  }
}
