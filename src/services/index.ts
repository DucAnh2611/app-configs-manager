import { apiKeyRepository, appRepository, configRepository, webhookRepository } from '../repositories';
import { ApiKeyService } from './api-key';
import { AppService } from './app';
import { CacheService } from './cache';
import { ConfigService } from './config';
import { WebhookService } from './webhook';

export type Services = {
  cacheService: CacheService;
  appService: AppService;
  apiKeyService: ApiKeyService;
  configService: ConfigService;
  webhookService: WebhookService;
};

let services: Services | null = null;

export const initServices = async () => {
  const cacheService = new CacheService();
  const appService = new AppService(
    appRepository,
    cacheService,
    new ConfigService(configRepository)
  );
  const apiKeyService = new ApiKeyService(
    apiKeyRepository,
    appService,
    new ConfigService(configRepository)
  );
  const configService = new ConfigService(configRepository);
  const webhookService = new WebhookService(webhookRepository);

  services = {
    apiKeyService,
    cacheService,
    appService,
    configService,
    webhookService,
  };
};

export const getServices = () => {
  if (!services) throw new Error('Service is not init!');

  return services;
};

export type { ApiKeyService, AppService, CacheService, ConfigService, WebhookService };
