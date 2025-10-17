import { COMMON_CONFIG } from '../configs';
import { IApp } from '../db';
import { decrypt, encrypt } from '../helpers';
import { ConfigRepository } from '../repositories';
import {
  DtoConfigBulkUp,
  DtoConfigGet,
  DtoConfigHistory,
  DtoConfigRemove,
  DtoConfigRollback,
  DtoConfigToggleUse,
  DtoConfigUp,
  TConfigDecoded,
} from '../types';

export class ConfigService {
  constructor(private readonly configRepository: ConfigRepository) {}

  public async history(dto: DtoConfigHistory) {
    const configs = await this.configRepository.find({
      where: { app: { code: dto.appCode }, namespace: dto.appNamespace },
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

  public async get(dto: DtoConfigGet) {
    const config = await this.configRepository.findOne({
      where: { app: { code: dto.appCode }, namespace: dto.appNamespace },
    });

    if (!config) {
      throw new Error(`Config of ${dto.appCode} not found!`);
    }

    return {
      ...config,
      configs: this.decryptConfig(config.configs),
    } as TConfigDecoded;
  }

  public async up(dto: DtoConfigUp) {
    const newVersion = await this.getNewVersion(dto.appId, dto.namespace);

    await this.unusePreviousVersion(dto.appId, dto.namespace);

    const newConfig = await this.configRepository.save({
      appId: dto.appId,
      namespace: dto.namespace,
      isUse: true,
      configs: this.encryptConfig(dto.configs),
      version: newVersion,
    });

    return newConfig;
  }

  public async toggleUse(dto: DtoConfigToggleUse) {
    const config = await this.configRepository.findOne({ where: { id: dto.configId } });

    if (!config) {
      throw new Error(`Config not found!`);
    }

    await this.unusePreviousVersion(config.appId, config.namespace);

    const toggled = await this.configRepository.update({ id: dto.configId }, { isUse: true });

    return !!toggled.affected;
  }

  public async remove(dto: DtoConfigRemove) {
    const config = await this.configRepository.findOne({ where: { id: dto.configId } });

    if (!config) {
      throw new Error(`Config not found!`);
    }

    await this.configRepository.softDelete(config.id);

    return true;
  }

  public async rollback(dto: DtoConfigRollback) {
    const config = await this.configRepository.findOne({ where: { id: dto.configId } });

    if (!config) {
      throw new Error(`Config not found!`);
    }

    await this.unusePreviousVersion(config.appId, config.namespace);

    await this.configRepository.update({ id: config.id }, { isUse: true });

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
          }) as DtoConfigBulkUp
      )
    );

    return this.bulkUp(bulkUpPayload);
  }

  private async bulkUp(dtos: DtoConfigBulkUp[]) {
    const saveConfigs = await Promise.all(
      dtos.map(async (dto) =>
        this.configRepository.create({
          appId: dto.appId,
          configs: this.encryptConfig(dto.configs),
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
}
