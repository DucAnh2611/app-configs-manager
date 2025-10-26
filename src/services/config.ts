import { COMMON_CONFIG } from '../configs';
import { APP_CONSTANTS } from '../constants';
import { EErrorCode, EResponseStatus } from '../enums';
import { CacheKeyGenerator, decrypt, encrypt, Exception } from '../helpers';
import { ConfigRepository } from '../repositories';
import {
  IApp,
  TConfigDecoded,
  TConfigServiceBulkUp,
  TConfigServiceGet,
  TConfigServiceHistory,
  TConfigServiceRemove,
  TConfigServiceRollback,
  TConfigServiceToggleUse,
  TConfigServiceUp,
} from '../types';
import { CacheService } from './cache';

export class ConfigService {
  constructor(
    private readonly configRepository: ConfigRepository,
    private readonly cacheService: CacheService
  ) {}

  public async history(dto: TConfigServiceHistory) {
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
        isUse: 'DESC',
        version: 'DESC',
      },
    });

    return configs;
  }

  public async get(dto: TConfigServiceGet): Promise<TConfigDecoded> {
    const cacheKey = CacheKeyGenerator.config(dto.appCode, dto.appNamespace);
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

    const result = {
      ...config,
      configs: this.safeConfig(this.decryptConfig(config.configs)),
    } as TConfigDecoded;

    await this.cacheService.set(cacheKey, result);

    return result;
  }

  public async up(dto: TConfigServiceUp) {
    const newVersion = await this.getNewVersion(dto.appId, dto.namespace);

    await this.unusePreviousVersion(dto.appId, dto.namespace);

    const newConfig = await this.configRepository.save({
      appId: dto.appId,
      namespace: dto.namespace,
      isUse: true,
      configs: this.encryptConfig(this.safeConfig(dto.configs)),
      version: newVersion,
    });

    const result = { ...newConfig, configs: this.decryptConfig(newConfig.configs) };

    const cacheKey = CacheKeyGenerator.config(dto.appId, dto.namespace);
    await this.cacheService.set(cacheKey, result);
    return result;
  }

  public async toggleUse(dto: TConfigServiceToggleUse) {
    const config = await this.configRepository.findOne({
      where: { id: dto.configId, appId: dto.appId },
    });

    if (!config) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.CONFIG_NOT_EXIST);
    }

    if (!config.isUse) await this.unusePreviousVersion(config.appId, config.namespace);

    const toggled = await this.configRepository.update(
      { id: dto.configId, appId: dto.appId },
      { isUse: !config.isUse }
    );

    const cacheKey = CacheKeyGenerator.config(dto.appId, config.namespace);
    const activeConfig = await this.configRepository.findOne({
      where: { appId: dto.appId, namespace: config.namespace, isUse: true },
    });

    if (activeConfig) {
      const cacheValue = { ...activeConfig, configs: this.decryptConfig(activeConfig.configs) };
      await this.cacheService.set(cacheKey, cacheValue);
    } else {
      await this.cacheService.delete(cacheKey);
    }

    return !!toggled.affected;
  }

  public async remove(dto: TConfigServiceRemove) {
    const config = await this.configRepository.findOne({
      where: { id: dto.configId, appId: dto.appId },
    });

    if (!config) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.CONFIG_NOT_EXIST);
    }

    await this.configRepository.softDelete(config.id);

    const cacheKey = CacheKeyGenerator.config(dto.appId, config.namespace);
    await this.cacheService.delete(cacheKey);

    return true;
  }

  public async rollback(dto: TConfigServiceRollback) {
    const config = await this.configRepository.findOne({
      where: { id: dto.configId, appId: dto.appId },
    });

    if (!config) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.CONFIG_NOT_EXIST);
    }

    const newVersion = await this.getNewVersion(dto.appId, config.namespace);
    await this.unusePreviousVersion(dto.appId, config.namespace);

    const { id: _, ...configData } = config;

    const result = await this.configRepository.save({
      ...configData,
      isUse: true,
      version: newVersion,
    });

    const cacheKey = CacheKeyGenerator.config(config.appId, config.namespace);
    await this.cacheService.set(cacheKey, {
      ...result,
      configs: this.decryptConfig(result.configs),
    });

    return true;
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

  private async bulkUp(dtos: TConfigServiceBulkUp[]) {
    const saveConfigs = await Promise.all(
      dtos.map(async (dto) =>
        this.configRepository.create({
          appId: dto.appId,
          configs: this.encryptConfig(this.safeConfig(dto.configs)),
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

  private encryptConfig(config: Record<string, any>) {
    const encypted = encrypt(
      config,
      COMMON_CONFIG.APP_CONFIG_ENCRYPT_SECRET_KEY,
      COMMON_CONFIG.APP_CONFIG_ENCRYPT_BYPES
    );

    return encypted.encryptedPayload;
  }

  private decryptConfig(config: string) {
    const decrypted = decrypt(
      config,
      COMMON_CONFIG.APP_CONFIG_ENCRYPT_SECRET_KEY,
      COMMON_CONFIG.APP_CONFIG_ENCRYPT_BYPES
    );

    return decrypted;
  }

  private safeConfig(config: Record<string, any>) {
    return {
      ...config,
      ...APP_CONSTANTS.DEFAULT_CONFIGS,
    };
  }
}
