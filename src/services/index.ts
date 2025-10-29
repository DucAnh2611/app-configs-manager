import { getRedis } from '../libs';
import {
  apiKeyRepository,
  appRepository,
  configRepository,
  webhookRepository,
  webhoookHistoryRepository,
} from '../repositories';
import { ApiKeyService } from './api-key';
import { AppService } from './app';
import { CacheService } from './cache';
import { ConfigService } from './config';
import { CronService } from './cron';
import { QueueService } from './queue';
import { WebhookService } from './webhook';
import { WebhookHistoryService } from './webhook-history';

export type Services = {
  cacheService: CacheService;
  appService: AppService;
  apiKeyService: ApiKeyService;
  configService: ConfigService;
  webhookService: WebhookService;
  webhookHistoryService: WebhookHistoryService;
  queueService: QueueService;
  cronService: CronService;
};

let services: Services | null = null;

export const initServices = async () => {
  const cacheService = new CacheService();
  const queueService = new QueueService(getRedis());
  const cronService = new CronService(queueService);

  const webhookHistoryService = new WebhookHistoryService(
    webhoookHistoryRepository,
    configRepository,
    queueService
  );
  const webhookService = new WebhookService(
    webhookRepository,
    configRepository,
    webhookHistoryService,
    cacheService
  );
  const configService = new ConfigService(configRepository, cacheService, webhookService);
  const appService = new AppService(appRepository, cacheService, configService);
  const apiKeyService = new ApiKeyService(
    apiKeyRepository,
    appService,
    configService,
    cacheService
  );
  services = {
    apiKeyService,
    cacheService,
    appService,
    configService,
    webhookService,
    webhookHistoryService,
    queueService,
    cronService,
  };
};

export const getServices = () => {
  if (!services) throw new Error('Service is not init!');

  return services;
};

export type {
  ApiKeyService,
  AppService,
  CacheService,
  ConfigService,
  CronService,
  QueueService,
  WebhookHistoryService,
  WebhookService
};

