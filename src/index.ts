import express from 'express';
import { AppDataSource } from './db';
import { ApiRoutes } from './routes/api';
import { connectRedis } from './libs';

async function main() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  await AppDataSource.initialize();
  await connectRedis();

  app.get('/', (req, res) => {
    res.json({ message: 'App configurations is running 🚀' });
  });

  app.get('/ping', (req, res) => {
    res.json({ message: 'Hello from API' });
  });

  app.use('/api', ApiRoutes);

  const PORT = 4000;

  app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });
}

main();
