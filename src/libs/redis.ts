import IORedis from 'ioredis';
import { REDIS_CONFIG } from '../configs';

export type Redis = IORedis;

let client: Redis | null = null;

export const connectRedis = async () => {
  if (!!client) return client;

  client = new IORedis({
    host: REDIS_CONFIG.HOST,
    port: Number(REDIS_CONFIG.PORT),
    maxRetriesPerRequest: null,
  });

  client.on('connect', () => console.log('✅ Redis connected'));
  client.on('ready', () => console.log('🟢 Redis ready'));
  client.on('error', (err) => console.error('❌ Redis error', err));

  await new Promise<void>((resolve, reject) => {
    client!.once('ready', resolve);
    client!.once('error', reject);
  });
};

export const getRedis = (): Redis => {
  if (!client) throw new Error('Redis is not init!');

  return client;
};
