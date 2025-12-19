import { EntitySchema } from 'typeorm';
import { DB_TABLES_CONSTANTS } from '../../constants';
import { IConfig } from '../../types';

export const ConfigEntity = new EntitySchema<IConfig>({
  name: DB_TABLES_CONSTANTS.CONFIG.NAME,
  tableName: DB_TABLES_CONSTANTS.CONFIG.TABLE_NAME,
  columns: {
    id: {
      type: 'uuid',
      generated: 'uuid',
      primary: true,
    },
    appId: {
      type: 'uuid',
      nullable: false,
    },
    configs: {
      type: 'text',
      nullable: false,
    },
    version: {
      type: 'int',
      nullable: false,
      default: 1,
    },
    namespace: {
      type: 'varchar',
      length: 50,
    },
    isUse: {
      type: 'boolean',
      default: false,
    },
    createdAt: {
      type: 'timestamp with time zone',
      createDate: true,
    },
    deletedAt: {
      type: 'timestamp with time zone',
      deleteDate: true,
      nullable: true,
      default: null,
    },
  },
  relations: {
    app: {
      type: 'many-to-one',
      target: DB_TABLES_CONSTANTS.APP.NAME,
      joinColumn: { name: 'appId' },
      onDelete: 'CASCADE',
    },
  },
  indices: [
    { columns: ['appId', 'namespace', 'version', 'isUse'], where: '"configs"."deletedAt" IS NULL' },
    { columns: ['namespace', 'version', 'isUse'], where: '"configs"."deletedAt" IS NULL' },
    { columns: ['deletedAt'], where: '"configs"."deletedAt" IS NULL' },
  ],
});
