
import * as jspb from "google-protobuf";

export class AccountDetailRequest extends jspb.Message {
  getBranchCode(): string;
  setBranchCode(value: string): void;

  getCustomerId(): string;
  setCustomerId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountDetailRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AccountDetailRequest): AccountDetailRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountDetailRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountDetailRequest;
  static deserializeBinaryFromReader(message: AccountDetailRequest, reader: jspb.BinaryReader): AccountDetailRequest;
}

export namespace AccountDetailRequest {
  export type AsObject = {
    branchCode: string,
    customerId: string,
  }
}

export class AccountDetailResponse extends jspb.Message {
  getFullName(): string;
  setFullName(value: string): void;

  getCifCreationDate(): string;
  setCifCreationDate(value: string): void;

  getCustomerNumber(): string;
  setCustomerNumber(value: string): void;

  getDateOfBirth(): string;
  setDateOfBirth(value: string): void;

  getGender(): string;
  setGender(value: string): void;

  getEmailId(): string;
  setEmailId(value: string): void;

  getMobileNumber(): string;
  setMobileNumber(value: string): void;

  getAddressLine1(): string;
  setAddressLine1(value: string): void;

  getAddressLine2(): string;
  setAddressLine2(value: string): void;

  getAddressLine3(): string;
  setAddressLine3(value: string): void;

  getAddressLine4(): string;
  setAddressLine4(value: string): void;

  getCountry(): string;
  setCountry(value: string): void;

  getBranch(): string;
  setBranch(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountDetailResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AccountDetailResponse): AccountDetailResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountDetailResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountDetailResponse;
  static deserializeBinaryFromReader(message: AccountDetailResponse, reader: jspb.BinaryReader): AccountDetailResponse;
}

export namespace AccountDetailResponse {
  export type AsObject = {
    fullName: string,
    cifCreationDate: string,
    customerNumber: string,
    dateOfBirth: string,
    gender: string,
    emailId: string,
    mobileNumber: string,
    addressLine1: string,
    addressLine2: string,
    addressLine3: string,
    addressLine4: string,
    country: string,
    branch: string,
  }
}
    