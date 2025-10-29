import dayjs from 'dayjs';
import { NextFunction, Request, Response } from 'express';
import { EErrorCode, EResponseStatus } from '../enums';
import { logger } from '../libs';
import {
  TMiddlewareHandler,
  TRequest,
  TRequestBase,
  TResponse,
  TResponseValidation,
  TRouteHandlerOptions,
  TRouterHandler,
} from '../types';
import { toPromise } from './promise';

interface IAppResponse {
  get resJson(): TResponse;
}

class AppResponse {
  private s: EResponseStatus | number;

  constructor(status: EResponseStatus | number) {
    this.s = status;
  }

  public get status() {
    return this.s;
  }
}

export class Success extends AppResponse implements IAppResponse {
  private data?: unknown;

  constructor(status: EResponseStatus | number, data?: unknown) {
    super(status);

    this.data = data;
  }

  public get resJson(): TResponse {
    return {
      success: true,
      data: this.data,
    };
  }
}

export class Exception extends AppResponse implements IAppResponse {
  private error: EErrorCode | unknown;

  constructor(status: EResponseStatus | number, error: EErrorCode | TResponseValidation[] | Error) {
    super(status);

    this.error = error;
  }

  public get resJson(): TResponse {
    let error = this.error;
    let message = null;

    if (error instanceof Error) {
      message = error.message;
      logger.error(error.message);
      error = EErrorCode.UNKNOWN;
    }

    return {
      success: false,
      error: error,
      msg: message,
    };
  }

  public toString(): string {
    return JSON.stringify(this.resJson);
  }
}

export const responseHandler = (res: Response, response: Exception | Success) => {
  return res.status(response.status).json(response.resJson);
};

const defaultRouteHandlerOption: TRouteHandlerOptions = {
  successCode: EResponseStatus.Ok,
  requireApiKey: false,
  requireAppSignature: false,
  controller: null,
};

export const routeHandler =
  <RQ extends TRequestBase = TRequestBase, RS extends Response = Response, T = unknown>(
    handler: TRouterHandler<RQ, RS, T>,
    options: Partial<TRouteHandlerOptions> = {}
  ) =>
  async (req: TRequest, res: Response, next: NextFunction) => {
    const combineOptions = {
      ...defaultRouteHandlerOption,
      ...options,
    };

    if (combineOptions.requireApiKey && !req.apiKey) {
      throw new Exception(EResponseStatus.Unauthorized, EErrorCode.APIKEY_UNAUTHORIZATION);
    }

    if (combineOptions.requireAppSignature && !req.appSign) {
      throw new Exception(EResponseStatus.Unauthorized, EErrorCode.APP_UNAUTHORIZATION);
    }

    const data = await toPromise(handler, req as any, res as any, next);

    (req as any as TRequestBase).controller = options.controller;
    (res as any).successCode = combineOptions.successCode;
    (res as any).data = data;

    return next();
  };

export const middlewareHandler =
  <RQ extends TRequestBase = TRequestBase, RS extends Response = Response>(
    middleware: TMiddlewareHandler<RQ, RS>
  ): TMiddlewareHandler<TRequest, Response> =>
  async (req: TRequest, res: Response, next: NextFunction) => {
    await toPromise(middleware, req as any, res as any, next);
  };

export const getAnalysticStartData = (req: Request) => {
  const appReq = req as any as TRequestBase;
  let duration: number | null = null;

  if (appReq.reqStart) {
    duration = dayjs().diff(dayjs(appReq.reqStart));
  }

  return {
    method: req.method,
    path: req.path,
    latency: {
      receive: appReq.reqStart ? dayjs(appReq.reqStart).toISOString() : null,
      end: dayjs().toISOString(),
      duration,
    },
    payload: {
      body: req.body,
      params: req.params,
      query: req.query,
    },
  };
};

export const getAnalysticEndData = <T extends Success | Exception>(req: Request, data: T) => {
  const appReq = req as any as TRequestBase;
  let duration: number | null = null;

  if (appReq.reqStart) {
    duration = dayjs(appReq.reqStart).diff(dayjs());
  }

  return {
    status: data.status,
    method: req.method,
    path: req.path,
    auth: {
      appSignature: appReq.appSign ?? null,
      apikey: appReq.apiKey ?? null,
    },
    payload: {
      request: { body: req.body, params: req.params, query: req.query },
      validated: {
        body: appReq.body,
        params: appReq.params,
        query: appReq.query,
      },
    },
    handler: {
      controller: appReq.controller || null,
    },
    middlewares: {
      apiKeyType: appReq.apiKeyType,
      dtos: appReq.dtos || [],
    },
    latency: {
      receive: appReq.reqStart ? dayjs(appReq.reqStart).toISOString() : null,
      end: dayjs().toISOString(),
      duration,
    },
    response: data.resJson,
  };
};
