import { ValidationError } from 'class-validator';
import { Request } from 'express';
import { EApiKeyType } from '../enums';

export type TJwtApiKeyPayload = {
  appCode: string;
  type: EApiKeyType;
  key: string;
  appId: string;
};

export type TRequest = Request & {
  appSign?: TRequestAppSign;
  apiKey?: TRequestApiKey;
};

export type TRequestWithApiKey = Request & { apiKey: TRequestApiKey };

export type TRequestWithtAppSignature = Request & { appSign: TRequestAppSign };

export type TRequestAuth = TRequestWithApiKey & TRequestWithtAppSignature;

export type TRequestAppSign = {
  code: string;
  namespace: string;
};

export type TRequestApiKey = {
  type: EApiKeyType;
  appId: string;
  key: string;
};

export type TResponse = {
  success: boolean;
  data?: unknown;
  error?: unknown;
};

export type TResponseValidation = {
  property: string;
  constraints:
    | {
        [type: string]: string;
      }
    | undefined;
  children: ValidationError[] | undefined;
};

export type TPagination = {
  // default page = 1
  page: number;

  // default size = 10
  size: number;
};

export type TSort = {
  // default soart = "", field:<1, -1>|field:<1, -1>
  sort: string;
};
