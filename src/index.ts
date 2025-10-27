import express from 'express';
import { initControllers } from './controllers';
import { initCronJob } from './cron';
import { AppDataSource } from './db';
import { connectRedis, env } from './libs';
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

  app.get('/', (req, res) => {
    res.json({ message: 'App configurations is running 🚀' });
  });

  app.get('/ping', (req, res) => {
    res.json({ message: 'Hello from API' });
  });

  app.use('/webhook', WebhookRouter);

  app.use('/api', ApiRouter, ResponseHandler());

  app.use(ErrorHandler());

  const PORT = env.PORT;

  app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });
}

main();
