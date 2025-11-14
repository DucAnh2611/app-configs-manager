import {
  EApiKeyType,
  EWebhookBodyType,
  EWebhookHistoryStatus,
  EWebhookMethod,
  EWebhookTriggerOn,
  EWebhookTriggerType,
} from '../enums';
import { TWebhookHistoryLog, TWebhookSnapshot } from './webhook';

export interface IApiKey {
  id: string;
  key: string;
  type: EApiKeyType;
  publicKey: string | null;
  description: string | null;
  appId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  revokedAt?: Date | null;
  deletedAt: null;
  app?: IApp;
}

export interface IApp {
  id: string;
  code: string;
  name: string;
  configs: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  apiKeys?: IApiKey[];
  vConfigs?: IConfig[];
}

export interface IConfig {
  id: string;
  appId: string;
  configs: string;
  version: number;
  namespace: string;
  isUse: boolean;
  createdAt: Date;
  deletedAt: Date | null;
  app?: IApp;
}

export interface IWebhookHistory {
  id: string;
  webhookId: string;
  status: EWebhookHistoryStatus;
  logs: Array<TWebhookHistoryLog>;
  data: Object;
  webhookSnapshot: TWebhookSnapshot | null;
  isSuccess: boolean;
  createdAt: Date;
  updatedAt: Date;
  webhook?: IWebhook;
}

export interface IWebhook {
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
  deletedAt?: Date | null;
  app?: IApp;
  hitories?: IWebhookHistory[];
}
