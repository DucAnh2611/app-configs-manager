import { WebhookHistoryService } from '../services';
import { TWebhookHistoryServiceList, TWebhookHistoryServiceRetry } from '../types';

export class WebhookHistoryController {
  constructor(private readonly webhookHistoryService: WebhookHistoryService) {}

  public async list(dto: TWebhookHistoryServiceList) {
    return this.webhookHistoryService.list(dto);
  }

  public async retry(dto: TWebhookHistoryServiceRetry) {
    return this.webhookHistoryService.retry(dto);
  }
}
