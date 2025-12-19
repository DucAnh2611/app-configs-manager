import { EntitySchema } from 'typeorm';
import { DB_TABLES_CONSTANTS } from '../../constants';
import { EApiKeyType } from '../../enums';
import { IApiKey } from '../../types';

export const ApiKeyEntity = new EntitySchema<IApiKey>({
  name: DB_TABLES_CONSTANTS.API_KEY.NAME,
  tableName: DB_TABLES_CONSTANTS.API_KEY.TABLE_NAME,
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
    keyId: {
      type: 'uuid',
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
      target: DB_TABLES_CONSTANTS.APP.NAME,
      joinColumn: { name: 'appId' },
      onDelete: 'CASCADE',
    },
    key: {
      type: 'many-to-one',
      target: DB_TABLES_CONSTANTS.KEY.NAME,
      joinColumn: { name: 'keyId' },
      onDelete: 'CASCADE',
    },
  },
  indices: [
    { columns: ['publicKey'], unique: true, where: '"api_key"."deletedAt" IS NULL' },
    { columns: ['appId', 'publicKey'], where: '"api_key"."deletedAt" IS NULL' },
    { columns: ['appId', 'active', 'type'], where: '"api_key"."deletedAt" IS NULL' },
    { columns: ['keyId'], where: '"api_key"."deletedAt" IS NULL' },
    { columns: ['deletedAt'], where: '"api_key"."deletedAt" IS NULL' },
  ],
});
