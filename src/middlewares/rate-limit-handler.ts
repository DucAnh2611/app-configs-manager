import { NextFunction, Response } from 'express';
import { EErrorCode, EResponseStatus } from '../enums';
import { Exception, rateLimit } from '../helpers';
import { getRedis } from '../libs';
import { getServices } from '../services';
import { TRequest } from '../types';

export const rateLimitHandler = () => async (req: TRequest, _res: Response, next: NextFunction) => {
  const redis = getRedis();
  const { configService } = getServices();

  const systemConfig = await configService.getSystemConfig();

  const { RATE_LIMIT_DURATION, RATE_LIMIT_REQUEST } = systemConfig;

  if (RATE_LIMIT_DURATION < 1 || RATE_LIMIT_REQUEST < 1) {
    throw new Exception(EResponseStatus.BadRequest, EErrorCode.RATE_LIMIT_CONFIG_NOT_VALID);
  }

  console.log(systemConfig);

  const rate = await rateLimit(
    redis,
    req.ip || req.hostname,
    RATE_LIMIT_REQUEST,
    RATE_LIMIT_DURATION
  );

  console.log(rate);

  if (!rate.allowed) {
    throw new Exception(EResponseStatus.BadGateway, EErrorCode.RATE_LIMIT_REACH, rate);
  }

  next();
};
