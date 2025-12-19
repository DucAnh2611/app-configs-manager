import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { EWebhookHistoryStatus } from '../../enums';
import { DtoSearch } from './common';

export class DtoWebhookHistoryList extends DtoSearch {
  @IsOptional()
  @IsUUID()
  webhookId: string;

  @IsOptional()
  @IsEnum(EWebhookHistoryStatus)
  status?: EWebhookHistoryStatus;
}

export class DtoWebhookHistoryRetry {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
