import { NextFunction, Request, Response } from 'express';
import { EApiKeyType } from '../enums';
import { getServices } from '../services';

export const ValidateApiKey = (type: EApiKeyType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { apiKeyService } = getServices();

    const authToken: string = (req.headers.authorization || '') as string;

    const [_, apiKeyHeader] = authToken.split(' ');

    if (!apiKeyHeader) {
      return res.status(403).json({
        status: 403,
        success: false,
        error: 'Missing Api key',
      });
    }

    const { code: appCode, namespace } = (req as any).app;

    const apikeyPayload = await apiKeyService.extractPayload(apiKeyHeader, appCode, namespace);

    if (!apikeyPayload || apikeyPayload.type !== type) {
      return res.status(403).json({
        status: 403,
        success: false,
        error: 'Mismatch API Key type',
      });
    }

    const { appId, key } = apikeyPayload;

    const valid = await apiKeyService.checkKeyType({
      type,
      key: key,
      appCode: appCode,
    });

    if (!valid) {
      return res.status(403).json({
        status: 403,
        success: false,
        error: 'Invalid API Key',
      });
    }

    (req as any).apiKey = {
      type,
      code: appCode,
      key: key,
      appId: appId,
    };

    next();
  };
};
