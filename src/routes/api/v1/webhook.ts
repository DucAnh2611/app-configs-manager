import { Router } from 'express';
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

WebhookRouter.get(
  '/list/all',
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
  '/:id',
  ValidateApiKey(EApiKeyType.WEBHOOK),
  ValidateDto([{ dto: DtoWebhookGet, type: EValidateDtoType.PARAM }]),
  routeHandler(
    async (req: TRequestAuth) => {
      const { webhookController } = getController();

      const { appId } = req.apiKey;
      const { code, namespace } = req.appSign;
      const { id } = req.params;

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
  '/',
  ValidateDto([{ dto: DtoWebhookRegister, type: EValidateDtoType.BODY }]),
  ValidateApiKey(EApiKeyType.UP_WEBHOOK),
  routeHandler(
    async (req: TRequestAuth) => {
      const { webhookController } = getController();

      const { appId } = req.apiKey;
      const { namespace, code } = req.appSign;

      const data = await webhookController.register({
        appId,
        appCode: code,
        appNamespace: namespace,
        ...req.body,
      });

      return data;
    },
    { requireApiKey: true, requireAppSignature: true }
  )
);

WebhookRouter.post(
  '/:id/toggle',
  ValidateDto([{ dto: DtoWebhookToggle, type: EValidateDtoType.PARAM }]),
  ValidateApiKey(EApiKeyType.UP_WEBHOOK),
  routeHandler(
    async (req: TRequestWithApiKey) => {
      const { webhookController } = getController();

      const { appId } = req.apiKey;
      const { id: webhookId } = req.params;

      const data = await webhookController.toggle({ appId, id: webhookId });

      return data;
    },
    { requireApiKey: true }
  )
);

WebhookRouter.put(
  '/:id',
  ValidateDto([
    { dto: DtoWebhookUpdateParams, type: EValidateDtoType.PARAM },
    { dto: DtoWebhookUpdateBody, type: EValidateDtoType.BODY },
  ]),
  ValidateApiKey(EApiKeyType.UP_WEBHOOK),
  routeHandler(
    async (req: TRequestAuth) => {
      const { webhookController } = getController();

      const { appId } = req.apiKey;
      const { namespace, code } = req.appSign;
      const { id } = req.params;

      const data = await webhookController.update({
        id,
        appId,
        appCode: code,
        appNamespace: namespace,
        ...req.body,
      });

      return data;
    },
    { requireApiKey: true, requireAppSignature: true }
  )
);

WebhookRouter.delete(
  '/:id',
  ValidateDto([{ dto: DtoWebhookDelete, type: EValidateDtoType.PARAM }]),
  ValidateApiKey(EApiKeyType.UP_WEBHOOK),
  routeHandler(
    async (req: TRequestWithApiKey) => {
      const { webhookController } = getController();

      const { appId } = req.apiKey;
      const { id } = req.params;

      const data = await webhookController.delete({ appId, id });

      return data;
    },
    { requireApiKey: true }
  )
);
