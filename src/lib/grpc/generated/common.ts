/* eslint-disable */
import type { Any } from "./google/protobuf/any";

export const protobufPackage = "common";

/** The service request message containing the request details. */
export interface ServiceRequest {
  request_id: string;
  source_system: string;
  channel: string;
  user_id: string;
  data: Any | undefined;
}

/** The service response message containing the response details. */
export interface ServiceResponse {
  request_id: string;
  response_id: string;
  code: string;
  message: string;
  data: Any | undefined;
}
