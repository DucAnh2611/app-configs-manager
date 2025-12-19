import { Repository } from 'typeorm';
import { AppDataSource, WebhookEntity } from '../db';
import { IWebhook } from '../types';

export type WebhookRepository = Repository<IWebhook>;

export const webhookRepository = AppDataSource.getRepository(WebhookEntity);
