import { getServices, initServices } from '../services';
import { ApiKeyController } from './api-key';
import { AppController } from './app';
import { ConfigController } from './config';

export type Controllers = {
  apiKeyController: ApiKeyController;
  appController: AppController;
  configController: ConfigController;
};

let controllers: Controllers | null = null;

export const initControllers = async () => {
  initServices();

  const { apiKeyService, appService, configService } = getServices();

  const apiKeyController = new ApiKeyController(apiKeyService);
  const appController = new AppController(appService);
  const configController = new ConfigController(configService);

  controllers = {
    apiKeyController,
    appController,
    configController,
  };
};

export const getController = () => {
  if (!controllers) throw new Error('Controller is not init!');

  return controllers;
};
