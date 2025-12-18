import { IConfig } from './entity';

export type TConfigBaseRecordData =
  | Array<string | number | TConfigRecords | boolean>
  | string
  | number
  | TConfigRecords
  | boolean;

export type TConfigRecords = {
  [x: string]: TConfigBaseRecordData;
};

export type TConfigDecoded = Omit<IConfig, 'configs'> & {
  configs: TConfigRecords;
};

export type TConfigServiceHistory = TConfigUseCache & {
  appId: string;
};

export type TConfigServiceGet = TConfigUseCache & {};

export type TConfigServiceUp = TConfigUseCache & {
  appId: string;
  configs: TConfigRecords;
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
  configs: TConfigRecords;
  namespace: string;
  isUse: boolean;
  version: number;
};

export type TConfigUseCache = {
  appCode: string;
  appNamespace: string;
};
