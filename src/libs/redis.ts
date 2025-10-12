import { createClient } from '@redis/client';
import { REDIS_CONFIG } from '../configs';

export type Redis = ReturnType<typeof createClient>;

let client: Redis | null = null;

export const connectRedis = async () => {
  if (!!client) return client;

  client = createClient({
    socket: {
      host: REDIS_CONFIG.HOST,
      port: Number(REDIS_CONFIG.PORT),
      reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
    },
  });

  client.on('connect', () => console.log('✅ Redis connected'));
  client.on('ready', () => console.log('🟢 Redis ready'));
  client.on('error', (err) => console.error('❌ Redis error', err));

  await client.connect();
};

export const getRedis = (): Redis => {
  if (!client) throw new Error('Redis is not init!');

  return client;
};
