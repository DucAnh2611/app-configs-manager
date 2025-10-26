import { EErrorCode } from '../enums';
import {
  EWebhookBodyType,
  EWebhookHistoryStatus,
  EWebhookMethod,
  EWebhookTriggerOn,
  EWebhookTriggerType,
} from '../enums/webhook';
import { TPagination, TSort } from './common';

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

export type TWebhookHistoryLog = {
  timestamp: string;
  status: EWebhookHistoryStatus;
  detail?: EErrorCode | string | Object;
  data?: any;
};

export type TWebhookHistoryServiceUpdate = {
  webhookHistoryId: string;
  status: EWebhookHistoryStatus;
  isSuccess: boolean;
  logs: TWebhookHistoryLog[];
};

export type TWebhookHistoryServiceCreate = {
  webhookId: string;
  data: Object;
};

export type TWebhookHistoryServiceList = TPagination &
  TSort & {
    webhookId?: string;
    status?: EWebhookHistoryStatus;
  };

export type TWebhookHistoryServiceRetry = {
  webhookHistoryId: string;
};
