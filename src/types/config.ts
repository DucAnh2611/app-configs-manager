import { IConfig } from '../db';

export type TConfigDecoded = Omit<IConfig, 'configs'> & {
  configs: Record<string, any>;
};
