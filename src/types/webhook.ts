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
  appCode: string;
  appNamespace: string;
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
  appCode: string;
  appNamespace: string;
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
};

export type TWebhookServiceDelete = {
  id: string;
  appId: string;
};

export type TWebhookServiceTrigger = {
  triggerType: EWebhookTriggerType;
  triggerOn: EWebhookTriggerOn;
  appId: string;
  appCode: string;
  data: any;
};

export type TWebhookServiceGet = {
  id: string;
  appId: string;
  appCode: string;
  appNamespace: string;
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
  webhookSnapshot: TWebhookSnapshot;
};

export type TWebhookHistoryServiceList = TPagination &
  TSort & {
    webhookId?: string;
    status?: EWebhookHistoryStatus;
    appId: string;
  };

export type TWebhookHistoryServiceRetry = {
  webhookHistoryId: string;
};

export type TWebhookSnapshot = {
  id: string;
  appId: string;
  name: string;
  triggerType: EWebhookTriggerType;
  triggerOn: EWebhookTriggerOn;
  targetUrl: string;
  method: EWebhookMethod;
  authKey: string | null;
  bodyType: EWebhookBodyType | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
