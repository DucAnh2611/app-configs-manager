import { NextFunction, Request, Response } from 'express';
import { EApiKeyType } from '../enums';
import { getServices } from '../services';

export const ValidateApiKey = (type: EApiKeyType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { apiKeyService } = getServices();

    const authToken: string = (req.headers.authorization || '') as string;
    const apiKeyAppHeader: string = req.headers['x-api-key-app'] as string;

    const [_, apiKeyHeader] = authToken.split(' ');

    if (!apiKeyHeader) {
      return res.status(403).json({
        status: 403,
        success: false,
        error: 'Missing Api key',
      });
    }

    const apikeyPayload = await apiKeyService.extractPayload(apiKeyHeader, apiKeyAppHeader);

    if (!apikeyPayload || apikeyPayload.type !== type) {
      return res.status(403).json({
        status: 403,
        success: false,
        error: 'Mismatch API Key type',
      });
    }

    const { appCode, key } = apikeyPayload;

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
      key: appCode,
    };

    next();
  };
};
