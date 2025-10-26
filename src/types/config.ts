import { IConfig } from './entity';

export type TConfigDecoded = Omit<IConfig, 'configs'> & {
  configs: Record<string, any>;
};

export type TConfigServiceHistory = {
  appId: string;
  appNamespace: string;
};

export type TConfigServiceGet = {
  appCode: string;
  appNamespace: string;
};

export type TConfigServiceUp = {
  appId: string;
  appCode: string;
  namespace: string;
  configs: Record<string, any>;
};

export type TConfigServiceToggleUse = {
  appId: string;
  configId: string;
  namespace: string;
};

export type TConfigServiceRollback = {
  appId: string;
  configId: string;
};

export type TConfigServiceRemove = {
  appId: string;
  configId: string;
};

export type TConfigServiceBulkUp = {
  appId: string;
  configs: Record<string, any>;
  namespace: string;
  isUse: boolean;
  version: number;
};
