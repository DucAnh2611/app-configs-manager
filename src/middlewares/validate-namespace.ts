import { NextFunction, Response } from 'express';
import { EErrorCode, EResponseStatus } from '../enums';
import { Exception, middlewareHandler, responseHandler } from '../helpers';
import { TRequest } from '../types';

export const ValidateNamespace = () => {
  return middlewareHandler((req: TRequest, res: Response, next: NextFunction) => {
    let namespace = req.headers['namespace'] ?? '';
    let appCodeHeader = req.headers['app-code'] ?? '';

    if (typeof namespace === 'object' && Array.isArray(namespace)) {
      namespace = namespace.join(' ');
    }

    if (typeof appCodeHeader === 'object' && Array.isArray(appCodeHeader)) {
      appCodeHeader = appCodeHeader.join(' ');
    }

    if (!namespace.trim()) {
      return responseHandler(
        res,
        new Exception(EResponseStatus.Unauthorized, EErrorCode.MISSING_HEADER_NAMESPACE)
      );
    }

    if (!appCodeHeader.trim()) {
      return responseHandler(
        res,
        new Exception(EResponseStatus.Unauthorized, EErrorCode.MISSING_HEADER_APP_CODE)
      );
    }

    req.appSign = {
      namespace: namespace.trim(),
      code: appCodeHeader.trim(),
    };

    next();
  });
};
