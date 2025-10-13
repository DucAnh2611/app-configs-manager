import { Router } from 'express';
import { ApiKeyRouter } from './api-key';
import { AppRouter } from './app';

export const ApiRoutes = Router();

ApiRoutes.use('/api-key', ApiKeyRouter);
ApiRoutes.use('/app', AppRouter);
