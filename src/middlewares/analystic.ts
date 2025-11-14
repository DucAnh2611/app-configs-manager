import dayjs from 'dayjs';
import { NextFunction, Request, Response } from 'express';
import { getAnalysticStartData } from '../helpers';
import { logger } from '../libs';
import { TRequestBase } from '../types';

export const AnalysticHandler = (req: Request, _: Response, next: NextFunction) => {
  const map: Partial<TRequestBase> = {
    vBody: {},
    vParam: {},
    vQuery: {},
    dtos: [],
    controller: null,
    apiKeyType: null,
    reqStart: dayjs(req.headers.date ?? new Date()).toDate(),
  };

  Object.entries(map).forEach(([f, v]) => {
    (req as any)[f] = v;
  });

  logger.info(getAnalysticStartData(req), 'REQUEST', 'RECEIVE');

  next();
};
