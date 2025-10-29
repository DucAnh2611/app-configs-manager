import { ROUTE_PATHS } from '../../../constants';
import { controllerNames, getController } from '../../../controllers';
import { EApiKeyType, EValidateDtoType } from '../../../enums';
import { createRouter } from '../../../helpers';
import { ValidateApiKey, ValidateDto } from '../../../middlewares';
import {
  DtoWebhookDelete,
  DtoWebhookGet,
  DtoWebhookRegister,
  DtoWebhookToggle,
  DtoWebhookUpdateBody,
  DtoWebhookUpdateParams,
  TRequestAuth,
  TRequestWithApiKey,
} from '../../../types';

const webhookPaths = ROUTE_PATHS.api.v1.webhook;

export const WebhookRouter = createRouter([
  {
    path: webhookPaths.list,
    method: 'get',
    middlewares: [ValidateApiKey(EApiKeyType.WEBHOOK)],
    handler: async (req: TRequestWithApiKey) => {
      const { webhookController } = getController();

      const { appId } = req.apiKey;
      const data = await webhookController.list({ appId });

      return data;
    },
    handlerOptions: { controller: controllerNames.webhook.list.name, requireApiKey: true },
  },
  {
    path: webhookPaths.get,
    method: 'get',
    middlewares: [
      ValidateApiKey(EApiKeyType.WEBHOOK),
      ValidateDto([{ dto: DtoWebhookGet, type: EValidateDtoType.PARAM }]),
    ],
    handler: async (req: TRequestAuth<{}, {}, DtoWebhookGet>) => {
      const { webhookController } = getController();

      const { appId } = req.apiKey;
      const { code, namespace } = req.appSign;
      const { id } = req.vParam;

      const data = await webhookController.get({
        id,
        appId,
        appCode: code,
        appNamespace: namespace,
      });

      return data;
    },
    handlerOptions: {
      controller: controllerNames.webhook.get.name,
      requireApiKey: true,
      requireAppSignature: true,
    },
  },
  {
    path: webhookPaths.register,
    method: 'post',
    middlewares: [
      ValidateDto([{ dto: DtoWebhookRegister, type: EValidateDtoType.BODY }]),
      ValidateApiKey(EApiKeyType.UP_WEBHOOK),
    ],
    handler: async (req: TRequestAuth<DtoWebhookRegister, {}, {}>) => {
      const { webhookController } = getController();

      const { appId } = req.apiKey;
      const { namespace, code } = req.appSign;

      const data = await webhookController.register({
        ...req.vBody,
        appId,
        appCode: code,
        appNamespace: namespace,
      });

      return data;
    },
    handlerOptions: {
      controller: controllerNames.webhook.register.name,
      requireApiKey: true,
      requireAppSignature: true,
    },
  },
  {
    path: webhookPaths.toggle,
    method: 'post',
    middlewares: [
      ValidateDto([{ dto: DtoWebhookToggle, type: EValidateDtoType.PARAM }]),
      ValidateApiKey(EApiKeyType.UP_WEBHOOK),
    ],
    handler: async (req: TRequestWithApiKey<{}, {}, DtoWebhookToggle>) => {
      const { webhookController } = getController();

      const { appId } = req.apiKey;
      const { id: webhookId } = req.vParam;

      const data = await webhookController.toggle({ appId, id: webhookId });

      return data;
    },
    handlerOptions: { controller: controllerNames.webhook.toggle.name, requireApiKey: true },
  },
  {
    path: webhookPaths.update,
    method: 'put',
    middlewares: [
      ValidateDto([
        { dto: DtoWebhookUpdateParams, type: EValidateDtoType.PARAM },
        { dto: DtoWebhookUpdateBody, type: EValidateDtoType.BODY },
      ]),
      ValidateApiKey(EApiKeyType.UP_WEBHOOK),
    ],
    handler: async (req: TRequestAuth<DtoWebhookUpdateBody, {}, DtoWebhookUpdateParams>) => {
      const { webhookController } = getController();

      const { appId } = req.apiKey;
      const { namespace, code } = req.appSign;
      const { id } = req.vParam;

      const data = await webhookController.update({
        ...req.vBody,
        id,
        appId,
        appCode: code,
        appNamespace: namespace,
      });

      return data;
    },
    handlerOptions: {
      controller: controllerNames.webhook.update.name,
      requireApiKey: true,
      requireAppSignature: true,
    },
  },
  {
    path: webhookPaths.delete,
    method: 'delete',
    middlewares: [
      ValidateDto([{ dto: DtoWebhookDelete, type: EValidateDtoType.PARAM }]),
      ValidateApiKey(EApiKeyType.UP_WEBHOOK),
    ],
    handler: async (req: TRequestWithApiKey<{}, {}, DtoWebhookDelete>) => {
      const { webhookController } = getController();

      const { appId } = req.apiKey;
      const { id } = req.vParam;

      const data = await webhookController.delete({ appId, id });

      return data;
    },
    handlerOptions: { controller: controllerNames.webhook.delete.name, requireApiKey: true },
  },
]);
