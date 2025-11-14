import { Redis } from '../libs';

export const rateLimit = async (redis: Redis, key: string, limit: number, windowSec: number) => {
  const now = Date.now();
  const windowStart = now - windowSec * 1000;

  const redisKey = `ratelimit:${key}`;

  await redis.zremrangebyscore(redisKey, 0, windowStart);
  const count = await redis.zcard(redisKey);

  if (count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  await redis.zadd(redisKey, now, `${now}`);
  await redis.expire(redisKey, windowSec);

  return { allowed: true, remaining: limit - count - 1 };
};
