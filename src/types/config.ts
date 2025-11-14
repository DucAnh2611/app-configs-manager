import { IConfig } from './entity';

export type TConfigDecoded = Omit<IConfig, 'configs'> & {
  configs: Record<string, any>;
};

export type TConfigServiceHistory = TConfigUseCache & {
  appId: string;
};

export type TConfigServiceGet = TConfigUseCache & {};

export type TConfigServiceUp = TConfigUseCache & {
  appId: string;
  configs: Record<string, any>;
};

export type TConfigServiceToggleUse = TConfigUseCache & {
  appId: string;
  configId: string;
};

export type TConfigServiceRollback = TConfigUseCache & {
  appId: string;
  configId: string;
};

export type TConfigServiceRemove = TConfigUseCache & {
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

export type TConfigUseCache = {
  appCode: string;
  appNamespace: string;
};
