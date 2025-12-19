import { beforeAll } from 'vitest';
import { AppDataSource } from '../db';
import { connectRedis } from '../libs';
import { initServices } from '../services';

beforeAll(async () => {
  await AppDataSource.initialize();
  await connectRedis();

  initServices();
});
