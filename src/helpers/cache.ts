import { CACHE_CONSTANTS } from '../constants';
import { ECacheKey } from '../enums';

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

  static apiKeyList(appCode: string): string {
    return `${ECacheKey.API_KEY_LIST}_${appCode}`;
  }

  static apiKeyValidate(appCode: string, type: string): string {
    return `${ECacheKey.API_KEY_VALIDATE}_${appCode}_${type}`;
  }

  static custom(...parts: Array<ECacheKey | string | number>): string {
    return parts.join(CACHE_CONSTANTS.KEY_SPLIT);
  }
}
