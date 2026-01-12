/* eslint-disable */
import type { Any } from "./google/protobuf/any";

export const protobufPackage = "service";

export interface ServiceRequest {
  request_id: string;
  source_system: string;
  channel: string;
  user_id: string;
  data: Any | undefined;
}

export interface ServiceResponse {
  request_id: string;
  response_id: string;
  code: string;
  message: string;
  data: Any | undefined;
}

export const SERVICE_PACKAGE_NAME = "service";
