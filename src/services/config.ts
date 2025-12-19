import { In, Not } from 'typeorm';
import { COMMON_CONFIG } from '../configs';
import { APP_CONSTANTS } from '../constants';
import { QUEUE_CONSTANTS } from '../constants/queue';
import { EErrorCode, EResponseStatus, EWebhookTriggerOn, EWebhookTriggerType } from '../enums';
import {
  bindStringFormat,
  CacheKeyGenerator,
  decrypt,
  deepCompare,
  encrypt,
  Exception,
  excludeFields,
  promiseAll,
  randNumber,
  valueOrDefault,
} from '../helpers';
import { ConfigRepository } from '../repositories';
import {
  IConfig,
  TConfigDecoded,
  TConfigRecords,
  TConfigServiceGet,
  TConfigServiceHistory,
  TConfigServiceRemove,
  TConfigServiceRollback,
  TConfigServiceToggleUse,
  TConfigServiceUp,
  TConfigUseCache,
} from '../types';
import { ConfigExtractor, TTransformConfigParams } from '../utils';
import { AppService } from './app';
import { CacheService } from './cache';
import { KeyService } from './key';
import { QueueService } from './queue';

export class ConfigService {
  constructor(
    private readonly configRepository: ConfigRepository,
    private readonly cacheService: CacheService,
    private readonly keyService: KeyService,
    private readonly queueService: QueueService
  ) {}

  public async history(dto: TConfigServiceHistory) {
    const cacheKey = this.getCacheKey(dto, this.history.name);
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const configs = await this.configRepository.find({
      where: { appId: dto.appId, namespace: dto.appNamespace },
      select: {
        id: true,
        isUse: true,
        version: true,
        createdAt: true,
        namespace: false,
        configs: false,
        appId: false,
      },
      order: {
        version: 'DESC',
      },
    });

    const cachedList = await this.cacheList(configs, dto, this.history.name);

    return cachedList;
  }

