import { Router } from 'express';
import { getController } from '../../../controllers';
import { EValidateDtoType } from '../../../enums';
import { ValidateDto } from '../../../middlewares';
import { DtoApiKeyValidate } from '../../../types';

export const ApiKeyRouter = Router();

ApiKeyRouter.post(
  '/check',
  ValidateDto([{ dto: DtoApiKeyValidate, type: EValidateDtoType.BODY }]),
  async (req, res) => {
    const { apiKeyController } = getController();

    const resData = await apiKeyController.check(req.body);

    return res.status(resData.status).json(resData);
  }
);
