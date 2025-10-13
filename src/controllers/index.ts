import { getServices, initServices } from '../services';
import { ApiKeyController } from './api-key';
import { AppController } from './app';

export type Controllers = {
  apiKeyController: ApiKeyController;
  appController: AppController;
};

let controllers: Controllers | null = null;

export const initControllers = async () => {
  initServices();

  const { apiKeyService, appService } = getServices();

  const apiKeyController = new ApiKeyController(apiKeyService);
  const appController = new AppController(appService);

  controllers = {
    apiKeyController,
    appController,
  };
};

export const getController = () => {
  if (!controllers) throw new Error('Controller is not init!');

  return controllers;
};
