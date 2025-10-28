import { Router } from 'express';
import { ROUTE_PATHS } from '../../../constants';
import { getController } from '../../../controllers';
import { EValidateDtoType } from '../../../enums';
import { routeHandler } from '../../../helpers';
import { ValidateDto } from '../../../middlewares';
import { DtoApiKeyValidate, TRequestValidatedDto } from '../../../types';

export const ApiKeyRouter = Router();

const apiKeyPaths = ROUTE_PATHS.api.v1.apiKey;

ApiKeyRouter.post(
  '/check',
  ValidateDto([{ dto: DtoApiKeyValidate, type: EValidateDtoType.BODY }]),
  routeHandler(async (req: TRequestValidatedDto<DtoApiKeyValidate, {}, {}>) => {
    const { apiKeyController } = getController();

    const resData = await apiKeyController.check(req.vBody);

    return resData;
  })
);
