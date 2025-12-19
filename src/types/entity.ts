import { ManipulateType } from 'dayjs';
import {
  EApiKeyType,
  EKeyStatus,
  EWebhookBodyType,
  EWebhookHistoryStatus,
  EWebhookMethod,
  EWebhookTriggerOn,
  EWebhookTriggerType,
} from '../enums';
import { TWebhookHistoryLog, TWebhookSnapshot } from './webhook';

export interface IApiKey {
  id: string;
  keyId: string;
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
  key?: IKey;
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

export interface IKey {
  id: string;
  type: string;
  hashed: string;
  hashBytes: number;
  version: number;
  status: EKeyStatus;
  durationAmount: number | null;
  durationUnit: ManipulateType | null;
  expireAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  apiKey?: IApiKey;
}
