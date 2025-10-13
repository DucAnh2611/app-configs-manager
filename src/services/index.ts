import { apiKeyRepository, appRepository } from '../repositories';
import { ApiKeyService } from './api-key';
import { AppService } from './app';
import { CacheService } from './cache';

export type Services = {
  cacheService: CacheService;
  appService: AppService;
  apiKeyService: ApiKeyService;
};

let services: Services | null = null;

export const initServices = async () => {
  const cacheService = new CacheService();
  const appService = new AppService(appRepository, cacheService);
  const apiKeyService = new ApiKeyService(apiKeyRepository, appService);

  services = {
    apiKeyService,
    cacheService,
    appService,
  };
};

export const getServices = () => {
  if (!services) throw new Error('Service is not init!');

  return services;
};

export type { AppService, ApiKeyService, CacheService };
