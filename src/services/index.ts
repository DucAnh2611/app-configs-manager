import { apiKeyRepository, appRepository, configRepository } from '../repositories';
import { ApiKeyService } from './api-key';
import { AppService } from './app';
import { CacheService } from './cache';
import { ConfigService } from './config';

export type Services = {
  cacheService: CacheService;
  appService: AppService;
  apiKeyService: ApiKeyService;
  configService: ConfigService;
};

let services: Services | null = null;

export const initServices = async () => {
  const cacheService = new CacheService();
  const appService = new AppService(
    appRepository,
    cacheService,
    new ConfigService(configRepository, cacheService)
  );
  const apiKeyService = new ApiKeyService(
    apiKeyRepository,
    appService,
    new ConfigService(configRepository, cacheService)
  );
  const configService = new ConfigService(configRepository, cacheService);

  services = {
    apiKeyService,
    cacheService,
    appService,
    configService,
  };
};

export const getServices = () => {
  if (!services) throw new Error('Service is not init!');

  return services;
};

export type { ApiKeyService, AppService, CacheService, ConfigService };
