import { Repository } from 'typeorm';
import { IWebhook, AppDataSource, WebhookEntity } from '../db';

export type WebhookRepository  = Repository<IWebhook>;

export const webhookRepository  = AppDataSource.getRepository(WebhookEntity);
