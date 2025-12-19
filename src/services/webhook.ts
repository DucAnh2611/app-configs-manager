import { APP_CONSTANTS } from '../constants';
import { EErrorCode, EKeyBytesMode, EResponseStatus } from '../enums';
import {
  EWebhookBodyType,
  EWebhookMethod,
  EWebhookTriggerOn,
  EWebhookTriggerType,
} from '../enums/webhook';
import {
  CacheKeyGenerator,
  decrypt,
  encrypt,
  Exception,
  excludeFields,
  promiseAll,
  valueOrDefault,
} from '../helpers';
import { WebhookRepository } from '../repositories';
import {
  TWebhookServiceDelete,
  TWebhookServiceGet,
  TWebhookServiceList,
  TWebhookServiceRegister,
  TWebhookServiceToggle,
  TWebhookServiceTrigger,
  TWebhookServiceUpdate,
} from '../types';
import { ConfigExtractorTransform } from '../utils';
import { CacheService } from './cache';
import { ConfigService } from './config';
import { KeyService } from './key';
import { WebhookHistoryService } from './webhook-history';

export class WebhookService {
  constructor(
    private readonly webhookRepository: WebhookRepository,
    private readonly keyService: KeyService,
    private readonly webhookHistoryService: WebhookHistoryService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService
  ) {}

  public async register(dto: TWebhookServiceRegister) {
    const existing = await this.webhookRepository.findOne({
      where: {
        appId: dto.appId,
        triggerType: dto.triggerType,
        triggerOn: dto.triggerOn,
        targetUrl: dto.targetUrl,
      },
    });

    if (existing) {
      throw new Exception(EResponseStatus.BadRequest, EErrorCode.WEBHOOK_ALREADY_EXIST);
    }

    const webhook = await this.webhookRepository.save({
      appId: dto.appId,
      name: dto.name,
      triggerType: dto.triggerType || EWebhookTriggerType.CHANGE,
      triggerOn: dto.triggerOn,
      targetUrl: dto.targetUrl,
      method: dto.method,
      authKey: !!dto.authKey?.trim()
        ? await this.encryptAuthKey(dto.authKey, dto.appCode, dto.appNamespace)
        : null,
      bodyType: dto.bodyType || EWebhookBodyType.JSON,
      isActive: false,
    });

    await promiseAll([
      this.cacheService.delete(CacheKeyGenerator.webhookList(dto.appId)),
      this.cacheService.delete(CacheKeyGenerator.webhookDetail(webhook.id)),
    ]);

    return webhook;
  }

