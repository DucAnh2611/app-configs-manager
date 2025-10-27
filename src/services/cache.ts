import { getRedis, Redis } from '../libs';

export class CacheService {
  private readonly cache: Redis;

  constructor() {
    this.cache = getRedis();
  }

  async set(key: string, value: any, ttlSeconds: number = 60) {
    await this.cache.set(key, JSON.stringify(value));
    if (ttlSeconds) await this.cache.expire(key, ttlSeconds);
  }

  async get<T = any>(key: string): Promise<T | null> {
    const raw = await this.cache.get(key);
    if (!raw) return null;

    let parsed: any;

    if (typeof raw === 'string') {
      parsed = JSON.parse(raw);
    } else if (Buffer.isBuffer(raw)) {
      parsed = JSON.parse((raw as Buffer).toString())[0];
    } else {
      parsed = raw;
    }

    return parsed as T;
  }

  async delete(key: string) {
    await this.cache.del(key);
  }
}
