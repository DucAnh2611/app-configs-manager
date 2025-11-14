import { EApiKeyType } from '../enums';

export type TApiKeyServiceCheck = {
  code: string;
  namespace: string;
  apiKey: string;
  publicKey?: string;
  type: EApiKeyType;
};
