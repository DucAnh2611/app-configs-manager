import { Job } from 'bullmq';
import { CRON_CONSTANTS, QUEUE_CONSTANTS } from '../constants/queue';
import { Services } from '../services';
import { IWebhookHistory } from '../types';

export const registerWebhookCronJob = (services: Services) => {
  registerWebhookCall(services);

  registerWebhookClean(services);
};

const registerWebhookCall = (services: Services) => {
  services.cronService.registerDynamicJob({
    name: QUEUE_CONSTANTS.NAME.WEBHOOK_HISTORY_CALL,
    handler: services.webhookHistoryService.registerCall.bind(services.webhookHistoryService),
    workerHandler: async (job: Job<IWebhookHistory>) => {
      await services.webhookHistoryService.call.apply(services.webhookHistoryService, [job.data]);
    },
    expression: CRON_CONSTANTS.EXPRESSION.WEBHOOK_HISTORY_CALL,
    concurrency: QUEUE_CONSTANTS.CONCURRENCY.WEBHOOK_HISTORY_CALL,
  });
};

const registerWebhookClean = (services: Services) => {
  services.cronService.registerDynamicJob({
    name: QUEUE_CONSTANTS.NAME.WEBHOOK_HISTORY_CLEAN,
    handler: services.webhookHistoryService.registerClean.bind(services.webhookHistoryService),
    workerHandler: async (job: Job<IWebhookHistory[]>) => {
      await services.webhookHistoryService.clean.apply(services.webhookHistoryService, [job.data]);
    },
    expression: CRON_CONSTANTS.EXPRESSION.WEBHOOK_HISTORY_CLEAN,
    concurrency: QUEUE_CONSTANTS.CONCURRENCY.WEBHOOK_HISTORY_CLEAN,
  });
};
