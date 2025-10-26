import { Router } from 'express';
import { getController } from '../../../controllers';
import { EApiKeyType, EValidateDtoType } from '../../../enums';
import { routeHandler } from '../../../helpers';
import { ValidateApiKey, ValidateDto } from '../../../middlewares';
import {
  DtoConfigRemove,
  DtoConfigRollback,
  DtoConfigToggleUse,
  DtoConfigUp,
  TRequestAuth,
} from '../../../types';

export const ConfigRouter = Router();

ConfigRouter.get(
  '/history',
  ValidateApiKey(EApiKeyType.CONFIG),
  routeHandler(
    async (req: TRequestAuth) => {
      const { configController } = getController();

      const { appId } = req.apiKey;
      const { namespace } = req.appSign;

      const data = await configController.history({ appId, appNamespace: namespace });

      return data;
    },
    { requireApiKey: true, requireAppSignature: true }
  )
);

ConfigRouter.get(
  '/',
  ValidateApiKey(EApiKeyType.CONFIG),
  routeHandler(
    async (req: TRequestAuth) => {
      const { configController } = getController();

      const { namespace, code } = req.appSign;

      const data = await configController.get({ appCode: code, appNamespace: namespace });

      return data;
    },
    { requireApiKey: true, requireAppSignature: true }
  )
);

ConfigRouter.post(
  '/',
  ValidateDto([{ dto: DtoConfigUp, type: EValidateDtoType.BODY }]),
  ValidateApiKey(EApiKeyType.UP_CONFIG),
  routeHandler(
    async (req: TRequestAuth) => {
      const { configController } = getController();

      const { appId } = req.apiKey;
      const { namespace, code } = req.appSign;

      const data = await configController.up({ appId, namespace, ...req.body, appCode: code });

      return data;
    },
    { requireApiKey: true, requireAppSignature: true }
  )
);

ConfigRouter.post(
  '/:id/toggle',
  ValidateDto([{ dto: DtoConfigToggleUse, type: EValidateDtoType.PARAM }]),
  ValidateApiKey(EApiKeyType.UP_CONFIG),
  routeHandler(
    async (req: TRequestAuth) => {
      const { configController } = getController();

      const { appId } = req.apiKey;
      const { namespace } = req.appSign;
      const { id: configId } = req.params as any as DtoConfigToggleUse;

      const data = await configController.toggleUse({ configId, appId, namespace });

      return data;
    },
    { requireApiKey: true, requireAppSignature: true }
  )
);

ConfigRouter.post(
  '/:id/rollback',
  ValidateDto([{ dto: DtoConfigRollback, type: EValidateDtoType.PARAM }]),
  ValidateApiKey(EApiKeyType.UP_CONFIG),
  routeHandler(
    async (req: TRequestAuth) => {
      const { configController } = getController();

      const { appId } = req.apiKey;
      const { id: configId } = req.params as any as DtoConfigRollback;

      const data = await configController.rollback({ configId, appId });

      return data;
    },
    { requireApiKey: true, requireAppSignature: true }
  )
);

ConfigRouter.delete(
  '/:id',
  ValidateDto([{ dto: DtoConfigRemove, type: EValidateDtoType.PARAM }]),
  ValidateApiKey(EApiKeyType.UP_CONFIG),
  routeHandler(
    async (req: TRequestAuth) => {
      const { configController } = getController();

      const { appId } = req.apiKey;
      const { id: configId } = req.params as any as DtoConfigRemove;

      const data = await configController.remove({ configId, appId });

      return data;
    },
    { requireApiKey: true, requireAppSignature: true }
  )
);