  public async get(dto: TConfigServiceGet): Promise<TConfigDecoded> {
    const cacheKey = this.getCacheKey(dto);
    const cache = await this.cacheService.get(cacheKey);
    if (cache) {
      return cache;
    }

    const config = await this.configRepository.findOne({
      where: {
        app: { code: AppService.safeCode(dto.appCode) },
        namespace: dto.appNamespace,
        isUse: true,
      },
    });

    if (!config) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.CONFIG_NOT_EXIST);
    }

    const cached = await this.cache(config, dto);

    return cached;
  }

  public async up(dto: TConfigServiceUp) {
    const isEqual = await this.equalCheck(dto.appCode, dto.appNamespace, dto.configs);
    if (isEqual) throw new Exception(EResponseStatus.BadRequest, EErrorCode.CONFIG_HAVE_NO_CHANGES);

    const newVersion = await this.getNewVersion(dto.appId, dto.appNamespace);

    const [{ hashBytes, key, version }] = await promiseAll(
      this.getSecretKey(dto.appId, dto.appNamespace),
      this.unusePreviousVersion(dto.appId, dto.appNamespace)
    );

    const entity = this.configRepository.create({
      appId: dto.appId,
      namespace: dto.appNamespace,
      isUse: true,
      configs: ConfigService.encryptConfig(
        ConfigService.safeConfig(dto.configs),
        version,
        key,
        hashBytes
      ),
      version: newVersion,
    });

    const newConfig = await this.configRepository.save(entity);

    const [cached] = await promiseAll(
      this.cache(newConfig, dto),
      this.triggerWebhookOnChange(newConfig, dto.appCode, EWebhookTriggerType.CHANGE),
      this.cacheService.delete(this.getCacheKey(dto, this.history.name))
    );

    return cached;
  }

  public async toggleUse(dto: TConfigServiceToggleUse) {
    const config = await this.configRepository.findOne({
      where: { id: dto.configId, appId: dto.appId, namespace: dto.appNamespace },
      relations: { app: true },
    });

    if (!config || !config.app) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.CONFIG_NOT_EXIST);
    }

    config.isUse = !config.isUse;

    if (config.isUse) await this.unusePreviousVersion(config.appId, config.namespace);
    else await this.checkNonActive(config.appId, config.namespace, [config.id]);

    await this.configRepository.update(
      { id: dto.configId, appId: dto.appId },
      { isUse: config.isUse }
    );

    const { app, ...configData } = config;

    const [cached] = await Promise.all([
      this.cache(configData, dto),
      this.triggerWebhookOnChange(config, app.code, EWebhookTriggerType.CHANGE),
      this.cacheService.delete(this.getCacheKey(dto, this.history.name)),
    ]);

    return cached;
  }

  public async remove(dto: TConfigServiceRemove) {
    const config = await this.configRepository.findOne({
      where: { id: dto.configId, appId: dto.appId },
      relations: { app: true },
    });

    if (!config || !config.app) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.CONFIG_NOT_EXIST);
    }

    await this.checkNonActive(config.appId, config.namespace, [config.id]);

    config.deletedAt = new Date();

    await this.configRepository.softDelete(config.id);

    const [cached] = await Promise.all([
      this.cache(config, dto),
      this.triggerWebhookOnChange(config, config.app.code, EWebhookTriggerType.REMOVE),
      this.cacheService.delete(this.getCacheKey(dto, this.history.name)),
    ]);

    return cached;
  }

  public async rollback(dto: TConfigServiceRollback) {
    const config = await this.configRepository.findOne({
      where: { id: dto.configId, appId: dto.appId },
      relations: { app: true },
    });

    if (!config || !config.app) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.CONFIG_NOT_EXIST);
    }

    const newVersion = await this.getNewVersion(dto.appId, config.namespace);
    await this.unusePreviousVersion(dto.appId, config.namespace);

    const { id: _, app, ...configData } = config;

    const instance = this.configRepository.create({
      ...configData,
      isUse: true,
      version: newVersion,
    });

    const rollbacked = await this.configRepository.save(instance);

    const [cached] = await Promise.all([
      this.cache(rollbacked, dto),
      this.triggerWebhookOnChange(config, app.code, EWebhookTriggerType.REMOVE),
      this.cacheService.delete(this.getCacheKey(dto, this.history.name)),
    ]);

    return cached;
  }

  public getSystemConfig<T extends Record<string, TTransformConfigParams>>(configSchema: T) {
    return {
      throwOnNull: async <K extends keyof T>(keys: K[]) => {
        const extractor = await this.getExtractor.bind(this)(
          COMMON_CONFIG.APP_CODE,
          COMMON_CONFIG.APP_ENV,
          configSchema
        );
        return extractor.throwOnNull(keys);
      },
      allowNull: async <K extends keyof T>(keys: K[]) => {
        const extractor = await this.getExtractor.bind(this)(
          COMMON_CONFIG.APP_CODE,
          COMMON_CONFIG.APP_ENV,
          configSchema
        );
        return extractor.allowNull(keys);
      },
    };
  }

  private async getExtractor<T extends Record<string, TTransformConfigParams>>(
    appCode: string,
    appNamespace: string,
    configSchema: T
  ) {
    const config = await this.get({
      appCode,
      appNamespace,
    });

    return new ConfigExtractor(ConfigService.safeConfig(config.configs)).select(configSchema);
  }

  private async unusePreviousVersion(appId: string, namespace: string) {
    await this.configRepository.update(
      {
        appId,
        namespace,
        isUse: true,
      },
      { isUse: false }
    );
  }

  private async getNewVersion(appId: string, namespace: string) {
    const currentVersion = await this.configRepository.findOne({
      where: {
        appId,
        namespace,
      },
      order: { version: 'DESC' },
    });

    if (!currentVersion) return 1;
    return currentVersion.version + 1;
  }

  public static encryptConfig(
    config: TConfigRecords,
    keyVersion: number,
    secret: string,
    bytes: number
  ) {
    const encrypted = encrypt(config, secret, bytes).encryptedPayload;

    return bindStringFormat('{keyVersion}_{encrypted}', { keyVersion, encrypted });
  }

  public static getSecretKeyVersion(hashedConfig: string) {
    const [keyVersion, hashed] = hashedConfig.split('_');

    if (!keyVersion || !hashed)
      throw new Exception(EResponseStatus.InternalServerError, EErrorCode.INTERNAL_SERVER);

    return Number(keyVersion);
  }

  public static getHashedTokenConfig(hashedConfig: string) {
    const [keyVersion, hashed] = hashedConfig.split('_');

    if (!keyVersion || !hashed)
      throw new Exception(EResponseStatus.InternalServerError, EErrorCode.INTERNAL_SERVER);

    return hashed;
  }

  public static decryptConfig(config: string, secret: string) {
    return decrypt<TConfigRecords>(config, secret);
  }

  private async getSecretKey(appId: string, namespace: string, version?: number) {
    return this.keyService.getRotateKey({
      type: APP_CONSTANTS.FORMATS.keyType.config(appId, namespace),
      options: {
        version,
        renewOnExpire: true,
        bytes: randNumber({ from: 32, to: 64, decimal: 0 }),
        onGenerateDuration: {
          amount: 60,
          unit: 'seconds',
        },
      },
    });
  }

  public static safeConfig(config: TConfigRecords) {
    return {
      ...APP_CONSTANTS.DEFAULT_CONFIGS,
      ...config,
    } as TConfigRecords;
  }

  private async equalCheck(appCode: string, appNamespace: string, configs: TConfigRecords) {
    const currentConfig = await this.configRepository.findOne({
      where: { app: { code: appCode }, namespace: appNamespace, isUse: true },
    });

    if (!currentConfig) return false;

    const { expiredKey, key } = await this.getSecretKey(
      currentConfig.appId,
      currentConfig.namespace,
      ConfigService.getSecretKeyVersion(currentConfig.configs)
    );

    return deepCompare(
      this.decodeConfig(currentConfig, valueOrDefault(expiredKey?.originKey, key)).configs,
      ConfigService.safeConfig(configs)
    );
  }

  private async checkNonActive(appId: string, namespace: string, excludeIds: string[]) {
    const activeCount = await this.configRepository.count({
      where: {
        appId: appId,
        namespace: namespace,
        id: Not(In(excludeIds)),
        isUse: true,
      },
    });

    if (!activeCount) {
      throw new Exception(EResponseStatus.BadRequest, EErrorCode.CONFIG_HAVE_NO_ACTIVE);
    }
  }

  private getCacheKey(dto: TConfigUseCache, ...parts: Array<string | number>) {
    return CacheKeyGenerator.config(dto.appCode, dto.appNamespace, ...parts);
  }

  private async cacheList(
    configs: IConfig[],
    cache: TConfigUseCache,
    ...extKeys: Array<string | number>
  ) {
    const cacheKey = this.getCacheKey(cache, ...extKeys);

    if (typeof configs !== 'object' || !Array.isArray(configs)) {
      return [];
    }

    await this.cacheService.set(cacheKey, configs);

    return configs;
  }

  private async cache(
    config: IConfig,
    cache: TConfigUseCache,
    ...extKeys: Array<string | number>
  ): Promise<TConfigDecoded> {
    const cacheKey = this.getCacheKey(cache, ...extKeys);
    const { key, expiredKey } = await this.getSecretKey(
      config.appId,
      config.namespace,
      ConfigService.getSecretKeyVersion(config.configs)
    );

    const result = this.decodeConfig(config, valueOrDefault(expiredKey?.originKey, key));

    if (config.isUse) await this.cacheService.set(cacheKey, result);
    else if (!config.isUse || !!config.deletedAt) await this.cacheService.delete(cacheKey);

    return result;
  }

  private decodeConfig(config: IConfig, key: string) {
    return {
      ...config,
      ...(config.configs
        ? {
            configs: ConfigService.decryptConfig(
              ConfigService.getHashedTokenConfig(config.configs),
              key
            ),
          }
        : {}),
    } as TConfigDecoded;
  }

  private async triggerWebhookOnChange(
    data: IConfig,
    appCode: string,
    triggerType: EWebhookTriggerType
  ) {
    const { key, expiredKey } = await this.getSecretKey(
      data.appId,
      data.namespace,
      ConfigService.getSecretKeyVersion(data.configs)
    );

    const decodedConfig = this.decodeConfig(data, valueOrDefault(expiredKey?.originKey, key));

    await this.queueService.addQueue(QUEUE_CONSTANTS.NAME.WEBHOOK_ON_CHANGE_CONFIG_TRIGGER, {
      appCode: appCode,
      appId: data.appId,
      data: excludeFields(decodedConfig, ['app', 'deletedAt']),
      triggerOn: EWebhookTriggerOn.CONFIG,
      triggerType,
    });
  }
}
