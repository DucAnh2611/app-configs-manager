import { In, Not } from 'typeorm';
import { COMMON_CONFIG } from '../configs';
import { APP_CONSTANTS } from '../constants';
import { EErrorCode, EResponseStatus, EWebhookTriggerOn, EWebhookTriggerType } from '../enums';
import { CacheKeyGenerator, decrypt, encrypt, Exception, excludeFields } from '../helpers';
import { ConfigRepository } from '../repositories';
import {
  IApp,
  IConfig,
  TConfigDecoded,
  TConfigServiceBulkUp,
  TConfigServiceGet,
  TConfigServiceHistory,
  TConfigServiceRemove,
  TConfigServiceRollback,
  TConfigServiceToggleUse,
  TConfigServiceUp,
  TConfigUseCache,
} from '../types';
import { CacheService } from './cache';
import { WebhookService } from './webhook';

export class ConfigService {
  constructor(
    private readonly configRepository: ConfigRepository,
    private readonly cacheService: CacheService,
    private readonly webhookService: WebhookService
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
      where: { app: { code: dto.appCode }, namespace: dto.appNamespace, isUse: true },
    });

    if (!config) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.CONFIG_NOT_EXIST);
    }

    const cached = await this.cache(config, dto);

    return cached;
  }

  public async up(dto: TConfigServiceUp) {
    const newVersion = await this.getNewVersion(dto.appId, dto.appNamespace);

    await this.unusePreviousVersion(dto.appId, dto.appNamespace);

    const entity = this.configRepository.create({
      appId: dto.appId,
      namespace: dto.appNamespace,
      isUse: true,
      configs: ConfigService.encryptConfig(ConfigService.safeConfig(dto.configs)),
      version: newVersion,
    });

    const newConfig = await this.configRepository.save(entity);

    const [cached] = await Promise.all([
      this.cache(newConfig, dto),
      this.triggerWebhookOnChange(newConfig, dto.appCode, dto.appId, EWebhookTriggerType.CHANGE),
      this.cacheService.delete(this.getCacheKey(dto, this.history.name)),
    ]);

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
      this.triggerWebhookOnChange(
        config,
        config.app.code,
        config.appId,
        EWebhookTriggerType.CHANGE
      ),
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
      this.triggerWebhookOnChange(
        config,
        config.app.code,
        config.appId,
        EWebhookTriggerType.REMOVE
      ),
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
      this.triggerWebhookOnChange(
        config,
        config.app.code,
        config.appId,
        EWebhookTriggerType.REMOVE
      ),
      this.cacheService.delete(this.getCacheKey(dto, this.history.name)),
    ]);

    return cached;
  }

  public async migrate(apps: IApp[]) {
    const bulkUpPayload = await Promise.all(
      apps.map(
        async (app) =>
          ({
            appId: app.id,
            configs: app.configs,
            namespace: 'dev',
            isUse: true,
            version: await this.getNewVersion(app.id, 'dev'),
          }) as TConfigServiceBulkUp
      )
    );

    const result = await this.bulkUp(bulkUpPayload);

    await Promise.all(
      apps.map((app) => {
        const cacheKey = CacheKeyGenerator.config(app.id, 'dev');
        return this.cacheService.delete(cacheKey);
      })
    );

    return result;
  }

  public async getSystemConfig() {
    const config = await this.get({
      appCode: COMMON_CONFIG.APP_CODE,
      appNamespace: COMMON_CONFIG.APP_ENV,
    });

    return ConfigService.safeConfig(config.configs);
  }

  private async bulkUp(dtos: TConfigServiceBulkUp[]) {
    const saveConfigs = await Promise.all(
      dtos.map(async (dto) =>
        this.configRepository.create({
          appId: dto.appId,
          configs: await ConfigService.encryptConfig(ConfigService.safeConfig(dto.configs)),
          isUse: dto.isUse,
          namespace: dto.namespace,
          version: dto.version,
        })
      )
    );

    return this.configRepository.save(saveConfigs);
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

  public static encryptConfig(config: Record<string, any>) {
    const encypted = encrypt(
      config,
      COMMON_CONFIG.APP_CONFIG_ENCRYPT_SECRET_KEY,
      COMMON_CONFIG.APP_CONFIG_ENCRYPT_BYPES
    );

    return encypted.encryptedPayload;
  }

  public static decryptConfig(config: string) {
    const decrypted = decrypt(
      config,
      COMMON_CONFIG.APP_CONFIG_ENCRYPT_SECRET_KEY,
      COMMON_CONFIG.APP_CONFIG_ENCRYPT_BYPES
    );

    return decrypted;
  }

  public static safeConfig(config: Record<string, any>) {
    return {
      ...config,
      ...APP_CONSTANTS.DEFAULT_CONFIGS,
    };
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
  ): Promise<TConfigDecoded[]> {
    const cacheKey = this.getCacheKey(cache, ...extKeys);

    if (typeof configs !== 'object' || !Array.isArray(configs)) {
      return [];
    }

    const decoded = configs.map(this.decodeConfig);

    await this.cacheService.set(cacheKey, decoded);
    return decoded;
  }

  private async cache(
    config: IConfig,
    cache: TConfigUseCache,
    ...extKeys: Array<string | number>
  ): Promise<TConfigDecoded> {
    const cacheKey = this.getCacheKey(cache, ...extKeys);
    const result = this.decodeConfig(config);

    if (config.isUse) await this.cacheService.set(cacheKey, result);
    else if (!config.isUse || !!config.deletedAt) await this.cacheService.delete(cacheKey);

    return result;
  }

  private decodeConfig(config: IConfig) {
    return {
      ...config,
      ...(config.configs ? { configs: ConfigService.decryptConfig(config.configs) } : {}),
    } as TConfigDecoded;
  }

  private async triggerWebhookOnChange(
    data: IConfig,
    appCode: string,
    appId: string,
    triggerType: EWebhookTriggerType
  ) {
    await this.webhookService.trigger({
      appCode: appCode,
      appId: appId,
      data: excludeFields(this.decodeConfig(data), ['app', 'deletedAt']),
      triggerOn: EWebhookTriggerOn.CONFIG,
      triggerType,
    });
  }
}
