import * as jspb from 'google-protobuf'

import * as google_protobuf_any_pb from 'google-protobuf/google/protobuf/any_pb';

export class AccountDetailRequest extends jspb.Message {
  getBranchCode(): string;
  setBranchCode(value: string): AccountDetailRequest;

  getCustomerId(): string;
  setCustomerId(value: string): AccountDetailRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountDetailRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AccountDetailRequest): AccountDetailRequest.AsObject;
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
  setFullName(value: string): AccountDetailResponse;

  getCifCreationDate(): string;
  setCifCreationDate(value: string): AccountDetailResponse;

  getCustomerNumber(): string;
  setCustomerNumber(value: string): AccountDetailResponse;

  getDateOfBirth(): string;
  setDateOfBirth(value: string): AccountDetailResponse;

  getGender(): string;
  setGender(value: string): AccountDetailResponse;

  getEmailId(): string;
  setEmailId(value: string): AccountDetailResponse;

  getMobileNumber(): string;
  setMobileNumber(value: string): AccountDetailResponse;

  getAddressLine1(): string;
  setAddressLine1(value: string): AccountDetailResponse;

  getAddressLine2(): string;
  setAddressLine2(value: string): AccountDetailResponse;

  getAddressLine3(): string;
  setAddressLine3(value: string): AccountDetailResponse;

  getAddressLine4(): string;
  setAddressLine4(value: string): AccountDetailResponse;

  getCountry(): string;
  setCountry(value: string): AccountDetailResponse;

  getBranch(): string;
  setBranch(value: string): AccountDetailResponse;

  getAccountsList(): Array<Account>;
  setAccountsList(value: Array<Account>): AccountDetailResponse;
  clearAccountsList(): AccountDetailResponse;
  addAccounts(value?: Account, index?: number): Account;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountDetailResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AccountDetailResponse): AccountDetailResponse.AsObject;
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
    accountsList: Array<Account.AsObject>,
  }
}

export class Account extends jspb.Message {
  getCustacno(): string;
  setCustacno(value: string): Account;

  getBranchCode(): string;
  setBranchCode(value: string): Account;

  getCcy(): string;
  setCcy(value: string): Account;

  getAccountType(): string;
  setAccountType(value: string): Account;

  getAcclassdesc(): string;
  setAcclassdesc(value: string): Account;

  getStatus(): string;
  setStatus(value: string): Account;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Account.AsObject;
  static toObject(includeInstance: boolean, msg: Account): Account.AsObject;
  static serializeBinaryToWriter(message: Account, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Account;
  static deserializeBinaryFromReader(message: Account, reader: jspb.BinaryReader): Account;
}

export namespace Account {
  export type AsObject = {
    custacno: string,
    branchCode: string,
    ccy: string,
    accountType: string,
    acclassdesc: string,
    status: string,
  }
}
