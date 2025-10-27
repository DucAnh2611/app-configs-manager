import { env } from '../libs';

export const COMMON_CONFIG = {
  APP_CODE: env.APP_CODE || '',
  APP_ENV: env.APP_ENV || 'dev',
  APP_CONFIG_ENCRYPT_BYPES: Number(env.APP_CONFIG_ENCRYPT_BYPES || '12'),
  APP_CONFIG_ENCRYPT_SECRET_KEY: env.APP_CONFIG_ENCRYPT_SECRET_KEY || 'CFG_KEY',
};
