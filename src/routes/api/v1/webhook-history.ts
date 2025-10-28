import { Router } from 'express';
import { REQUEST_DEFAULT_FULLSEARCH, ROUTE_PATHS } from '../../../constants';
import { getController } from '../../../controllers';
import { EApiKeyType, EValidateDtoType } from '../../../enums';
import { routeHandler } from '../../../helpers';
import { ValidateApiKey, ValidateDto } from '../../../middlewares';
import { DtoWebhookHistoryList, DtoWebhookHistoryRetry, TRequestAuth } from '../../../types';

export const WebhookHistoryRouter = Router();

const webhookHistoryPaths = ROUTE_PATHS.api.v1.webhookHistory;

WebhookHistoryRouter.get(
  webhookHistoryPaths.list,
  ValidateApiKey(EApiKeyType.WEBHOOK),
  ValidateDto([{ dto: DtoWebhookHistoryList, type: EValidateDtoType.QUERY }]),
  routeHandler(
    async (req: TRequestAuth<{}, DtoWebhookHistoryList, {}>) => {
      const { webhookHistoryController } = getController();

      const { appId } = req.apiKey;

      const data = await webhookHistoryController.list({
        ...REQUEST_DEFAULT_FULLSEARCH,
        ...req.vQuery,
        appId,
      });

      return data;
    },
    { requireApiKey: true, requireAppSignature: true }
  )
);

WebhookHistoryRouter.post(
  webhookHistoryPaths.retry,
  ValidateApiKey(EApiKeyType.WEBHOOK),
  ValidateDto([{ dto: DtoWebhookHistoryRetry, type: EValidateDtoType.PARAM }]),
  routeHandler(
    async (req: TRequestAuth<{}, {}, DtoWebhookHistoryRetry>) => {
      const { webhookHistoryController } = getController();

      const { id } = req.vParam;

      const data = await webhookHistoryController.retry({ webhookHistoryId: id });

      return data;
    },
    { requireApiKey: true, requireAppSignature: true }
  )
);
