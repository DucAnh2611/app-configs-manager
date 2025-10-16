import { env } from '../libs';

export const COMMON_CONFIG = {
  APP_CODE: env.APP_CODE || '',
  APP_ENV: env.APP_ENV || 'dev',
};
