import { Router } from 'express';
import { ROUTE_PATHS } from '../../../constants';
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

const configPaths = ROUTE_PATHS.api.v1.config;

ConfigRouter.get(
  configPaths.history,
  ValidateApiKey(EApiKeyType.CONFIG),
  routeHandler(
    async (req: TRequestAuth) => {
      const { configController } = getController();

      const { appId } = req.apiKey;
      const { namespace, code } = req.appSign;

      const data = await configController.history({
        appId,
        appNamespace: namespace,
        appCode: code,
      });

      return data;
    },
    { requireApiKey: true, requireAppSignature: true }
  )
);

ConfigRouter.get(
  configPaths.get,
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
  configPaths.up,
  ValidateDto([{ dto: DtoConfigUp, type: EValidateDtoType.BODY }]),
  ValidateApiKey(EApiKeyType.UP_CONFIG),
  routeHandler(
    async (req: TRequestAuth<DtoConfigUp, {}, {}>) => {
      const { configController } = getController();

      const { appId } = req.apiKey;
      const { namespace, code } = req.appSign;

      const data = await configController.up({
        ...req.vBody,
        appId,
        appNamespace: namespace,
        appCode: code,
      });

      return data;
    },
    { requireApiKey: true, requireAppSignature: true }
  )
);

ConfigRouter.post(
  configPaths.toggle,
  ValidateDto([{ dto: DtoConfigToggleUse, type: EValidateDtoType.PARAM }]),
  ValidateApiKey(EApiKeyType.UP_CONFIG),
  routeHandler(
    async (req: TRequestAuth<{}, {}, DtoConfigToggleUse>) => {
      const { configController } = getController();

      const { appId } = req.apiKey;
      const { code, namespace } = req.appSign;
      const { id: configId } = req.vParam;

      const data = await configController.toggleUse({
        configId,
        appId,
        appCode: code,
        appNamespace: namespace,
      });

      return data;
    },
    { requireApiKey: true, requireAppSignature: true }
  )
);

ConfigRouter.post(
  configPaths.rollback,
  ValidateDto([{ dto: DtoConfigRollback, type: EValidateDtoType.PARAM }]),
  ValidateApiKey(EApiKeyType.UP_CONFIG),
  routeHandler(
    async (req: TRequestAuth<{}, {}, DtoConfigRollback>) => {
      const { configController } = getController();

      const { appId } = req.apiKey;
      const { code, namespace } = req.appSign;
      const { id: configId } = req.vParam;

      const data = await configController.rollback({
        configId,
        appId,
        appCode: code,
        appNamespace: namespace,
      });

      return data;
    },
    { requireApiKey: true, requireAppSignature: true }
  )
);

ConfigRouter.delete(
  configPaths.remove,
  ValidateDto([{ dto: DtoConfigRemove, type: EValidateDtoType.PARAM }]),
  ValidateApiKey(EApiKeyType.UP_CONFIG),
  routeHandler(
    async (req: TRequestAuth<{}, {}, DtoConfigRemove>) => {
      const { configController } = getController();

      const { appId } = req.apiKey;
      const { code, namespace } = req.appSign;
      const { id: configId } = req.vParam;

      const data = await configController.remove({
        configId,
        appId,
        appCode: code,
        appNamespace: namespace,
      });

      return data;
    },
    { requireApiKey: true, requireAppSignature: true }
  )
);
