import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { EResponseStatus, EValidateDtoType } from '../enums';
import { Exception, middlewareHandler } from '../helpers';
import { TResponseValidation } from '../types';

export const ValidateDto = (sources: Array<{ dto: any; type: EValidateDtoType }> = []) => {
  return middlewareHandler(async (req: Request, res: Response, next: NextFunction) => {
    for (const source of sources) {
      await validateEachSource(source.dto, source.type, req);
    }

    (req as any).isValidateDto = true;

    next();
  });
};

const validateEachSource = async (dtoClass: any, sourceType: EValidateDtoType, req: Request) => {
  const data = req[sourceType];
  const dtoInstance = plainToInstance(dtoClass, data);
  const errors = await validate(dtoInstance, { whitelist: true, forbidNonWhitelisted: true });

  if (errors.length > 0) {
    const formatted: TResponseValidation[] = errors.map((err) => ({
      property: err.property,
      constraints: err.constraints,
      children: err.children?.length ? err.children : undefined,
    }));

    throw new Exception(EResponseStatus.BadRequest, formatted);
  }

  Object.assign(req[sourceType], dtoInstance);
};
