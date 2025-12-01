import { NextFunction, Response } from 'express';
import { EApiKeyType, EErrorCode, EResponseStatus } from '../enums';
import { Exception, middlewareHandler, valueOrDefault } from '../helpers';
import { getServices } from '../services';
import { TRequestBase } from '../types';

export const ValidateApiKey = (type: EApiKeyType) => {
  return middlewareHandler(async (req: TRequestBase, _res: Response, next: NextFunction) => {
    const { apiKeyService } = getServices();
    req.apiKeyType = type;

    const authToken: string = valueOrDefault<string>(req.headers.authorization, '');

    const [_apikeyType, publicKeyHeader] = authToken.split(' ');

    if (!publicKeyHeader) {
      throw new Exception(EResponseStatus.Unauthorized, EErrorCode.APIKEY_UNAUTHORIZATION);
    }

    if (!req.appSign) {
      throw new Exception(EResponseStatus.Unauthorized, EErrorCode.MISSING_REQUEST_APP_SIGNATURE);
    }

    const valid = await apiKeyService.validate({
      publicKey: publicKeyHeader,
      type,
    });

    if (!valid) {
      throw new Exception(EResponseStatus.Forbidden, EErrorCode.APIKEY_PAYLOAD_INVALID);
    }

    req.apiKey = {
      type,
      publicKey: publicKeyHeader,
    };

    next();
  });
};
