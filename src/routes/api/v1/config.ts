import { ROUTE_PATHS } from '../../../constants';
import { controllerNames, getController } from '../../../controllers';
import { EApiKeyType, EValidateDtoType } from '../../../enums';
import { createRouter } from '../../../helpers';
import { ValidateApiKey, ValidateDto } from '../../../middlewares';
import {
  DtoConfigRemove,
  DtoConfigRollback,
  DtoConfigToggleUse,
  DtoConfigUp,
  TRequestAuth,
} from '../../../types';

const configPaths = ROUTE_PATHS.api.v1.config;

export const ConfigRouter = createRouter([
  {
    path: configPaths.history,
    method: 'get',
    middlewares: [ValidateApiKey(EApiKeyType.CONFIG)],
    handler: async (req: TRequestAuth) => {
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
    handlerOptions: {
      requireApiKey: true,
      requireAppSignature: true,
      controller: controllerNames.config.history.name,
    },
  },
  {
    path: configPaths.get,
    method: 'get',
    middlewares: [ValidateApiKey(EApiKeyType.CONFIG)],
    handler: async (req: TRequestAuth) => {
      const { configController } = getController();

      const { namespace, code } = req.appSign;

      const data = await configController.get({ appCode: code, appNamespace: namespace });

      return data;
    },
    handlerOptions: {
      requireApiKey: true,
      requireAppSignature: true,
      controller: controllerNames.config.get.name,
    },
  },
  {
    path: configPaths.up,
    method: 'post',
    middlewares: [
      ValidateDto([{ dto: DtoConfigUp, type: EValidateDtoType.BODY }]),
      ValidateApiKey(EApiKeyType.UP_CONFIG),
    ],
    handler: async (req: TRequestAuth<DtoConfigUp, {}, {}>) => {
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
    handlerOptions: {
      requireApiKey: true,
      requireAppSignature: true,
      controller: controllerNames.config.up.name,
    },
  },
  {
    path: configPaths.toggle,
    method: 'post',
    middlewares: [
      ValidateDto([{ dto: DtoConfigToggleUse, type: EValidateDtoType.PARAM }]),
      ValidateApiKey(EApiKeyType.UP_CONFIG),
    ],
    handler: async (req: TRequestAuth<{}, {}, DtoConfigToggleUse>) => {
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
    handlerOptions: {
      requireApiKey: true,
      requireAppSignature: true,
      controller: controllerNames.config.toggleUse.name,
    },
  },
  {
    path: configPaths.rollback,
    method: 'post',
    middlewares: [
      ValidateDto([{ dto: DtoConfigRollback, type: EValidateDtoType.PARAM }]),
      ValidateApiKey(EApiKeyType.UP_CONFIG),
    ],
    handler: async (req: TRequestAuth<{}, {}, DtoConfigRollback>) => {
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
    handlerOptions: {
      requireApiKey: true,
      requireAppSignature: true,
      controller: controllerNames.config.rollback.name,
    },
  },
  {
    path: configPaths.remove,
    method: 'delete',
    middlewares: [
      ValidateDto([{ dto: DtoConfigRemove, type: EValidateDtoType.PARAM }]),
      ValidateApiKey(EApiKeyType.UP_CONFIG),
    ],
    handler: async (req: TRequestAuth<{}, {}, DtoConfigRemove>) => {
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
    handlerOptions: {
      requireApiKey: true,
      requireAppSignature: true,
      controller: controllerNames.config.remove.name,
    },
  },
]);
