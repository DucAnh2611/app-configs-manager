import { NextFunction, Request, RequestHandler, Response } from 'express';
import { EErrorCode, EResponseStatus } from '../enums';
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
      console.error(error);
      error = EErrorCode.UNKNOWN;
    }

    return {
      success: true,
      error: error,
    };
  }
}

export const responseHandler = (res: Response, response: Exception | Success) => {
  return res.status(response.status).json(response.resJson);
};

type TRouteHandlerOptions = {
  requireApiKey?: boolean;
  requireAppSignature?: boolean;
};

const defaultRouteHandlerOption: TRouteHandlerOptions = {};

export const routeHandler =
  <T, R extends Request>(handler: (req: R) => Promise<T>, options: TRouteHandlerOptions = {}) =>
  async (req: TRequest, res: Response) => {
    try {
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

      const data = await toPromise(handler, req as R);

      return responseHandler(res, new Success(EResponseStatus.Ok, data));
    } catch (e) {
      return errorHandler(res, e);
    }
  };

export const middlewareHandler =
  (middleware: RequestHandler) => async (req: TRequest, res: Response, next: NextFunction) => {
    try {
      await toPromise(middleware, req, res, next);
    } catch (e) {
      return errorHandler(res, e);
    }
  };

export const errorHandler = (res: Response, e: unknown) => {
  if (e instanceof Exception) {
    return responseHandler(res, e);
  }

  if (e instanceof Error) {
    return responseHandler(res, new Exception(EResponseStatus.BadGateway, e));
  }

  return responseHandler(
    res,
    new Exception(EResponseStatus.InternalServerError, EErrorCode.INTERNAL_SERVER)
  );
};
