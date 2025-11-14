import { REQUEST_DEFAULT_FULLSEARCH, ROUTE_PATHS } from '../../../constants';
import { controllerNames, getController } from '../../../controllers';
import { EApiKeyType, EValidateDtoType } from '../../../enums';
import { createRouter } from '../../../helpers';
import { ValidateApiKey, ValidateDto } from '../../../middlewares';
import { DtoWebhookHistoryList, DtoWebhookHistoryRetry, TRequestAuth } from '../../../types';

const webhookHistoryPaths = ROUTE_PATHS.api.v1.webhookHistory;

export const WebhookHistoryRouter = createRouter([
  {
    path: webhookHistoryPaths.list,
    method: 'get',
    middlewares: [
      ValidateApiKey(EApiKeyType.WEBHOOK),
      ValidateDto([{ dto: DtoWebhookHistoryList, type: EValidateDtoType.QUERY }]),
    ],
    handler: async (req: TRequestAuth<{}, DtoWebhookHistoryList, {}>) => {
      const { webhookHistoryController } = getController();

      const { appId } = req.apiKey;

      const data = await webhookHistoryController.list({
        ...REQUEST_DEFAULT_FULLSEARCH,
        ...req.vQuery,
        appId,
      });

      return data;
    },
    handlerOptions: {
      requireApiKey: true,
      requireAppSignature: true,
      controller: controllerNames.webhookHistory.list.name,
    },
  },
  {
    path: webhookHistoryPaths.retry,
    method: 'post',
    middlewares: [
      ValidateApiKey(EApiKeyType.WEBHOOK),
      ValidateDto([{ dto: DtoWebhookHistoryRetry, type: EValidateDtoType.PARAM }]),
    ],
    handler: async (req: TRequestAuth<{}, {}, DtoWebhookHistoryRetry>) => {
      const { webhookHistoryController } = getController();

      const { id } = req.vParam;

      const data = await webhookHistoryController.retry({ webhookHistoryId: id });

      return data;
    },
    handlerOptions: {
      requireApiKey: true,
      requireAppSignature: true,
      controller: controllerNames.webhookHistory.retry.name,
    },
  },
]);
