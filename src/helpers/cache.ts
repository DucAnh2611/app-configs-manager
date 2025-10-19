import { ECacheKey, CACHE_CONSTANTS } from "../enums/cache";

export class CacheKeyGenerator {
  static config(appId: string, namespace: string): string {
    return `${ECacheKey.CONFIG}_${appId}_${namespace}`;
  }

  static webhookList(appId: string): string {
    return `${ECacheKey.WEBHOOK}_LIST_${appId}`;
  }

  static webhookDetail(webhookId: string): string {
    return `${ECacheKey.WEBHOOK}_DETAIL_${webhookId}`;
  }

  static appDetail(appId: string): string {
    return `${ECacheKey.APP}_DETAIL_${appId}`;
  }

  static apiKey(keyId: string): string {
    return `${ECacheKey.API_KEY}_${keyId}`;
  }

  static custom(...parts: Array<ECacheKey | string | number>): string {
    return parts.join(CACHE_CONSTANTS.KEY_SPLIT);
  }
}
