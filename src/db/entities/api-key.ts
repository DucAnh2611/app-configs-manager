import { EntitySchema } from 'typeorm';
import { IApp } from './app';
import { EApiKeyType } from '../../enums';

export interface IApiKey {
  id: string;
  key: string;
  type: EApiKeyType;
  publicKey: string | null;
  description: string | null;
  appId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  revokedAt?: Date | null;
  deletedAt: null;
  app?: IApp;
}

export const ApiKeyEntity = new EntitySchema<IApiKey>({
  name: 'ApiKey',
  tableName: 'api_key',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    appId: {
      type: 'uuid',
    },
    type: {
      type: 'enum',
      nullable: false,
      default: EApiKeyType.THIRD_PARTY,
      enum: EApiKeyType,
    },
    key: {
      type: 'text',
      nullable: false,
    },
    publicKey: {
      type: 'text',
      nullable: true,
      default: null,
    },
    description: {
      type: 'varchar',
      length: 128,
      nullable: true,
    },
    active: {
      type: 'boolean',
      nullable: false,
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
    revokedAt: {
      type: 'timestamp with time zone',
      nullable: true,
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
