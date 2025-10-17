import { EApiKeyType } from '../enums';

export type TJwtApiKeyPayload = {
  appCode: string;
  type: EApiKeyType;
  key: string;
  appId: string;
};
