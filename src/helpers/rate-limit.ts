import { type Redis } from '../libs';

/**
 * Rate Limit Helper
 *
 * Provides utility to check and enforce rate limits using a Redis-backed sliding window.
 *
 * @function checkRateLimit
 * @param {Redis} redis - Redis client instance for storing request timestamps.
 * @param {string} key - Unique identifier for the client/user/IP for rate limiting.
 * @param {number} limit - Maximum number of allowed requests in the given window.
 * @param {number} windowSec - Length of the rate limit window in seconds.
 * @returns {Promise<{ allowed: boolean; remaining: number }>} - Indicates if the request is allowed and how many requests remain.
 *
 * @description
 * The function `checkRateLimit` implements a sliding window rate limitation mechanism using Redis sorted sets.
 * Each request's timestamp is stored in a sorted set keyed by the provided identifier.
 * Requests older than the current window are removed,
 * and the function checks how many requests have been made within the window.
 * If the limit is exceeded, further requests are blocked until the window elapses.
 *
 * Typical usage (see: src/middlewares/rate-limit-handler.ts) involves invoking this helper
 * before processing requests, commonly in an Express middleware.
 *
 * Example:
 * ```ts
 *   const result = await checkRateLimit(redis, req.ip, 10, 60);
 *   if (!result.allowed) {
 *     // Return an error response or apply further logic
 *   }
 * ```
 */
export const checkRateLimit = async (
  redis: Redis,
  key: string,
  limit: number,
  windowSec: number
) => {
  const now = Date.now();
  const windowStart = now - windowSec * 1000;

  const redisKey = `ratelimit:${key}`;
  const lua = `
    redis.call('zremrangebyscore', KEYS[1], 0, ARGV[1])
    local count = redis.call('zcard', KEYS[1])
    return count
  `;
  const count = (await redis.eval(lua, 1, redisKey, windowStart)) as number;

  if (count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  await redis.zadd(redisKey, now, `${now}`);
  await redis.expire(redisKey, windowSec);

  return { allowed: true, remaining: limit - count - 1 };
};
