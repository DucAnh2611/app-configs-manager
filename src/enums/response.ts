export enum EResponseStatus {
  Ok = 200,
  Created = 201,
  NoContent = 204,

  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  UnprocessableEntity = 422,

  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
}

export enum EErrorCode {
  // Validate header
  MISSING_HEADER_NAMESPACE,
  MISSING_HEADER_APP_CODE,
  MISSING_HEADER_AUTHORIZATION,

  // Validate request
  MISSING_REQUEST_APP_SIGNATURE,

  // Apikey
  APIKEY_UNAUTHORIZATION,
  APIKEY_PAYLOAD_EXTRACT_FAILED,
  APIKEY_PAYLOAD_INVALID,
  APIKEY_PAYLOAD_TYPE_DISMATCH,
  APIKEY_NOT_EXIST,

  // App
  APP_UNAUTHORIZATION,
  APP_NOT_EXIST,
  APP_EXISTED,

  // Config
  CONFIG_NOT_EXIST,
  CONFIG_EXISTED,

  PUBLIC_KEY_LENGTH_IS_NOT_CONFIGURATED,

  INTERNAL_SERVER = 9999,
  UNKNOWN = 10000,
}
