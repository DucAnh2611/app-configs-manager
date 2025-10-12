import { env } from '../libs';

export const REDIS_CONFIG = {
  HOST: env.REDIS_HOST || 'localhost',
  PORT: env.REDIS_PORT || 6379,
  PASSWORD: env.REDIS_PASSWORD || '',
};
