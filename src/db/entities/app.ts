import { EntitySchema } from 'typeorm';
import { DB_TABLES_CONSTANTS } from '../../constants';
import { IApp } from '../../types';

export const AppEntity = new EntitySchema<IApp>({
  name: DB_TABLES_CONSTANTS.APP.NAME,
  tableName: DB_TABLES_CONSTANTS.APP.TABLE_NAME,
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    code: {
      type: 'varchar',
      length: 50,
    },
    name: {
      type: 'varchar',
      length: 50,
    },
    configs: {
      type: 'jsonb',
      default: {},
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
    apiKeys: {
      type: 'one-to-many',
      target: DB_TABLES_CONSTANTS.API_KEY.NAME,
      inverseSide: 'app',
      cascade: true,
    },
    vConfigs: {
      type: 'one-to-many',
      target: DB_TABLES_CONSTANTS.CONFIG.NAME,
      inverseSide: 'app',
      cascade: true,
    },
  },
  indices: [
    { columns: ['code'], unique: true, where: '"apps"."deletedAt" IS NULL' },
    { columns: ['id', 'code'], where: '"apps"."deletedAt" IS NULL' },
    { columns: ['deletedAt'], where: '"apps"."deletedAt" IS NULL' },
  ],
});
