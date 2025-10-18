import { Router } from 'express';
import { getController } from '../../../controllers';
import { EValidateDtoType } from '../../../enums';
import { routeHandler } from '../../../helpers';
import { ValidateDto } from '../../../middlewares';
import { DtoApiKeyValidate } from '../../../types';

export const ApiKeyRouter = Router();

ApiKeyRouter.post(
  '/check',
  ValidateDto([{ dto: DtoApiKeyValidate, type: EValidateDtoType.BODY }]),
  routeHandler(async (req) => {
    const { apiKeyController } = getController();

    const resData = await apiKeyController.check(req.body);

    return resData;
  })
);
