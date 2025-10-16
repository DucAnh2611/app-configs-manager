import { COMMON_CONFIG } from '../configs';
import { IApp } from '../db';
import { decrypt, encrypt } from '../helpers';
import { ConfigRepository } from '../repositories';
import { DtoConfigUp } from '../types';

export class ConfigService {
  constructor(private readonly configRepository: ConfigRepository) {}

  public async get() {}

  public async up() {}

  public async migrate(apps: IApp[]) {
    const bulkUpPayload = apps.map(
      (app) =>
        ({
          appId: app.id,
          configs: app.configs,
          namespace: 'dev',
          version: 1,
          isUse: true,
        }) as DtoConfigUp
    );

    return this.bulkUp(bulkUpPayload);
  }

  private async bulkUp(dtos: DtoConfigUp[]) {
    const saveConfigs = dtos.map((dto) =>
      this.configRepository.create({
        appId: dto.appId,
        configs: this.encryptConfig(dto.configs),
        isUse: dto.isUse,
        namespace: dto.namespace,
        version: dto.version,
      })
    );

    return this.configRepository.save(saveConfigs);
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
