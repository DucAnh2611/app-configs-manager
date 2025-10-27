import { Router } from 'express';
import { ApiKeyRouter } from './api-key';
import { AppRouter } from './app';
import { ConfigRouter } from './config';
import { WebhookRouter } from './webhook';

export const ApiV1Router = Router();

ApiV1Router.use('/api-key', ApiKeyRouter);
ApiV1Router.use('/app', AppRouter);
ApiV1Router.use('/config', ConfigRouter);
ApiV1Router.use('/webhook', WebhookRouter);
