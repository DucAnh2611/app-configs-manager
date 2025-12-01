export const KEY_CONSTANTS = {
  fileFormat: 'keys/{type}/v_{version}.txt',
  keyLineFormat: '{start}|{end}|{key}',
  not_expire: 'NOT_EXPIRE',
  DEFAULT_VALUES: {
    SECRET_KEY_BYTES: 32,
    SECRET_HASH_KEY_BYTES: 64,
    SECRET_HASH_KEY_ROTATE_TIME: 30,
    SECRET_HASH_KEY_ROTATE_UNIT: 'day',
  },
};
