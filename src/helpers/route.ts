import { Router } from 'express';
import { TRoutes } from '../types';
import { routeHandler } from './response';

export const createRouter = (routes: TRoutes[]) => {
  const router = Router();

  for (const route of routes) {
    router[route.method](
      route.path,
      ...route.middlewares,
      routeHandler(route.handler, route.handlerOptions)
    );
  }

  return router;
};
