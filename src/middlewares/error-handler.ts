import { NextFunction, Request, Response } from 'express';
import { EErrorCode, EResponseStatus } from '../enums';
import { Exception, getAnalysticEndData, responseHandler } from '../helpers';
import { logger } from '../libs';
import { TRequestBase, TResponseValidation } from '../types';

export const ErrorHandler = () => {
  return (
    error: Exception | Error | TResponseValidation[],
    req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    let response: Exception = new Exception(
      EResponseStatus.InternalServerError,
      EErrorCode.INTERNAL_SERVER
    );

    if (error instanceof Exception) {
      response = error;
    }

    if (error instanceof Error) {
      response = new Exception(EResponseStatus.BadGateway, error);
    }

    logger.info(getAnalysticEndData(req as any as TRequestBase, response), 'RESPONSE', 'FAILED');

    responseHandler(res, response);

    return;
  };
};
