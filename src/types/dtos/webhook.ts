import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';
import {
  EWebhookBodyType,
  EWebhookMethod,
  EWebhookTriggerOn,
  EWebhookTriggerType,
} from '../../enums/webhook';

export class DtoWebhookRegister {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(EWebhookTriggerType)
  triggerType?: EWebhookTriggerType;

  @IsNotEmpty()
  @IsEnum(EWebhookTriggerOn)
  triggerOn: EWebhookTriggerOn;

  @IsNotEmpty()
  @IsUrl({ host_whitelist: ['localhost', '127.0.0.1'] })
  targetUrl: string;

  @IsNotEmpty()
  @IsEnum(EWebhookMethod)
  method: EWebhookMethod;

  @IsOptional()
  @IsString()
  authKey?: string;

  @IsOptional()
  @IsEnum(EWebhookBodyType)
  bodyType?: EWebhookBodyType;
}

export class DtoWebhookUpdateBody {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(EWebhookTriggerType)
  triggerType?: EWebhookTriggerType;

  @IsOptional()
  @IsEnum(EWebhookTriggerOn)
  triggerOn?: EWebhookTriggerOn;

  @IsOptional()
  @IsUrl({ host_whitelist: ['localhost', '127.0.0.1'] })
  targetUrl?: string;

  @IsOptional()
  @IsEnum(EWebhookMethod)
  method?: EWebhookMethod;

  @IsOptional()
  @IsString()
  authKey?: string;

  @IsOptional()
  @IsEnum(EWebhookBodyType)
  bodyType?: EWebhookBodyType;
}

export class DtoWebhookUpdateParams {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class DtoWebhookToggle {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class DtoWebhookDelete {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class DtoWebhookGet {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
