import { NextFunction, Response } from 'express';
import { EErrorCode, EResponseStatus } from '../enums';
import { checkRateLimit, Exception } from '../helpers';
import { getRedis } from '../libs';
import { getServices } from '../services';
import { TRequest } from '../types';
import { CETransform } from '../utils';

const { schema, primitives } = CETransform;

export const rateLimitHandler = () => async (req: TRequest, _res: Response, next: NextFunction) => {
  const redis = getRedis();
  const { configService } = getServices();

  const systemConfig = await configService
    .getSystemConfig({
      rateLimit: schema(
        {
          duration: primitives('number', 3),
          request: primitives('number', 1),
        },
        {
          duration: 3,
          request: 1,
        }
      ).allowNull([]),
    })
    .allowNull([]);

  if (systemConfig.rateLimit.duration < 1 || systemConfig.rateLimit.request < 1) {
    throw new Exception(EResponseStatus.BadRequest, EErrorCode.RATE_LIMIT_CONFIG_NOT_VALID);
  }

  const rate = await checkRateLimit(
    redis,
    req.ip || req.hostname,
    systemConfig.rateLimit.request,
    systemConfig.rateLimit.duration
  );

  if (!rate.allowed) {
    throw new Exception(EResponseStatus.BadGateway, EErrorCode.RATE_LIMIT_REACH, rate);
  }

  next();
};
