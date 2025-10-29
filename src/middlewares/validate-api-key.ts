import { NextFunction, Response } from 'express';
import { EApiKeyType, EErrorCode, EResponseStatus } from '../enums';
import { Exception, middlewareHandler } from '../helpers';
import { getServices } from '../services';
import { TRequestBase } from '../types';

export const ValidateApiKey = (type: EApiKeyType) => {
  return middlewareHandler(async (req: TRequestBase, _res: Response, next: NextFunction) => {
    const { apiKeyService } = getServices();
    req.apiKeyType = type;

    const authToken: string = (req.headers.authorization || '') as string;

    const [_apikeyType, apiKeyHeader] = authToken.split(' ');

    if (!apiKeyHeader) {
      throw new Exception(EResponseStatus.Unauthorized, EErrorCode.MISSING_HEADER_AUTHORIZATION);
    }

    if (!req.appSign) {
      throw new Exception(EResponseStatus.Unauthorized, EErrorCode.MISSING_REQUEST_APP_SIGNATURE);
    }

    const { code: appCode, namespace } = req.appSign;

    const apikeyPayload = await apiKeyService.extractPayload(apiKeyHeader, appCode, namespace);

    if (!apikeyPayload) {
      throw new Exception(EResponseStatus.Forbidden, EErrorCode.APIKEY_PAYLOAD_EXTRACT_FAILED);
    }

    if (apikeyPayload.type !== type) {
      throw new Exception(EResponseStatus.Forbidden, EErrorCode.APIKEY_PAYLOAD_TYPE_DISMATCH);
    }

    const { appId, key } = apikeyPayload;

    const valid = await apiKeyService.checkKeyType({
      type,
      key: key,
      appCode: appCode,
    });

    if (!valid) {
      throw new Exception(EResponseStatus.Forbidden, EErrorCode.APIKEY_PAYLOAD_INVALID);
    }

    req.apiKey = {
      type,
      key: key,
      appId: appId,
    };

    next();
  });
};
