import { Repository } from 'typeorm';
import { AppDataSource, ConfigEntity, IConfig } from '../db';

export type ConfigRepository = Repository<IConfig>;

export const configRepository = AppDataSource.getRepository(ConfigEntity);
