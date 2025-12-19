import { beforeAll } from 'vitest';
import { AppDataSource } from '../db';
import { connectRedis, getRedis } from '../libs';
import { initServices } from '../services';

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  try {
    getRedis();
  } catch {
    await connectRedis();
  }

  initServices();
});
