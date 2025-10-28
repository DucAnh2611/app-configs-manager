import { Router } from 'express';
import { ROUTE_PATHS } from '../../../constants';
import { getController } from '../../../controllers';
import { EApiKeyType, EValidateDtoType } from '../../../enums';
import { routeHandler } from '../../../helpers';
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

export const WebhookRouter = Router();

const webhookPaths = ROUTE_PATHS.api.v1.webhook;

WebhookRouter.get(
  webhookPaths.list,
  ValidateApiKey(EApiKeyType.WEBHOOK),
  routeHandler(
    async (req: TRequestWithApiKey) => {
      const { webhookController } = getController();

      const { appId } = req.apiKey;

      const data = await webhookController.list({ appId });

      return data;
    },
    { requireApiKey: true }
  )
);

WebhookRouter.get(
  webhookPaths.get,
  ValidateApiKey(EApiKeyType.WEBHOOK),
  ValidateDto([{ dto: DtoWebhookGet, type: EValidateDtoType.PARAM }]),
  routeHandler(
    async (req: TRequestAuth<{}, {}, DtoWebhookGet>) => {
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
    { requireApiKey: true, requireAppSignature: true }
  )
);

WebhookRouter.post(
  webhookPaths.register,
  ValidateDto([{ dto: DtoWebhookRegister, type: EValidateDtoType.BODY }]),
  ValidateApiKey(EApiKeyType.UP_WEBHOOK),
  routeHandler(
    async (req: TRequestAuth<DtoWebhookRegister, {}, {}>) => {
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
    { requireApiKey: true, requireAppSignature: true }
  )
);

WebhookRouter.post(
  webhookPaths.toggle,
  ValidateDto([{ dto: DtoWebhookToggle, type: EValidateDtoType.PARAM }]),
  ValidateApiKey(EApiKeyType.UP_WEBHOOK),
  routeHandler(
    async (req: TRequestWithApiKey<{}, {}, DtoWebhookToggle>) => {
      const { webhookController } = getController();

      const { appId } = req.apiKey;
      const { id: webhookId } = req.vParam;

      const data = await webhookController.toggle({ appId, id: webhookId });

      return data;
    },
    { requireApiKey: true }
  )
);

WebhookRouter.put(
  webhookPaths.update,
  ValidateDto([
    { dto: DtoWebhookUpdateParams, type: EValidateDtoType.PARAM },
    { dto: DtoWebhookUpdateBody, type: EValidateDtoType.BODY },
  ]),
  ValidateApiKey(EApiKeyType.UP_WEBHOOK),
  routeHandler(
    async (req: TRequestAuth<DtoWebhookUpdateBody, {}, DtoWebhookUpdateParams>) => {
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
    { requireApiKey: true, requireAppSignature: true }
  )
);

WebhookRouter.delete(
  webhookPaths.delete,
  ValidateDto([{ dto: DtoWebhookDelete, type: EValidateDtoType.PARAM }]),
  ValidateApiKey(EApiKeyType.UP_WEBHOOK),
  routeHandler(
    async (req: TRequestWithApiKey<{}, {}, DtoWebhookDelete>) => {
      const { webhookController } = getController();

      const { appId } = req.apiKey;
      const { id } = req.vParam;

      const data = await webhookController.delete({ appId, id });

      return data;
    },
    { requireApiKey: true }
  )
);
