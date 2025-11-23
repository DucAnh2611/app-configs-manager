import { DataSource } from 'typeorm';
import { COMMON_CONFIG, DATABASE_CONFIG } from '../configs';
import {
  ApiKeyEntity,
  AppEntity,
  ConfigEntity,
  WebhookEntity,
  WebhookHistoryEntity,
} from './entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: COMMON_CONFIG.DOCKER ? 'postgres' : DATABASE_CONFIG.host,
  port: DATABASE_CONFIG.port,
  username: DATABASE_CONFIG.username,
  password: DATABASE_CONFIG.password,
  database: DATABASE_CONFIG.database,
  synchronize: false,
  migrations: ['**/migrations/*.js'],
  entities: [AppEntity, ApiKeyEntity, ConfigEntity, WebhookEntity, WebhookHistoryEntity],
  applicationName: 'app_config_node',
  poolSize: 5,
});
