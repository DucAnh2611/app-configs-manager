import { Repository } from 'typeorm';
import { AppDataSource, WebhookHistoryEntity } from '../db';
import { IWebhookHistory } from '../types';

export type WebhookHistoryRepository = Repository<IWebhookHistory>;

export const webhoookHistoryRepository = AppDataSource.getRepository(WebhookHistoryEntity);
