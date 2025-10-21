import { Repository } from 'typeorm';
import { AppDataSource, WebhookEntity, IWebhook } from '../db';

export type WebhookRepository = Repository<IWebhook>;

export const webhookRepository = AppDataSource.getRepository(WebhookEntity);