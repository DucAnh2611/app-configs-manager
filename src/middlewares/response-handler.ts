import { Request, Response } from 'express';
import { EResponseStatus } from '../enums';
import { getAnalysticEndData, responseHandler, Success } from '../helpers';
import { logger } from '../libs';
import { TRequestBase } from '../types';

export const ResponseHandler = () => {
  return (req: Request, res: Response) => {
    const resData = new Success((res as any).successCode || EResponseStatus.Ok, (res as any).data);

    logger.info(getAnalysticEndData(req as any as TRequestBase, resData), 'RESPONSE', 'SUCCESS');

    responseHandler(res, resData);
  };
};
