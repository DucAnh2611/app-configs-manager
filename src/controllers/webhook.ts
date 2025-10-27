import { WebhookService } from '../services';
import {
  TWebhookServiceDelete,
  TWebhookServiceGet,
  TWebhookServiceList,
  TWebhookServiceRegister,
  TWebhookServiceToggle,
  TWebhookServiceUpdate,
} from '../types';

export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  public async register(dto: TWebhookServiceRegister) {
    return this.webhookService.register(dto);
  }

  public async update(dto: TWebhookServiceUpdate) {
    return this.webhookService.update(dto);
  }

  public async list(dto: TWebhookServiceList) {
    return this.webhookService.list(dto);
  }

  public async toggle(dto: TWebhookServiceToggle) {
    return this.webhookService.toggle(dto);
  }

  public async delete(dto: TWebhookServiceDelete) {
    return this.webhookService.delete(dto);
  }

  public async get(dto: TWebhookServiceGet) {
    return this.webhookService.get(dto);
  }
}
