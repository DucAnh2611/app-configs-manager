import { getServices } from '../services';
import { ApiKeyController } from './api-key';
import { AppController } from './app';
import { ConfigController } from './config';
import { WebhookController } from './webhook';

export type Controllers = {
  apiKeyController: ApiKeyController;
  appController: AppController;
  configController: ConfigController;
  webhookController: WebhookController;
};

let controllers: Controllers | null = null;

export const initControllers = async () => {
  const { apiKeyService, appService, configService, webhookService } = getServices();

  const apiKeyController = new ApiKeyController(apiKeyService);
  const appController = new AppController(appService);
  const configController = new ConfigController(configService);
  const webhookController = new WebhookController(webhookService);

  controllers = {
    apiKeyController,
    appController,
    configController,
    webhookController,
  };
};

export const getController = () => {
  if (!controllers) throw new Error('Controller is not init!');

  return controllers;
};
