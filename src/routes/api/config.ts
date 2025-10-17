import { Router } from 'express';
import { getController } from '../../controllers';
import { EApiKeyType, EValidateDtoType } from '../../enums';
import { ValidateApiKey, ValidateDto } from '../../middlewares';
import {
  DtoConfigGet,
  DtoConfigHistory,
  DtoConfigRemove,
  DtoConfigRollback,
  DtoConfigToggleUse,
  DtoConfigUp,
} from '../../types';

export const ConfigRouter = Router();

ConfigRouter.get(
  '/history',
  ValidateDto([{ dto: DtoConfigHistory, type: EValidateDtoType.QUERY }]),
  ValidateApiKey(EApiKeyType.CONFIG),
  async (req, res) => {
    const { configController } = getController();

    const { appId } = (req as any).apiKey;
    const { namespace } = req.query as any as DtoConfigHistory;

    const resData = await configController.history({ appId, appNamespace: namespace });

    return res.status(resData.status).json(resData);
  }
);

ConfigRouter.get(
  '/',
  ValidateDto([{ dto: DtoConfigGet, type: EValidateDtoType.QUERY }]),
  ValidateApiKey(EApiKeyType.CONFIG),
  async (req, res) => {
    const { configController } = getController();

    const { appId } = (req as any).apiKey;
    const { namespace } = req.query as any as DtoConfigGet;

    const resData = await configController.get({ appId, appNamespace: namespace });

    return res.status(resData.status).json(resData);
  }
);

ConfigRouter.post(
  '/',
  ValidateDto([{ dto: DtoConfigUp, type: EValidateDtoType.BODY }]),
  ValidateApiKey(EApiKeyType.UP_CONFIG),
  async (req, res) => {
    const { configController } = getController();

    const { appId } = (req as any).apiKey;

    const resData = await configController.up({ appId, ...req.body });

    return res.status(resData.status).json(resData);
  }
);

ConfigRouter.post(
  '/:id/toggle',
  ValidateDto([{ dto: DtoConfigToggleUse, type: EValidateDtoType.PARAM }]),
  ValidateApiKey(EApiKeyType.UP_CONFIG),
  async (req, res) => {
    const { configController } = getController();

    const { appId } = (req as any).apiKey;
    const { id: configId } = req.params as any as DtoConfigToggleUse;

    const resData = await configController.toggleUse({ configId, appId });

    return res.status(resData.status).json(resData);
  }
);

ConfigRouter.post(
  '/:id/rollback',
  ValidateDto([{ dto: DtoConfigRollback, type: EValidateDtoType.PARAM }]),
  ValidateApiKey(EApiKeyType.UP_CONFIG),
  async (req, res) => {
    const { configController } = getController();

    const { appId } = (req as any).apiKey;
    const { id: configId } = req.params as any as DtoConfigRollback;

    const resData = await configController.rollback({ configId, appId });

    return res.status(resData.status).json(resData);
  }
);

ConfigRouter.delete(
  '/:id',
  ValidateDto([{ dto: DtoConfigRemove, type: EValidateDtoType.PARAM }]),
  ValidateApiKey(EApiKeyType.UP_CONFIG),
  async (req, res) => {
    const { configController } = getController();

    const { appId } = (req as any).apiKey;
    const { id: configId } = req.params as any as DtoConfigRemove;

    const resData = await configController.remove({ configId, appId });

    return res.status(resData.status).json(resData);
  }
);
