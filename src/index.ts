import express from 'express';
import { initControllers } from './controllers';
import { AppDataSource } from './db';
import { connectRedis, env } from './libs';
import { ApiRouter } from './routes/api';

async function main() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  await AppDataSource.initialize();
  await connectRedis();
  initControllers();

  app.get('/', (req, res) => {
    res.json({ message: 'App configurations is running 🚀' });
  });

  app.get('/ping', (req, res) => {
    res.json({ message: 'Hello from API' });
  });

  app.use('/api', ApiRouter);

  const PORT = env.PORT;

  app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });
}

main();
