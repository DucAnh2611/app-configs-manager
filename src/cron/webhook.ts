import { Job } from 'bullmq';
import { CRON_CONSTANTS, QUEUE_CONSTANTS } from '../constants/queue';
import { Services } from '../services';
import { IWebhookHistory, TWebhookServiceTrigger } from '../types';

export const registerWebhookCronJob = (services: Services) => {
  registerWebhookCall(services);

  registerWebhookClean(services);

  registerWebhookOnChangeConfigTrigger(services);
};

const registerWebhookCall = (services: Services) => {
  services.cronService.registerDynamicJob({
    name: QUEUE_CONSTANTS.NAME.WEBHOOK_HISTORY_CALL,
    register: services.webhookHistoryService.registerCall.bind(services.webhookHistoryService),
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
    register: services.webhookHistoryService.registerClean.bind(services.webhookHistoryService),
    workerHandler: async (job: Job<IWebhookHistory[]>) => {
      await services.webhookHistoryService.clean.apply(services.webhookHistoryService, [job.data]);
    },
    expression: CRON_CONSTANTS.EXPRESSION.WEBHOOK_HISTORY_CLEAN,
    concurrency: QUEUE_CONSTANTS.CONCURRENCY.WEBHOOK_HISTORY_CLEAN,
  });
};

const registerWebhookOnChangeConfigTrigger = (services: Services) => {
  services.cronService.registerDynamicJob({
    name: QUEUE_CONSTANTS.NAME.WEBHOOK_ON_CHANGE_CONFIG_TRIGGER,
    workerHandler: async (job: Job<TWebhookServiceTrigger>) => {
      await services.webhookService.trigger.apply(services.webhookService, [job.data]);
    },
    concurrency: QUEUE_CONSTANTS.CONCURRENCY.WEBHOOK_ON_CHANGE_CONFIG_TRIGGER,
  });
};
