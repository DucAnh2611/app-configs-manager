export const CACHE_KEYS = {
  CONFIG: 'CONFIG',
  WEBHOOK: 'WEBHOOK',
  APP: 'APP',
  API_KEY: 'API_KEY',
} as const;

export class CacheKeyGenerator {
  static config(appId: string, namespace: string): string {
    return `${CACHE_KEYS.CONFIG}_${appId}_${namespace}`;
  }

  static webhookList(appId: string): string {
    return `${CACHE_KEYS.WEBHOOK}_LIST_${appId}`;
  }

  static webhookDetail(webhookId: string): string {
    return `${CACHE_KEYS.WEBHOOK}_DETAIL_${webhookId}`;
  }

  static appDetail(appId: string): string {
    return `${CACHE_KEYS.APP}_DETAIL_${appId}`;
  }

  static apiKey(keyId: string): string {
    return `${CACHE_KEYS.API_KEY}_${keyId}`;
  }

  static custom(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}_${parts.join('_')}`;
  }
}
