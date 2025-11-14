export const QUEUE_CONSTANTS = {
  CONCURRENCY: {
    WEBHOOK_HISTORY_CALL: 5,
    WEBHOOK_HISTORY_CLEAN: 5,
  },
  NAME: {
    WEBHOOK_HISTORY_CALL: 'webhook_history_call',
    WEBHOOK_HISTORY_CLEAN: 'webhook_history_clean',
  },
};

export const CRON_CONSTANTS = {
  EXPRESSION: {
    WEBHOOK_HISTORY_CALL: '*/1 * * * *',
    WEBHOOK_HISTORY_CLEAN: '*/1 * * * *',
  },
};
