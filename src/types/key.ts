export type TKeyServiceGetRotateKey = {
  type: string;
  version?: number;
  bytes?: number;
};

export type TKeyServiceGenerate = {
  type: string;
  useRotate?: boolean;
  bytes?: number;
};
