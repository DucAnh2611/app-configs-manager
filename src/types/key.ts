import { ManipulateType } from 'dayjs';

export type TKeyGenerateDuration = { amount: number; unit: ManipulateType };

export type TKeyServiceGetRotateKeyOptions = {
  bytes: number;
  onGenerateDuration: TKeyGenerateDuration;
  version?: number;
  renewOnExpire?: boolean;
};

export type TKeyServiceGetRotateKey = {
  type: string;
  options: TKeyServiceGetRotateKeyOptions;
};

export type TKeyserviceGetOriginKeyResult = {
  key: string;
  version: number;
  id: string;
  expiredKey: { id: string; originKey: string } | null;
};

export type TKeyServiceGenerate = {
  type: string;
  useRotate?: boolean;
  bytes: number;
  duration?: TKeyGenerateDuration;
};
