import { Request, Response } from 'express';
import { EResponseStatus } from '../enums';
import { responseHandler, Success } from '../helpers';

export const ResponseHandler = () => {
  return (_req: Request, res: Response) => {
    responseHandler(
      res,
      new Success((res as any).successCode || EResponseStatus.Ok, (res as any).data)
    );
  };
};
