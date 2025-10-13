import { Router } from 'express';
import { ValidateApiKey, ValidateDto } from '../../middlewares';
import { DtoAppUpConfig } from '../../types';
import { EValidateDtoType } from '../../enums';
import { EApiKeyType } from '../../enums';
import { getController } from '../../controllers';

export const AppRouter = Router();

AppRouter.put(
  '/cfg',
  ValidateDto([{ dto: DtoAppUpConfig, type: EValidateDtoType.BODY }]),
  ValidateApiKey(EApiKeyType.UP_CONFIG),
  async (req, res) => {
    const { appController } = getController();
    const { code } = (req as any).apiKey;

    const resData = await appController.upConfig(code, req.body);

    return res.status(resData.status).json(resData);
  }
);

AppRouter.get('/cfg', ValidateApiKey(EApiKeyType.CONFIG), async (req, res) => {
  const { appController } = getController();
  const { code } = (req as any).apiKey;

  const resData = await appController.appConfigs({ code: code });

  return res.status(resData.status).json(resData);
});
