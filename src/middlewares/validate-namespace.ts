import { NextFunction, Request, Response } from 'express';

export const ValidateNamespace = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    let namespace = req.headers['namespace'] ?? '';
    let appCodeHeader = req.headers['app-code'] ?? '';

    if (typeof namespace === 'object' && Array.isArray(namespace)) {
      namespace = namespace.join(' ');
    }

    if (typeof appCodeHeader === 'object' && Array.isArray(appCodeHeader)) {
      appCodeHeader = appCodeHeader.join(' ');
    }

    if (!namespace.trim()) {
      return res.status(401).json({
        status: 401,
        success: false,
        error: 'Missing Namespace header!',
      });
    }

    if (!appCodeHeader.trim()) {
      return res.status(403).json({
        status: 403,
        success: false,
        error: 'Missing App code',
      });
    }

    (req as any).app = {
      namespace: namespace.trim(),
      code: appCodeHeader.trim(),
    };

    next();
  };
};
