import { EntitySchema } from "typeorm";
import { IApp } from "./app";

export interface IWebhook {
    id: string;
    key: string;
    url: string;
    secret: string;
    appId: string;
    active: boolean;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: null;
    app?: IApp;
}

export const WebhookEntity = new EntitySchema<IWebhook>({
  name: 'Webhook',
  tableName: 'webhook',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    appId: {
      type: 'uuid',
    },
    url: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    secret: {
      type: 'varchar',
      length: 128,
      nullable: false,
    },
    description: {
      type: 'varchar',
      length: 128,
      nullable: true,
    },
    active: {
      type: 'boolean',
      nullable: false,
      default: true,
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
      default: null,
      deleteDate: true,
    },
  },
  relations: {
    app: {
      type: 'many-to-one',
      target: 'App',
      joinColumn: { name: 'appId' },
      onDelete: 'CASCADE',
    },
  },
});