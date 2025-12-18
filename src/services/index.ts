import { getRedis } from '../libs';
import {
  apiKeyRepository,
  appRepository,
  configRepository,
  keyRepository,
  webhookRepository,
  webhoookHistoryRepository,
} from '../repositories';
import { ApiKeyService } from './api-key';
import { AppService } from './app';
import { CacheService } from './cache';
import { ConfigService } from './config';
import { CronService } from './cron';
import { KeyService } from './key';
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
  keyService: KeyService;
};

let services: Services | null = null;

export const initServices = () => {
  const cacheService = new CacheService();
  const queueService = new QueueService(getRedis());
  const cronService = new CronService(queueService);

  const keyService = new KeyService(keyRepository, cacheService);
  const webhookHistoryService = new WebhookHistoryService(
    webhoookHistoryRepository,
    configRepository,
    keyService,
    queueService
  );
  const configService = new ConfigService(configRepository, cacheService, keyService, queueService);
  const webhookService = new WebhookService(
    webhookRepository,
    keyService,
    webhookHistoryService,
    configService,
    cacheService
  );
  const appService = new AppService(appRepository, cacheService, configService);
  const apiKeyService = new ApiKeyService(
    apiKeyRepository,
    appService,
    keyService,
    cacheService,
    configService
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
    keyService,
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
  KeyService,
  QueueService,
  WebhookHistoryService,
  WebhookService
};

