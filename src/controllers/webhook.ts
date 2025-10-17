import { WebhookService } from '../services';
import { DtoWebhookRegister, DtoWebhookUpdate, DtoWebhookList, DtoWebhookToggle, DtoWebhookDelete, DtoWebhookReceive } from '../types';

export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  public async register(body: DtoWebhookRegister) {
    try {
      const data = await this.webhookService.register(body);
      return { status: 201, success: true, data };
    } catch (error) {
      return { status: 400, success: false, error: (error as Error).message };
    }
  }

  public async update(body: DtoWebhookUpdate) {
    try {
      const data = await this.webhookService.update(body);
      return { status: 200, success: true, data };
    } catch (error) {
      return { status: 400, success: false, error: (error as Error).message };
    }
  }

  public async list(body: DtoWebhookList) {
    try {
      const data = await this.webhookService.list(body);
      return { status: 200, success: true, data };
    } catch (error) {
      return { status: 400, success: false, error: (error as Error).message };
    }
  }

  public async toggle(body: DtoWebhookToggle) {
    try {
      const data = await this.webhookService.toggle(body);
      return { status: 200, success: true, data };
    } catch (error) {
      return { status: 400, success: false, error: (error as Error).message };
    }
  }

  public async delete(body: DtoWebhookDelete) {
    try {
      const data = await this.webhookService.delete(body);
      return { status: 200, success: true, data };
    } catch (error) {
      return { status: 400, success: false, error: (error as Error).message };
    }
  }

  public async receive(body: DtoWebhookReceive) {
    try {
      const data = await this.webhookService.processWebhook(body);
      return { status: 200, success: true, data };
    } catch (error) {
      return { status: 400, success: false, error: (error as Error).message };
    }
  }
}