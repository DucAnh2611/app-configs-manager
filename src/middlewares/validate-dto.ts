import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { EResponseStatus, EValidateDtoType } from '../enums';
import { Exception, middlewareHandler } from '../helpers';
import { TRequestBase, TRequestValidatedDto, TResponseValidation } from '../types';

export const ValidateDto = (sources: Array<{ dto: any; type: EValidateDtoType }> = []) => {
  return middlewareHandler(async (req: TRequestBase, res: Response, next: NextFunction) => {
    req.dtos = req.dtos || [];

    for (const source of sources) {
      req.dtos.push({ type: source.type, dto: source.dto.name });

      await validateEachSource(source.dto, source.type, req);
    }

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

  const mapFields: Record<
    EValidateDtoType,
    keyof Pick<TRequestValidatedDto<any, any, any>, 'vBody' | 'vParam' | 'vQuery'>
  > = {
    [EValidateDtoType.BODY]: 'vBody',
    [EValidateDtoType.QUERY]: 'vQuery',
    [EValidateDtoType.PARAM]: 'vParam',
  };

  if (!mapFields[sourceType]) return;

  (req as Partial<TRequestValidatedDto<any, any, any>>)[mapFields[sourceType]] = dtoInstance;
};
