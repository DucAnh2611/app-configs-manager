import { ValidationError } from 'class-validator';
import { NextFunction, Request, Response, Router } from 'express';
import { EApiKeyType, EResponseStatus } from '../enums';

export type TJwtApiKeyPayload = {
  appCode: string;
  type: EApiKeyType;
  key: string;
  appId: string;
};

export type TRequestValidatedDto<
  B extends Object = any,
  Q extends Object = any,
  P extends Object = any,
> = Request & {
  vBody: B;
  vQuery: Q;
  vParam: P;
};

export type TRequest = Request & {
  appSign?: TRequestAppSign;
  apiKey?: TRequestApiKey;
};

export type TRequestWithApiKey<
  B extends Object = any,
  Q extends Object = any,
  P extends Object = any,
> = TRequestValidatedDto<B, Q, P> & {
  apiKey: TRequestApiKey;
};

export type TRequestWithtAppSignature<
  B extends Object = any,
  Q extends Object = any,
  P extends Object = any,
> = TRequestValidatedDto<B, Q, P> & { appSign: TRequestAppSign };

export type TRequestAuth<
  B extends Object = any,
  Q extends Object = any,
  P extends Object = any,
> = TRequestWithApiKey<B, Q, P> & TRequestWithtAppSignature<B, Q, P>;

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

export type TRouteHandlerOptions = {
  requireApiKey: boolean;
  requireAppSignature: boolean;
  successCode: EResponseStatus | number;
};

export type TRequestBase<
  B extends Object = any,
  Q extends Object = any,
  P extends Object = any,
> = TRequestValidatedDto<B, Q, P> & Pick<TRequestAuth<B, Q, P>, 'appSign' | 'apiKey'>;

export type TRouterHandler<
  RQ extends TRequestBase = TRequestBase,
  RS extends Response = Response,
  T = unknown,
> = (req: RQ, res: RS, next: NextFunction) => Promise<T>;

export type TMiddlewareHandler<RQ extends Request = Request, RS extends Response = Response> = (
  req: RQ,
  res: RS,
  next: NextFunction
) => Promise<void>;

export type TRoutes<
  RQ extends TRequestBase = TRequestBase,
  RS extends Response = Response,
  T = unknown,
> = {
  path: string;
  method: keyof Pick<
    Router,
    'post' | 'put' | 'patch' | 'get' | 'delete' | 'head' | 'options' | 'all'
  >;
  middlewares: Array<TMiddlewareHandler>;
  handler: TRouterHandler<RQ, RS, T>;
  handlerOptions?: Partial<TRouteHandlerOptions>;
};
