import { DataSource } from 'typeorm';
import { DATABASE_CONFIG } from '../configs';
import { ApiKeyEntity, AppEntity } from './entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DATABASE_CONFIG.host,
  port: DATABASE_CONFIG.port,
  username: DATABASE_CONFIG.username,
  password: DATABASE_CONFIG.password,
  database: DATABASE_CONFIG.database,
  synchronize: false,
  migrations: ['**/migrations/*.js'],
  entities: [AppEntity, ApiKeyEntity],
  applicationName: 'app_config_node',
  poolSize: 5,
});
