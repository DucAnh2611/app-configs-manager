import { getServices } from '../services';
import { ApiKeyController } from './api-key';
import { AppController } from './app';
import { ConfigController } from './config';
import { WebhookController } from './webhook';
import { WebhookHistoryController } from './webhook-history';

export type Controllers = {
  apiKeyController: ApiKeyController;
  appController: AppController;
  configController: ConfigController;
  webhookController: WebhookController;
  webhookHistoryController: WebhookHistoryController;
};

let controllers: Controllers | null = null;

export const initControllers = async () => {
  const { apiKeyService, appService, configService, webhookService, webhookHistoryService } =
    getServices();

  const apiKeyController = new ApiKeyController(apiKeyService);
  const appController = new AppController(appService);
  const configController = new ConfigController(configService);
  const webhookController = new WebhookController(webhookService);
  const webhookHistoryController = new WebhookHistoryController(webhookHistoryService);

  controllers = {
    apiKeyController,
    appController,
    configController,
    webhookController,
    webhookHistoryController,
  };
};

export const getController = () => {
  if (!controllers) throw new Error('Controller is not init!');

  return controllers;
};
