import { TKeyDurationUnit, TKeyGenerated } from 'key-rotation-manager';

export type TKeyGenerateDuration = { amount: number; unit: TKeyDurationUnit };

export type TKeyServiceGetRotateKeyOptions = {
  bytes?: number;
  onGenerateDuration: TKeyGenerateDuration;
  version?: string;
  renewOnExpire?: boolean;
};

export type TKeyServiceGetRotateKey = {
  type: string;
  options: TKeyServiceGetRotateKeyOptions;
};

export type TKeyserviceGetOriginKeyResult = {
  key: string;
  version: string;
  id: string;
  hashBytes: number;
  expiredKey: TKeyGenerated | null;
};

export type TKeyServiceGenerate = {
  type: string;
  useRotate?: boolean;
  bytes?: number;
  duration?: TKeyGenerateDuration;
};
