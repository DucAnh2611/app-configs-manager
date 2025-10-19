import { EWebhookBodyType, EWebhookMethod, EWebhookTriggerOn, EWebhookTriggerType } from '../enums/webhook';

export type TWebhookServiceRegister = {
  appId: string;
  name: string;
  triggerType?: EWebhookTriggerType;
  triggerOn: EWebhookTriggerOn;
  targetUrl: string;
  method: EWebhookMethod;
  authKey?: string;
  bodyType?: EWebhookBodyType;
};

export type TWebhookServiceUpdate = {
  id: string;
  appId: string;
  name?: string;
  triggerType?: EWebhookTriggerType;
  triggerOn?: EWebhookTriggerOn;
  targetUrl?: string;
  method?: EWebhookMethod;
  authKey?: string;
  bodyType?: EWebhookBodyType;
};

export type TWebhookServiceList = {
  appId: string;
};

export type TWebhookServiceToggle = {
  id: string;
  appId: string;
  isActive: boolean;
};

export type TWebhookServiceDelete = {
  id: string;
  appId: string;
};

export type TWebhookServiceFire = {
  triggerType: string;
  triggerOn: string;
  appCode: string;
  namespace: string;
};