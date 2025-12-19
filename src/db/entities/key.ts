import { EntitySchema } from 'typeorm';
import { DB_TABLES_CONSTANTS } from '../../constants';
import { EKeyStatus } from '../../enums';
import { IKey } from '../../types';

export const KeyEntity = new EntitySchema<IKey>({
  name: DB_TABLES_CONSTANTS.KEY.NAME,
  tableName: DB_TABLES_CONSTANTS.KEY.TABLE_NAME,
  columns: {
    id: {
      type: 'uuid',
      generated: 'uuid',
      primary: true,
    },
    type: {
      type: 'varchar',
      nullable: false,
      length: DB_TABLES_CONSTANTS.KEY.TYPE_LENGTH,
    },
    hashed: {
      type: 'text',
      nullable: false,
    },
    hashBytes: {
      type: 'integer',
      nullable: false,
    },
    status: {
      type: 'enum',
      enum: EKeyStatus,
      nullable: false,
    },
    version: {
      type: 'integer',
      default: -1,
    },
    durationAmount: {
      type: 'integer',
      nullable: true,
      default: null,
    },
    durationUnit: {
      type: 'text',
      nullable: true,
      default: null,
    },
    expireAt: {
      type: 'timestamp with time zone',
      nullable: true,
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
    apiKey: {
      type: 'one-to-many',
      inverseSide: 'key',
      target: DB_TABLES_CONSTANTS.API_KEY.NAME,
    },
  },
  indices: [
    {
      columns: ['id'],
      unique: true,
      where: `"keys"."deletedAt" IS NULL`,
    },
    {
      columns: ['type', 'status'],
      where: `"keys"."deletedAt" IS NULL AND "keys"."status" != '${EKeyStatus.RETIRED}'`,
    },
    {
      columns: ['type', 'version'],
      where: `"keys"."deletedAt" IS NULL AND "keys"."status" != '${EKeyStatus.RETIRED}'`,
    },
    { columns: ['deletedAt'], where: '"keys"."deletedAt" IS NULL' },
  ],
});
