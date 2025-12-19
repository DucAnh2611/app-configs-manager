import { NextFunction, Response } from 'express';
import { EErrorCode, EResponseStatus } from '../enums';
import { Exception, rateLimit } from '../helpers';
import { getRedis } from '../libs';
import { getServices } from '../services';
import { TRequest } from '../types';

export const rateLimitHandler = () => async (req: TRequest, _res: Response, next: NextFunction) => {
  const redis = getRedis();
  const { configService } = getServices();

  const systemConfig = await configService
    .getSystemConfig({
      RATE_LIMIT_DURATION: 'number',
      RATE_LIMIT_REQUEST: 'number',
    })
    .allowNull([]);

  if (systemConfig.RATE_LIMIT_DURATION < 1 || systemConfig.RATE_LIMIT_REQUEST < 1) {
    throw new Exception(EResponseStatus.BadRequest, EErrorCode.RATE_LIMIT_CONFIG_NOT_VALID);
  }

  const rate = await rateLimit(
    redis,
    req.ip || req.hostname,
    systemConfig.RATE_LIMIT_REQUEST,
    systemConfig.RATE_LIMIT_DURATION
  );

  if (!rate.allowed) {
    throw new Exception(EResponseStatus.BadGateway, EErrorCode.RATE_LIMIT_REACH, rate);
  }

  next();
};
