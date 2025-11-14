import { Router } from 'express';
import { ROUTE_PATHS } from '../../constants';
import { TestRouter } from './test';

export const WebhookRouter = Router();

const webhookPaths = ROUTE_PATHS.webhook;

WebhookRouter.use(webhookPaths.test.base, TestRouter);
