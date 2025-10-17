import { getServices, initServices } from '../services';
import { ApiKeyController } from './api-key';
import { AppController } from './app';
import { WebhookController } from './webhook';

export type Controllers = {
  apiKeyController: ApiKeyController;
  appController: AppController;
  webhookController: WebhookController;
};

let controllers: Controllers | null = null;

export const initControllers = async () => {
  initServices();

  const { apiKeyService, appService, webhookService } = getServices();

  const apiKeyController = new ApiKeyController(apiKeyService);
  const appController = new AppController(appService);
  const webhookController = new WebhookController(webhookService);

  controllers = {
    apiKeyController,
    appController,
    webhookController,
  };
};

export const getController = () => {
  if (!controllers) throw new Error('Controller is not init!');

  return controllers;
};
