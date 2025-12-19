import { Router } from 'express';
import { ROUTE_PATHS } from '../../../constants';
import { ApiKeyRouter } from './api-key';
import { AppRouter } from './app';
import { ConfigRouter } from './config';
import { WebhookRouter } from './webhook';
import { WebhookHistoryRouter } from './webhook-history';

export const ApiV1Router = Router();

const apiV1paths = ROUTE_PATHS.api.v1;

ApiV1Router.use(apiV1paths.apiKey.base, ApiKeyRouter);
ApiV1Router.use(apiV1paths.app.base, AppRouter);
ApiV1Router.use(apiV1paths.config.base, ConfigRouter);
ApiV1Router.use(apiV1paths.webhook.base, WebhookRouter);
ApiV1Router.use(apiV1paths.webhookHistory.base, WebhookHistoryRouter);
