import { NextFunction, Request, Response } from 'express';
import { EErrorCode, EResponseStatus } from '../enums';
import { Exception, responseHandler } from '../helpers';
import { TResponseValidation } from '../types';

export const ErrorHandler = () => {
  return (
    error: Exception | Error | TResponseValidation[],
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    if (error instanceof Exception) {
      responseHandler(res, error);
      return;
    }

    if (error instanceof Error) {
      responseHandler(res, new Exception(EResponseStatus.BadGateway, error));
      return;
    }

    responseHandler(
      res,
      new Exception(EResponseStatus.InternalServerError, EErrorCode.INTERNAL_SERVER)
    );
    return;
  };
};
