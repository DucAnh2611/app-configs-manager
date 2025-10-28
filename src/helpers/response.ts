import { NextFunction, Request, RequestHandler, Response } from 'express';
import { EErrorCode, EResponseStatus } from '../enums';
import { logger } from '../libs';
import { TRequest, TResponse, TResponseValidation } from '../types';
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

    if (error instanceof Error) {
      logger.error(error.message);
      error = EErrorCode.UNKNOWN;
    }

    return {
      success: false,
      error: error,
    };
  }

  public toString(): string {
    return JSON.stringify(this.resJson);
  }
}

export const responseHandler = (res: Response, response: Exception | Success) => {
  return res.status(response.status).json(response.resJson);
};

type TRouteHandlerOptions = {
  requireApiKey: boolean;
  requireAppSignature: boolean;
  successCode: EResponseStatus | number;
};

const defaultRouteHandlerOption: TRouteHandlerOptions = {
  successCode: EResponseStatus.Ok,
  requireApiKey: false,
  requireAppSignature: false,
};

export const routeHandler =
  <T, R extends Request>(
    handler: (req: R, res: Response, next: NextFunction) => Promise<T>,
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

    const data = await toPromise(handler, req as any, res, next);

    (res as any).successCode = combineOptions.successCode;
    (res as any).data = data;

    return next();
  };

export const middlewareHandler =
  (middleware: RequestHandler) => async (req: TRequest, res: Response, next: NextFunction) => {
    await toPromise(middleware, req, res, next);
  };
