import { EntitySchema } from 'typeorm';
import { DB_TABLES_CONSTANTS } from '../../constants';
import { EWebhookHistoryStatus } from '../../enums';
import { IWebhookHistory } from '../../types';

export const WebhookHistoryEntity = new EntitySchema<IWebhookHistory>({
  name: DB_TABLES_CONSTANTS.WEBHOOK_HISTORY.NAME,
  tableName: DB_TABLES_CONSTANTS.WEBHOOK_HISTORY.TABLE_NAME,
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    webhookId: {
      type: 'uuid',
      nullable: false,
    },
    status: {
      type: 'enum',
      enum: EWebhookHistoryStatus,
    },
    isSuccess: {
      type: 'boolean',
      default: false,
    },
    logs: {
      type: 'jsonb',
      default: [],
    },
    data: {
      type: 'jsonb',
      default: {},
    },
    webhookSnapshot: {
      type: 'jsonb',
      default: null,
    },
    createdAt: {
      type: 'timestamp with time zone',
      createDate: true,
    },
    updatedAt: {
      type: 'timestamp with time zone',
      updateDate: true,
    },
  },
  relations: {
    webhook: {
      type: 'many-to-one',
      target: DB_TABLES_CONSTANTS.WEBHOOK.NAME,
      joinColumn: { name: 'webhookId' },
      onDelete: 'CASCADE',
    },
  },
  indices: [
    { columns: ['webhookId', 'status'] },
    {
      columns: ['webhookId', 'isSuccess'],
      where: `"webhook_histories"."status" != '${EWebhookHistoryStatus.IN_QUEUE}'`,
    },
  ],
});
