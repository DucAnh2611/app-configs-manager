import express from 'express';
import { ROUTE_PATHS } from './constants';
import { initControllers } from './controllers';
import { initCronJob } from './cron';
import { AppDataSource } from './db';
import { EErrorCode, EResponseStatus } from './enums';
import { Exception } from './helpers';
import { connectRedis, env, logger } from './libs';
import { ErrorHandler, ResponseHandler } from './middlewares';
import { ApiRouter, WebhookRouter } from './routes';
import { initServices } from './services';

async function main() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  await AppDataSource.initialize();
  await connectRedis();

  initServices();
  initControllers();

  initCronJob();

  const appPaths = ROUTE_PATHS;

  app.get(appPaths.base, (req, res) => {
    res.json({ message: 'App configurations is running 🚀' });
  });

  app.get(appPaths.ping.base, (req, res) => {
    res.json({ message: 'Hello from API' });
  });

  app.use(appPaths.webhook.base, WebhookRouter);

  app.use(appPaths.api.base, ApiRouter, ResponseHandler());

  app.all(appPaths.any, () => {
    throw new Exception(EResponseStatus.NotFound, EErrorCode.ROUTE_NOT_SUPPORTED);
  });

  app.use(ErrorHandler());

  const PORT = env.PORT || 4000;

  app.listen(PORT, () => {
    logger.info(`✅ Server is running on http://localhost:${PORT}`);
  });
}

main();
