import { EErrorCode, EResponseStatus } from '../enums';
import {
  EWebhookBodyType,
  EWebhookMethod,
  EWebhookTriggerOn,
  EWebhookTriggerType,
} from '../enums/webhook';
import { Exception } from '../helpers';
import { WebhookRepository } from '../repositories';
import {
  IWebhook,
  TWebhookServiceDelete,
  TWebhookServiceList,
  TWebhookServiceRegister,
  TWebhookServiceToggle,
  TWebhookServiceUpdate,
} from '../types';

export class WebhookService {
  constructor(private readonly webhookRepository: WebhookRepository) {}

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
      authKey: dto.authKey || null,
      bodyType: dto.bodyType || EWebhookBodyType.JSON,
      isActive: false,
    } as any);

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
        authKey: dto.authKey ?? webhook.authKey,
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
        triggerType: true,
        triggerOn: true,
        targetUrl: true,
        method: true,
        bodyType: true,
        isActive: true,
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

    const updated = await this.webhookRepository.update({ id: dto.id }, { isActive: dto.isActive });

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

  public async getById(id: string): Promise<IWebhook> {
    const exist = await this.webhookRepository.findOneBy({ id });
    if (!exist) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.WEBHOOK_NOT_EXIST);
    }

    return exist;
  }
}