  public async update(dto: TWebhookServiceUpdate) {
    const webhook = await this.webhookRepository.findOne({
      where: { id: dto.id, appId: dto.appId },
    });

    if (!webhook) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.WEBHOOK_NOT_EXIST);
    }

    const updated = await this.webhookRepository.update(
      { id: dto.id },
      {
        name: dto.name ?? webhook.name,
        triggerType: (dto.triggerType as EWebhookTriggerType) ?? webhook.triggerType,
        triggerOn: (dto.triggerOn as EWebhookTriggerOn) ?? webhook.triggerOn,
        targetUrl: dto.targetUrl ?? webhook.targetUrl,
        method: (dto.method as EWebhookMethod) ?? webhook.method,
        authKey: !!dto.authKey
          ? await this.encryptAuthKey(dto.authKey, dto.appCode, dto.appNamespace)
          : null,
        bodyType: (dto.bodyType as EWebhookBodyType) ?? webhook.bodyType,
      }
    );

    await promiseAll([
      this.cacheService.delete(CacheKeyGenerator.webhookList(dto.appId)),
      this.cacheService.delete(CacheKeyGenerator.webhookDetail(dto.id)),
    ]);

    return !!updated.affected;
  }

  public async list(dto: TWebhookServiceList) {
    const cacheKey = CacheKeyGenerator.webhookList(dto.appId);
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const webhooks = await this.webhookRepository.find({
      where: { appId: dto.appId },
      select: {
        id: true,
        name: true,
        appId: true,
        triggerType: true,
        triggerOn: true,
        targetUrl: true,
        method: true,
        bodyType: true,
        isActive: true,
        authKey: false,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.cacheService.set(cacheKey, webhooks, 300);

    return webhooks;
  }

  public async toggle(dto: TWebhookServiceToggle) {
    const webhook = await this.webhookRepository.findOne({
      where: { id: dto.id, appId: dto.appId },
    });

    if (!webhook) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.WEBHOOK_NOT_EXIST);
    }

    const updated = await this.webhookRepository.update(
      { id: dto.id },
      { isActive: !webhook.isActive }
    );

    await promiseAll([
      this.cacheService.delete(CacheKeyGenerator.webhookList(dto.appId)),
      this.cacheService.delete(CacheKeyGenerator.webhookDetail(dto.id)),
    ]);

    return !!updated.affected;
  }

  public async delete(dto: TWebhookServiceDelete) {
    const webhook = await this.webhookRepository.findOne({
      where: { id: dto.id, appId: dto.appId },
    });

    if (!webhook) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.WEBHOOK_NOT_EXIST);
    }

    await this.webhookRepository.softDelete({ id: dto.id });

    await promiseAll([
      this.cacheService.delete(CacheKeyGenerator.webhookList(dto.appId)),
      this.cacheService.delete(CacheKeyGenerator.webhookDetail(dto.id)),
    ]);

    return true;
  }

  public async get(dto: TWebhookServiceGet) {
    const cacheKey = CacheKeyGenerator.webhookDetail(dto.id);
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const exist = await this.webhookRepository.findOneBy({ id: dto.id, appId: dto.appId });
    if (!exist) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.WEBHOOK_NOT_EXIST);
    }

    const { authKey, ...webhookData } = exist;

    const result = {
      ...webhookData,
      authKey: authKey
        ? await this.decryptAuthKey(
            authKey,
            dto.appCode,
            dto.appNamespace,
            this.refreshAuthKey(exist.id, authKey, dto.appCode, dto.appNamespace).bind(this)
          )
        : null,
    };
    await this.cacheService.set(cacheKey, excludeFields(result, ['authKey']), 300);

    return result;
  }

  public async getById(id: string) {
    const exist = await this.webhookRepository.findOneBy({ id });
    if (!exist) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.WEBHOOK_NOT_EXIST);
    }

    return exist;
  }

  public async trigger(dto: TWebhookServiceTrigger) {
    const triggeredWebhooks = await this.webhookRepository.find({
      where: {
        appId: dto.appId,
        triggerOn: dto.triggerOn,
        triggerType: dto.triggerType,
        isActive: true,
      },
    });

    for (const triggered of triggeredWebhooks) {
      await this.webhookHistoryService.create({
        data: dto.data,
        webhookId: triggered.id,
        webhookSnapshot: triggered,
      });
    }
  }

  private refreshAuthKey(keyId: string, authKey: string, code: string, namespace: string) {
    return async (expiredKey: string) => {
      const decrypted = decrypt<string>(authKey, expiredKey);

      const encrypted = await this.encryptAuthKey(decrypted, code, namespace);

      await this.webhookRepository.update(
        {
          id: keyId,
        },
        {
          authKey: encrypted,
        }
      );
    };
  }

  private async getHashConfig(code: string, namespace: string) {
    const systemConfig = await this.configService
      .getSystemConfig({
        WEBHOOK_KEY_DURATION_AMOUNT: 'number',
        WEBHOOK_KEY_DURATION_UNIT: 'dateUnit',
        WEBHOOK_KEY_BYTES_MODE: ConfigExtractorTransform.enum(EKeyBytesMode),
        WEBHOOK_KEY_BYTES_FIXED: 'number',
        WEBHOOK_KEY_BYTES_RAND_FROM: 'number',
        WEBHOOK_KEY_BYTES_RAND_TO: 'number',
        WEBHOOK_KEY_BYTES_RAND_DECIMAL: 'number',
      })
      .allowNull([]);

    if (systemConfig.WEBHOOK_KEY_DURATION_AMOUNT < 1) {
      throw new Exception(EResponseStatus.InternalServerError, EErrorCode.CONFIG_PROPERTY_INVALID, {
        WEBHOOK_KEY_DURATION_AMOUNT: systemConfig.WEBHOOK_KEY_DURATION_AMOUNT,
      });
    }

    return this.keyService.getRotateKey({
      type: APP_CONSTANTS.FORMATS.keyType.webhook('auth-key', code, namespace),
      options: {
        renewOnExpire: true,
        bytes: KeyService.getBytes(
          systemConfig.WEBHOOK_KEY_BYTES_MODE,
          systemConfig.WEBHOOK_KEY_BYTES_FIXED,
          systemConfig.WEBHOOK_KEY_BYTES_RAND_FROM,
          systemConfig.WEBHOOK_KEY_BYTES_RAND_TO,
          systemConfig.WEBHOOK_KEY_BYTES_RAND_DECIMAL
        ),
        onGenerateDuration: {
          amount: systemConfig.WEBHOOK_KEY_DURATION_AMOUNT,
          unit: systemConfig.WEBHOOK_KEY_DURATION_UNIT,
        },
      },
    });
  }

  private async encryptAuthKey(authKey: string, code: string, namespace: string) {
    const { key, hashBytes } = await this.getHashConfig(code, namespace);
    const encypted = encrypt(authKey, key, hashBytes);

    return encypted.encryptedPayload;
  }

  private async decryptAuthKey(
    authKey: string,
    code: string,
    namespace: string,
    onExpired?: (expiredKey: string, bytes: number) => Promise<void>
  ) {
    const { key, hashBytes, expiredKey } = await this.getHashConfig(code, namespace);

    // When expired key -> decrypt the expiredKey
    const decryptKey = valueOrDefault<string>(expiredKey?.originKey, key);
    const decrypted = decrypt<string>(authKey, decryptKey);

    if (expiredKey && onExpired) await onExpired(expiredKey.originKey, hashBytes);

    return decrypted;
  }
}
