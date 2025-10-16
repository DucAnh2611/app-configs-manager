import { COMMON_CONFIG } from '../configs';
import { decrypt, encrypt } from '../helpers';
import { ConfigRepository } from '../repositories';

export class ConfigService {
  constructor(private readonly configRepository: ConfigRepository) {}

  public async get() {}

  public async up() {}

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
