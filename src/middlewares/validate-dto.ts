import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { EValidateDtoType } from '../enums';

export const ValidateDto = (sources: Array<{ dto: any; type: EValidateDtoType }> = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const source of sources) {
      await validateEachSource(source.dto, source.type, req, res);
    }

    (req as any).isValidateDto = true;

    next();
  };
};

const validateEachSource = async (
  dtoClass: any,
  sourceType: EValidateDtoType,
  req: Request,
  res: Response
) => {
  const data = req[sourceType];
  const dtoInstance = plainToInstance(dtoClass, data);
  const errors = await validate(dtoInstance, { whitelist: true, forbidNonWhitelisted: true });

  if (errors.length > 0) {
    const formatted = errors.map((err) => ({
      property: err.property,
      constraints: err.constraints,
      children: err.children?.length ? err.children : undefined,
    }));

    return res.status(400).json({
      success: false,
      status: 400,
      message: `Validation failed in ${sourceType}`,
      errors: formatted,
    });
  }

  Object.assign(req[sourceType], dtoInstance);
};
