import { EntitySchema } from 'typeorm';
import { IApp } from './app';

export interface IConfig {
  id: string;
  appId: string;
  configs: string;
  version: number;
  namespace: string;
  isUse: boolean;
  createdAt: Date;
  deletedAt: Date | null;
  app?: IApp;
}

export const ConfigEntity = new EntitySchema<IConfig>({
  name: 'Config',
  tableName: 'configs',
  columns: {
    id: {
      type: 'uuid',
      generated: true,
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
      target: 'App',
      joinColumn: { name: 'appId' },
      onDelete: 'CASCADE',
    },
  },
});
