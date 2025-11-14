import { EntitySchema } from 'typeorm';
import { DB_TABLES_CONSTANTS } from '../../constants';
import {
  EWebhookBodyType,
  EWebhookMethod,
  EWebhookTriggerOn,
  EWebhookTriggerType,
} from '../../enums/webhook';
import { IWebhook } from '../../types';

export const WebhookEntity = new EntitySchema<IWebhook>({
  name: DB_TABLES_CONSTANTS.WEBHOOK.NAME,
  tableName: DB_TABLES_CONSTANTS.WEBHOOK.TABLE_NAME,
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    appId: {
      type: 'uuid',
      nullable: false,
    },
    name: {
      type: 'varchar',
      length: 100,
    },
    triggerType: {
      type: 'enum',
      enum: EWebhookTriggerType,
    },
    triggerOn: {
      type: 'enum',
      enum: EWebhookTriggerOn,
    },
    targetUrl: {
      type: 'varchar',
    },
    method: {
      type: 'enum',
      enum: EWebhookMethod,
    },
    authKey: {
      type: 'varchar',
      nullable: true,
    },
    bodyType: {
      type: 'enum',
      enum: EWebhookBodyType,
      nullable: true,
      default: null,
    },
    isActive: {
      type: 'boolean',
      default: false,
    },
    createdAt: {
      type: 'timestamp with time zone',
      createDate: true,
    },
    updatedAt: {
      type: 'timestamp with time zone',
      updateDate: true,
    },
    deletedAt: {
      type: 'timestamp with time zone',
      nullable: true,
      deleteDate: true,
    },
  },
  relations: {
    app: {
      type: 'many-to-one',
      target: DB_TABLES_CONSTANTS.APP.NAME,
      joinColumn: { name: 'appId' },
      onDelete: 'CASCADE',
    },
    hitories: {
      type: 'one-to-many',
      target: DB_TABLES_CONSTANTS.WEBHOOK_HISTORY.NAME,
      inverseSide: 'webhook',
      cascade: true,
    },
  },
});
