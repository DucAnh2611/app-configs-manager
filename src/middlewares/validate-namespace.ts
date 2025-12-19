import { NextFunction, Response } from 'express';
import { EErrorCode, EResponseStatus } from '../enums';
import { Exception, middlewareHandler } from '../helpers';
import { getServices } from '../services';
import { TRequestBase } from '../types';

export const ValidateNamespace = () => {
  return middlewareHandler(async (req: TRequestBase, _res: Response, next: NextFunction) => {
    const { appService } = getServices();
    let namespace = req.headers['namespace'] ?? '';
    let appCodeHeader = req.headers['app-code'] ?? '';

    if (typeof namespace === 'object' && Array.isArray(namespace)) {
      namespace = namespace.join(' ');
    }

    if (typeof appCodeHeader === 'object' && Array.isArray(appCodeHeader)) {
      appCodeHeader = appCodeHeader.join(' ');
    }

    const app = await appService.getByCode(appCodeHeader);
    if (!app) throw new Exception(EResponseStatus.NotFound, EErrorCode.APP_NOT_EXIST);

    if (!namespace.trim()) {
      throw new Exception(EResponseStatus.Unauthorized, EErrorCode.MISSING_HEADER_NAMESPACE);
    }

    if (!appCodeHeader.trim()) {
      throw new Exception(EResponseStatus.Unauthorized, EErrorCode.MISSING_HEADER_APP_CODE);
    }

    req.appSign = {
      namespace: namespace.trim(),
      code: appCodeHeader.trim(),
      appId: app.id,
    };

    next();
  });
};
