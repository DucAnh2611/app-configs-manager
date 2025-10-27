import { EErrorCode, EResponseStatus } from '../enums';
import {
  EWebhookBodyType,
  EWebhookMethod,
  EWebhookTriggerOn,
  EWebhookTriggerType,
} from '../enums/webhook';
import { decrypt, encrypt, Exception } from '../helpers';
import { ConfigRepository, WebhookRepository } from '../repositories';
import {
  TWebhookServiceDelete,
  TWebhookServiceGet,
  TWebhookServiceList,
  TWebhookServiceRegister,
  TWebhookServiceToggle,
  TWebhookServiceTrigger,
  TWebhookServiceUpdate,
} from '../types';
import { ConfigService } from './config';
import { WebhookHistoryService } from './webhook-history';

export class WebhookService {
  constructor(
    private readonly webhookRepository: WebhookRepository,
    private readonly configRepository: ConfigRepository,
    private readonly webhookHistoryService: WebhookHistoryService
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
          : webhook.authKey,
        bodyType: (dto.bodyType as EWebhookBodyType) ?? webhook.bodyType,
      }
    );

    return !!updated.affected;
  }

  public async list(dto: TWebhookServiceList) {
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

    return true;
  }

  public async get(dto: TWebhookServiceGet) {
    const exist = await this.webhookRepository.findOneBy({ id: dto.id, appId: dto.appId });
    if (!exist) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.WEBHOOK_NOT_EXIST);
    }

    const { authKey, ...webhookData } = exist;

    return {
      ...webhookData,
      authKey: authKey ? await this.decryptAuthKey(authKey, dto.appCode, dto.appNamespace) : null,
    };
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
      });
    }
  }

  private async getHashConfig(code: string, namespace: string) {
    const config = await this.configRepository.findOne({
      where: {
        app: { code },
        namespace,
        isUse: true,
      },
    });

    if (!config) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.CONFIG_NOT_EXIST);
    }

    return ConfigService.safeConfig(ConfigService.decryptConfig(config.configs));
  }

  private async encryptAuthKey(authKey: string, code: string, namespace: string) {
    const { WEBHOOK_AUTHKEY_ENCRYPT_SECRET_KEY, WEBHOOK_AUTHKEY_ENCRYPT_BYPES } =
      await this.getHashConfig(code, namespace);

    const encypted = encrypt(
      authKey,
      WEBHOOK_AUTHKEY_ENCRYPT_SECRET_KEY,
      WEBHOOK_AUTHKEY_ENCRYPT_BYPES
    );

    return encypted.encryptedPayload;
  }

  private async decryptAuthKey(authKey: string, code: string, namespace: string) {
    const { WEBHOOK_AUTHKEY_ENCRYPT_SECRET_KEY, WEBHOOK_AUTHKEY_ENCRYPT_BYPES } =
      await this.getHashConfig(code, namespace);

    const decrypted = decrypt(
      authKey,
      WEBHOOK_AUTHKEY_ENCRYPT_SECRET_KEY,
      WEBHOOK_AUTHKEY_ENCRYPT_BYPES
    );

    return decrypted;
  }
}
