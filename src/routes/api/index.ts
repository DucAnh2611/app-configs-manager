import { Router } from 'express';
import { ApiKeyRouter } from './api-key';
import { AppRouter } from './app';
import { ConfigRouter } from './config';

export const ApiRoutes = Router();

ApiRoutes.use('/api-key', ApiKeyRouter);
ApiRoutes.use('/app', AppRouter);
ApiRoutes.use('/config', ConfigRouter);
