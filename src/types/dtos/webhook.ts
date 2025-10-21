import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  IsBoolean,
} from 'class-validator';
import { EWebhookBodyType, EWebhookMethod, EWebhookTriggerOn, EWebhookTriggerType } from '../../enums/webhook';

export class DtoWebhookRegister {
  @IsNotEmpty()
  @IsUUID()
  appId: string;

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
  @IsUrl()
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

export class DtoWebhookUpdate {
  @IsNotEmpty()
  @IsUUID()
  id: string;

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
  @IsUrl()
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

export class DtoWebhookList {
  @IsNotEmpty()
  @IsUUID()
  appId: string;
}

export class DtoWebhookToggle {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}

export class DtoWebhookDelete {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class DtoWebhookFire {
  @IsNotEmpty()
  @IsEnum(EWebhookTriggerType)
  triggerType: EWebhookTriggerType;

  @IsNotEmpty()
  @IsEnum(EWebhookTriggerOn)
  triggerOn: EWebhookTriggerOn;

  @IsNotEmpty()
  @IsString()
  appCode: string;

  @IsNotEmpty()
  @IsString()
  namespace: string;
}