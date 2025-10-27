import { Router } from 'express';
import { TestRouter } from './test';

export const WebhookRouter = Router();

WebhookRouter.use('/test', TestRouter);
